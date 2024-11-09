import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import "./App.css"
import { AppMode, INTERVAL_DELAY, StorageKey } from "./constants"
import { generateReplayFunction } from "./replayHandler"
import {
  addClick,
  generateClickListener,
  resetScoreMap,
} from "./scoringHandler"
import { changeVideo, downloadScores, importScores } from "./userInputHandler"
import { regainClickerFocus, youtubeVideoIdToUrl } from "./utils"

function App() {
  const [appMode, setAppMode] = useState(AppMode.Scoring)

  const youtubePlayer = useRef<YouTubePlayer | null>(null)
  const [videoUrl, setVideoUrl] = useState("https://youtu.be/9hhMUT2U2L4")
  const [videoId, setVideoId] = useState("9hhMUT2U2L4")
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const [scoreMap, setScoreMap] = useState(new Map<number, number>())

  const filesDownloadElement = useRef<HTMLAnchorElement | null>(null)
  const fileUploadElement = useRef<HTMLInputElement | null>(null)

  const [keyPositive, setKeyPositive] = useState(() => {
    const localData = localStorage.getItem(StorageKey.KeyPositive)
    return localData ? JSON.parse(localData) : "a"
  })
  const [keyNegative, setKeyNegative] = useState(() => {
    const localData = localStorage.getItem(StorageKey.KeyNegative)
    return localData ? JSON.parse(localData) : "s"
  })

  // add clicking key event listener
  useEffect(() => {
    if (appMode !== AppMode.Scoring) {
      return
    }

    const clickListener = generateClickListener(
      appMode,
      videoReady,
      videoDuration,
      youtubePlayer,
      keyPositive,
      keyNegative,
      setScoreMap,
    )

    // capture prioritizes this event listener
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture
    window.addEventListener("keydown", clickListener, { capture: true })

    return () => {
      console.debug(`useEffect cleanup: remove scoring listener`)
      window.removeEventListener("keydown", clickListener, { capture: true })
    }
  }, [
    appMode,
    videoReady,
    videoDuration,
    youtubePlayer,
    keyPositive,
    keyNegative,
  ])

  useEffect(() => {
    if (appMode !== AppMode.Playback) {
      return
    }

    // do nothing if video is not ready
    if (
      !videoReady ||
      videoDuration <= 0 ||
      !youtubePlayer?.current ||
      scoreMap.size <= 0
    ) {
      return
    }

    // set video to 5 seconds before first click if possible
    const firstClickTime = Math.min(...scoreMap.keys())
    youtubePlayer.current.seekTo(Math.max(firstClickTime - 5, 0))

    // start interval
    const intervalId = window.setInterval(
      generateReplayFunction(youtubePlayer.current, Array.from(scoreMap)),
      INTERVAL_DELAY,
    )

    // start video
    youtubePlayer.current.getInternalPlayer().playVideo()

    // clear interval on re-render
    return () => {
      console.debug(`useEffect cleanup: clear replay interval`)
      window.clearInterval(intervalId)
      if (youtubePlayer.current) {
        youtubePlayer.current.getInternalPlayer().pauseVideo()
      }
    }
  }, [
    appMode,
    videoReady,
    videoDuration,
    youtubePlayer,
    keyPositive,
    keyNegative,
  ])

  return (
    <>
      <button
        id="app-mode"
        name="app-mode"
        onClick={() =>
          appMode === AppMode.Playback
            ? setAppMode(AppMode.Scoring)
            : setAppMode(AppMode.Playback)
        }
        disabled={!(appMode === AppMode.Playback || scoreMap.size > 0)}
      >
        {appMode === AppMode.Scoring ? "Play Back Scores" : "Stop Play Back"}
      </button>

      <br></br>

      <input
        id="video-id"
        name="video-id"
        type="text"
        value={videoUrl}
        onChange={(e) =>
          changeVideo(
            e.target.value,
            videoId,
            setScoreMap,
            setVideoUrl,
            setVideoReady,
            setVideoId,
          )
        }
        required
      />
      <p>Currently playing video ID: {videoId}</p>

      <br></br>

      <button
        id="click-positive"
        name="click-positive"
        onClick={() =>
          addClick(
            appMode,
            videoReady,
            videoDuration,
            youtubePlayer,
            setScoreMap,
            +1,
          )
        }
      >
        +1
      </button>
      <input
        id="key-positive"
        name="key-positive"
        type="text"
        value={keyPositive}
        onChange={(e) => setKeyPositive(e.target.value)}
        minLength={1}
        maxLength={1}
        required
      />

      <br></br>
      <button
        id="click-negative"
        name="click-negative"
        onClick={() =>
          addClick(
            appMode,
            videoReady,
            videoDuration,
            youtubePlayer,
            setScoreMap,
            -1,
          )
        }
      >
        -1
      </button>
      <input
        id="key-negative"
        name="key-negative"
        type="text"
        value={keyNegative}
        onChange={(e) => setKeyNegative(e.target.value)}
        minLength={1}
        maxLength={1}
        required
      />

      <br></br>
      <br></br>

      <YouTubePlayer
        id="youtube-player"
        url={youtubeVideoIdToUrl(videoId)}
        controls={true}
        onDuration={setVideoDuration}
        onError={window.alert}
        onReady={() => setVideoReady(true)}
        onStart={() => regainClickerFocus(appMode)}
        onPlay={() => regainClickerFocus(appMode)}
        onPause={() => regainClickerFocus(appMode)}
        onBuffer={() => regainClickerFocus(appMode)}
        onBufferEnd={() => regainClickerFocus(appMode)}
        onSeek={() => regainClickerFocus(appMode)}
        onPlaybackRateChange={() => regainClickerFocus(appMode)}
        onPlaybackQualityChange={() => regainClickerFocus(appMode)}
        onEnded={() => regainClickerFocus(appMode)}
        onClickPreview={() => regainClickerFocus(appMode)}
        onEnablePIP={() => regainClickerFocus(appMode)}
        onDisablePIP={() => regainClickerFocus(appMode)}
        ref={youtubePlayer}
      />

      <br></br>

      <button
        id="reset-scores"
        name="reset-scores"
        onClick={() => resetScoreMap(setScoreMap, false)}
        disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
      >
        Reset Scores
      </button>
      <button
        id="download-scores"
        name="download-scores"
        onClick={() => downloadScores(filesDownloadElement, scoreMap, videoId)}
        disabled={scoreMap.size <= 0}
      >
        Download Scores
      </button>
      <button
        id="import-scores"
        name="import-scores"
        onClick={() => fileUploadElement.current?.click()}
      >
        Import Scores
      </button>

      <br></br>

      {/* elements to trigger file download */}
      <a
        ref={filesDownloadElement}
        href=""
        style={{ display: "none", visibility: "hidden" }}
        hidden
      ></a>
      {/* elements to trigger file upload */}
      <input
        ref={fileUploadElement}
        onChange={() =>
          importScores(
            fileUploadElement,
            videoId,
            setScoreMap,
            setVideoUrl,
            setVideoReady,
            setVideoId,
          )
        }
        type="file"
        accept=".json,application/json"
        style={{ display: "none", visibility: "hidden" }}
        hidden
      />

      <br></br>

      <textarea
        value={JSON.stringify(Object.fromEntries(scoreMap), null, 4)}
        rows={scoreMap.size + 3}
        cols={50}
        disabled={true}
      ></textarea>
    </>
  )
}

export default App

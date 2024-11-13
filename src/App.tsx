import { init } from "@instantdb/react"
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
import { ScoreJson } from "./types"
import {
  changeVideo,
  downloadScores,
  importScoreJson,
  importScoresFromFile,
  publishScores,
} from "./userInputHandler"
import {
  getScoresPerSecond,
  regainClickerFocus,
  youtubeVideoIdToUrl,
} from "./utils"

const db = init<ScoreJson>({
  appId: atob(`${import.meta.env.VITE_THE_CAT}`),
})

function App() {
  const [appMode, setAppMode] = useState(AppMode.Scoring)

  const youtubePlayer = useRef<YouTubePlayer | null>(null)
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=9hhMUT2U2L4",
  )
  const [videoId, setVideoId] = useState("9hhMUT2U2L4")
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const [scoreMap, setScoreMap] = useState(new Map<number, number>())
  const scoreMapArray = Array.from(scoreMap.entries())
  const [replayIndex, setReplayIndex] = useState(-1)
  const displayScoreMapArray =
    appMode === AppMode.Playback &&
    replayIndex >= 0 &&
    replayIndex < scoreMap.size
      ? scoreMapArray.slice(0, replayIndex)
      : scoreMapArray
  const [displayScorePositive, displayScoreNegative] =
    displayScoreMapArray.reduce(
      (sums, [_time, score]) => {
        // sums[0]: positive, sums[1]: negative
        sums[score > 0 ? 0 : 1] += score
        return sums
      },
      // [positive, negative]
      [0, 0],
    )
  const displayScoreTotal = displayScorePositive + displayScoreNegative
  const displayTotalTime =
    Math.max(...displayScoreMapArray.flatMap(([time, _score]) => time)) -
    Math.min(...displayScoreMapArray.flatMap(([time, _score]) => time))

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

  // parse url query parameters for video replay
  useEffect(() => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.searchParams)
    if (params.has("id")) {
      // reset url
      window.history.replaceState(null, "", "/")

      // get recording id
      const scoreHash = params.get("id")
      console.debug(scoreHash)

      db.queryOnce({ scores: { $: { where: { hash: scoreHash } } } })
        .then(({ data }) => {
          if (data.scores.length === 1) {
            const scoreJson = data.scores[0] as unknown as ScoreJson
            importScoreJson(
              videoId,
              setScoreMap,
              setVideoUrl,
              setVideoReady,
              setVideoId,
              scoreJson,
            )
          } else {
            window.alert(
              `Error: unable to find score :[\n` + `ID: ${scoreHash}`,
            )
          }
        })
        .catch((e) => {
          console.debug(e)
          window.alert(`Error: unable to find score :[\n` + `ID: ${scoreHash}`)
        })
    }
  }, [])

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

  // add replay loop
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
      generateReplayFunction(
        youtubePlayer.current,
        scoreMapArray,
        setReplayIndex,
      ),
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
      setReplayIndex(-1)
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
      <h1>44Clicker</h1>

      <label htmlFor="video-id">YouTube Video Link: </label>
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

      <br></br>
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
        disabled={appMode !== AppMode.Scoring}
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
      <span>
        +{displayScorePositive} (
        {getScoresPerSecond(displayScorePositive, displayTotalTime)})
      </span>
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
        disabled={appMode !== AppMode.Scoring}
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
      {/* remove extra "-", we need the hardcoded "-" for "-0" */}
      <span>
        -{displayScoreNegative * -1} (
        {getScoresPerSecond(displayScoreNegative, displayTotalTime)})
      </span>

      <br></br>

      <span>
        Total Score: {displayScoreTotal >= 0 ? "+" : ""}
        {displayScoreTotal} (
        {getScoresPerSecond(displayScoreTotal, displayTotalTime)})
      </span>

      <br></br>
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

      {appMode === AppMode.Playback && (
        <>
          <p>
            {replayIndex !== -1
              ? "Playing scoring replay..."
              : "Scoring replay finished"}
          </p>
        </>
      )}

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
        id="download-scores"
        name="download-scores"
        onClick={() => downloadScores(filesDownloadElement, videoId, scoreMap)}
        disabled={scoreMap.size <= 0}
      >
        Download Scores
      </button>
      <button
        id="import-scores"
        name="import-scores"
        onClick={() => fileUploadElement.current?.click()}
        disabled={appMode !== AppMode.Scoring}
      >
        Import Scores
      </button>
      <button
        id="publish-scores"
        name="publish-scores"
        onClick={() => publishScores(db, videoId, scoreMap)}
        disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
      >
        Publish Scores
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
          importScoresFromFile(
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

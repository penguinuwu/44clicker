import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import "./App.css"
import { AppMode, StorageKey } from "./constants"
import {
  addClick,
  generateClickListener,
  resetScoreMap,
} from "./scoringHandler"
import { downloadScores, changeVideo, uploadScores } from "./userInputHandler"
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

  return (
    <>
      <input
        id="app-mode"
        name="app-mode"
        type="checkbox"
        checked={appMode === AppMode.Scoring}
        onChange={(e) => {
          e.target.checked
            ? setAppMode(AppMode.Scoring)
            : setAppMode(AppMode.Playback)
          regainClickerFocus()
        }}
      />

      <br></br>
      <input
        id="video-id"
        name="video-id"
        type="text"
        value={videoUrl}
        onChange={(e) =>
          changeVideo(
            e.target.value,
            setScoreMap,
            setVideoUrl,
            setVideoReady,
            setVideoId,
          )
        }
        required
      />
      <p>{videoId}</p>

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
        onStart={regainClickerFocus}
        onPlay={regainClickerFocus}
        onPause={regainClickerFocus}
        onBuffer={regainClickerFocus}
        onBufferEnd={regainClickerFocus}
        onSeek={regainClickerFocus}
        onPlaybackRateChange={regainClickerFocus}
        onPlaybackQualityChange={regainClickerFocus}
        onEnded={regainClickerFocus}
        onClickPreview={regainClickerFocus}
        onEnablePIP={regainClickerFocus}
        onDisablePIP={regainClickerFocus}
        ref={youtubePlayer}
      />

      <br></br>

      <button
        id="reset-scores"
        name="reset-scores"
        onClick={() => resetScoreMap(setScoreMap, false)}
        disabled={scoreMap.size <= 0}
      >
        Reset Scores
      </button>
      <button
        id="download-scores"
        name="download-scores"
        onClick={() => downloadScores(filesDownloadElement, scoreMap, videoId)}
        disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
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
          uploadScores(
            fileUploadElement,
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

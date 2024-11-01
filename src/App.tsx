import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import "./App.css"
import { AppMode, StorageKey } from "./constants"
import { generateClickListener, parseClick } from "./clickHandler"
import { regainClickerFocus } from "./utils"
import { parseLink } from "./videoHandler"

function App() {
  const [appMode, setAppMode] = useState(AppMode.Judging)

  const youtubePlayer = useRef<YouTubePlayer | null>(null)
  const [videoUrl, setVideoUrl] = useState("https://youtu.be/9hhMUT2U2L4")
  const [videoId, setVideoId] = useState("9hhMUT2U2L4")
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  const [scoreMap, setScoreMap] = useState(new Map<number, number>())

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
        type="checkbox"
        id="app-mode"
        name="app-mode"
        checked={appMode === AppMode.Judging}
        onChange={(e) => {
          e.target.checked
            ? setAppMode(AppMode.Judging)
            : setAppMode(AppMode.Playback)
          regainClickerFocus()
        }}
      />

      <br></br>
      <input
        type="text"
        id="video-id"
        name="video-id"
        value={videoUrl}
        onChange={(e) => parseLink(e, setVideoUrl, setVideoReady, setVideoId)}
        required
      />
      <p>{videoId}</p>

      <br></br>

      <button
        id="click-positive"
        name="click-positive"
        onClick={() =>
          parseClick(
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
        type="text"
        id="key-positive"
        name="key-positive"
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
          parseClick(
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
        type="text"
        id="key-negative"
        name="key-negative"
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
        url={`https://www.youtube.com/watch?v=${videoId}`}
        controls={true}
        onDuration={setVideoDuration}
        onError={console.debug} // TODO
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

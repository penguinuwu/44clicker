import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import "./App.css"
import { AppMode, StorageKey } from "./constants"

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

  // TODO: don't steal focus from input boxes

  // add clicking key event listener
  useEffect(() => {
    function onJudgeClick(event: KeyboardEvent) {
      // do nothing if video is not ready
      if (
        appMode !== AppMode.Judging ||
        !videoReady ||
        videoDuration <= 0 ||
        !youtubePlayer?.current
      ) {
        return
      }

      if (event.key === keyPositive || event.key === keyNegative) {
        // disable default key actions
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()

        // ignore keys held down
        if (event.repeat) {
          console.debug(`click repeat ${event.key}`)
          return
        }

        // get score
        const clickScore = event.key === keyPositive ? +1 : -1
        console.debug(`click ${clickScore}`)

        parseClick(clickScore)
      }
    }

    // capture prioritizes this event listener
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture
    window.document.addEventListener("keydown", onJudgeClick, { capture: true })

    return () => {
      window.removeEventListener("keydown", onJudgeClick)
    }
  }, [
    appMode,
    videoReady,
    videoDuration,
    youtubePlayer,
    keyPositive,
    keyNegative,
  ])

  /**
   * validate and set input video url
   * @param event
   * @returns void
   */
  function parseLink(event: React.ChangeEvent<HTMLInputElement>) {
    const inputLink = event.target.value

    // update text box url
    setVideoUrl(inputLink)

    // validate youtube url
    const regexID = "([0-9A-Za-z_-]*)"
    const regexList = [
      `youtube.com\/watch\?.*v=${regexID}`,
      `youtube.com\/embed\/${regexID}`,
      `youtube.com\/shorts\/${regexID}`,
      `youtu.be\/${regexID}`,
    ]
    const regex = regexList.join("|")
    const result = `${inputLink}`.match(regex)
    if (!result) return // TODO: error

    // extract the video id
    const extractedId = result.slice(1).filter((e) => e)[0]
    if (!extractedId) return // TODO: error

    setVideoReady(false)
    setVideoId(extractedId)
  }

  function parseClick(clickScore: number) {
    // do nothing if video is not ready
    if (
      appMode !== AppMode.Judging ||
      !videoReady ||
      videoDuration <= 0 ||
      !youtubePlayer?.current
    ) {
      return
    }

    // get time
    const clickTime = youtubePlayer.current.getCurrentTime()
    console.debug(`click ${clickScore}: ${clickTime} / ${videoDuration}`)

    // note: it seems like the scoreMap value does not update within useEffect
    // but the prevScoreMap value does update, so we're using that instead
    setScoreMap((prevScoreMap) => {
      const scoreMapCopy = new Map(prevScoreMap)

      // delete score if it cancels out on the exact millisecond
      // the user probably wants to delete the click if this happens
      const newClickScore = clickScore + (scoreMapCopy.get(clickTime) ?? 0)
      if (newClickScore === 0) {
        scoreMapCopy.delete(clickTime)
      } else {
        scoreMapCopy.set(clickTime, newClickScore)
      }

      // sort by keys and return new copy of the map
      return new Float64Array(scoreMapCopy.keys())
        .sort()
        .reduce((newScoreMap, time) => {
          const clickScore = scoreMapCopy.get(time) ?? 0
          newScoreMap.set(time, clickScore)
          return newScoreMap
        }, new Map<number, number>())
    })
  }

  /**
   * cross origin iframe does not allow key logging!
   * thus to use clicker shortcuts, we need to focus out of the iframe
   */
  function regainClickerFocus() {
    window.document.getElementById("root")?.focus({
      preventScroll: true,
      // @ts-ignore: firefox implemented this
      focusVisible: false,
    })
  }

  return (
    <>
      <input
        type="text"
        id="video-id"
        name="video-id"
        value={videoUrl}
        onChange={parseLink}
        required
      />
      <p>{videoId}</p>

      <br></br>

      <button
        id="click-positive"
        name="click-positive"
        onClick={() => parseClick(+1)}
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
        onClick={() => parseClick(-1)}
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

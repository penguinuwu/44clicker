import YouTubePlayer from "react-player/youtube"

import { AppMode } from "./constants"
import { sortMapByKey } from "./utils"

const keyframesPositive = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em darkgreen", "none"],
}
const keyframesNegative = {
  easing: "ease-out",
  boxShadow: ["0 0 4em 2em crimson", "none"],
}
const animeOptions = {
  duration: 800,
  iterations: 1,
}

/**
 * flash video on click
 * @param clickScore
 */
function clickerFlash(clickScore: number) {
  // TODO: replace with ref to prevent querying every flash
  const youtubePlayerElement = window.document.getElementById("youtube-player")

  switch (clickScore) {
    case 1:
      youtubePlayerElement?.animate(keyframesPositive, animeOptions)
      break

    case -1:
      youtubePlayerElement?.animate(keyframesNegative, animeOptions)
      break

    default:
      console.debug(`flash broke ${clickScore}`)
      break
  }
}

/**
 * a
 * @param appMode
 * @param videoReady
 * @param videoDuration
 * @param youtubePlayer
 * @param keyPositive
 * @param keyNegative
 * @param setScoreMap
 * @returns void
 */
export function generateClickListener(
  appMode: AppMode,
  videoReady: boolean,
  videoDuration: number,
  youtubePlayer: React.MutableRefObject<YouTubePlayer | null>,
  keyPositive: string,
  keyNegative: string,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
) {
  return function (event: KeyboardEvent) {
    // do nothing if video is not ready
    if (
      appMode !== AppMode.Judging ||
      !videoReady ||
      videoDuration <= 0 ||
      !youtubePlayer?.current
    ) {
      return
    }

    // do not steal focus from input boxes
    if (
      event.target instanceof Element &&
      event.target.tagName.toLowerCase() === "input"
    ) {
      return
    }

    console.log(keyPositive, keyNegative)

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

      parseClick(
        appMode,
        videoReady,
        videoDuration,
        youtubePlayer,
        setScoreMap,
        clickScore,
      )
    }
  }
}

/**
 * handle click if judging is ongoing
 * @param clickScore
 * @returns void
 */
export function parseClick(
  appMode: AppMode,
  videoReady: boolean,
  videoDuration: number,
  youtubePlayer: React.MutableRefObject<YouTubePlayer | null>,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  clickScore: number,
) {
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
    return sortMapByKey(scoreMapCopy)
  })

  // flash screen
  clickerFlash(clickScore)
}

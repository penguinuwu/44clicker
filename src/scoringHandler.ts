import YouTubePlayer from "react-player/youtube"

import {
  ANIME_OPTIONS,
  AppMode,
  KEYFRAMES_NEGATIVE,
  KEYFRAMES_POSITIVE,
} from "./constants"
import { ScoreJson } from "./types"
import { sortMapByKey } from "./utils"

/**
 * flash video on click
 * @param clickScore
 */
export function clickerFlash(clickScore: number) {
  // TODO: replace with ref to prevent querying every flash
  const youtubePlayerElement = window.document.getElementById("youtube-player")

  switch (clickScore) {
    case 1:
      youtubePlayerElement?.animate(KEYFRAMES_POSITIVE, ANIME_OPTIONS)
      break

    case -1:
      youtubePlayerElement?.animate(KEYFRAMES_NEGATIVE, ANIME_OPTIONS)
      break

    default:
      console.debug(`flash broke ${clickScore}`)
      break
  }
}

/**
 * return keydown listener function for clicks
 * @param appMode
 * @param videoReady
 * @param videoDuration
 * @param youtubePlayer
 * @param keyPositive
 * @param keyNegative
 * @param setScoreMap
 * @returns (event: KeyboardEvent) => void
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
      appMode !== AppMode.Scoring ||
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

      addClick(
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
 * add click if judging is ongoing
 * @param clickScore
 * @returns void
 */
export function addClick(
  appMode: AppMode,
  videoReady: boolean,
  videoDuration: number,
  youtubePlayer: React.MutableRefObject<YouTubePlayer | null>,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  clickScore: number,
) {
  // do nothing if video is not ready
  if (
    appMode !== AppMode.Scoring ||
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

/**
 * delete click from score mapping at given time
 * @param appMode
 * @param setScoreMap
 * @param clickTime
 * @returns void
 */
export function deleteClick(
  appMode: AppMode,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  clickTime: number,
) {
  // do nothing if not in judging mode
  if (appMode !== AppMode.Scoring) {
    return
  }

  console.debug(`deleting click ${clickTime}`)

  // note: it seems like the scoreMap value does not update within useEffect
  // but the prevScoreMap value does update, so we're using that instead
  setScoreMap((prevScoreMap) => {
    const scoreMapCopy = new Map(prevScoreMap)

    // delete score
    scoreMapCopy.delete(clickTime)

    // sort by keys and return new copy of the map
    return sortMapByKey(scoreMapCopy)
  })
}

/**
 * set scores from json, assuming input is sanitized
 * @param setScoreMap
 * @param scoreJson
 * @param confirmed skip confirmation popup
 */
export function importScoreMap(
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  scoreJson: ScoreJson,
  confirmed: boolean,
) {
  // assume everything has been sanitized
  if (confirmed || window.confirm("Are you sure you want to import scores?")) {
    // create new map, then sort, then set
    setScoreMap(sortMapByKey(new Map(scoreJson.scores)))
  }
}

/**
 * delete all mappings of timestamp to click
 * @param setScoreMap
 * @param confirmed skip confirmation popup
 */
export function resetScoreMap(
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  confirmed: boolean,
) {
  if (confirmed || window.confirm("Are you sure you want to reset scores?")) {
    setScoreMap(new Map<number, number>())
  }
}

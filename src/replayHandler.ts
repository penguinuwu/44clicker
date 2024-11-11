import YouTubePlayer from "react-player/youtube"

import { INTERVAL_DELAY_THRESHOLD, PlayerStates } from "./constants"
import { clickerFlash } from "./scoringHandler"

/**
 * generate replay function for setInterval
 * @param youtubePlayer
 * @param scoreMapFlat
 * @returns () => Promise<void>
 */
export function generateReplayFunction(
  youtubePlayer: YouTubePlayer,
  scoreMapFlat: [number, number][],
) {
  // function scoped variables
  // idk if this is good practice lol
  // i just need some way to persist data through intervals
  let previousTime = youtubePlayer.getCurrentTime()
  let scoreMapIndex: number | null = null

  const lastClickTime = scoreMapFlat.reduce(
    (maxTime, click) => Math.max(maxTime, click[0]),
    -Infinity,
  )

  return async function () {
    const currentTime = youtubePlayer.getCurrentTime()

    // video paused
    // do nothing
    if (
      youtubePlayer.getInternalPlayer().getPlayerState() !==
      PlayerStates.PLAYING
    ) {
      console.debug(`playback: video not playing at ${currentTime}`)
      return
    }

    // ignore accidental rewinds, workaround for setInterval out-of-order execution
    // TODO: fix by using something preserving execution order, maybe setTimeout?
    // setTimeout example https://stackoverflow.com/a/63143722
    // use a separate useEffect for timeout cleanup https://stackoverflow.com/a/55041347
    if (
      currentTime < previousTime &&
      previousTime - currentTime < INTERVAL_DELAY_THRESHOLD
    ) {
      console.debug(
        `playback: out-of-order rewind by ${
          previousTime - currentTime
        } - ${previousTime} -> ${currentTime}`,
      )
      return
    }

    // video rewinded, or fast-forwarded, or huge lag
    // catch up previousTime, reset scoreMapIndex, go to next iteration
    if (
      currentTime < previousTime ||
      previousTime + INTERVAL_DELAY_THRESHOLD < currentTime
    ) {
      console.debug(
        `playback: reset ${previousTime} -> ${currentTime}` +
          `\n` +
          `rw: ${currentTime < previousTime}` +
          `\n` +
          `ff: ${previousTime + INTERVAL_DELAY_THRESHOLD < currentTime}`,
      )
      previousTime = currentTime
      scoreMapIndex = null
      return
    }

    // no more upcoming clicks
    // catch up previousTime, reset scoreMapIndex, go to next iteration
    if (previousTime > lastClickTime) {
      console.debug(`playback: no more clicks after ${lastClickTime}`)
      previousTime = currentTime
      scoreMapIndex = null
      return
    }

    // find next click index
    if (scoreMapIndex === null) {
      console.debug(
        `playback: scoreMapIndex undefined (${previousTime}, ${currentTime}]`,
      )

      // search for index of clicks recorded after previousTime
      // TODO: use binary search since array is sorted
      // scoreMapIndex = findIndexSorted(scoreMapFlat, (e) => previousTime < e[0]);
      scoreMapIndex = scoreMapFlat.findIndex(
        ([clickTime, _click]) => previousTime < clickTime,
      )

      // no more upcoming clicks
      // catch up previousTime, reset scoreMapIndex, go to next iteration
      if (scoreMapIndex === -1) {
        console.debug(
          `playback: next click index not found after ${previousTime}`,
        )
        previousTime = currentTime
        scoreMapIndex = null
        return
      }
    }

    // play clicks between (previousTime, currentTime]
    while (scoreMapIndex < scoreMapFlat.length) {
      const [timestamp, click] = scoreMapFlat[scoreMapIndex]

      // stop playing clicks past current time
      if (currentTime < timestamp) {
        break
      }

      console.debug(`playback: click ${click} at ${timestamp}`)
      clickerFlash(click)
      scoreMapIndex++
    }

    previousTime = currentTime
    return
  }
}

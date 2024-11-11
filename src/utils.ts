import { AppMode } from "./constants"
import { ScoreJson } from "./types"

/**
 * cross origin iframe does not allow key logging!
 * thus to use clicker shortcuts, we need to focus out of the iframe
 * @param appMode
 */
export function regainClickerFocus(appMode: AppMode) {
  if (appMode === AppMode.Scoring) {
    window.document.getElementById("root")?.focus({
      preventScroll: true,
      // @ts-ignore: firefox implemented this
      focusVisible: false,
    })
  }
}

/**
 * sort map by keys and return new copy
 * @param inputMap
 * @returns
 */
export function sortMapByKey(inputMap: Map<any, any>) {
  return new Float64Array(inputMap.keys())
    .sort()
    .reduce((newScoreMap, time) => {
      const clickScore = inputMap.get(time) ?? 0
      newScoreMap.set(time, clickScore)
      return newScoreMap
    }, new Map<number, number>())
}

/**
 * convert youtube video ID to its full URL
 * @param videoId
 * @returns
 */
export function youtubeVideoIdToUrl(videoId: string) {
  return `https://www.youtube.com/watch?v=${videoId}`
}

/**
 * return first index where condition is true
 * thanks to https://stackoverflow.com/a/6554035/
 * TODO: prove correctness lmao 💀
 * @param array assuming it is sorted
 * @param condition assuming true for lower half and false for upper half
 * @returns index
 */
export function findIndexSorted<T>(
  array: T[],
  condition: (element: T) => boolean,
) {
  // empty array or final value greater than lowerbound
  if (array.length <= 0 || condition(array[array.length - 1])) {
    return undefined
  }

  // first value is greater than lowerbound
  if (!condition(array[0])) {
    return 0
  }

  let low = 0
  let high = array.length

  // begin binary search
  while (low < high) {
    const mid = Math.floor((low + high) / 2)

    if (condition(array[mid])) {
      // condition is satisfied, thus check lower indicies
      high = mid
    } else {
      // condition is not satisfied, thus check higher indicies
      low = mid + 1
    }
  }

  return low === high ? low : -1
}

/**
 * generate SHA-512 hash
 * https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#converting_a_digest_to_a_hex_string
 * @param message
 * @returns string
 */
export async function hash(message: string) {
  // encode as (utf-8) Uint8Array
  const msgUint8 = new TextEncoder().encode(message)

  // hash the message
  const hashBuffer = await window.crypto.subtle.digest("SHA-1", msgUint8)

  // convert buffer to byte array
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  // convert bytes to base64 string
  // https://stackoverflow.com/a/11562550
  return btoa(String.fromCharCode(...hashArray))

  // // convert bytes to hex string
  // return hashArray.map((b) => b.toString(94).padStart(2, "0")).join("")

  // // convert bytes to ascii string
  // return new TextDecoder().decode(hashBuffer)
}

export async function getScoreJson(
  videoId: string,
  judgeName: string,
  scoreMap: Map<number, number>,
) {
  // make sure scores are sorted by timestamp
  const scoreArray = Array.from(scoreMap.entries())
  scoreArray.sort((a, b) => a[0] - b[0])

  // get hash of video ID and scores array
  const scoreId = await hash(
    JSON.stringify({
      videoId: videoId,
      scores: scoreArray,
    }),
  )

  const scoreJson: ScoreJson = {
    hash: scoreId,
    videoId: videoId,
    judgeName: judgeName,
    date: Date.now(),
    scores: scoreArray,
  }

  return scoreJson
}

/**
 * return scores per second
 * @param score
 * @param time seconds with decimal
 * @returns string format
 */
export function getScoresPerSecond(score: number, time: number) {
  if (time === 0 || !Number.isFinite(time) || Number.isNaN(time)) {
    return "N/A clicks/second"
  }

  const fraction = score / time
  // add "+" if number is positive
  const prefix = fraction >= 0 ? "+" : ""

  return `${prefix}${fraction.toFixed(2)} clicks/second`
}

/**
 * convert timestamp seconds to readable time format
 * @param timestamp seconds with decimal
 * @param maxTime seconds with decimal
 * @returns string format
 */
export function formatTimestamp(timestamp: number, maxTime?: number) {
  // check if broken
  if (!maxTime) {
    console.debug(`formatTimestamp timestamp:${timestamp} maxTime:${maxTime}`)
    return "0"
  }

  // get first 4 digits of milliseconds
  const ms = Math.floor((timestamp * 10000) % 1000).toString()

  const s = Math.floor(timestamp % 60).toString()
  const m = Math.floor((timestamp / 60) % 60).toString()

  // no mod to limit hours
  const h = Math.floor(timestamp / 3600).toString()

  return maxTime < 3600
    ? `${m}:${s.padStart(2, "0")}.${ms.padStart(4, "0")}`
    : `${h}:${m.padStart(2, "0")}:${s.padStart(2, "0")}.${ms.padStart(4, "0")}`
}

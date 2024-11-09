import { AppMode } from "./constants"

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

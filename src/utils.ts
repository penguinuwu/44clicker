/**
 * cross origin iframe does not allow key logging!
 * thus to use clicker shortcuts, we need to focus out of the iframe
 */
export function regainClickerFocus() {
  window.document.getElementById("root")?.focus({
    preventScroll: true,
    // @ts-ignore: firefox implemented this
    focusVisible: false,
  })
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

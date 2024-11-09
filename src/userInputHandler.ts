import { importScoreMap, resetScoreMap } from "./scoringHandler"
import { ScoreJson } from "./types"
import { youtubeVideoIdToUrl } from "./utils"

/**
 * validate input video url, show confirm popup, set video url
 * @param inputLink
 * @param currentVideoId
 * @param setScoreMap
 * @param setVideoUrl
 * @param setVideoReady
 * @param setVideoId
 * @returns void
 */
export function changeVideo(
  inputLink: string,
  currentVideoId: string,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>,
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoId: React.Dispatch<React.SetStateAction<string>>,
) {
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
  if (!result) {
    // TODO: error
    return false
  }

  // extract the video id
  const extractedId = result.slice(1).filter((e) => e)[0]
  if (!extractedId) {
    // TODO: error
    return false
  }

  // confirm change video
  // TODO: get video title from ID
  if (
    !window.confirm(
      `Confirm changing video to ${extractedId}?\nThis will reset your scores!`,
    )
  ) {
    window.alert("Score import cancelled")
    return
  }

  resetScoreMap(setScoreMap, true)

  // no need to unready video if it's the same video
  if (extractedId !== currentVideoId) {
    setVideoReady(false)
    setVideoId(extractedId)
  }

  return true
}

/**
 * download scores
 * @param filesDownloadElement
 * @param scoreMap
 * @param videoId
 * @returns void
 */
export function downloadScores(
  filesDownloadElement: React.MutableRefObject<HTMLAnchorElement | null>,
  scoreMap: Map<number, number>,
  videoId: string,
) {
  console.debug(`download scores ${videoId}`)

  // missing data
  if (!videoId || scoreMap.size <= 0 || !filesDownloadElement?.current) {
    return
  }

  // get download date time
  const downloadDateNow = Date.now()

  // set download default file name
  filesDownloadElement.current.setAttribute(
    "download",
    `44clicker-scores_${videoId}_${downloadDateNow}.json`,
  )

  // generate stringified json
  const scoreJson: ScoreJson = {
    videoId: videoId,
    judgeName: "", // TODO
    date: downloadDateNow,
    scores: Array.from(scoreMap.entries()),
  }
  const scoreJsonString = JSON.stringify(scoreJson)
  filesDownloadElement.current.setAttribute(
    "href",
    `data:application/json;charset=utf-8,` +
      encodeURIComponent(scoreJsonString),
  )

  // download file
  filesDownloadElement.current.click()
}

/**
 * import scores
 * @param fileUploadElement
 * @param currentVideoId
 * @param setScoreMap
 * @param setVideoUrl
 * @param setVideoReady
 * @param setVideoId
 * @returns void
 */
export async function importScores(
  fileUploadElement: React.MutableRefObject<HTMLInputElement | null>,
  currentVideoId: string,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>,
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoId: React.Dispatch<React.SetStateAction<string>>,
) {
  const scoreFiles = fileUploadElement.current?.files
  if (!scoreFiles?.length || scoreFiles.length <= 0) {
    return window.alert("Error: no file uploaded!")
  }

  try {
    // read json
    const scoreText = await scoreFiles[0].text()
    const scoreJson = JSON.parse(scoreText) as ScoreJson
    console.debug(`import scores`)
    console.debug(scoreJson)

    // reset reference
    if (fileUploadElement.current?.files) {
      fileUploadElement.current.files = null
    }

    // validate json structure
    if (
      !scoreJson ||
      !Array.isArray(scoreJson.scores) ||
      scoreJson.scores.length <= 0
    ) {
      window.alert("Error: empty scores data!")
      return
    }

    // validate each time-click pair
    for (const pair of scoreJson.scores) {
      if (
        !Array.isArray(pair) ||
        pair.length !== 2 ||
        typeof pair[0] !== "number" ||
        typeof pair[1] !== "number" ||
        !Number.isFinite(pair[0]) ||
        !Number.isFinite(pair[1])
      ) {
        console.debug(pair)
        window.alert("Error: incorrect scores format")
        return
      }
    }

    // sort pairs
    scoreJson.scores.sort((a, b) => a[0] - b[0])

    // change video and show confirmation popup
    if (
      !changeVideo(
        youtubeVideoIdToUrl(scoreJson.videoId),
        currentVideoId,
        setScoreMap,
        setVideoUrl,
        setVideoReady,
        setVideoId,
      )
    ) {
      window.alert("Error: invalid video link")
      return
    }

    // input is validated
    importScoreMap(setScoreMap, scoreJson, true)
  } catch (error) {
    console.debug(error)
    if (fileUploadElement.current?.files) {
      fileUploadElement.current.files = null
    }
    window.alert("Error: cannot understand scores!")
  }
}

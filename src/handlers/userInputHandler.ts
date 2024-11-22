import { id, InstantReactWeb, tx } from "@instantdb/react"

import { importScoreMap, resetScoreMap } from "$/handlers/scoringHandler"
import { JUDGE_NAME_LIMIT } from "$/helpers/constants"
import { ScoreJson } from "$/helpers/types"
import { getScoreJson, youtubeVideoIdToUrl } from "$/helpers/utils"

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
 * @param videoId
 * @param judgeName
 * @param scoreMap
 * @returns void
 */
export async function downloadScores(
  filesDownloadElement: React.MutableRefObject<HTMLAnchorElement | null>,
  videoId: string,
  judgeName: string,
  scoreMap: Map<number, number>,
) {
  console.debug(`download scores ${videoId}`)

  // missing data
  if (!videoId || scoreMap.size <= 0 || !filesDownloadElement?.current) {
    return
  }

  // generate score json
  const scoreJson = await getScoreJson(videoId, judgeName, scoreMap)

  // set download file name and file content
  filesDownloadElement.current.setAttribute(
    "download",
    `44clicker-scores_${scoreJson.videoId}.json`,
  )
  filesDownloadElement.current.setAttribute(
    "href",
    `data:application/json;charset=utf-8,` +
      encodeURIComponent(JSON.stringify(scoreJson)),
  )

  // download file
  filesDownloadElement.current.click()
}

/**
 * import scores
 * @param currentVideoId
 * @param setScoreMap
 * @param setVideoUrl
 * @param setVideoReady
 * @param setVideoId
 * @param setJudgeName
 * @param scoreJson
 * @returns
 */
export async function importScoreJson(
  currentVideoId: string,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>,
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoId: React.Dispatch<React.SetStateAction<string>>,
  setJudgeName: React.Dispatch<React.SetStateAction<string>>,
  scoreJson: ScoreJson,
) {
  console.debug(`import scores JSON`)
  console.debug(scoreJson)

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

  setJudgeName(scoreJson.judgeName.substring(0, JUDGE_NAME_LIMIT))

  // input is validated
  importScoreMap(setScoreMap, scoreJson, true)
}

/**
 * import scores
 * @param fileUploadElement
 * @param currentVideoId
 * @param setScoreMap
 * @param setVideoUrl
 * @param setVideoReady
 * @param setVideoId
 * @param setJudgeName
 * @returns void
 */
export async function importScoresFromFile(
  fileUploadElement: React.MutableRefObject<HTMLInputElement | null>,
  currentVideoId: string,
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>,
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>,
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoId: React.Dispatch<React.SetStateAction<string>>,
  setJudgeName: React.Dispatch<React.SetStateAction<string>>,
) {
  const scoreFiles = fileUploadElement.current?.files
  if (!scoreFiles?.length || scoreFiles.length <= 0) {
    return window.alert("Error: no file uploaded!")
  }

  try {
    // read json, catch potential parsing errors
    const scoreText = await scoreFiles[0].text()
    const scoreJson = JSON.parse(scoreText) as ScoreJson
    console.debug(`import scores from file`)

    // reset reference
    if (fileUploadElement.current?.files) {
      fileUploadElement.current.files = null
    }

    importScoreJson(
      currentVideoId,
      setScoreMap,
      setVideoUrl,
      setVideoReady,
      setVideoId,
      setJudgeName,
      scoreJson,
    )
  } catch (error) {
    console.debug(error)
    if (fileUploadElement.current?.files) {
      fileUploadElement.current.files = null
    }
    window.alert("Error: cannot understand scores!")
  }
}

/**
 * publish scores to instantdb
 * @param db
 * @param videoId
 * @param judgeName
 * @param scoreMap
 * @param setPublishUrlResult
 * @returns void
 */
export async function publishScores(
  db: InstantReactWeb<ScoreJson, {}, false>,
  videoId: string,
  judgeName: string,
  scoreMap: Map<number, number>,
  setPublishUrlResult: React.Dispatch<
    React.SetStateAction<{ url?: string; status?: string }>
  >,
) {
  console.debug(`publish scores ${videoId}`)

  // missing data
  if (!videoId || scoreMap.size <= 0) {
    return
  }

  // generate score json
  const scoreJson = await getScoreJson(videoId, judgeName, scoreMap)

  const url =
    `${window.location.origin}/?` + `id=${encodeURIComponent(scoreJson.hash)}`

  // publish scores
  db.transact(tx.scores[id()].update(scoreJson))
    .then(() =>
      setPublishUrlResult({
        url,
        status: "Score published! Find the score at:",
      }),
    )
    .catch((e) => {
      console.debug(e)
      if (
        e.message &&
        `${e.message}`.toLowerCase().startsWith("record not unique")
      ) {
        setPublishUrlResult({
          url,
          status: "This score has already been published! Find the score at:",
        })
      } else {
        setPublishUrlResult({
          url: undefined,
          status: "Error: score publish failed :[",
        })
      }
    })
}

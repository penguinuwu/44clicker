/**
 * validate and set input video url
 * @param event
 * @param setVideoUrl
 * @param setVideoReady
 * @param setVideoId
 * @returns void
 */
export function parseLink(
  event: React.ChangeEvent<HTMLInputElement>,
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>,
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>,
  setVideoId: React.Dispatch<React.SetStateAction<string>>,
) {
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

import { useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import "./App.css"

function App() {
  const youtubePlayer = useRef<YouTubePlayer | null>(null)
  const [videoUrl, setVideoUrl] = useState("https://youtu.be/9hhMUT2U2L4")
  const [videoId, setVideoId] = useState("9hhMUT2U2L4")

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

    return setVideoId(extractedId)
  }

  return (
    <>
      <YouTubePlayer
        url={`https://www.youtube.com/watch?v=${videoId}`}
        controls={true}
        
        ref={youtubePlayer}
      />

      <input
        type="text"
        id="video-id"
        name="video-id"
        value={videoUrl}
        onChange={parseLink}
        required
      />
      <p>{videoId}</p>
    </>
  )
}

export default App

import { useState } from "react"
import "./App.css"

function App() {
  const [videoId, setVideoId] = useState("9hhMUT2U2L4")

  return (
    <>
      <input
        type="text"
        id="video-id"
        name="video-id"
        value={videoId}
        onChange={(e) => setVideoId(e.target.value)}
        required
      />
      <p>{videoId}</p>
    </>
  )
}

export default App

import { init } from "@instantdb/react"
import DeleteIcon from "@mui/icons-material/Delete"
import ReplayIcon from "@mui/icons-material/Replay"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Grid2 from "@mui/material/Grid2"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Typography from "@mui/material/Typography"
import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline"
import PauseCircleOutlinedIcon from "@mui/icons-material/PauseCircleOutlined"

import FooterBar from "$/components/FooterBar"
import HeaderBar from "$/components/HeaderBar"
import LookAtThisGraph from "$/graf/LookAtThisGraph"
import { generateReplayFunction } from "$/handlers/replayHandler"
import {
  addClick,
  generateClickListener,
  resetScoreMap,
} from "$/handlers/scoringHandler"
import {
  importScoreJson,
  importScoresFromFile,
} from "$/handlers/userInputHandler"
import {
  AppMode,
  INTERVAL_DELAY,
  JUDGE_NAME_LIMIT,
  StorageKey,
} from "$/helpers/constants"
import { ScoreJson } from "$/helpers/types"
import {
  getScoresPerSecond,
  isValidKeys,
  regainClickerFocus,
  youtubeVideoIdToUrl,
} from "$/helpers/utils"

// init scores database
const db = init<ScoreJson>({
  appId: atob(`${import.meta.env.VITE_THE_CAT}`),
})

// get keys from localstorage
let initialKeyPositive = localStorage.getItem(StorageKey.KeyPositive) || "1"
let initialKeyNegative = localStorage.getItem(StorageKey.KeyNegative) || "0"
if (!isValidKeys(initialKeyPositive, initialKeyNegative)) {
  initialKeyPositive = "1"
  initialKeyNegative = "0"
  localStorage.setItem(StorageKey.KeyPositive, "1")
  localStorage.setItem(StorageKey.KeyNegative, "0")
}

function App() {
  // web app mode
  const [appMode, setAppMode] = useState(AppMode.Scoring)

  // video information
  const youtubePlayer = useRef<YouTubePlayer | null>(null)
  const [videoUrl, setVideoUrl] = useState(
    "https://www.youtube.com/watch?v=Hnn_-y59a84",
  )
  const [videoId, setVideoId] = useState("Hnn_-y59a84")
  const [videoReady, setVideoReady] = useState(false)
  const [videoDuration, setVideoDuration] = useState(0)

  // score data
  const [scoreMap, setScoreMap] = useState(new Map<number, number>())
  const scoreMapArray = Array.from(scoreMap)

  // replay and score displays
  const [replayIndex, setReplayIndex] = useState(-1)
  const displayScoreMapArray =
    appMode === AppMode.Playback &&
    replayIndex >= 0 &&
    replayIndex < scoreMap.size
      ? scoreMapArray.slice(0, replayIndex)
      : scoreMapArray
  const [displayScorePositive, displayScoreNegative] =
    displayScoreMapArray.reduce(
      (sums, [_time, score]) => {
        // sums[0]: positive, sums[1]: negative
        sums[score > 0 ? 0 : 1] += score
        return sums
      },
      // [positive, negative]
      [0, 0],
    )
  const displayScoreTotal = displayScorePositive + displayScoreNegative
  const displayTotalTime =
    Math.max(...displayScoreMapArray.flatMap(([time, _score]) => time)) -
    Math.min(...displayScoreMapArray.flatMap(([time, _score]) => time))

  // upload scores status
  const [publishUrlResult, setPublishUrlResult] = useState<{
    url?: string
    status?: string
  }>({
    url: undefined,
    status: undefined,
  })

  // download/upload fields
  const filesDownloadElement = useRef<HTMLAnchorElement | null>(null)
  const fileUploadElement = useRef<HTMLInputElement | null>(null)

  // user input fields
  const [keyPositive, setKeyPositive] = useState(initialKeyPositive)
  const [keyNegative, setKeyNegative] = useState<string>(initialKeyNegative)
  const [judgeName, setJudgeName] = useState<string>(() => {
    const initialJudgeName = localStorage.getItem(StorageKey.JudgeName) || ""
    return `${initialJudgeName}`.substring(0, JUDGE_NAME_LIMIT)
  })

  // parse url query parameters for video replay
  useEffect(() => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.searchParams)
    if (params.has("id")) {
      // reset url
      window.history.pushState(null, "", "/")

      // get recording id
      const scoreHash = params.get("id")
      console.debug(scoreHash)

      db.queryOnce({ scores: { $: { where: { hash: scoreHash } } } })
        .then(async ({ data }) => {
          if (data.scores.length === 1) {
            const scoreJson = data.scores[0] as unknown as ScoreJson
            if (
              await importScoreJson(
                videoId,
                setScoreMap,
                setVideoUrl,
                setVideoReady,
                setVideoId,
                setJudgeName,
                scoreJson,
              )
            ) {
              setAppMode(AppMode.Playback)
            }
          } else {
            window.alert(
              `Error: unable to find score :[\n` + `ID: ${scoreHash}`,
            )
          }
        })
        .catch((e) => {
          console.debug(e)
          window.alert(`Error: unable to find score :[\n` + `ID: ${scoreHash}`)
        })
    }
  }, [])

  // add clicking key event listener
  useEffect(() => {
    if (appMode !== AppMode.Scoring) {
      return
    }

    const clickListener = generateClickListener(
      appMode,
      videoReady,
      videoDuration,
      youtubePlayer,
      keyPositive,
      keyNegative,
      setScoreMap,
    )

    // capture prioritizes this event listener
    // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#capture
    window.addEventListener("keydown", clickListener, { capture: true })

    return () => {
      console.debug(`useEffect cleanup: remove scoring listener`)
      window.removeEventListener("keydown", clickListener, { capture: true })
    }
  }, [
    appMode,
    videoReady,
    videoDuration,
    youtubePlayer,
    keyPositive,
    keyNegative,
  ])

  // add replay loop
  useEffect(() => {
    if (appMode !== AppMode.Playback) {
      return
    }

    // do nothing if video is not ready
    if (
      !videoReady ||
      videoDuration <= 0 ||
      !youtubePlayer?.current ||
      scoreMap.size <= 0
    ) {
      return
    }

    // set video to 5 seconds before first click if possible
    const firstClickTime = Math.min(...scoreMap.keys())
    youtubePlayer.current.seekTo(Math.max(firstClickTime - 5, 0))

    // start interval
    const intervalId = window.setInterval(
      generateReplayFunction(
        youtubePlayer.current,
        scoreMapArray,
        setReplayIndex,
      ),
      INTERVAL_DELAY,
    )

    // start video
    youtubePlayer.current.getInternalPlayer().playVideo()

    // clear interval on re-render
    return () => {
      console.debug(`useEffect cleanup: clear replay interval`)
      window.clearInterval(intervalId)
      if (youtubePlayer.current) {
        youtubePlayer.current.getInternalPlayer().pauseVideo()
      }
      setReplayIndex(-1)
    }
  }, [
    appMode,
    videoReady,
    videoDuration,
    youtubePlayer,
    keyPositive,
    keyNegative,
  ])

  return (
    <>
      {/* header */}
      <HeaderBar
        {...{
          db,
          appMode,
          judgeName,
          videoId,
          setVideoId,
          videoUrl,
          setVideoUrl,
          scoreMap,
          setScoreMap,
          setVideoReady,
          publishUrlResult,
          setPublishUrlResult,
        }}
      />
      {/* content */}
      <Stack
        marginX={{ xs: 2, md: 3, lg: "10%", xl: "18%" }}
        marginY={{ xs: 2, md: 3 }}
      >
        {/* input buttons */}
        <Grid2>
          {/* key bindings */}
          <Grid2 size={{ xs: 12, sm: 8 }}>
            <Card>
              <CardContent sx={{ flexGrow: 1 }}>
                <Stack direction="row">
                  <TextField
                    id="key-positive"
                    label="Positive Click Key"
                    variant="outlined"
                    type="text"
                    value={keyPositive}
                    onChange={(e) => {
                      setKeyPositive(e.target.value)
                      localStorage.setItem(
                        StorageKey.KeyPositive,
                        e.target.value,
                      )
                    }}
                    error={!isValidKeys(keyPositive, keyNegative)}
                    slotProps={{ htmlInput: { minLength: 1, maxLength: 1 } }}
                    required
                    disabled={appMode !== AppMode.Scoring}
                    sx={{
                      minWidth: "22%",
                      display: { xs: "none", md: "inline-block" },
                    }}
                    helperText="Shortcut for +1"
                  />

                  <TextField
                    id="judge-name"
                    label="Judge Name"
                    variant="outlined"
                    type="text"
                    value={judgeName}
                    onChange={(e) => setJudgeName(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: JUDGE_NAME_LIMIT } }}
                    disabled={appMode !== AppMode.Scoring}
                    sx={{ width: "100%" }}
                    helperText="Optional name up to 30 characters"
                  />

                  <TextField
                    id="key-negative"
                    label="Negative Click Key"
                    variant="outlined"
                    type="text"
                    value={keyNegative}
                    onChange={(e) => {
                      setKeyNegative(e.target.value)
                      localStorage.setItem(
                        StorageKey.KeyNegative,
                        e.target.value,
                      )
                    }}
                    error={!isValidKeys(keyPositive, keyNegative)}
                    slotProps={{ htmlInput: { minLength: 1, maxLength: 1 } }}
                    required
                    disabled={appMode !== AppMode.Scoring}
                    sx={{
                      minWidth: "22%",
                      display: { xs: "none", md: "inline-block" },
                    }}
                    helperText="Shortcut for -1"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>

          {/* reset / playback */}
          <Grid2 size={{ xs: 12, sm: 4 }}>
            <Card>
              <CardContent>
                <Stack direction={{ xs: "row", sm: "column", md: "row" }}>
                  <Button
                    id="reset-scores"
                    name="reset-scores"
                    color="error"
                    variant="text"
                    startIcon={<DeleteIcon />}
                    onClick={() => resetScoreMap(setScoreMap, false)}
                    disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
                    size="large"
                  >
                    Reset
                  </Button>
                  <Button
                    id="app-mode"
                    name="app-mode"
                    startIcon={
                      appMode === AppMode.Playback ? (
                        <PauseCircleOutlinedIcon />
                      ) : (
                        <PlayCircleOutlineIcon />
                      )
                    }
                    color={appMode === AppMode.Playback ? "error" : "success"}
                    variant={
                      appMode === AppMode.Playback ? "contained" : "outlined"
                    }
                    onClick={() =>
                      appMode === AppMode.Playback
                        ? setAppMode(AppMode.Scoring)
                        : setAppMode(AppMode.Playback)
                    }
                    disabled={
                      !(appMode === AppMode.Playback || scoreMap.size > 0)
                    }
                    size="large"
                  >
                    {appMode === AppMode.Playback
                      ? "Stop Play Back"
                      : "Play Back"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* video */}
        <Card>
          <Stack spacing={0} direction="column" flexGrow={1}>
            <Stack spacing={0} direction="row">
              <Button
                variant="contained"
                color="success"
                sx={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  display: { xs: "none", md: "inline-flex" },
                }}
                onClick={() =>
                  addClick(
                    appMode,
                    videoReady,
                    videoDuration,
                    youtubePlayer,
                    setScoreMap,
                    +1,
                  )
                }
                disabled={appMode !== AppMode.Scoring}
              >
                +1
                <br />[{keyPositive}]
              </Button>
              <CardMedia
                component={YouTubePlayer}
                id="youtube-player"
                width="100%"
                height="100%"
                sx={{ aspectRatio: 16 / 9 }}
                url={youtubeVideoIdToUrl(videoId)}
                controls={true}
                // onDuration={setVideoDuration} // this seems unreliable
                onError={window.alert}
                playing={appMode === AppMode.Playback}
                onReady={() => {
                  setVideoReady(true)
                  setVideoDuration(youtubePlayer.current?.getDuration()!)
                }}
                onStart={() => regainClickerFocus(appMode)}
                onPlay={() => regainClickerFocus(appMode)}
                onPause={() => regainClickerFocus(appMode)}
                onBuffer={() => regainClickerFocus(appMode)}
                onBufferEnd={() => regainClickerFocus(appMode)}
                onSeek={() => regainClickerFocus(appMode)}
                onPlaybackRateChange={() => regainClickerFocus(appMode)}
                onPlaybackQualityChange={() => regainClickerFocus(appMode)}
                onEnded={() => regainClickerFocus(appMode)}
                onClickPreview={() => regainClickerFocus(appMode)}
                onEnablePIP={() => regainClickerFocus(appMode)}
                onDisablePIP={() => regainClickerFocus(appMode)}
                ref={youtubePlayer}
              />
              <Button
                variant="contained"
                color="error"
                sx={{
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  display: { xs: "none", md: "inline-flex" },
                }}
                onClick={() =>
                  addClick(
                    appMode,
                    videoReady,
                    videoDuration,
                    youtubePlayer,
                    setScoreMap,
                    -1,
                  )
                }
                disabled={appMode !== AppMode.Scoring}
              >
                -1
                <br />[{keyNegative}]
              </Button>
            </Stack>
            <Stack spacing={0} direction="row" display={{ md: "none" }}>
              <Button
                variant="contained"
                color="success"
                size="large"
                sx={{
                  flexGrow: 1,
                  borderTopLeftRadius: 0,
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  lineHeight: 2,
                }}
                onClick={() =>
                  addClick(
                    appMode,
                    videoReady,
                    videoDuration,
                    youtubePlayer,
                    setScoreMap,
                    +1,
                  )
                }
                disabled={appMode !== AppMode.Scoring}
              >
                +1
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                sx={{
                  flexGrow: 1,
                  borderTopRightRadius: 0,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  lineHeight: 2,
                }}
                onClick={() =>
                  addClick(
                    appMode,
                    videoReady,
                    videoDuration,
                    youtubePlayer,
                    setScoreMap,
                    -1,
                  )
                }
                disabled={appMode !== AppMode.Scoring}
              >
                -1
              </Button>
            </Stack>
          </Stack>
        </Card>

        {/* score counter */}
        <Stack direction={{ xs: "column", sm: "row" }}>
          <Card>
            <CardContent>
              <Typography variant="body1">Positive Clicks</Typography>
              <Typography variant="h5" color="green">
                {"+ "}
                {displayScorePositive}
              </Typography>
              <Typography variant="caption">
                {getScoresPerSecond(displayScorePositive, displayTotalTime)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="body1">Total Score</Typography>
              <Typography variant="h5" color="grey">
                {displayScoreTotal >= 0 ? "+ " : "- "}
                {Math.abs(displayScoreTotal)}
              </Typography>
              <Typography variant="caption">
                {getScoresPerSecond(displayScoreTotal, displayTotalTime)}
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="body1">Negative Clicks</Typography>
              <Typography variant="h5" color="red">
                {"- "}
                {/* remove extra "-", we need the hardcoded "-" for "-0" */}
                {displayScoreNegative * -1}
              </Typography>
              <Typography variant="caption">
                {getScoresPerSecond(displayScoreNegative, displayTotalTime)}
              </Typography>
            </CardContent>
          </Card>
        </Stack>

        {/* graph */}
        <Card>
          <CardMedia
            component={LookAtThisGraph}
            appMode={appMode}
            youtubePlayer={youtubePlayer}
            videoDuration={videoDuration}
            displayScoreMapArray={displayScoreMapArray}
            scoreMapArray={scoreMapArray}
            setScoreMap={setScoreMap}
          />
        </Card>
      </Stack>
      {/* footer */}
      <FooterBar
        {...{
          appMode,
          judgeName,
          videoId,
          scoreMap,
          fileUploadElement,
          filesDownloadElement,
        }}
      />
      {/* elements to trigger file download */}
      <a
        ref={filesDownloadElement}
        href=""
        style={{ display: "none", visibility: "hidden" }}
        hidden
      ></a>
      {/* elements to trigger file upload */}
      <input
        ref={fileUploadElement}
        onChange={() =>
          importScoresFromFile(
            fileUploadElement,
            videoId,
            setScoreMap,
            setVideoUrl,
            setVideoReady,
            setVideoId,
            setJudgeName,
          )
        }
        type="file"
        accept=".json,application/json"
        style={{ display: "none", visibility: "hidden" }}
        hidden
      />
    </>
  )
}

export default App

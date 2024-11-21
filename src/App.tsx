import { init } from "@instantdb/react"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import DeleteIcon from "@mui/icons-material/Delete"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import GitHubIcon from "@mui/icons-material/GitHub"
import InstagramIcon from "@mui/icons-material/Instagram"
import ReplayIcon from "@mui/icons-material/Replay"
import SearchIcon from "@mui/icons-material/Search"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Button from "@mui/material/Button"
import Card from "@mui/material/Card"
import CardContent from "@mui/material/CardContent"
import CardMedia from "@mui/material/CardMedia"
import Divider from "@mui/material/Divider"
import Grid2 from "@mui/material/Grid2"
import Icon from "@mui/material/Icon"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useEffect, useRef, useState } from "react"
import YouTubePlayer from "react-player/youtube"

import LogoSvg from "./assets/logo.svg"
import {
  AppMode,
  INTERVAL_DELAY,
  JUDGE_NAME_LIMIT,
  StorageKey,
} from "./constants"
import LookAtThisGraph from "./graf/LookAtThisGraph"
import { generateReplayFunction } from "./replayHandler"
import {
  addClick,
  generateClickListener,
  resetScoreMap,
} from "./scoringHandler"
import { ScoreJson } from "./types"
import {
  changeVideo,
  downloadScores,
  importScoreJson,
  importScoresFromFile,
  publishScores,
} from "./userInputHandler"
import {
  getScoresPerSecond,
  regainClickerFocus,
  youtubeVideoIdToUrl,
} from "./utils"

const db = init<ScoreJson>({
  appId: atob(`${import.meta.env.VITE_THE_CAT}`),
})

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

  // download/upload fields
  const filesDownloadElement = useRef<HTMLAnchorElement | null>(null)
  const fileUploadElement = useRef<HTMLInputElement | null>(null)

  // user input fields
  const [keyPositive, setKeyPositive] = useState(() => {
    const localData = localStorage.getItem(StorageKey.KeyPositive)
    return localData ? JSON.parse(localData) : "a"
  })
  const [keyNegative, setKeyNegative] = useState(() => {
    const localData = localStorage.getItem(StorageKey.KeyNegative)
    return localData ? JSON.parse(localData) : "s"
  })
  const [judgeName, setJudgeName] = useState(() => {
    const localData = localStorage.getItem(StorageKey.JudgeName)
    return localData ? JSON.parse(localData) : ""
  })

  // parse url query parameters for video replay
  useEffect(() => {
    const url = new URL(window.location.href)
    const params = new URLSearchParams(url.searchParams)
    if (params.has("id")) {
      // reset url
      window.history.replaceState(null, "", "/")

      // get recording id
      const scoreHash = params.get("id")
      console.debug(scoreHash)

      db.queryOnce({ scores: { $: { where: { hash: scoreHash } } } })
        .then(({ data }) => {
          if (data.scores.length === 1) {
            const scoreJson = data.scores[0] as unknown as ScoreJson
            importScoreJson(
              videoId,
              setScoreMap,
              setVideoUrl,
              setVideoReady,
              setVideoId,
              setJudgeName,
              scoreJson,
            )
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
      {/* navbar */}
      <AppBar position="fixed" enableColorOnDark>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Stack spacing={2} alignItems="center" direction="row">
            <Icon component="a" href="#" sx={{ height: "2em", width: "2em" }}>
              <img src={LogoSvg} style={{ height: "100%", width: "100%" }} />
            </Icon>
            <Badge badgeContent="Beta" color="secondary">
              <Typography
                variant="h6"
                component="a"
                href="#"
                noWrap
                sx={{
                  mr: 1,
                  fontFamily: "monospace",
                  fontWeight: 700,
                  letterSpacing: ".13rem",
                  color: "inherit",
                  textDecoration: "none",
                }}
              >
                44Clicker
              </Typography>
            </Badge>
          </Stack>

          <TextField
            id="video-id"
            label="YouTube Video Link"
            type="text"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                changeVideo(
                  videoUrl,
                  videoId,
                  setScoreMap,
                  setVideoUrl,
                  setVideoReady,
                  setVideoId,
                )
                regainClickerFocus(appMode)
              }
            }}
            sx={{ width: "40%" }}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <IconButton
                      edge="start"
                      onClick={() => {
                        changeVideo(
                          videoUrl,
                          videoId,
                          setScoreMap,
                          setVideoUrl,
                          setVideoReady,
                          setVideoId,
                        )
                        regainClickerFocus(appMode)
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack spacing={1} alignItems="stretch" direction="row">
            <Button
              id="import-scores"
              name="import-scores"
              startIcon={<FileUploadIcon />}
              onClick={() => fileUploadElement.current?.click()}
              disabled={appMode !== AppMode.Scoring}
            >
              Import
              <br />
              Scores
            </Button>
            <Button
              id="download-scores"
              name="download-scores"
              startIcon={<FileDownloadIcon />}
              onClick={() =>
                downloadScores(
                  filesDownloadElement,
                  videoId,
                  judgeName,
                  scoreMap,
                )
              }
              disabled={scoreMap.size <= 0}
            >
              Download
              <br />
              Scores
            </Button>
            <Button
              id="publish-scores"
              name="publish-scores"
              startIcon={<CloudUploadIcon />}
              onClick={() => publishScores(db, videoId, judgeName, scoreMap)}
              disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
            >
              Publish
              <br />
              Scores
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* https://stackoverflow.com/a/63300755 */}
      {/* content */}
      <Stack
        sx={{
          marginY: "2%",
          marginX: { xs: "2%", md: "5%", lg: "10%", xl: "18%" },
        }}
      >
        <Card>
          <CardMedia sx={{ display: "flex", alignSelf: "stretch" }}>
            <Button
              variant="contained"
              color="error"
              sx={{
                lineHeight: 1.5,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              id="click-negative"
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
          </CardMedia>
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
          <CardMedia sx={{ display: "flex", alignSelf: "stretch" }}>
            <Button
              variant="contained"
              color="success"
              sx={{
                lineHeight: 1.5,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              id="click-positive"
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
          </CardMedia>
        </Card>

        {/* score counter */}
        <Grid2>
          <Grid2 size={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Negative Clicks</Typography>
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
          </Grid2>

          <Grid2 size={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Total Score</Typography>
                <Typography variant="h5" color="grey">
                  {displayScoreTotal >= 0 ? "+ " : "- "}
                  {Math.abs(displayScoreTotal)}
                </Typography>
                <Typography variant="caption">
                  {getScoresPerSecond(displayScoreTotal, displayTotalTime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>

          <Grid2 size={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2">Positive Clicks</Typography>
                <Typography variant="h5" color="green">
                  {"+ "}
                  {displayScorePositive}
                </Typography>
                <Typography variant="caption">
                  {getScoresPerSecond(displayScorePositive, displayTotalTime)}
                </Typography>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

        {/* input buttons */}
        <Grid2>
          {/* key bindings */}
          <Grid2 size={8}>
            <Card>
              <CardContent>
                <Stack direction="row">
                  <TextField
                    id="key-negative"
                    label="Negative Click Key"
                    variant="outlined"
                    type="text"
                    value={keyNegative}
                    onChange={(e) => setKeyNegative(e.target.value)}
                    slotProps={{ htmlInput: { minLength: 1, maxLength: 1 } }}
                    required
                    sx={{ width: "50%" }}
                    helperText="Shortcut to score -1"
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
                    helperText=" "
                  />

                  <TextField
                    id="key-positive"
                    label="Positive Click Key"
                    variant="outlined"
                    type="text"
                    value={keyPositive}
                    onChange={(e) => setKeyPositive(e.target.value)}
                    slotProps={{ htmlInput: { maxLength: JUDGE_NAME_LIMIT } }}
                    required
                    sx={{ width: "50%" }}
                    helperText="Shortcut to score +1"
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid2>

          {/* reset / playback */}
          <Grid2 size={4}>
            <Card>
              <CardContent>
                <Stack direction={{ xs: "column", md: "row" }}>
                  <Button
                    id="reset-scores"
                    name="reset-scores"
                    startIcon={<DeleteIcon />}
                    onClick={() => resetScoreMap(setScoreMap, false)}
                    disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
                    size="large"
                  >
                    Reset Scores
                  </Button>
                  <Button
                    id="app-mode"
                    name="app-mode"
                    startIcon={<ReplayIcon />}
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
                    {appMode === AppMode.Scoring
                      ? "Play Back Scores"
                      : "Stop Play Back"}
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid2>
        </Grid2>

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
      <Paper elevation={4} sx={{ borderRadius: 0 }}>
        <Stack
          padding={5}
          spacing={0.5}
          direction="row"
          justifyContent="start"
          alignItems="center"
        >
          <Link
            display="flex"
            alignItems="center"
            href="https://github.com/penguinuwu/44clicker"
          >
            <GitHubIcon fontSize="inherit" />
          </Link>
          <Divider orientation="vertical" flexItem />
          <Typography>Made by</Typography>
          <Link
            display="flex"
            alignItems="center"
            href="https://www.instagram.com/walk_the_chiken/"
          >
            <InstagramIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
            Evan Cui
          </Link>
          <Typography>and</Typography>
          <Link
            display="flex"
            alignItems="center"
            href="https://www.instagram.com/0_tacgibrm/"
          >
            <InstagramIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
            Yibo Xu
          </Link>
        </Stack>
      </Paper>
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

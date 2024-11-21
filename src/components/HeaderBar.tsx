import { InstantReactWeb } from "@instantdb/react"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import SearchIcon from "@mui/icons-material/Search"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Button from "@mui/material/Button"
import Icon from "@mui/material/Icon"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"

import LogoSvg from "../assets/logo.svg"
import { AppMode } from "../constants"
import { ScoreJson } from "../types"
import { changeVideo, downloadScores, publishScores } from "../userInputHandler"
import { regainClickerFocus } from "../utils"

interface Props {
  db: InstantReactWeb<ScoreJson, {}, false>
  appMode: AppMode
  judgeName: string
  videoId: string
  setVideoId: React.Dispatch<React.SetStateAction<string>>
  videoUrl: string
  setVideoUrl: React.Dispatch<React.SetStateAction<string>>
  scoreMap: Map<number, number>
  setScoreMap: React.Dispatch<React.SetStateAction<Map<number, number>>>
  setVideoReady: React.Dispatch<React.SetStateAction<boolean>>
  fileUploadElement: React.MutableRefObject<HTMLInputElement | null>
  filesDownloadElement: React.MutableRefObject<HTMLAnchorElement | null>
}

function HeaderBar({
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
  fileUploadElement,
  filesDownloadElement,
}: Props) {
  return (
    <>
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
    </>
  )
}

export default HeaderBar

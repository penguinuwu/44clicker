import { InstantReactWeb } from "@instantdb/react"
import CloudUploadIcon from "@mui/icons-material/CloudUpload"
import FileDownloadIcon from "@mui/icons-material/FileDownload"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import MoreIcon from "@mui/icons-material/MoreVert"
import SearchIcon from "@mui/icons-material/Search"
import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Button from "@mui/material/Button"
import Icon from "@mui/material/Icon"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import Menu from "@mui/material/Menu"
import MenuItem from "@mui/material/MenuItem"
import Stack from "@mui/material/Stack"
import TextField from "@mui/material/TextField"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import { useState } from "react"
import useScrollTrigger from "@mui/material/useScrollTrigger"
import Slide from "@mui/material/Slide"

import LogoSvg from "$/assets/logo.svg"
import {
  changeVideo,
  downloadScores,
  publishScores,
} from "$/handlers/userInputHandler"
import { AppMode } from "$/helpers/constants"
import { ScoreJson } from "$/helpers/types"
import { regainClickerFocus } from "$/helpers/utils"

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
  // hide bar on scroll
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 30 })

  const searchBarVideoId = (
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
      sx={{ width: "100%" }}
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
  )
  const buttonImportScores = (
    <Button
      id="import-scores"
      name="import-scores"
      startIcon={<FileUploadIcon />}
      onClick={() => fileUploadElement.current?.click()}
      disabled={appMode !== AppMode.Scoring}
      sx={{ flexGrow: { xs: 1, md: 0 } }}
    >
      Import
      <br />
      Scores
    </Button>
  )
  const buttonDownloadScores = (
    <Button
      id="download-scores"
      name="download-scores"
      startIcon={<FileDownloadIcon />}
      onClick={() =>
        downloadScores(filesDownloadElement, videoId, judgeName, scoreMap)
      }
      disabled={scoreMap.size <= 0}
      sx={{ flexGrow: { xs: 1, md: 0 } }}
    >
      Download
      <br />
      Scores
    </Button>
  )
  const buttonPublishScores = (
    <Button
      id="publish-scores"
      name="publish-scores"
      startIcon={<CloudUploadIcon />}
      onClick={() => publishScores(db, videoId, judgeName, scoreMap)}
      disabled={appMode !== AppMode.Scoring || scoreMap.size <= 0}
      sx={{ flexGrow: { xs: 1, md: 0 } }}
    >
      Publish
      <br />
      Scores
    </Button>
  )

  //
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    useState<HTMLElement | null>(null)
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl)
  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget)
  }
  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null)
  }
  const mobileMenuId = "mobile-more-menu"
  const mobileMoreMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem divider={true} disabled={true}>
        <Typography>Score Options</Typography>
      </MenuItem>
      <MenuItem divider={true}>{buttonImportScores}</MenuItem>
      <MenuItem divider={true}>{buttonDownloadScores}</MenuItem>
      <MenuItem>{buttonPublishScores}</MenuItem>
    </Menu>
  )

  return (
    <>
      <Slide in={!trigger}>
        <AppBar position="fixed" enableColorOnDark>
          <Toolbar sx={{ justifyContent: "space-between" }}>
            {/* logos */}
            <Stack spacing={2} alignItems="center" direction="row">
              <Icon component="a" href="#" sx={{ height: "2em", width: "2em" }}>
                <img src={LogoSvg} style={{ height: "100%", width: "100%" }} />
              </Icon>
              <Badge
                badgeContent="Beta"
                color="secondary"
                sx={{ display: { xs: "none", lg: "inline-flex" } }}
              >
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

            {/* search bar */}
            <Box width={{ xs: "65%", sm: "80%", md: "45%" }}>
              {searchBarVideoId}
            </Box>

            {/* button menu */}
            <Stack
              spacing={1}
              alignItems="stretch"
              direction="row"
              display={{ xs: "none", md: "block" }}
            >
              {buttonImportScores}
              {buttonDownloadScores}
              {buttonPublishScores}
            </Stack>

            {/* hidden button menu */}
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
              sx={{ display: { md: "none" } }}
            >
              <MoreIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </Slide>
      {mobileMoreMenu}
      <Toolbar /> {/* https://stackoverflow.com/a/63300755 */}
    </>
  )
}

export default HeaderBar

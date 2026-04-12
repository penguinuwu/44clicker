import FileDownloadIcon from "@mui/icons-material/FileDownload"
import FileUploadIcon from "@mui/icons-material/FileUpload"
import GitHubIcon from "@mui/icons-material/GitHub"
import InstagramIcon from "@mui/icons-material/Instagram"
import Button from "@mui/material/Button"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Tooltip from "@mui/material/Tooltip"
import Typography from "@mui/material/Typography"

import { downloadScores } from "$/handlers/userInputHandler"
import { AppMode } from "$/helpers/constants"

interface Props {
  appMode: AppMode
  judgeName: string
  videoId: string
  scoreMap: Map<number, number>
  fileUploadElement: React.RefObject<HTMLInputElement | null>
  filesDownloadElement: React.RefObject<HTMLAnchorElement | null>
}

function FooterBar({
  appMode,
  judgeName,
  videoId,
  scoreMap,
  fileUploadElement,
  filesDownloadElement,
}: Props) {
  return (
    <Paper elevation={4} sx={{ borderRadius: 0 }}>
      <Stack
        spacing={0.5}
        direction="row"
        sx={{
          flexWrap: "wrap",
          paddingTop: 5,
          paddingBottom: 1,
          paddingX: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Any issues? Let us know on</Typography>
        <Link
          href="https://github.com/penguinuwu/44clicker"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <GitHubIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
          GitHub!
        </Link>
      </Stack>
      <Stack
        spacing={0.5}
        direction="row"
        sx={{
          flexWrap: "wrap",
          padding: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Made by</Typography>
        <Link
          href="https://www.instagram.com/walk_the_chiken/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <InstagramIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
          Evan Cui
        </Link>
        <Typography>and</Typography>
        <Link
          href="https://www.instagram.com/0_tacgibrm/"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <InstagramIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
          Yibo Xu
        </Link>
        <Typography>:]</Typography>
      </Stack>
      <Stack
        spacing={1}
        direction="row"
        sx={{
          flexWrap: "wrap",
          paddingTop: 1,
          paddingBottom: 5,
          paddingX: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Tooltip title="Import scores via JSON file">
          <span>
            <Button
              id="import-scores"
              name="import-scores"
              startIcon={<FileUploadIcon />}
              onClick={() => fileUploadElement.current?.click()}
              disabled={appMode !== AppMode.Scoring}
            >
              Import Scores
            </Button>
          </span>
        </Tooltip>
        <Divider orientation="vertical" variant="middle" flexItem />
        <Tooltip title="Download scores JSON file">
          <span>
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
              Download Scores
            </Button>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  )
}

export default FooterBar

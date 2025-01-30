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
  fileUploadElement: React.MutableRefObject<HTMLInputElement | null>
  filesDownloadElement: React.MutableRefObject<HTMLAnchorElement | null>
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
        paddingTop={5}
        paddingBottom={1}
        paddingX={1}
        spacing={0.5}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "wrap" }}
      >
        <Typography>Any issues? Let us know on</Typography>
        <Link
          display="flex"
          alignItems="center"
          href="https://github.com/penguinuwu/44clicker"
        >
          <GitHubIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
          Github!
        </Link>
      </Stack>
      <Stack
        padding={1}
        spacing={0.5}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "wrap" }}
      >
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
        <Typography>:]</Typography>
      </Stack>
      <Stack
        paddingTop={1}
        paddingBottom={5}
        paddingX={1}
        spacing={1}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "wrap" }}
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

import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import Alert from "@mui/material/Alert"
import Button from "@mui/material/Button"
import Collapse from "@mui/material/Collapse"
import Dialog from "@mui/material/Dialog"
import DialogActions from "@mui/material/DialogActions"
import DialogContent from "@mui/material/DialogContent"
import DialogContentText from "@mui/material/DialogContentText"
import DialogTitle from "@mui/material/DialogTitle"
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
import TextField from "@mui/material/TextField"
import { useState } from "react"

interface Props {
  publishUrlResult: { url?: string; status?: string }
  setPublishUrlResult: React.Dispatch<
    React.SetStateAction<{ url?: string; status?: string }>
  >
}

function PublishScoresDialog({ publishUrlResult, setPublishUrlResult }: Props) {
  const [urlCopied, setUrlCopied] = useState(false)

  const handleClose = () => {
    setPublishUrlResult({ url: undefined, status: undefined })
    setUrlCopied(false)
  }

  return (
    <Dialog
      open={publishUrlResult.status !== undefined}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Upload Scores</DialogTitle>

      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {publishUrlResult.status}
        </DialogContentText>

        {/* url */}
        {publishUrlResult.url !== undefined && (
          <TextField
            type="text"
            value={publishUrlResult.url}
            sx={{ width: "100%" }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => {
                        if (publishUrlResult.url !== undefined) {
                          navigator.clipboard.writeText(publishUrlResult.url)
                          setUrlCopied(true)
                        }
                      }}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}

        {/* alert to confirm copy to clipboard */}
        <Collapse in={urlCopied}>
          <Alert
            icon={<CheckIcon fontSize="inherit" />}
            variant="outlined"
            severity="success"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setUrlCopied(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            Link copied to clipboard
          </Alert>
        </Collapse>
      </DialogContent>

      {/* ok 👍 */}
      <DialogActions>
        <Button onClick={handleClose} autoFocus sx={{ lineHeight: 1.75 }}>
          Okay 👍
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PublishScoresDialog

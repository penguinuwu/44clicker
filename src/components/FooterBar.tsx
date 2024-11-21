import GitHubIcon from "@mui/icons-material/GitHub"
import InstagramIcon from "@mui/icons-material/Instagram"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

function FooterBar() {
  return (
    <Paper elevation={4} sx={{ borderRadius: 0 }}>
      <Stack
        padding={5}
        spacing={0.5}
        direction="row"
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "wrap" }}
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
  )
}

export default FooterBar

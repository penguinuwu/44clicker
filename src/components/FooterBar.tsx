import FavoriteIcon from "@mui/icons-material/Favorite"
import GitHubIcon from "@mui/icons-material/GitHub"
import InstagramIcon from "@mui/icons-material/Instagram"
import Divider from "@mui/material/Divider"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

function FooterBar() {
  return (
    <Paper elevation={4} sx={{ borderRadius: 0, color: "rgba(0, 0, 0, " }}>
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
      <Divider variant="middle" flexItem />
      <Stack
        paddingTop={1}
        paddingBottom={5}
        paddingX={1}
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
    </Paper>
  )
}

export default FooterBar

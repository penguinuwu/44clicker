import GitHubIcon from "@mui/icons-material/GitHub"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

function FooterBar() {
  return (
    <Paper elevation={4} sx={{ borderRadius: 0 }}>
      <Stack
        paddingX={1}
        paddingY={5}
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
    </Paper>
  )
}
export default FooterBar

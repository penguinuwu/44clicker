import GitHubIcon from "@mui/icons-material/GitHub"
import Link from "@mui/material/Link"
import Paper from "@mui/material/Paper"
import Stack from "@mui/material/Stack"
import Typography from "@mui/material/Typography"

function FooterBar() {
  return (
    <Paper elevation={4} sx={{ borderRadius: 0 }}>
      <Stack
        spacing={0.5}
        direction="row"
        sx={{
          flexWrap: "wrap",
          paddingX: 1,
          paddingY: 5,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Typography>Any issues? Let us know on</Typography>
        <Link
          href="https://github.com/penguinuwu/44clicker"
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <GitHubIcon fontSize="inherit" sx={{ marginRight: 0.3 }} />
          Github!
        </Link>
      </Stack>
    </Paper>
  )
}
export default FooterBar

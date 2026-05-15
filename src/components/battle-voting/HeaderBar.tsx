import AppBar from "@mui/material/AppBar"
import Badge from "@mui/material/Badge"
import Box from "@mui/material/Box"
import Icon from "@mui/material/Icon"
import Slide from "@mui/material/Slide"
import Stack from "@mui/material/Stack"
import Toolbar from "@mui/material/Toolbar"
import Typography from "@mui/material/Typography"
import useScrollTrigger from "@mui/material/useScrollTrigger"

function HeaderBar() {
  const trigger = useScrollTrigger({ disableHysteresis: true, threshold: 40 })

  return (
    <>
      <Slide in={!trigger}>
        <AppBar position="fixed">
          <Toolbar sx={{ justifyContent: "space-between" }}>
            <Stack
              spacing={2}
              direction="row"
              sx={{ alignItems: "center", width: "100%" }}
            >
              <Icon component="a" href="#" sx={{ height: "2em", width: "2em" }}>
                <img
                  src={`${process.env.NEXT_PUBLIC_HOST}/logo.svg`}
                  style={{ height: "100%", width: "100%" }}
                />
              </Icon>
              <Badge
                badgeContent="Beta"
                color="secondary"
                sx={{ display: { xs: "none", sm: "inline-flex" } }}
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
              <Box sx={{ flexGrow: 1 }} />
              <Typography
                variant="h6"
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
                44EMPORIUM
              </Typography>
            </Stack>
          </Toolbar>
        </AppBar>
      </Slide>
      <Toolbar /> {/* https://stackoverflow.com/a/63300755 */}
    </>
  )
}

export default HeaderBar

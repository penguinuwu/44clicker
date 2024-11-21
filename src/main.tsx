import { createTheme, ThemeProvider } from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "$/App"
import "$/index.css"

const paletteLight = {
  main: "#fff",
  contrastText: "#000",
}
const paletteDark = {
  main: "#121212",
  contrastText: "#fff",
}

const theme = createTheme({
  cssVariables: true, // https://mui.com/material-ui/customization/dark-mode/#the-solution-css-variables
  colorSchemes: {
    light: {
      palette: {
        primary: paletteLight,
        secondary: paletteDark,
        background: {
          default: paletteLight.main,
          paper: paletteLight.main,
        },
      },
    },
    dark: {
      palette: {
        primary: paletteDark,
        secondary: paletteLight,
        background: {
          default: paletteDark.main,
          paper: paletteDark.main,
        },
      },
    },
  },
  shape: {
    borderRadius: 15,
  },
  components: {
    MuiButton: {
      defaultProps: {
        variant: "outlined",
        color: "secondary",
      },
      styleOverrides: {
        root: {
          lineHeight: 1,
        },
      },
    },
    MuiFormControl: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        color: "secondary",
        margin: "dense",
        size: "small",
        InputLabelProps: {
          shrink: true,
        },
      },
    },
    MuiLink: {
      defaultProps: {
        color: "secondary",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          textAlign: "center",
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          // alignContent: "stretch",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          // https://github.com/mui/material-ui/issues/11980#issuecomment-400347688
          "&:last-child": {
            paddingBottom: 16,
          },
        },
      },
    },
    MuiGrid2: {
      defaultProps: {
        container: true,
        spacing: { xs: 1, sm: 2, md: 3 },
        alignItems: "stretch",
        justifyContent: "space-evenly",
        flexGrow: 1,
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: 2,
        alignItems: "stretch",
        justifyContent: "center",
      },
    },
  },
})

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      {/* https://github.com/mui/material-ui/issues/30146#issuecomment-991188096 */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)

import { createTheme, ThemeProvider } from "@mui/material"
import CssBaseline from "@mui/material/CssBaseline"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import App from "$/components/App"
import "$/index.css"

const paletteLight = {
  main: "#fff",
}
const paletteDark = {
  main: "#282828",
}

const theme = createTheme({
  cssVariables: true, // https://mui.com/material-ui/customization/dark-mode/#the-solution-css-variables
  colorSchemes: {
    light: {
      palette: {
        primary: paletteLight,
        secondary: paletteDark,
        background: {
          default: "#f0f0f0",
        },
      },
    },
    dark: {
      palette: {
        primary: paletteDark,
        secondary: paletteLight,
        background: {
          default: "#000",
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
          textTransform: "none",
        },
      },
    },
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      }
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
      defaultProps: {
        variant: "outlined",
      },
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
        spacing: { xs: 1, sm: 2, md: 3 },
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

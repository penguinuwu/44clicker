"use client"

import { createTheme } from "@mui/material/styles"

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
        slotProps: {
          inputLabel: {
            shrink: true,
          },
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
    MuiGrid: {
      defaultProps: {
        container: true,
        spacing: { xs: 1, sm: 2, md: 3 },
        sx: {
          alignItems: "stretch",
          justifyContent: "space-evenly",
          flexGrow: 1,
        },
      },
    },
    MuiStack: {
      defaultProps: {
        spacing: { xs: 1, sm: 2, md: 3 },
        sx: {
          alignItems: "stretch",
          justifyContent: "center",
        },
      },
    },
  },
})

export default theme

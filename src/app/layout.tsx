import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter"
import CssBaseline from "@mui/material/CssBaseline"
import { ThemeProvider } from "@mui/material/styles"
import type { Metadata } from "next"
import { Roboto } from "next/font/google"

import "$/app/globals.css"
import theme from "$/app/theme"

export const metadata: Metadata = {
  title: {
    template: "%s - 44Clicker",
    default: "44Clicker",
  },
  description:
    "Judge and share yo-yo performances with graph visualization and clicks playback!",
  keywords: [
    "yo-yo",
    "yoyo",
    "yoyos",
    "yoyoing",
    "routine",
    "freestyle",
    "scoring",
    "judging",
    "analytics",
    "visualization",
    "playback",
  ],
  openGraph: {
    title: "44Clicker",
    description:
      "Judge and share yo-yo performances with graph visualization and clicks playback!",
    url: "https://44clicker.com",
    siteName: "44Clicker",
    images: [
      {
        url: `https://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_BASE_PATH}/44clicker-text-icon.png`,
        width: 1200,
        height: 630,
        alt: "44Clicker logo",
      },
    ],
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "44Clicker",
    description:
      "Judge and share yo-yo performances with graph visualization and clicks playback!",
    images: [
      `https://${process.env.NEXT_PUBLIC_HOST}${process.env.NEXT_PUBLIC_BASE_PATH}/44clicker-text-icon.png`,
    ],
  },
}

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={roboto.variable}>
      <body>
        <AppRouterCacheProvider options={{ key: "css" }}>
          <ThemeProvider theme={theme}>
            {/* https://github.com/mui/material-ui/issues/30146#issuecomment-991188096 */}
            <CssBaseline />
            {children}
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

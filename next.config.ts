import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  output: "export",

  // remove
  // https://nextjs.org/docs/architecture/nextjs-compiler#remove-console
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" && { 
      exclude: ["error", "warn"]
    }
  },

  // set base path for deployment
  env: {
    NEXT_PUBLIC_HOST:
      process.env.CF_PAGES_URL ||
      process.env.NEXT_PUBLIC_HOST ||
      "https://44clicker.com",
  },
}

export default nextConfig

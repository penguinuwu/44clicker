import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  output: "export",

  // set base path and asset prefix for deployment
  basePath: process.env.PAGES_BASE_PATH,
  env: {
    NEXT_PUBLIC_HOST:
      process.env.PAGES_HOST || process.env.CF_PAGES_URL || "44clicker.com",
    NEXT_PUBLIC_BASE_PATH: process.env.PAGES_BASE_PATH || "",
  },
}

export default nextConfig

import react from "@vitejs/plugin-react-swc"
import path from "path"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    drop: ["console", "debugger"],
  },
  plugins: [react()],
  resolve: {
    alias: {
      $: path.resolve(__dirname, "src"),
    },
  },
})

import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://mgifford.github.io",
  base: "/dpg-dpi-govstack-map",
  output: "static",
  build: {
    inlineStylesheets: "auto"
  },
  vite: {
    build: {
      target: "es2022"
    }
  }
});

import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://example.org",
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

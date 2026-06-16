import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Relative base: the built site works at ANY GitHub Pages path
  // (https://user.github.io/<any-repo>/) with no base-path mismatch.
  base: "./",
  plugins: [react(), tailwindcss()],
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<user>.github.io/patatos/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? "/patatos/" : "/",
}));

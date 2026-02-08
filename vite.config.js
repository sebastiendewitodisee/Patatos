import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<user>.github.io/<repo>/
// En CI GitHub, on récupère le nom réel du repo pour gérer la casse (patatos/Patatos).
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "patatos";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === "production" ? `/${repoName}/` : "/",
}));

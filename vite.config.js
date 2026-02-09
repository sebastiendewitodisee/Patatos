import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages project site: https://<user>.github.io/<repo>/
// En CI GitHub, on récupère le nom réel du repo pour gérer la casse (patatos/Patatos).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  const repoName = env.GITHUB_REPOSITORY?.split("/")[1] ?? "Patatos";

  return {
    plugins: [react()],
    base: mode === "production" ? `/${repoName}/` : "/",
  };
});

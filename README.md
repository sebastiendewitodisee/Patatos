# Team Patates Patatos - Site React Vite

Site multi-pages (SPA React) pour organiser le projet potager **Opération Récolte 🥔**.

## Démarrage

```bash
npm i
npm run dev
```

App dispo ensuite sur l'URL fournie par Vite (en local: `http://127.0.0.1:5173`).

## Build production

```bash
npm run build
npm run preview
```

## Structure principale

- `src/pages/`: pages de routes (`/`, `/planning`, `/equipe`, `/varietes`, `/organisation`, `/faq`, `/contact`, `/legal`)
- `src/components/`: layout global + composants UI réutilisables
- `src/data/`: données éditables du site
- `src/utils/planning.js`: fonctions de calcul (prochaine étape, progression, dernières updates)
- `src/styles/`: styles globaux et composants

## Mettre à jour le planning (important)

Le planning central est dans:

- `src/data/planning.js`

Chaque entrée est un objet simple:

```js
{
  id: "plantation-weekend",
  date: "2026-03-14",
  title: "Plantation (session weekend)",
  type: "plantation",
  status: "a-faire",
  phase: "Plantation",
  description: "..."
}
```

## Déploiement Vercel (recommandé)

1. Push du repo sur GitHub.
2. Import du repo dans Vercel.
3. Framework détecté: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`

## Déploiement GitHub Pages (option)

### 1) Configurer la base Vite

Dans `vite.config.js`, définir `base` avec le nom du repo (exemple `patatos-site`):

```js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/patatos-site/",
});
```

### 2) Action GitHub (workflow)

Créer `.github/workflows/deploy.yml`:

```yml
name: Deploy Vite to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

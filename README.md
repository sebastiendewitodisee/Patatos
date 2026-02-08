# Team Patates Patatos - Site React Vite

Site multi-pages (SPA React) pour organiser le projet potager **Opération Récolte 🥔**.

## Démarrage local

```bash
npm i
npm run dev
```

App locale (par défaut): `http://127.0.0.1:5173`

## Build production

```bash
npm run build
npm run preview
```

Le build est généré dans `dist/`.

## Structure principale

- `src/pages/`: pages de routes (`/`, `/planning`, `/equipe`, `/varietes`, `/organisation`, `/faq`, `/contact`, `/legal`)
- `src/components/`: layout global + composants UI réutilisables
- `src/data/`: données éditables du site
- `src/utils/planning.js`: fonctions de calcul (prochaine étape, progression, dernières updates)
- `src/styles/`: styles globaux et composants

## Mettre à jour le planning

Le planning central est dans `src/data/planning.js`.

Exemple d'entrée:

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

## Déploiement automatique GitHub Pages (repo `patatos`)

Le projet est configuré pour un site GitHub Pages de type **project site**:

- URL attendue: `https://<user>.github.io/Patatos/`
- Base Vite en production: `/<repo>/` auto-détectée depuis `GITHUB_REPOSITORY` (fallback local: `/patatos/`)
- Router: `HashRouter` (URLs en `/#/planning`) pour éviter les 404 au refresh sur GitHub Pages

### 1) Workflow GitHub Actions

Le workflow est déjà fourni dans:

- `.github/workflows/deploy.yml`

Il exécute automatiquement à chaque push sur `main`:

1. checkout
2. setup-node (Node 20)
3. `npm ci`
4. `npm run build`
5. publication de `dist/` via `actions/upload-pages-artifact` + `actions/deploy-pages`

### 2) Activer GitHub Pages dans le repo

Dans GitHub: `Settings > Pages`

- Source: `GitHub Actions`

Une fois activé, chaque push sur `main` déclenche un déploiement.

## URL finale

- `https://sebastiendewitodisee.github.io/Patatos/`

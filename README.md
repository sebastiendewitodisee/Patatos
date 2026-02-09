# Team Patates Patatos - Site React Vite

Site multi-pages (SPA React) pour organiser le projet potager **Opération Récolte 🥔**.

## Démarrage local

```bash
npm i
npm run dev
```

App locale (par défaut): `http://127.0.0.1:5173`

## Langue (FR/NL) avec HashRouter

Priorité de résolution de la langue:

1. URL `?lang=`
2. `localStorage` (`patatos_lang`)
3. Langue navigateur (`navigator.languages` / `navigator.language`)
4. Défaut `fr`

Formats d'URL supportés:

- `https://.../Patatos/?lang=nl#/planning`
- `https://.../Patatos/#/planning?lang=nl`

Quand la langue est changée via le Header, le site met à jour `localStorage` et canonicalise l'URL en écrivant `?lang=` avant le hash, sans modifier le hash de route.

Mini test manuel (Header mobile):
- Ouvrir le site en largeur `<880px` et vérifier que les contrôles Thème/Langue sont visibles dans la barre.
- Ouvrir le burger et vérifier que ces contrôles restent visibles + cliquables, et que le dropdown contient uniquement les liens de navigation.

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

## UI guidelines (Design system)

Guide court pour les tokens d'espacement et les classes communes:

- [docs/ui.md](docs/ui.md)

## Mettre à jour le planning

Le planning central est dans `src/data/planning.js`.

Règles d'édition (modèle actuel):

1. Ajouter/mettre à jour un événement avec un `id` stable, `order`, `period` (technique FR), `type`, `phaseId`, `status` et les champs utiles (`isIndicative`, `validation`, etc.).
2. Conserver des `phaseId` stables: `preparation`, `plantation`, `suivi`, `recolte`, `conservation`.
3. Ajouter les traductions associées dans `src/i18n/locales/fr.json` et `src/i18n/locales/nl.json` sous `planning.events.<id>.*`.

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

# Patatos — AGENTS.md (Project instructions)

## 1) Commandes obligatoires avant tout commit
- `npm run lint`
- `npm run build`
- `npm run i18n:check`

## 2) Contexte technique
- Vite + React
- Déployé sur GitHub Pages en project site => base = `/Patatos/`
- Router = `HashRouter`
- Tous les assets publics doivent être résolus avec `import.meta.env.BASE_URL` (jamais `src="/..."`)

## 3) Règles i18n (FR/NL)
- Toute chaîne UI visible doit passer par i18n (`react-i18next`).
- Éviter tout hardcode FR/NL dans `src/pages` et `src/components`.
- Pour les data-driven keys (ex: variétés, planning), conserver la logique existante et compléter les clés FR/NL.
- Les `alt` / `aria-label` doivent être traduits (`t("...")`).

## 4) UI / Design System (harmonisation)
- Réutiliser les tokens + classes communes définis dans `src/styles/global.css` et `docs/ui.md`.
- Wrappers pages: `container page page-block`
- Sections: `section stack` ou `section section-tight stack`
- Titres: `page-title` / `page-subtitle` / `section-title` / `section-subtitle`
- Composants: `card`, `table-wrap + table`, `chip-row + chip`
- Éviter des marges/paddings au hasard dans les pages: préférer tokens/classes.

## 5) Header / responsive (non-régression)
- Ne pas casser: burger, toggle langue (1 bouton), toggle thème (1 bouton icône-only).
- Ne jamais casser le sizing pixel-perfect des boutons du header.
- Wordmark + logo: toujours via `BASE_URL`.
- Tester visuellement à `320/360/390/420/880 px`.

## 6) Qualité / Git / Commits
- Petits commits ciblés, messages clairs (`feat` / `fix` / `style` / `chore` / `docs`).
- Ne pas mélanger refactor + feature dans le même commit.
- Pas de fichiers inutiles dans `public/` (nettoyer/ignorer ce qui n’est pas utilisé).

## 7) Quand tu n’es pas sûr
- Faire une recherche dans le repo (`rg`) et citer les fichiers/sections touchés.
- Proposer 2 options max et choisir celle qui minimise les risques (non-régression).

FIN

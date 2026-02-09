# UI Guidelines (Design System Light)

## But

Harmoniser l'UI (marges, paddings, typos, composants visuels) avec des tokens CSS et des classes communes, sans refonte.

## Design tokens (source)

Les tokens sont définis dans `src/styles/global.css`:

- `--page-max`
- `--page-pad-x`
- `--section-pad-y`
- `--section-pad-y-tight`
- `--stack-gap`
- `--card-pad`
- `--card-radius`
- `--card-shadow`
- `--title-gap`

Note mobile: sous `420px`, une media query réduit `--section-pad-y`, `--section-pad-y-tight` et `--stack-gap` pour éviter des pages trop "hautes" et garder un rythme plus compact.

## Classes standard a utiliser dans les pages

Wrapper page:

- `container page page-block`

Sections:

- `section stack`
- `section section-tight stack`

Titres:

- `page-title`
- `page-subtitle`
- `section-title`
- `section-subtitle`

Composants:

- `card`
- `table-wrap` + `table`
- `chip-row` + `chip`

## Exemples copiables

### Squelette de page

```jsx
<div className="container page page-block">
  <section className="section section-tight stack">
    <h1 className="page-title">{t("...")}</h1>
    <p className="section-intro page-subtitle">{t("...")}</p>
  </section>

  <section className="section stack">
    <h2 className="section-title">{t("...")}</h2>
    <p className="section-subtitle muted-text">{t("...")}</p>
  </section>
</div>
```

### Section avec cards

```jsx
<section className="section stack">
  <h2 className="section-title">{t("...")}</h2>
  <div className="grid three-columns">
    <Card title={t("...")}>...</Card>
    <Card title={t("...")}>...</Card>
    <Card title={t("...")}>...</Card>
  </div>
</section>
```

### Table dans table-wrap

```jsx
<section className="section stack">
  <h2 className="section-title">{t("...")}</h2>
  <div className="table-wrap">
    <table className="table">
      <thead>...</thead>
      <tbody>...</tbody>
    </table>
  </div>
</section>
```

## Regles rapides

- Toujours utiliser `stack` pour les espacements verticaux internes.
- Eviter les `margin-top` locaux "au hasard" dans les pages.
- Reutiliser `card`, `table`, `chip` avant de creer une nouvelle variante.
- Garder les tokens comme source de verite pour les espacements.
- Verifier les rendus aux largeurs `320`, `360`, `390`, `420`, `880`.

import { useEffect, useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { varieties } from "../data/varieties";

const RECAP_ID = "recap-varietes";
const VARIETE_PREFIX = "variete-";
const VARIETES_ROUTE = "/varietes";

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getFocusParamFromUrl() {
  const url = new URL(window.location.href);
  const focusFromSearch = url.searchParams.get("focus");
  if (focusFromSearch) {
    return focusFromSearch;
  }

  const hashValue = url.hash.replace(/^#/, "");
  const [, hashQuery = ""] = hashValue.split("?");
  return new URLSearchParams(hashQuery).get("focus");
}

function getTargetIdFromFocus(focus) {
  if (!focus) {
    return "";
  }

  if (focus === "recap") {
    return RECAP_ID;
  }

  if (focus.startsWith(VARIETE_PREFIX)) {
    return focus;
  }

  return "";
}

function updateFocusParam(focus) {
  const url = new URL(window.location.href);
  const hashValue = url.hash.replace(/^#/, "");
  const [hashPathRaw, hashQuery = ""] = hashValue.split("?");
  const hashPath = (hashPathRaw.split("#")[0] || VARIETES_ROUTE).trim();

  const params = new URLSearchParams(hashQuery);
  params.set("focus", focus);

  const nextHash = `${hashPath}?${params.toString()}`;
  window.history.replaceState({}, "", `${url.pathname}#${nextHash}`);
}

function Varietes() {
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    const focus = getFocusParamFromUrl();
    const targetId = getTargetIdFromFocus(focus);
    if (!targetId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const scrollToAnchor = (event, targetId, focus) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    updateFocusParam(focus);
  };

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Variétés 🥔</h1>
        <p className="section-intro">
          Liste Patatos 2026: aperçu simple des variétés, périodes de saison et usages pratiques.
        </p>
      </section>

      <section className="section">
        <Card title="Repères de saison">
          <p>Toutes les périodes sont des repères: on ajuste selon météo, sol et observation des plants.</p>
        </Card>
      </section>

      <section className="section anchor-offset" id={RECAP_ID}>
        <h2>Récapitulatif</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variété</th>
                <th>Type</th>
                <th>Plantation</th>
                <th>Récolte</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {varieties.map((item) => {
                const slug = toSlug(item.name);
                const targetId = `variete-${slug}`;

                return (
                  <tr key={item.name}>
                    <td>
                      <a
                        href={`#${VARIETES_ROUTE}?focus=${targetId}`}
                        onClick={(event) => scrollToAnchor(event, targetId, targetId)}
                      >
                        {item.name} <span aria-hidden="true">→</span>
                      </a>
                    </td>
                    <td>
                      <strong>{item.type}</strong>
                    </td>
                    <td>{item.planting}</td>
                    <td>{item.harvest}</td>
                    <td>{item.usage}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Détails des variétés</h2>
        <div className="grid three-columns">
          {varieties.map((item) => {
            const slug = toSlug(item.name);
            const targetId = `variete-${slug}`;
            const rawImage = item.image?.trim();
            const imgSrc = rawImage ? `${import.meta.env.BASE_URL}${rawImage}` : "";
            const showPlaceholder = !imgSrc || brokenImages[item.name];

            return (
              <div key={item.name} id={targetId} className="anchor-offset">
                <Card>
                  <div className="variety-card-header">
                    {showPlaceholder ? (
                      <span className="variety-thumb-placeholder" aria-label={`Placeholder pour ${item.name}`}>
                        🥔
                      </span>
                    ) : (
                      <img
                        src={imgSrc}
                        alt={`Pomme de terre ${item.name}`}
                        className="variety-thumb"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                          setBrokenImages((prev) => ({ ...prev, [item.name]: true }));
                        }}
                      />
                    )}
                    <div>
                      <h3>{item.name}</h3>
                      <Badge tone={item.type === "précoce" ? "plantation" : "conservation"}>{item.type}</Badge>
                    </div>
                  </div>

                  <div className="variety-meta">
                    <p>
                      <strong>Plantation:</strong> {item.planting}
                    </p>
                    <p>
                      <strong>Récolte:</strong> {item.harvest}
                    </p>
                    <p>
                      <strong>Usage:</strong> {item.usage}
                    </p>
                  </div>

                  <a
                    href={`#${VARIETES_ROUTE}?focus=recap`}
                    onClick={(event) => scrollToAnchor(event, RECAP_ID, "recap")}
                  >
                    Retour au récap ↑
                  </a>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Conseils récolte</h2>
        <Card>
          <ul className="tips-list">
            <li>Feuillage qui jaunit: signe que la maturité approche.</li>
            <li>Peau qui tient quand tu frottes doucement: bon indicateur.</li>
            <li>Fais un test sur un pied avant de lancer toute la récolte.</li>
          </ul>
        </Card>
      </section>

      <section className="section">
        <h2>Conseils conservation</h2>
        <Card>
          <ul className="tips-list">
            <li>Stocker au frais, au sec et à l&apos;obscurité.</li>
            <li>Ne pas laver avant stockage.</li>
            <li>Trier régulièrement pour retirer les tubercules abîmés.</li>
          </ul>
        </Card>
      </section>
    </div>
  );
}

export default Varietes;

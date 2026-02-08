import { useEffect, useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { varieties } from "../data/varieties";

const RECAP_ID = "recap-varietes";
const VARIETE_PREFIX = "variete-";

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getAnchorIdFromHash(hashValue) {
  const normalizedHash = hashValue.replace(/^#/, "");
  if (!normalizedHash) {
    return "";
  }

  const segments = normalizedHash.split("#").reverse();
  return segments.find((segment) => segment.startsWith(VARIETE_PREFIX) || segment === RECAP_ID) ?? "";
}

function updateVarietesHash(anchorId) {
  window.location.hash = `/varietes#${anchorId}`;
}

function Varietes() {
  const [brokenImages, setBrokenImages] = useState({});

  useEffect(() => {
    const anchorId = getAnchorIdFromHash(window.location.hash);
    if (!anchorId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(anchorId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const scrollToAnchor = (event, targetId) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    updateVarietesHash(targetId);
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
                      <a href={`#${targetId}`} onClick={(event) => scrollToAnchor(event, targetId)}>
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
            const showPlaceholder = !item.image || brokenImages[item.name];

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
                        src={item.image}
                        alt={`Pomme de terre ${item.name}`}
                        className="variety-thumb"
                        onError={() => {
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

                  <a href={`#${RECAP_ID}`} onClick={(event) => scrollToAnchor(event, RECAP_ID)}>
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

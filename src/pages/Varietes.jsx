import { useState } from "react";
import Card from "../components/Card";
import { varieties } from "../data/varieties";

function Varietes() {
  const [brokenImages, setBrokenImages] = useState({});

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

      <section className="section">
        <div className="grid two-columns">
          <Card title="Précoces">
            <p>En général, elles se récoltent plus tôt pour une conso rapide.</p>
          </Card>
          <Card title="Conservation">
            <p>En général, elles restent plus longtemps en terre et se stockent mieux.</p>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Listing des variétés</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Variété</th>
                <th>Type</th>
                <th>Plantation</th>
                <th>Récolte</th>
                <th>Usage</th>
              </tr>
            </thead>
            <tbody>
              {varieties.map((item) => {
                const showPlaceholder = !item.image || brokenImages[item.name];

                return (
                  <tr key={item.name}>
                    <td>
                      {showPlaceholder ? (
                        <span
                          aria-label={`Placeholder pour ${item.name}`}
                          style={{
                            width: 48,
                            height: 48,
                            display: "inline-grid",
                            placeItems: "center",
                            borderRadius: 12,
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            background: "rgba(255, 255, 255, 0.08)",
                            fontSize: 22,
                          }}
                        >
                          🥔
                        </span>
                      ) : (
                        <img
                          src={item.image}
                          alt={`Pomme de terre ${item.name}`}
                          style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 12 }}
                          onError={() => {
                            setBrokenImages((prev) => ({ ...prev, [item.name]: true }));
                          }}
                        />
                      )}
                    </td>
                    <td>{item.name}</td>
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

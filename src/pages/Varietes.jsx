import { useMemo, useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { varieties } from "../data/varieties";

function Varietes() {
  const [stateFilter, setStateFilter] = useState("all");

  const filteredVarieties = useMemo(() => {
    if (stateFilter === "all") {
      return varieties;
    }

    return varieties.filter((item) => item.state === stateFilter);
  }, [stateFilter]);

  const confirmedCount = varieties.filter((item) => item.state === "confirme").length;
  const toConfirmCount = varieties.filter((item) => item.state === "a_confirmer").length;

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Variétés 🥔</h1>
        <p className="section-intro">
          Liste Patatos 2026: aucune info n'est marquée confirmée sans preuve (étiquette, fiche fournisseur, Horta).
        </p>
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
        <Card title="Checklist de confirmation">
          <ul className="tips-list">
            <li>Photo de l'étiquette du sac</li>
            <li>Source fournisseur (Horta / fiche)</li>
            <li>Usage confirmé</li>
            <li>Période de récolte confirmée</li>
          </ul>
          <p className="muted-text">
            Dès qu'on a une preuve, on passe l'état à "confirme" et on remplit type/usage/période.
          </p>
        </Card>
      </section>

      <section className="section">
        <div className="status-filter" role="group" aria-label="Filtrer les variétés par état">
          <button
            type="button"
            className={`filter-chip${stateFilter === "all" ? " is-active" : ""}`}
            onClick={() => setStateFilter("all")}
          >
            Toutes ({varieties.length})
          </button>
          <button
            type="button"
            className={`filter-chip${stateFilter === "confirme" ? " is-active" : ""}`}
            onClick={() => setStateFilter("confirme")}
          >
            Confirmées ({confirmedCount})
          </button>
          <button
            type="button"
            className={`filter-chip${stateFilter === "a_confirmer" ? " is-active" : ""}`}
            onClick={() => setStateFilter("a_confirmer")}
          >
            À confirmer ({toConfirmCount})
          </button>
        </div>
      </section>

      <section className="section">
        <h2>Listing des variétés</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variété</th>
                <th>État</th>
                <th>Type</th>
                <th>Récolte</th>
                <th>Usage</th>
                <th>Source</th>
                <th>Preuve</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredVarieties.map((item) => {
                const isConfirmed = item.state === "confirme";

                return (
                  <tr key={item.name}>
                    <td>{item.name}</td>
                    <td>
                      <Badge tone={isConfirmed ? "done" : "todo"}>
                        {isConfirmed ? "Confirmée" : "À confirmer"}
                      </Badge>
                    </td>
                    <td>{isConfirmed ? <strong>{item.type}</strong> : "à confirmer"}</td>
                    <td>{isConfirmed ? item.harvest : "à confirmer (indicatif)"}</td>
                    <td>{isConfirmed ? item.usage : ""}</td>
                    <td>{item.source}</td>
                    <td>{item.proof || ""}</td>
                    <td>{item.notes}</td>
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

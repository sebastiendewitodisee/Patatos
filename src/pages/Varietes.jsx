import Card from "../components/Card";
import { varieties } from "../data/varieties";

function Varietes() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Variétés 🥔</h1>
        <p className="section-intro">
          On garde une vue simple: distinction précoces vs conservation, et on confirme les détails au fur et à
          mesure.
        </p>
      </section>

      <section className="section">
        <div className="grid two-columns">
          <Card title="Précoces">
            <p>
              Les variétés précoces se récoltent plus tôt, souvent pour une conso rapide. Elles sont top pour les
              premières frites 🍟.
            </p>
          </Card>
          <Card title="Conservation">
            <p>
              Les variétés de conservation restent plus longtemps en terre et tiennent mieux sur la durée en stock.
            </p>
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Listing des variétés</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variété</th>
                <th>Type</th>
                <th>Récolte</th>
                <th>Note</th>
              </tr>
            </thead>
            <tbody>
              {varieties.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.harvest}</td>
                  <td>{item.note}</td>
                </tr>
              ))}
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

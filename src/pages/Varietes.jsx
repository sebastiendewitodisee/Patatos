import Card from "../components/Card";
import { varieties } from "../data/varieties";

function Varietes() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Variétés 🥔</h1>
        <p className="section-intro">
          On garde ici une vue claire de la liste. Les infos non vérifiées restent marquées "à confirmer".
        </p>
      </section>

      <section className="section">
        <div className="grid two-columns">
          <Card title="Précoces">
            <p>
              Les variétés précoces servent en général à récolter plus tôt pour une conso rapide.
            </p>
          </Card>
          <Card title="Conservation">
            <p>
              Les variétés de conservation sont plutôt prévues pour une récolte plus tardive et un stockage plus long.
            </p>
          </Card>
        </div>
      </section>

      <section className="section">
        <Card>
          <p>
            Important: on n'invente pas les détails. Tant que le type ou la période n'est pas vérifié, on laisse
            "à confirmer".
          </p>
        </Card>
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
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {varieties.map((item) => (
                <tr key={item.name}>
                  <td>{item.name}</td>
                  <td>{item.type}</td>
                  <td>{item.harvest}</td>
                  <td>{item.notes}</td>
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

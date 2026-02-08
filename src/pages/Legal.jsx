import Card from "../components/Card";

function Legal() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Mentions légales</h1>
      </section>

      <section className="section">
        <Card>
          <p>Site interne du projet Team Patates Patatos.</p>
          <p>Données gérées localement dans le repo, sans backend.</p>
          <p>Si besoin, adapte cette page avec les infos légales du groupe.</p>
        </Card>
      </section>
    </div>
  );
}

export default Legal;

import Card from "../components/Card";

const tasks = [
  "Préparation du terrain",
  "Plantation",
  "Buttage",
  "Arrosage",
  "Surveillance maladies",
  "Récolte, tri et stockage",
];

function Organisation() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Organisation 🌱</h1>
        <p className="section-intro">
          On reste souples, mais on garde un cadre simple pour avancer sans friction.
        </p>
      </section>

      <section className="section">
        <Card title="Liste des tâches">
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </Card>
      </section>

      <section className="section">
        <Card className="highlight-card">
          <p className="highlight-line">N&apos;hésitez pas à poser des questions si besoin !</p>
          <p className="highlight-line">Qui est partant ? Même si c&apos;est juste pour une petite part 🙂</p>
        </Card>
      </section>
    </div>
  );
}

export default Organisation;

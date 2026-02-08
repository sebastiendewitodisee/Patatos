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
          Objectif: rester souples entre potes, mais assez carrés pour que le planning avance vraiment.
        </p>
      </section>

      <section className="section">
        <Card title="Liste des tâches">
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
          <p className="muted-text">On se répartit les rôles selon les dispos, puis on met à jour le planning central.</p>
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

import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { planningEvents, STATUS_META } from "../data/planning";
import { formatDateFr, getLatestUpdates, getUpcomingEvent } from "../utils/planning";

function Home() {
  const latestUpdates = getLatestUpdates(planningEvents, 3);
  const upcomingEvent = getUpcomingEvent(planningEvents);

  return (
    <div className="container page-block home-page">
      <section className="hero-panel">
        <p className="eyebrow">Team Patates Patatos</p>
        <h1>
          Opération Récolte <span aria-hidden="true">🥔</span>
        </h1>
        <p className="hero-copy">
          Un projet entre potes, fun mais organisé: on prépare, on plante, on suit, puis on partage la récolte.
        </p>

        <div className="cta-row">
          <Link to="/planning" className="btn btn-primary">
            Aller au planning
          </Link>
          <Link to="/equipe" className="btn">
            Aller à l&apos;équipe
          </Link>
          <Link to="/varietes" className="btn btn-ghost">
            Aller aux variétés
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Le concept</h2>
        <div className="grid three-columns">
          <Card title="Simple">
            Un planning clair, une checklist et des infos qui vont à l&apos;essentiel.
          </Card>
          <Card title="Fun">
            Une ambiance entre potes, avec nos mascottes patates et un peu de bonne humeur 🌱
          </Card>
          <Card title="Efficace">
            Chaque étape est visible pour éviter les oublis et avancer ensemble.
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Dernières mises à jour</h2>
        <div className="grid three-columns">
          {latestUpdates.map((item) => {
            const status = STATUS_META[item.status] ?? STATUS_META["a-faire"];

            return (
              <Card key={item.id} title={item.title}>
                <p className="muted-text">Mis à jour le {formatDateFr(item.updatedAt ?? item.date)}</p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Prochain rendez-vous</h2>
        <Card className="next-event-card">
          {upcomingEvent ? (
            <>
              <p className="next-event-title">{upcomingEvent.title}</p>
              <p className="muted-text">Prévu le {formatDateFr(upcomingEvent.date)}</p>
              <p>{upcomingEvent.description}</p>
            </>
          ) : (
            <p>Pas d&apos;événement à venir pour le moment. Ajoute-en un dans le planning.</p>
          )}
        </Card>
      </section>
    </div>
  );
}

export default Home;

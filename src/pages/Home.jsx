import { Link } from "react-router-dom";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { planningEvents, STATUS_META } from "../data/planning";
import {
  formatDateFr,
  getEventScheduleLabel,
  getLatestUpdates,
  getUpcomingEvent,
  isEventIndicative,
} from "../utils/planning";

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
          Projet entre potes, cadré sans prise de tête: on suit les étapes, on ajuste ensemble et on avance proprement.
        </p>

        <div className="cta-row">
          <Link to="/planning" className="btn btn-primary">
            Voir le planning central
          </Link>
          <Link to="/equipe" className="btn">
            Voir l&apos;équipe
          </Link>
          <Link to="/varietes" className="btn btn-ghost">
            Voir les variétés
          </Link>
        </div>
      </section>

      <section className="section">
        <h2>Le concept</h2>
        <div className="grid three-columns">
          <Card title="Simple">Un seul planning partagé, mis à jour au fil des sessions.</Card>
          <Card title="Fun">Ambiance cool, entraide et petites patates mascottes 🌱</Card>
          <Card title="Efficace">
            On priorise l&apos;utile: qui fait quoi, à peu près quand, et ce qu&apos;il reste à confirmer.
          </Card>
        </div>
      </section>

      <section className="section">
        <h2>Dernières mises à jour</h2>
        <div className="grid three-columns">
          {latestUpdates.map((item) => {
            const status = STATUS_META[item.status] ?? STATUS_META.todo;

            return (
              <Card key={item.id} title={item.title}>
                <p className="muted-text">Mis à jour le {formatDateFr(item.updatedAt)}</p>
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
              <p className="muted-text">{getEventScheduleLabel(upcomingEvent)}</p>
              {isEventIndicative(upcomingEvent) ? (
                <p className="muted-text">Repère indicatif: on valide sur place selon la météo et les plants.</p>
              ) : null}
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

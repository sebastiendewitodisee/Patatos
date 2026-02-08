import Card from "../components/Card";
import { teamMembers } from "../data/team";

function Team() {
  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>L&apos;équipe 🧑‍🌾</h1>
        <p className="section-intro">Le noyau dur de Team Patates Patatos, version mascottes incluses.</p>
      </section>

      <section className="section">
        <div className="grid two-columns team-grid">
          {teamMembers.map((member) => (
            <Card key={member.name} className="team-card">
              <div className="team-avatar" aria-hidden="true">
                {member.emoji}
              </div>
              <div>
                <h2>{member.name}</h2>
                <p>{member.detail}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Team;

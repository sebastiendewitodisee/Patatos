import { useState } from "react";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { teamMembers } from "../data/team";

function Team() {
  const [imageErrors, setImageErrors] = useState({});

  function handleImageError(memberName) {
    setImageErrors((current) => {
      if (current[memberName]) {
        return current;
      }

      return { ...current, [memberName]: true };
    });
  }

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>Équipe 🧑‍🌾</h1>
        <p className="section-intro">La team Patatos avance ensemble: simple, efficace et toujours dans la bonne humeur.</p>
      </section>

      <section className="section">
        <div className="team-grid">
          {teamMembers.map((member) => {
            const imgSrc = member.image ? `${import.meta.env.BASE_URL}${member.image}` : "";
            const hasImage = Boolean(imgSrc) && !imageErrors[member.name];

            return (
              <Card key={member.name} className="team-card">
                <div className="team-card-header">
                  <div className="team-avatar">
                    {hasImage ? (
                      <img
                        src={imgSrc}
                        alt={`Photo de ${member.name}`}
                        loading="lazy"
                        onError={() => handleImageError(member.name)}
                      />
                    ) : (
                      <span className="team-avatar-placeholder" aria-hidden="true">
                        🥔
                      </span>
                    )}
                  </div>

                  <div className="team-card-body">
                    <h2 className="team-name">{member.name}</h2>
                    <Badge tone="neutral">Team Patatos</Badge>
                  </div>
                </div>

                {member.role ? <p className="muted-text">{member.role}</p> : null}
                {member.note ? <p className="muted-text">{member.note}</p> : null}
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Team;

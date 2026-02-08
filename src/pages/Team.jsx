import { useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { teamMembers } from "../data/team";

function Team() {
  const { t } = useTranslation();
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
        <h1>{t("team.title")}</h1>
        <p className="section-intro">{t("team.intro")}</p>
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
                        alt={t("team.image_alt", { name: member.name })}
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
                    <Badge tone="neutral">{t("team.badge")}</Badge>
                  </div>
                </div>

                <p className="muted-text">{t(`team.members.${member.id}.role`)}</p>
                <p className="muted-text">{t(`team.members.${member.id}.note`)}</p>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Team;

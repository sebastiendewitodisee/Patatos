import { useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { teamMembers } from "../data/team";

function Team() {
  const { t } = useTranslation();
  const [imageErrors, setImageErrors] = useState({});
  const avatarFocusByMemberId = {
    denis: "18%",
    sebastien1: "16%",
    sebastien2: "18%",
    josh: "20%",
    melvin: "18%",
  };

  const statsItems = [
    { key: "members", value: String(teamMembers.length) },
    { key: "season", value: t("team.stats.seasonValue") },
    { key: "motto", value: t("team.stats.mottoValue") },
  ];

  function handleImageError(memberId) {
    setImageErrors((current) => {
      if (current[memberId]) {
        return current;
      }

      return { ...current, [memberId]: true };
    });
  }

  return (
    <div className="container page-block team-page">
      <section className="section section-tight">
        <h1>{t("team.title")}</h1>
        <p className="section-intro">{t("team.intro")}</p>
      </section>

      <section className="section">
        <Card className="team-stats-card">
          <div className="team-stats-grid">
            {statsItems.map((item) => (
              <div key={item.key} className="team-stat">
                <p className="muted-text">{t(`team.stats.${item.key}`)}</p>
                <p className="team-stat-value">{item.value}</p>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <section className="section">
        <div className="team-grid">
          {teamMembers.map((member) => {
            const imgSrc = member.avatar ? `${import.meta.env.BASE_URL}${member.avatar}` : "";
            const hasImage = Boolean(imgSrc) && !imageErrors[member.id];

            return (
              <div key={member.id} className="team-card-shell" tabIndex={0}>
                <Card className="team-card">
                  <div className="team-card-head">
                    <div className="team-avatar" style={{ "--avatar-focus-y": avatarFocusByMemberId[member.id] ?? "20%" }}>
                      {hasImage ? (
                        <img
                          src={imgSrc}
                          alt={member.name}
                          loading="lazy"
                          onError={() => handleImageError(member.id)}
                        />
                      ) : (
                        <span className="team-avatar-fallback" aria-hidden="true">
                          🥔
                        </span>
                      )}
                    </div>

                    <div className="team-card-body">
                      <h2 className="team-name">{member.name}</h2>
                      <Badge tone="neutral">{t(member.roleKey)}</Badge>
                    </div>
                  </div>

                  <p className="muted-text">{t(member.taglineKey)}</p>
                  <p className="muted-text team-focus-line">
                    <strong>{t("team.focus.label")}:</strong> {t("team.focus.value")}
                  </p>
                </Card>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Team;

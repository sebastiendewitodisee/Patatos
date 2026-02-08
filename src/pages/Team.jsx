import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";

const avatarFocusByMemberId = {
  denis: "12%",
  sebastien1: "18%",
  sebastien2: "20%",
  josh: "16%",
  melvin: "18%",
};

const teamMembers = [
  {
    id: "denis",
    name: "Denis",
    image: "team/denis.png",
    roles: ["team.roles.coordinator", "team.roles.logistics"],
    taglineKey: "team.taglines.denis",
    focusKey: "team.focus.items.denis",
    featured: true,
  },
  {
    id: "sebastien1",
    name: "S\u00E9bastien \"le vrai\"",
    image: "team/sebastien1.png",
    roles: ["team.roles.lead", "team.roles.support"],
    taglineKey: "team.taglines.sebastien1",
    focusKey: "team.focus.items.sebastien1",
  },
  {
    id: "sebastien2",
    name: "S\u00E9bastien",
    image: "team/sebastien2.png",
    roles: ["team.roles.support"],
    taglineKey: "team.taglines.sebastien2",
    focusKey: "team.focus.items.sebastien2",
  },
  {
    id: "josh",
    name: "Josh",
    image: "team/josh.png",
    roles: ["team.roles.logistics"],
    taglineKey: "team.taglines.josh",
    focusKey: "team.focus.items.josh",
  },
  {
    id: "melvin",
    name: "Melvin",
    image: "team/melvin.png",
    roles: ["team.roles.plants"],
    taglineKey: "team.taglines.melvin",
    focusKey: "team.focus.items.melvin",
  },
];

const heroChipKeys = ["team.hero.chip1", "team.hero.chip2", "team.hero.chip3"];

function Team() {
  const { t } = useTranslation();
  const [imageErrors, setImageErrors] = useState({});
  const [roleFilter, setRoleFilter] = useState("all");

  const roleOptions = useMemo(() => {
    const roleSet = new Set(teamMembers.flatMap((member) => member.roles));
    return Array.from(roleSet);
  }, []);

  const filteredMembers = useMemo(() => {
    if (roleFilter === "all") {
      return teamMembers;
    }

    return teamMembers.filter((member) => member.roles.includes(roleFilter));
  }, [roleFilter]);

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
      <section className="section section-tight team-hero">
        <div className="team-hero-copy">
          <span className="team-hero-badge">{t("team.hero.badge")}</span>
          <h1>{t("team.title")}</h1>
          <p className="section-intro">{t("team.intro")}</p>
          <div className="team-chip-row" aria-label={t("team.hero.chips_aria")}>
            {heroChipKeys.map((chipKey) => (
              <span key={chipKey} className="team-hero-chip">
                {t(chipKey)}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="team-stats-premium">
          {statsItems.map((item) => (
            <div key={item.key} className="team-stat-card">
              <p className="muted-text">{t(`team.stats.${item.key}`)}</p>
              <p className="team-stat-value">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="team-members-head">
          <h2 className="section-title">{t("team.sections.members_title")}</h2>
          <p className="muted-text">{t("team.sections.members_subtitle")}</p>
        </div>

        <div className="team-filters" aria-label={t("team.filters.title")}>
          <p className="team-filters-label">{t("team.filters.title")}</p>

          <div className="team-filter-chips" role="group" aria-label={t("team.filters.title")}>
            <button
              type="button"
              className={`filter-chip team-filter-chip${roleFilter === "all" ? " is-active" : ""}`}
              onClick={() => setRoleFilter("all")}
            >
              {t("team.filters.all_roles")}
            </button>

            {roleOptions.map((roleKey) => (
              <button
                key={roleKey}
                type="button"
                className={`filter-chip team-filter-chip${roleFilter === roleKey ? " is-active" : ""}`}
                onClick={() => setRoleFilter(roleKey)}
              >
                {t(roleKey)}
              </button>
            ))}
          </div>

          <p className="muted-text team-filters-count">{t("team.filters.count", { count: filteredMembers.length })}</p>
        </div>

        <div className="team-grid">
          {filteredMembers.map((member, index) => {
            const imgSrc = member.image ? `${import.meta.env.BASE_URL}${member.image}` : "";
            const hasImage = Boolean(imgSrc) && !imageErrors[member.id];
            const cardClassName = member.featured ? "team-card is-featured" : "team-card";

            return (
              <article key={member.id} className={cardClassName} tabIndex={0} style={{ "--delay": `${index * 60}ms` }}>
                <div className="team-card-head">
                  <div className="team-avatar" style={{ "--avatar-focus-y": avatarFocusByMemberId[member.id] ?? "18%" }}>
                    {hasImage ? (
                      <img src={imgSrc} alt={member.name} loading="lazy" onError={() => handleImageError(member.id)} />
                    ) : (
                      <span className="team-avatar-fallback" aria-hidden="true">
                        {"\uD83E\uDD54"}
                      </span>
                    )}
                  </div>

                  <div className="team-card-body">
                    <h3 className="team-name">{member.name}</h3>
                    <p className="muted-text team-tagline">{t(member.taglineKey)}</p>
                  </div>
                </div>

                <div className="team-role-row" aria-label={t("team.member_labels.roles")}>
                  {member.roles.map((roleKey) => (
                    <Badge key={`${member.id}-${roleKey}`} tone="neutral">
                      {t(roleKey)}
                    </Badge>
                  ))}
                </div>

                <p className="muted-text team-focus-line">
                  <strong>{t("team.focus.label")}:</strong> {t(member.focusKey)}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default Team;

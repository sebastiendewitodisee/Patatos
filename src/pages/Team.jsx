import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";

const ROLE_ORDER = ["lead", "coordinator", "logistics", "support", "plants"];
const HERO_CHIP_KEYS = ["team.hero.chip1", "team.hero.chip2", "team.hero.chip3"];

const TEAM_MEMBERS = [
  {
    id: "denis",
    name: "Denis",
    avatar: "team/denis.png",
    roleKey: "coordinator",
    secondaryRoles: ["logistics"],
    taglineKey: "team.taglines.denis",
    focusKey: "team.focus.items.denis",
    focusY: "12%",
    featured: true,
  },
  {
    id: "sebastien1",
    name: "S\u00E9bastien \"le vrai\"",
    avatar: "team/sebastien1.png",
    roleKey: "lead",
    secondaryRoles: ["support"],
    taglineKey: "team.taglines.sebastien1",
    focusKey: "team.focus.items.sebastien1",
    focusY: "18%",
  },
  {
    id: "sebastien2",
    name: "S\u00E9bastien",
    avatar: "team/sebastien2.png",
    roleKey: "support",
    secondaryRoles: [],
    taglineKey: "team.taglines.sebastien2",
    focusKey: "team.focus.items.sebastien2",
    focusY: "20%",
  },
  {
    id: "josh",
    name: "Josh",
    avatar: "team/josh.png",
    roleKey: "logistics",
    secondaryRoles: [],
    taglineKey: "team.taglines.josh",
    focusKey: "team.focus.items.josh",
    focusY: "16%",
  },
  {
    id: "melvin",
    name: "Melvin",
    avatar: "team/melvin.png",
    roleKey: "plants",
    secondaryRoles: [],
    taglineKey: "team.taglines.melvin",
    focusKey: "team.focus.items.melvin",
    focusY: "18%",
  },
];

function Team() {
  const { t } = useTranslation();
  const groupPhotoSrc = `${import.meta.env.BASE_URL}team/team.png`;
  const [imageErrors, setImageErrors] = useState({});
  const [roleFilter, setRoleFilter] = useState("all");
  const [query, setQuery] = useState("");

  const roleOptions = useMemo(() => {
    const roleSet = new Set();

    TEAM_MEMBERS.forEach((member) => {
      roleSet.add(member.roleKey);
      member.secondaryRoles.forEach((role) => roleSet.add(role));
    });

    return Array.from(roleSet).sort((left, right) => {
      const leftIndex = ROLE_ORDER.indexOf(left);
      const rightIndex = ROLE_ORDER.indexOf(right);

      if (leftIndex === -1 && rightIndex === -1) {
        return left.localeCompare(right);
      }

      if (leftIndex === -1) {
        return 1;
      }

      if (rightIndex === -1) {
        return -1;
      }

      return leftIndex - rightIndex;
    });
  }, []);

  const normalizedQuery = query.trim().toLocaleLowerCase();

  const filteredMembers = useMemo(() => {
    return TEAM_MEMBERS.filter((member) => {
      const roleMatch =
        roleFilter === "all" || member.roleKey === roleFilter || member.secondaryRoles.includes(roleFilter);

      const queryMatch = !normalizedQuery || member.name.toLocaleLowerCase().includes(normalizedQuery);
      return roleMatch && queryMatch;
    });
  }, [normalizedQuery, roleFilter]);

  const hasActiveFilters = roleFilter !== "all" || normalizedQuery.length > 0;
  const ratio = TEAM_MEMBERS.length ? Math.round((filteredMembers.length / TEAM_MEMBERS.length) * 100) : 0;

  function handleImageError(memberId) {
    setImageErrors((current) => {
      if (current[memberId]) {
        return current;
      }

      return { ...current, [memberId]: true };
    });
  }

  function resetFilters() {
    setRoleFilter("all");
    setQuery("");
  }

  return (
    <div className="container page-block team-page">
      <section className="section section-tight team-hero">
        <div className="team-hero-inner">
          <span className="team-hero-badge">{t("team.hero.badge")}</span>
          <h1 className="team-hero-title">{t("team.title")}</h1>
          <p className="team-hero-sub">{t("team.intro")}</p>

          <div className="team-chip-row" aria-label={t("team.hero.chips_aria")}>
            {HERO_CHIP_KEYS.map((chipKey) => (
              <span key={chipKey} className="team-hero-chip">
                {t(chipKey)}
              </span>
            ))}
          </div>

          <figure className="group-photo team-group-photo team-hero-banner">
            <img src={groupPhotoSrc} alt={t("team.group_photo_alt")} loading="lazy" />
            <figcaption>{t("team.group_photo_caption")}</figcaption>
          </figure>
        </div>
      </section>

      <section className="section">
        <div className="team-members-head">
          <h2 className="section-title">{t("team.sections.members_title")}</h2>
          <p className="muted-text">{t("team.sections.members_subtitle")}</p>
        </div>

        <div className="team-filters" aria-label={t("team.filters.title")}>
          <p className="team-filters-label">{t("team.filters.title")}</p>

          <div className="team-filter-tools">
            <div className="team-filter-chips" role="group" aria-label={t("team.filters.title")}>
              <button
                type="button"
                className={`filter-chip team-filter-chip${roleFilter === "all" ? " is-active" : ""}`}
                onClick={() => setRoleFilter("all")}
              >
                {t("team.filters.all")}
              </button>

              {roleOptions.map((roleKey) => (
                <button
                  key={roleKey}
                  type="button"
                  className={`filter-chip team-filter-chip${roleFilter === roleKey ? " is-active" : ""}`}
                  onClick={() => setRoleFilter(roleKey)}
                >
                  {t(`team.roles.${roleKey}`)}
                </button>
              ))}
            </div>

            <div className="team-search-wrap">
              <label className="sr-only" htmlFor="team-search">
                {t("team.filters.search_placeholder")}
              </label>
              <input
                id="team-search"
                type="text"
                className="input team-search-input"
                placeholder={t("team.filters.search_placeholder")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              {hasActiveFilters ? (
                <button type="button" className="filter-chip team-chip-reset" onClick={resetFilters}>
                  {t("team.filters.reset")}
                </button>
              ) : null}
            </div>
          </div>

          <div className="team-results" aria-live="polite">
            <p className="muted-text">{t("team.filters.results", { count: filteredMembers.length, total: TEAM_MEMBERS.length })}</p>
            <div className="team-results-track" aria-hidden="true">
              <span style={{ width: `${ratio}%` }} />
            </div>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <p className="empty-state team-empty">{t("team.ui.no_results")}</p>
        ) : (
          <div className="team-grid">
            {filteredMembers.map((member, index) => {
              const imgSrc = member.avatar ? `${import.meta.env.BASE_URL}${member.avatar}` : "";
              const hasImage = Boolean(imgSrc) && !imageErrors[member.id];
              const allRoles = [member.roleKey, ...member.secondaryRoles];
              const cardClassName = member.featured ? "team-card is-featured" : "team-card";

              return (
                <article
                  key={member.id}
                  className={cardClassName}
                  tabIndex={0}
                  style={{ "--delay": `${index * 50}ms`, "--avatar-focus-y": member.focusY ?? "18%" }}
                >
                  <div className="team-card-head">
                    <div className="team-avatar">
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
                    {allRoles.map((role, roleIndex) => (
                      <Badge key={`${member.id}-${role}`} tone={roleIndex === 0 ? "neutral" : "progress"}>
                        {t(`team.roles.${role}`)}
                      </Badge>
                    ))}
                  </div>

                  <p className="muted-text team-focus-line">
                    <strong>{t("team.ui.highlight")}:</strong> {t(member.focusKey)}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Team;

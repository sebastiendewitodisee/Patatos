import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { planningEvents, STATUS_META } from "../data/planning";
import {
  formatDateLocale,
  getEffectiveStatus,
  getEventScheduleLabel,
  getIndicativeValidationMessage,
  getLatestUpdates,
  getUpcomingEvent,
  isEventIndicative,
} from "../utils/planning";

function getEventText(event, keyName, fallbackKeyName, t) {
  const translationKey = event?.[keyName];
  const fallbackValue = fallbackKeyName ? event?.[fallbackKeyName] : "";

  if (!translationKey) {
    return fallbackValue ?? "";
  }

  return t(translationKey, { defaultValue: fallbackValue ?? "" });
}

function getEventPeriodLabel(event, t, locale, periodFallback, dateFallback) {
  const fallbackLabel = getEventScheduleLabel(event, {
    periodFallback,
    dateFallback,
    locale,
  });

  if (!event?.periodKey) {
    return fallbackLabel;
  }

  return t(event.periodKey, { defaultValue: fallbackLabel });
}

function getEventValidationText(event, t, validationFallback) {
  const fallbackLabel = getIndicativeValidationMessage(event, validationFallback);
  return event?.validationKey ? t(event.validationKey, { defaultValue: fallbackLabel }) : fallbackLabel;
}

function getPostPreviewText(post) {
  const excerpt = String(post?.excerpt ?? "").trim();
  if (excerpt) {
    return excerpt;
  }

  const body = String(post?.body ?? "").trim();
  if (!body) {
    return "";
  }

  return body.length > 160 ? `${body.slice(0, 157)}...` : body;
}

function Home() {
  const { t, i18n } = useTranslation();
  const [latestPosts, setLatestPosts] = useState(null);
  const [isLatestPostsLoading, setIsLatestPostsLoading] = useState(true);
  const groupPhotoSrc = `${import.meta.env.BASE_URL}team/team.png`;
  const latestUpdates = getLatestUpdates(planningEvents, 3);
  const upcomingEvent = getUpcomingEvent(planningEvents);
  const dateFallback = t("planning.fallbacks.date_tbc");
  const periodFallback = t("planning.fallbacks.period_tbc");
  const validationFallback = t("planning.fallbacks.validation");
  const isDutch = i18n.resolvedLanguage?.startsWith("nl");
  const locale = isDutch ? "nl-BE" : "fr-BE";
  const currentLang = isDutch ? "nl" : "fr";
  const hasLatestPosts = Array.isArray(latestPosts) && latestPosts.length > 0;
  const featuredPost = hasLatestPosts ? latestPosts[0] : null;
  const featuredPreview = featuredPost ? getPostPreviewText(featuredPost) : "";
  const secondaryPosts = hasLatestPosts ? latestPosts.slice(1) : [];

  useEffect(() => {
    let cancelled = false;

    const loadLatestPosts = async () => {
      setIsLatestPostsLoading(true);
      const { fetchLatestPublishedPosts } = await import("../lib/postsService");
      const posts = await fetchLatestPublishedPosts(currentLang, 3);

      if (cancelled) {
        return;
      }

      setLatestPosts(posts);
      setIsLatestPostsLoading(false);
    };

    loadLatestPosts();

    return () => {
      cancelled = true;
    };
  }, [currentLang]);

  return (
    <div className="container page page-block home-page">
      <section className="hero-panel">
        <p className="eyebrow">{t("home.eyebrow")}</p>
        <h1 className="page-title">
          {t("home.title")} <span aria-hidden="true">🥔</span>
        </h1>
        <p className="hero-copy">{t("home.subtitle")}</p>
        <figure className="group-photo home-group-photo">
          <img src={groupPhotoSrc} alt={t("team.group_photo_alt")} loading="lazy" />
          <figcaption>{t("team.group_photo_caption")}</figcaption>
        </figure>

        <div className="cta-row">
          <Link to="/planning" className="btn btn-primary">
            {t("home.cta_planning")}
          </Link>
          <Link to="/equipe" className="btn">
            {t("home.cta_team")}
          </Link>
          <Link to="/varietes" className="btn btn-ghost">
            {t("home.cta_varieties")}
          </Link>
        </div>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("home.concept_title")}</h2>
        <div className="grid three-columns">
          <Card title={t("home.concept_simple_title")}>{t("home.concept_simple_text")}</Card>
          <Card title={t("home.concept_fun_title")}>{t("home.concept_fun_text")}</Card>
          <Card title={t("home.concept_efficient_title")}>{t("home.concept_efficient_text")}</Card>
        </div>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("home.latest_updates_title")}</h2>
        <div className="grid three-columns">
          {latestUpdates.map((item) => {
            const statusKey = getEffectiveStatus(item);
            const status = STATUS_META[statusKey] ?? STATUS_META.todo;

            return (
              <Card key={item.id} title={getEventText(item, "titleKey", "title", t)}>
                <p className="muted-text">{t("home.updated_at", { date: formatDateLocale(item.updatedAt, locale, dateFallback) })}</p>
                <Badge tone={status.tone}>{t(`status.${statusKey}`)}</Badge>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("home.next_title")}</h2>
        <Card className="next-event-card">
          {upcomingEvent ? (
            <>
              <p className="next-event-title">{getEventText(upcomingEvent, "titleKey", "title", t)}</p>
              <p className="muted-text">
                {t("common.period_with_value", {
                  value: getEventPeriodLabel(upcomingEvent, t, locale, periodFallback, dateFallback),
                })}
              </p>
              {isEventIndicative(upcomingEvent) ? (
                <p className="muted-text">{getEventValidationText(upcomingEvent, t, validationFallback)}</p>
              ) : null}
              <p>{getEventText(upcomingEvent, "descriptionKey", "description", t)}</p>
            </>
          ) : (
            <p>{t("home.no_upcoming")}</p>
          )}
        </Card>
      </section>

      <section className="section stack">
        <h2 className="section-title">{t("home.blog_title")}</h2>
        <p className="section-subtitle muted-text">{t("home.blog_subtitle")}</p>

        {isLatestPostsLoading ? <p className="muted-text">{t("home.blog_loading")}</p> : null}

        {!isLatestPostsLoading && latestPosts === null ? (
          <p className="muted-text">{t("home.blog_unavailable")}</p>
        ) : null}

        {!isLatestPostsLoading && Array.isArray(latestPosts) && latestPosts.length === 0 ? (
          <p className="muted-text">{t("home.blog_empty")}</p>
        ) : null}

        {!isLatestPostsLoading && hasLatestPosts ? (
          <>
            <Card title={featuredPost?.title ?? ""}>
              {featuredPreview ? <p>{featuredPreview}</p> : null}
              <Link to={`/posts/${encodeURIComponent(featuredPost?.slug ?? "")}`} className="btn btn-primary">
                {t("home.blog_read")}
              </Link>
            </Card>

            {secondaryPosts.length > 0 ? (
              <div className="grid two-columns">
                {secondaryPosts.map((post) => {
                  const previewText = getPostPreviewText(post);

                  return (
                    <Card key={post.id} title={post.title}>
                      {previewText ? <p>{previewText}</p> : null}
                      <Link to={`/posts/${encodeURIComponent(post.slug)}`} className="btn btn-ghost">
                        {t("home.blog_read")}
                      </Link>
                    </Card>
                  );
                })}
              </div>
            ) : null}
          </>
        ) : null}

        <div className="cta-row">
          <Link to="/posts" className="btn">
            {t("home.blog_all")}
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

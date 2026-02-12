import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Card from "../components/Card";
import { fetchPublishedPosts } from "../lib/postsService";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function Posts() {
  const { t, i18n } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const [posts, setPosts] = useState([]);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("updated_desc");
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      return undefined;
    }

    let isActive = true;

    const loadPosts = async () => {
      if (isActive) {
        setIsLoading(true);
        setIsUnavailable(false);
      }

      const result = await fetchPublishedPosts(currentLang);

      if (!isActive) {
        return;
      }

      if (result === null) {
        setPosts([]);
        setIsUnavailable(true);
        setIsLoading(false);
        return;
      }

      setPosts(result);
      setIsUnavailable(false);
      setIsLoading(false);
    };

    loadPosts();

    return () => {
      isActive = false;
    };
  }, [currentLang, isSupabaseEnabled]);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextPosts = posts.filter((post) => {
      if (!normalizedQuery) {
        return true;
      }

      const title = String(post?.title ?? "").toLowerCase();
      const excerpt = String(post?.excerpt ?? "").toLowerCase();
      return `${title} ${excerpt}`.includes(normalizedQuery);
    });

    const getUpdatedAtValue = (post) => {
      const timestamp = new Date(post?.updated_at ?? "").getTime();
      return Number.isFinite(timestamp) ? timestamp : 0;
    };

    if (sortMode === "updated_asc") {
      return nextPosts.sort((a, b) => getUpdatedAtValue(a) - getUpdatedAtValue(b));
    }

    if (sortMode === "title_asc") {
      return nextPosts.sort((a, b) => String(a?.title ?? "").localeCompare(String(b?.title ?? ""), currentLang));
    }

    return nextPosts.sort((a, b) => getUpdatedAtValue(b) - getUpdatedAtValue(a));
  }, [currentLang, posts, query, sortMode]);

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("posts.title")}</h1>
        <p className="section-intro page-subtitle">{t("posts.subtitle")}</p>
      </section>

      <section className="section stack">
        {!isSupabaseEnabled || isUnavailable ? (
          <Card title={t("posts.unavailable_title")}>
            <p>{t("posts.unavailable_body")}</p>
          </Card>
        ) : isLoading ? (
          <Card title={t("posts.title")}>
            <p>{t("posts.loading")}</p>
          </Card>
        ) : posts.length === 0 ? (
          <Card title={t("posts.title")}>
            <p>{t("posts.empty")}</p>
          </Card>
        ) : (
          <div className="stack">
            <Card title={t("posts.title")}>
              <div className="grid two-columns">
                <div className="stack">
                  <label htmlFor="posts-search" className="sr-only">
                    {t("posts.search_placeholder")}
                  </label>
                  <input
                    id="posts-search"
                    type="search"
                    className="input"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("posts.search_placeholder")}
                    aria-label={t("posts.search_placeholder")}
                  />
                </div>
                <div className="stack">
                  <label htmlFor="posts-sort" className="muted-text">
                    {t("posts.sort_label")}
                  </label>
                  <select
                    id="posts-sort"
                    className="select"
                    value={sortMode}
                    onChange={(event) => setSortMode(event.target.value)}
                    aria-label={t("posts.sort_label")}
                  >
                    <option value="updated_desc">{t("posts.sort.updated_desc")}</option>
                    <option value="updated_asc">{t("posts.sort.updated_asc")}</option>
                    <option value="title_asc">{t("posts.sort.title_asc")}</option>
                  </select>
                </div>
              </div>
            </Card>

            {filteredPosts.length === 0 ? (
              <Card title={t("posts.title")}>
                <p>{t("posts.empty")}</p>
              </Card>
            ) : (
              <div className="grid two-columns">
                {filteredPosts.map((post) => (
                  <Card key={post.id} title={<Link to={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>}>
                    {post.excerpt ? <p className="muted-text">{post.excerpt}</p> : null}
                    <Link className="btn btn-ghost" to={`/posts/${encodeURIComponent(post.slug)}`}>
                      {t("posts.read_more")}
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Posts;

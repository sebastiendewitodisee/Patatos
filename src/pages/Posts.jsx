import { useEffect, useState } from "react";
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
          <div className="grid two-columns">
            {posts.map((post) => (
              <Card key={post.id} title={<Link to={`/posts/${encodeURIComponent(post.slug)}`}>{post.title}</Link>}>
                {post.excerpt ? <p className="muted-text">{post.excerpt}</p> : null}
                <Link className="btn btn-ghost" to={`/posts/${encodeURIComponent(post.slug)}`}>
                  {t("posts.read_more")}
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Posts;

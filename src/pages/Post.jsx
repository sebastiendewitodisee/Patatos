import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import { fetchPublishedPostBySlug } from "../lib/postsService";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function Post() {
  const { t, i18n } = useTranslation();
  const { slug = "" } = useParams();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      return undefined;
    }

    let isActive = true;

    const loadPost = async () => {
      if (isActive) {
        setIsLoading(true);
      }

      const result = await fetchPublishedPostBySlug(currentLang, slug);

      if (!isActive) {
        return;
      }

      setPost(result);
      setIsLoading(false);
    };

    loadPost();

    return () => {
      isActive = false;
    };
  }, [currentLang, isSupabaseEnabled, slug]);

  return (
    <div className="container page page-block">
      {!isSupabaseEnabled ? (
        <section className="section section-tight stack">
          <Card title={t("post.unavailable_title")}>
            <p>{t("post.unavailable_body")}</p>
          </Card>
        </section>
      ) : isLoading ? (
        <section className="section section-tight stack">
          <Card title={t("posts.title")}>
            <p>{t("post.loading")}</p>
          </Card>
        </section>
      ) : !post ? (
        <section className="section section-tight stack">
          <Card title={t("post.not_found_title")}>
            <p>{t("post.not_found_body")}</p>
            <Link className="btn btn-ghost" to="/posts">
              {t("post.back_to_list")}
            </Link>
          </Card>
        </section>
      ) : (
        <>
          <section className="section section-tight stack">
            <h1 className="page-title">{post.title}</h1>
            {post.excerpt ? <p className="section-intro page-subtitle">{post.excerpt}</p> : null}
            <Link className="btn btn-ghost" to="/posts">
              {t("post.back_to_list")}
            </Link>
          </section>

          <section className="section stack">
            <Card>
              <p style={{ whiteSpace: "pre-line" }}>{post.body}</p>
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

export default Post;

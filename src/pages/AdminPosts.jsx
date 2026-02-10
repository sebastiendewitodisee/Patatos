import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const POSTS_SELECT_COLUMNS = "id, slug, lang, title, excerpt, body, published, created_at, updated_at";

const ERROR_KEYS = {
  slugTaken: "adminPosts.errors.slug_taken",
  network: "adminPosts.errors.network",
  generic: "adminPosts.errors.generic",
};

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function sanitizeSlug(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isSlugTakenError(error) {
  const code = String(error?.code ?? "");
  const constraint = String(error?.constraint ?? "").toLowerCase();
  const message = String(error?.message ?? "").toLowerCase();
  const details = String(error?.details ?? "").toLowerCase();

  if (code !== "23505") {
    return false;
  }

  return (
    constraint.includes("slug") ||
    message.includes("slug") ||
    message.includes("duplicate") ||
    details.includes("slug")
  );
}

function getRequestErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();

  if (isSlugTakenError(error)) {
    return ERROR_KEYS.slugTaken;
  }

  if (message.includes("network") || message.includes("fetch")) {
    return ERROR_KEYS.network;
  }

  return ERROR_KEYS.generic;
}

function formatTimestamp(value, locale) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  } catch {
    return "";
  }
}

function mapRowToPost(row, index, defaultLang) {
  return {
    id: String(row?.id ?? `post-${index + 1}`),
    slug: String(row?.slug ?? ""),
    lang: normalizeUiLang(row?.lang ?? defaultLang),
    title: String(row?.title ?? ""),
    excerpt: String(row?.excerpt ?? ""),
    body: String(row?.body ?? ""),
    published: Boolean(row?.published),
    created_at: String(row?.created_at ?? ""),
    updated_at: String(row?.updated_at ?? ""),
    isNew: false,
  };
}

function buildPayload(post, currentLang) {
  return {
    slug: sanitizeSlug(post?.slug),
    lang: normalizeUiLang(currentLang),
    title: String(post?.title ?? "").trim(),
    excerpt: String(post?.excerpt ?? "").trim() || null,
    body: String(post?.body ?? "").trim(),
    published: Boolean(post?.published),
  };
}

function AdminPosts() {
  const { t, i18n } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const locale = currentLang === "nl" ? "nl-BE" : "fr-BE";

  const [session, setSession] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseEnabled);
  const [posts, setPosts] = useState([]);
  const [isPostsLoading, setIsPostsLoading] = useState(false);
  const [savingById, setSavingById] = useState({});
  const [deletingById, setDeletingById] = useState({});
  const [errorKey, setErrorKey] = useState("");

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase) {
      return undefined;
    }

    let isActive = true;

    const loadSession = async () => {
      if (isActive) {
        setIsSessionLoading(true);
      }

      const { data, error } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      setSession(data?.session ?? null);
      setErrorKey(error ? ERROR_KEYS.generic : "");
      setIsSessionLoading(false);
    };

    loadSession();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
    });

    return () => {
      isActive = false;
      data.subscription.unsubscribe();
    };
  }, [isSupabaseEnabled]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !session) {
      return undefined;
    }

    let isActive = true;

    const loadPosts = async () => {
      if (isActive) {
        setIsPostsLoading(true);
        setErrorKey("");
      }

      const { data, error } = await supabase
        .from("content_posts")
        .select(POSTS_SELECT_COLUMNS)
        .eq("lang", currentLang)
        .order("updated_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        setPosts([]);
        setErrorKey(getRequestErrorKey(error));
        setIsPostsLoading(false);
        return;
      }

      const nextPosts = Array.isArray(data)
        ? data.map((row, index) => mapRowToPost(row, index, currentLang))
        : [];

      setPosts(nextPosts);
      setIsPostsLoading(false);
    };

    loadPosts();

    return () => {
      isActive = false;
    };
  }, [currentLang, isSupabaseEnabled, session]);

  const isAuthenticated = Boolean(session);
  const isBusy = useMemo(
    () => Object.values(savingById).some(Boolean) || Object.values(deletingById).some(Boolean),
    [deletingById, savingById]
  );

  const handleFieldChange = (postId, fieldName, value) => {
    setPosts((previousPosts) =>
      previousPosts.map((post) => {
        if (post.id !== postId) {
          return post;
        }

        if (fieldName === "published") {
          return { ...post, published: Boolean(value) };
        }

        if (fieldName === "slug") {
          return { ...post, slug: sanitizeSlug(value) };
        }

        return { ...post, [fieldName]: value };
      })
    );
  };

  const handleAddPost = () => {
    const tempId = `new-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    const newPost = {
      id: tempId,
      slug: "",
      lang: currentLang,
      title: "",
      excerpt: "",
      body: "",
      published: false,
      created_at: "",
      updated_at: "",
      isNew: true,
    };

    setPosts((previousPosts) => [newPost, ...previousPosts]);
    setErrorKey("");
  };

  const handleSavePost = async (post) => {
    if (!supabase || !isSupabaseEnabled || !isAuthenticated) {
      return;
    }

    const payload = buildPayload(post, currentLang);
    const hasLocalDuplicateSlug = posts.some(
      (candidate) => candidate.id !== post.id && sanitizeSlug(candidate.slug) === payload.slug
    );

    if (!payload.slug || !payload.title || !payload.body) {
      setErrorKey(ERROR_KEYS.generic);
      return;
    }

    if (hasLocalDuplicateSlug) {
      setErrorKey(ERROR_KEYS.slugTaken);
      return;
    }

    setSavingById((previousState) => ({ ...previousState, [post.id]: true }));
    setErrorKey("");

    let response;

    if (post.isNew) {
      response = await supabase.from("content_posts").insert(payload).select(POSTS_SELECT_COLUMNS).single();
    } else {
      response = await supabase
        .from("content_posts")
        .update(payload)
        .eq("id", post.id)
        .select(POSTS_SELECT_COLUMNS)
        .single();
    }

    setSavingById((previousState) => ({ ...previousState, [post.id]: false }));

    if (response.error) {
      setErrorKey(getRequestErrorKey(response.error));
      return;
    }

    const savedPost = mapRowToPost(response.data ?? {}, 0, currentLang);
    setPosts((previousPosts) =>
      previousPosts.map((currentPost) =>
        currentPost.id === post.id ? { ...savedPost, isNew: false } : currentPost
      )
    );
  };

  const handleDeletePost = async (post) => {
    if (!supabase || !isSupabaseEnabled || !isAuthenticated) {
      return;
    }

    const isConfirmed = window.confirm(t("adminPosts.confirm_delete"));

    if (!isConfirmed) {
      return;
    }

    if (post.isNew) {
      setPosts((previousPosts) => previousPosts.filter((candidate) => candidate.id !== post.id));
      return;
    }

    setDeletingById((previousState) => ({ ...previousState, [post.id]: true }));
    setErrorKey("");

    const { error } = await supabase.from("content_posts").delete().eq("id", post.id);
    setDeletingById((previousState) => ({ ...previousState, [post.id]: false }));

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    setPosts((previousPosts) => previousPosts.filter((candidate) => candidate.id !== post.id));
  };

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("adminPosts.title")}</h1>
        <p className="section-intro page-subtitle">{t("adminPosts.subtitle")}</p>
      </section>

      {!isSupabaseEnabled ? (
        <section className="section stack">
          <Card title={t("adminPosts.disabled_title")}>
            <p>{t("adminPosts.disabled_body")}</p>
          </Card>
        </section>
      ) : isSessionLoading ? (
        <section className="section stack">
          <Card title={t("adminPosts.title")}>
            <p>{t("adminPosts.loading")}</p>
          </Card>
        </section>
      ) : !isAuthenticated ? (
        <section className="section stack">
          <Card title={t("adminPosts.title")}>
            <p>{t("adminPosts.need_login")}</p>
            <a className="btn btn-primary" href="#/admin">
              {t("adminPosts.go_to_admin")}
            </a>
          </Card>
        </section>
      ) : (
        <>
          <section className="section stack">
            <Card title={t("adminPosts.title")}>
              <p className="muted-text">{t("adminPosts.connected_as", { email: session?.user?.email ?? "" })}</p>
              <div className="chip-row">
                <span className="chip">
                  {t("adminPosts.fields.lang")}: {currentLang.toUpperCase()}
                </span>
                <button type="button" className="btn btn-primary" onClick={handleAddPost} disabled={isBusy || isPostsLoading}>
                  {t("adminPosts.new")}
                </button>
              </div>
              {isPostsLoading ? <p className="muted-text">{t("adminPosts.loading")}</p> : null}
              {errorKey ? (
                <p className="muted-text" role="alert">
                  {t(errorKey)}
                </p>
              ) : null}
            </Card>
          </section>

          <section className="section stack">
            <h2 className="section-title">{t("adminPosts.title")}</h2>

            {posts.length === 0 && !isPostsLoading ? (
              <Card>
                <p className="muted-text">{t("adminPosts.empty")}</p>
              </Card>
            ) : (
              <div className="stack">
                {posts.map((post) => {
                  const isSaving = Boolean(savingById[post.id]);
                  const isDeleting = Boolean(deletingById[post.id]);
                  const isDisabled = isSaving || isDeleting || isPostsLoading;
                  const createdAtLabel = formatTimestamp(post.created_at, locale);
                  const updatedAtLabel = formatTimestamp(post.updated_at, locale);

                  return (
                    <Card key={post.id} title={post.title || t("adminPosts.new_draft")}>
                      <form
                        className="contact-form"
                        onSubmit={(event) => {
                          event.preventDefault();
                          handleSavePost(post);
                        }}
                      >
                        <label htmlFor={`post-slug-${post.id}`}>{t("adminPosts.fields.slug")}</label>
                        <input
                          id={`post-slug-${post.id}`}
                          type="text"
                          className="input"
                          value={post.slug}
                          onChange={(event) => handleFieldChange(post.id, "slug", event.target.value)}
                          onBlur={(event) => handleFieldChange(post.id, "slug", event.target.value)}
                          placeholder={t("adminPosts.slug_placeholder")}
                          disabled={isDisabled}
                          required
                        />

                        <label htmlFor={`post-title-${post.id}`}>{t("adminPosts.fields.title")}</label>
                        <input
                          id={`post-title-${post.id}`}
                          type="text"
                          className="input"
                          value={post.title}
                          onChange={(event) => handleFieldChange(post.id, "title", event.target.value)}
                          placeholder={t("adminPosts.title_placeholder")}
                          disabled={isDisabled}
                          required
                        />

                        <label htmlFor={`post-excerpt-${post.id}`}>{t("adminPosts.fields.excerpt")}</label>
                        <textarea
                          id={`post-excerpt-${post.id}`}
                          className="input"
                          rows={3}
                          value={post.excerpt}
                          onChange={(event) => handleFieldChange(post.id, "excerpt", event.target.value)}
                          placeholder={t("adminPosts.excerpt_placeholder")}
                          disabled={isDisabled}
                        />

                        <label htmlFor={`post-body-${post.id}`}>{t("adminPosts.fields.body")}</label>
                        <textarea
                          id={`post-body-${post.id}`}
                          className="input"
                          rows={8}
                          value={post.body}
                          onChange={(event) => handleFieldChange(post.id, "body", event.target.value)}
                          placeholder={t("adminPosts.body_placeholder")}
                          disabled={isDisabled}
                          required
                        />

                        <div className="chip-row">
                          <input
                            id={`post-published-${post.id}`}
                            type="checkbox"
                            checked={Boolean(post.published)}
                            onChange={(event) => handleFieldChange(post.id, "published", event.target.checked)}
                            disabled={isDisabled}
                          />
                          <label htmlFor={`post-published-${post.id}`}>{t("adminPosts.fields.published")}</label>
                        </div>

                        {createdAtLabel ? (
                          <p className="muted-text">{t("adminPosts.meta.created_at", { value: createdAtLabel })}</p>
                        ) : null}
                        {updatedAtLabel ? (
                          <p className="muted-text">{t("adminPosts.meta.updated_at", { value: updatedAtLabel })}</p>
                        ) : null}

                        <div className="chip-row">
                          <button type="submit" className="btn btn-primary" disabled={isDisabled}>
                            {isSaving ? t("adminPosts.saving") : t("adminPosts.save")}
                          </button>
                          <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => handleDeletePost(post)}
                            disabled={isDisabled}
                          >
                            {isDeleting ? t("adminPosts.deleting") : t("adminPosts.delete")}
                          </button>
                        </div>
                      </form>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminPosts;

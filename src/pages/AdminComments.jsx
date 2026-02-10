import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const COMMENTS_SELECT_WITH_POST =
  "id, post_id, author_name, message, is_approved, created_at, content_posts:post_id ( id, slug, lang, title )";
const COMMENTS_SELECT_BASIC = "id, post_id, author_name, message, is_approved, created_at";
const POSTS_SELECT_FOR_MAP = "id, slug, lang, title";

const ERROR_KEYS = {
  generic: "adminComments.errors.generic",
  network: "adminComments.errors.network",
};

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function extractRelatedPost(value) {
  if (!value) {
    return null;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return typeof value === "object" ? value : null;
}

function sortComments(items) {
  return [...items].sort((a, b) => {
    if (a.isApproved !== b.isApproved) {
      return a.isApproved ? 1 : -1;
    }

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function getRequestErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();
  return message.includes("network") || message.includes("fetch")
    ? ERROR_KEYS.network
    : ERROR_KEYS.generic;
}

function mapCommentRecord(row, relatedPost) {
  return {
    id: String(row?.id ?? ""),
    postId: String(row?.post_id ?? ""),
    authorName: String(row?.author_name ?? ""),
    message: String(row?.message ?? ""),
    isApproved: Boolean(row?.is_approved),
    createdAt: String(row?.created_at ?? ""),
    postSlug: String(relatedPost?.slug ?? ""),
    postTitle: String(relatedPost?.title ?? ""),
    postLang: normalizeUiLang(relatedPost?.lang ?? ""),
  };
}

function formatDateLabel(value, locale) {
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

function AdminComments() {
  const { t, i18n } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const locale = currentLang === "nl" ? "nl-BE" : "fr-BE";

  const [session, setSession] = useState(null);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseEnabled);
  const [comments, setComments] = useState([]);
  const [filterStatus, setFilterStatus] = useState("pending");
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [approvingById, setApprovingById] = useState({});
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

    const loadComments = async () => {
      if (isActive) {
        setIsCommentsLoading(true);
        setErrorKey("");
      }

      let normalizedComments = [];

      const joinedResponse = await supabase
        .from("comments")
        .select(COMMENTS_SELECT_WITH_POST)
        .order("created_at", { ascending: false });

      if (!joinedResponse.error && Array.isArray(joinedResponse.data)) {
        normalizedComments = joinedResponse.data
          .map((row) => {
            const relatedPost = extractRelatedPost(row.content_posts);
            return mapCommentRecord(row, relatedPost);
          })
          .filter((comment) => comment.postLang === currentLang);
      } else {
        const commentsResponse = await supabase
          .from("comments")
          .select(COMMENTS_SELECT_BASIC)
          .order("created_at", { ascending: false });
        const postsResponse = await supabase
          .from("content_posts")
          .select(POSTS_SELECT_FOR_MAP)
          .eq("lang", currentLang);

        if (commentsResponse.error || postsResponse.error) {
          if (!isActive) {
            return;
          }

          const error = commentsResponse.error || postsResponse.error || joinedResponse.error;
          setComments([]);
          setErrorKey(getRequestErrorKey(error));
          setIsCommentsLoading(false);
          return;
        }

        const postsMap = new Map(
          (postsResponse.data ?? []).map((post) => [
            String(post?.id ?? ""),
            {
              slug: post?.slug ?? "",
              lang: post?.lang ?? "",
              title: post?.title ?? "",
            },
          ])
        );

        normalizedComments = (commentsResponse.data ?? [])
          .map((row) => {
            const relatedPost = postsMap.get(String(row?.post_id ?? "")) ?? null;
            return mapCommentRecord(row, relatedPost);
          })
          .filter((comment) => comment.postLang === currentLang);
      }

      if (!isActive) {
        return;
      }

      setComments(sortComments(normalizedComments));
      setIsCommentsLoading(false);
    };

    loadComments();

    return () => {
      isActive = false;
    };
  }, [currentLang, isSupabaseEnabled, session]);

  const isAuthenticated = Boolean(session);
  const filteredComments = useMemo(() => {
    if (filterStatus === "all") {
      return comments;
    }

    if (filterStatus === "approved") {
      return comments.filter((comment) => comment.isApproved);
    }

    return comments.filter((comment) => !comment.isApproved);
  }, [comments, filterStatus]);

  const handleApprove = async (comment) => {
    if (!isSupabaseEnabled || !supabase || !isAuthenticated) {
      return;
    }

    setApprovingById((previousState) => ({ ...previousState, [comment.id]: true }));
    setErrorKey("");

    const { error } = await supabase
      .from("comments")
      .update({ is_approved: true })
      .eq("id", comment.id);

    setApprovingById((previousState) => ({ ...previousState, [comment.id]: false }));

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    setComments((previousComments) =>
      sortComments(
        previousComments.map((item) =>
          item.id === comment.id
            ? {
                ...item,
                isApproved: true,
              }
            : item
        )
      )
    );
  };

  const handleDelete = async (comment) => {
    if (!isSupabaseEnabled || !supabase || !isAuthenticated) {
      return;
    }

    const isConfirmed = window.confirm(t("adminComments.confirm_delete"));

    if (!isConfirmed) {
      return;
    }

    setDeletingById((previousState) => ({ ...previousState, [comment.id]: true }));
    setErrorKey("");

    const { error } = await supabase.from("comments").delete().eq("id", comment.id);
    setDeletingById((previousState) => ({ ...previousState, [comment.id]: false }));

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    setComments((previousComments) => previousComments.filter((item) => item.id !== comment.id));
  };

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("adminComments.title")}</h1>
        <p className="section-intro page-subtitle">{t("adminComments.subtitle")}</p>
      </section>

      {!isSupabaseEnabled ? (
        <section className="section stack">
          <Card title={t("adminComments.disabled_title")}>
            <p>{t("adminComments.disabled_body")}</p>
          </Card>
        </section>
      ) : isSessionLoading ? (
        <section className="section stack">
          <Card title={t("adminComments.title")}>
            <p>{t("adminComments.loading")}</p>
          </Card>
        </section>
      ) : !isAuthenticated ? (
        <section className="section stack">
          <Card title={t("adminComments.title")}>
            <p>{t("adminComments.need_login")}</p>
            <a className="btn btn-primary" href="#/admin">
              {t("adminComments.go_to_admin")}
            </a>
          </Card>
        </section>
      ) : (
        <>
          <section className="section stack">
            <Card title={t("adminComments.title")}>
              <div className="chip-row">
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "pending" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("pending")}
                >
                  {t("adminComments.filters.pending")}
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "approved" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("approved")}
                >
                  {t("adminComments.filters.approved")}
                </button>
                <button
                  type="button"
                  className={`filter-chip ${filterStatus === "all" ? "is-active" : ""}`}
                  onClick={() => setFilterStatus("all")}
                >
                  {t("adminComments.filters.all")}
                </button>
              </div>

              {isCommentsLoading ? <p className="muted-text">{t("adminComments.loading")}</p> : null}
              {errorKey ? (
                <p className="muted-text" role="alert">
                  {t(errorKey)}
                </p>
              ) : null}
            </Card>
          </section>

          <section className="section stack">
            {filteredComments.length === 0 && !isCommentsLoading ? (
              <Card title={t("adminComments.title")}>
                <p>{t("adminComments.empty")}</p>
              </Card>
            ) : (
              <div className="stack">
                {filteredComments.map((comment) => {
                  const isApproving = Boolean(approvingById[comment.id]);
                  const isDeleting = Boolean(deletingById[comment.id]);
                  const isActionDisabled = isApproving || isDeleting || isCommentsLoading;
                  const postDisplay = comment.postTitle || comment.postSlug || comment.postId;
                  const createdLabel = formatDateLabel(comment.createdAt, locale);

                  return (
                    <Card key={comment.id} title={comment.authorName || comment.id}>
                      <div className="chip-row">
                        <Badge tone={comment.isApproved ? "done" : "todo"}>
                          {comment.isApproved
                            ? t("adminComments.status.approved")
                            : t("adminComments.status.pending")}
                        </Badge>
                        {createdLabel ? <span className="muted-text">{createdLabel}</span> : null}
                      </div>

                      <p className="muted-text">{t("adminComments.post_label", { value: postDisplay })}</p>
                      <p style={{ whiteSpace: "pre-line" }}>{comment.message}</p>

                      <div className="chip-row">
                        {!comment.isApproved ? (
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => handleApprove(comment)}
                            disabled={isActionDisabled}
                          >
                            {isApproving ? t("adminComments.approving") : t("adminComments.approve")}
                          </button>
                        ) : null}

                        <button
                          type="button"
                          className="btn btn-ghost"
                          onClick={() => handleDelete(comment)}
                          disabled={isActionDisabled}
                        >
                          {isDeleting ? t("adminComments.deleting") : t("adminComments.delete")}
                        </button>
                      </div>
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

export default AdminComments;

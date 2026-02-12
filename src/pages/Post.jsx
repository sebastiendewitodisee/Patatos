import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import Card from "../components/Card";
import {
  createComment,
  fetchApprovedCommentsByPostId,
  fetchPublishedPostBySlug,
} from "../lib/postsService";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const COOLDOWN_SECONDS = 60;
const STORAGE_KEY = "patatos_comment_cooldown_until";

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
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
    return date.toLocaleDateString(locale);
  } catch {
    return "";
  }
}

function Post() {
  const { t, i18n } = useTranslation();
  const { slug = "" } = useParams();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);
  const locale = currentLang === "nl" ? "nl-BE" : "fr-BE";
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(isSupabaseEnabled);
  const [approvedComments, setApprovedComments] = useState(null);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentErrorKey, setCommentErrorKey] = useState("");
  const [commentErrorSeconds, setCommentErrorSeconds] = useState(null);
  const [commentSuccessKey, setCommentSuccessKey] = useState("");

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

  useEffect(() => {
    if (!isSupabaseEnabled || !post?.id) {
      return undefined;
    }

    let isActive = true;

    const loadApprovedComments = async () => {
      if (isActive) {
        setIsCommentsLoading(true);
      }

      const result = await fetchApprovedCommentsByPostId(post.id);

      if (!isActive) {
        return;
      }

      setApprovedComments(result);
      setIsCommentsLoading(false);
    };

    loadApprovedComments();

    return () => {
      isActive = false;
    };
  }, [currentLang, isSupabaseEnabled, post?.id]);

  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!post?.id) {
      setCommentErrorKey("commentForm.errors.generic");
      setCommentErrorSeconds(null);
      setCommentSuccessKey("");
      return;
    }

    if (honeypot.trim().length > 0) {
      setCommentErrorKey("commentForm.errors.spam");
      setCommentErrorSeconds(null);
      setCommentSuccessKey("");
      return;
    }

    let cooldownUntil = 0;

    try {
      const storedValue = localStorage.getItem(STORAGE_KEY);
      const parsedValue = Number.parseInt(storedValue ?? "0", 10);
      cooldownUntil = Number.isFinite(parsedValue) ? parsedValue : 0;
    } catch {
      cooldownUntil = 0;
    }

    const now = Date.now();

    if (cooldownUntil > now) {
      const secondsRemaining = Math.max(1, Math.ceil((cooldownUntil - now) / 1000));
      setCommentErrorKey("commentForm.errors.cooldown");
      setCommentErrorSeconds(secondsRemaining);
      setCommentSuccessKey("");
      return;
    }

    const trimmedAuthor = authorName.trim();
    const trimmedMessage = message.trim();

    if (!trimmedAuthor || !trimmedMessage || trimmedAuthor.length > 120 || trimmedMessage.length > 2000) {
      setCommentErrorKey("commentForm.errors.required");
      setCommentErrorSeconds(null);
      setCommentSuccessKey("");
      return;
    }

    setIsSubmittingComment(true);
    setCommentErrorKey("");
    setCommentErrorSeconds(null);
    setCommentSuccessKey("");

    const result = await createComment({
      lang: currentLang,
      slug: post.slug,
      postId: post.id,
      authorName: trimmedAuthor,
      message: trimmedMessage,
    });

    setIsSubmittingComment(false);

    if (!result?.ok) {
      setCommentErrorKey(result?.errorKey ?? "commentForm.errors.generic");
      setCommentErrorSeconds(null);
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + COOLDOWN_SECONDS * 1000));
    } catch {
      // Ignore localStorage failures; submit already succeeded.
    }

    const refreshedComments = await fetchApprovedCommentsByPostId(post.id);
    if (refreshedComments !== null) {
      setApprovedComments(refreshedComments);
    }

    setHoneypot("");
    setAuthorName("");
    setMessage("");
    setCommentErrorKey("");
    setCommentErrorSeconds(null);
    setCommentSuccessKey("commentForm.success");
  };

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

          <section className="section stack">
            <h2 className="section-title">{t("commentForm.title")}</h2>
            <p className="section-subtitle muted-text">{t("commentForm.subtitle")}</p>

            {!isSupabaseEnabled ? (
              <Card title={t("commentForm.unavailable_title")}>
                <p>{t("commentForm.unavailable_body")}</p>
              </Card>
            ) : (
              <div className="stack">
                <Card title={t("commentsList.title")}>
                  {isCommentsLoading ? (
                    <p className="muted-text">{t("commentsList.loading")}</p>
                  ) : approvedComments === null || approvedComments.length === 0 ? (
                    <p className="muted-text">{t("commentsList.empty")}</p>
                  ) : (
                    <div className="stack">
                      {approvedComments.map((comment) => {
                        const dateLabel = formatDateLabel(comment?.created_at, locale);

                        return (
                          <Card key={comment.id}>
                            <p className="muted-text">
                              {t("commentsList.meta_by", { name: comment.author_name || "-" })}{" "}
                              {t("commentsList.meta_on", { date: dateLabel || "-" })}
                            </p>
                            <p style={{ whiteSpace: "pre-line" }}>{comment.message}</p>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card>
                  <form className="contact-form" onSubmit={handleSubmitComment}>
                    <input
                      type="text"
                      name="website"
                      className="sr-only"
                      autoComplete="off"
                      tabIndex={-1}
                      aria-hidden="true"
                      value={honeypot}
                      onChange={(event) => setHoneypot(event.target.value)}
                    />

                    <label htmlFor="comment-author">{t("commentForm.author_label")}</label>
                    <input
                      id="comment-author"
                      type="text"
                      className="input"
                      value={authorName}
                      onChange={(event) => {
                        setAuthorName(event.target.value);
                        setCommentSuccessKey("");
                      }}
                      placeholder={t("commentForm.author_placeholder")}
                      maxLength={120}
                      disabled={isSubmittingComment}
                      required
                    />

                    <label htmlFor="comment-message">{t("commentForm.message_label")}</label>
                    <textarea
                      id="comment-message"
                      className="input"
                      rows={5}
                      value={message}
                      onChange={(event) => {
                        setMessage(event.target.value);
                        setCommentSuccessKey("");
                      }}
                      placeholder={t("commentForm.message_placeholder")}
                      maxLength={2000}
                      disabled={isSubmittingComment}
                      required
                    />

                    <button type="submit" className="btn btn-primary" disabled={isSubmittingComment}>
                      {isSubmittingComment ? t("commentForm.submitting") : t("commentForm.submit")}
                    </button>
                  </form>

                  {commentSuccessKey ? <p className="form-feedback">{t(commentSuccessKey)}</p> : null}
                  {commentErrorKey ? (
                    <p className="muted-text" role="alert">
                      {t(commentErrorKey, {
                        seconds: commentErrorSeconds ?? COOLDOWN_SECONDS,
                      })}
                    </p>
                  ) : null}
                </Card>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Post;

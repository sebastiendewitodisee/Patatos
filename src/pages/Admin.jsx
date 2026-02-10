import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const ERROR_KEYS = {
  invalidCredentials: "admin.errors.invalid_credentials",
  emailNotConfirmed: "admin.errors.email_not_confirmed",
  network: "admin.errors.network",
  generic: "admin.errors.generic",
};

function getAuthErrorKey(error) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("invalid login credentials")) {
    return ERROR_KEYS.invalidCredentials;
  }

  if (message.includes("email not confirmed")) {
    return ERROR_KEYS.emailNotConfirmed;
  }

  if (message.includes("network")) {
    return ERROR_KEYS.network;
  }

  return ERROR_KEYS.generic;
}

function Admin() {
  const { t } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseEnabled);
  const [errorKey, setErrorKey] = useState("");

  useEffect(() => {
    if (!isSupabaseEnabled) {
      return undefined;
    }

    let isActive = true;

    const loadSession = async () => {
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

  const isAuthenticated = Boolean(session);
  const isFormDisabled = !isSupabaseEnabled || isSubmitting || isSessionLoading;
  const statusKey = !isSupabaseEnabled
    ? "admin.status_unconfigured"
    : isSessionLoading
      ? "admin.status_loading"
      : isAuthenticated
        ? "admin.status_connected"
        : "admin.status_not_connected";

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!supabase || !isSupabaseEnabled) {
      return;
    }

    setIsSubmitting(true);
    setErrorKey("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);
    setPassword("");

    if (error) {
      setErrorKey(getAuthErrorKey(error));
      return;
    }

    setErrorKey("");
  };

  const handleLogout = async () => {
    if (!supabase || !isSupabaseEnabled) {
      return;
    }

    setIsSubmitting(true);
    setErrorKey("");

    const { error } = await supabase.auth.signOut();
    setIsSubmitting(false);

    if (error) {
      setErrorKey(ERROR_KEYS.generic);
    }
  };

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("admin.title")}</h1>
        <p className="section-intro page-subtitle">{t("admin.subtitle")}</p>
      </section>

      <section className="section stack">
        <Card title={t("admin.status_title")}>
          <p>{t(statusKey)}</p>
          <p className="muted-text">
            {t(!isSupabaseEnabled ? "admin.status_unconfigured_help" : "admin.status_ready")}
          </p>
          {isAuthenticated && session?.user?.email ? (
            <p className="muted-text">{t("admin.connected_as", { email: session.user.email })}</p>
          ) : null}
        </Card>
      </section>

      <section className="section stack">
        <Card title={t("admin.form_title")}>
          {isAuthenticated ? (
            <div className="stack">
              <p>{t("admin.logged_in_message")}</p>
              <div className="chip-row">
                <a className="btn btn-ghost" href="#/admin/planning">
                  {t("adminNav.manage_planning")}
                </a>
                <a className="btn btn-ghost" href="#/admin/posts">
                  {t("adminNav.manage_posts")}
                </a>
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLogout}
                disabled={isSubmitting || isSessionLoading}
              >
                {isSubmitting ? t("admin.logout_loading") : t("admin.logout")}
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={handleLogin}>
              <label htmlFor="admin-email">{t("admin.email_label")}</label>
              <input
                id="admin-email"
                type="email"
                className="input"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder={t("admin.email_placeholder")}
                disabled={isFormDisabled}
                required
              />

              <label htmlFor="admin-password">{t("admin.password_label")}</label>
              <input
                id="admin-password"
                type="password"
                className="input"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("admin.password_placeholder")}
                disabled={isFormDisabled}
                required
              />

              <button type="submit" className="btn btn-primary" disabled={isFormDisabled}>
                {isSubmitting ? t("admin.login_loading") : t("admin.login")}
              </button>

              {!isSupabaseEnabled ? <p className="muted-text">{t("admin.form_disabled_hint")}</p> : null}
            </form>
          )}

          {errorKey ? (
            <p className="muted-text" role="alert">
              {t(errorKey)}
            </p>
          ) : null}
        </Card>
      </section>
    </div>
  );
}

export default Admin;

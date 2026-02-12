import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const ADMINS_SELECT_COLUMNS = "id, user_id, created_at";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getRequestErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();
  return message.includes("network") || message.includes("fetch")
    ? "adminAdmins.errors.network"
    : "adminAdmins.errors.generic";
}

function formatDateLabel(value, locale) {
  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "short",
      timeStyle: "short",
    }).format(parsedDate);
  } catch {
    return "";
  }
}

function normalizeUserId(value) {
  return String(value ?? "").trim().toLowerCase();
}

function AdminAdmins() {
  const { t, i18n } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const locale = String(i18n.resolvedLanguage || i18n.language || "").toLowerCase().startsWith("nl")
    ? "nl-BE"
    : "fr-BE";

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseEnabled);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [admins, setAdmins] = useState([]);
  const [isAdminsLoading, setIsAdminsLoading] = useState(false);
  const [newUserId, setNewUserId] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [removingById, setRemovingById] = useState({});
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
      setErrorKey(error ? "adminAdmins.errors.generic" : "");
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
    let isActive = true;

    const checkAdmin = async () => {
      if (!isSupabaseEnabled || !supabase || !session?.user?.id) {
        if (isActive) {
          setIsAdmin(false);
          setIsAdminLoading(false);
        }
        return;
      }

      if (isActive) {
        setIsAdminLoading(true);
      }

      const { data, error } = await supabase
        .from("app_admins")
        .select("id")
        .eq("user_id", session.user.id)
        .maybeSingle();

      if (!isActive) {
        return;
      }

      if (error) {
        setIsAdmin(false);
        setErrorKey(getRequestErrorKey(error));
        setIsAdminLoading(false);
        return;
      }

      setIsAdmin(Boolean(data?.id));
      setIsAdminLoading(false);
    };

    checkAdmin();

    return () => {
      isActive = false;
    };
  }, [isSupabaseEnabled, session?.user?.id]);

  useEffect(() => {
    if (!isSupabaseEnabled || !supabase || !session || !isAdmin) {
      return undefined;
    }

    let isActive = true;

    const loadAdmins = async () => {
      if (isActive) {
        setIsAdminsLoading(true);
        setErrorKey("");
      }

      const { data, error } = await supabase
        .from("app_admins")
        .select(ADMINS_SELECT_COLUMNS)
        .order("created_at", { ascending: false });

      if (!isActive) {
        return;
      }

      if (error) {
        setAdmins([]);
        setErrorKey(getRequestErrorKey(error));
        setIsAdminsLoading(false);
        return;
      }

      const nextAdmins = Array.isArray(data)
        ? data.map((row) => ({
            id: String(row?.id ?? ""),
            user_id: normalizeUserId(row?.user_id),
            created_at: String(row?.created_at ?? ""),
          }))
        : [];

      setAdmins(nextAdmins);
      setIsAdminsLoading(false);
    };

    loadAdmins();

    return () => {
      isActive = false;
    };
  }, [isAdmin, isSupabaseEnabled, session]);

  const isAuthenticated = Boolean(session);
  const currentUserId = normalizeUserId(session?.user?.id);
  const isBusy = isAdding || isAdminsLoading || Object.values(removingById).some(Boolean);

  const adminsWithMeta = useMemo(
    () =>
      admins.map((admin) => ({
        ...admin,
        isCurrentUser: admin.user_id === currentUserId,
      })),
    [admins, currentUserId]
  );

  const refreshAdmins = async () => {
    if (!isSupabaseEnabled || !supabase || !isAuthenticated || !isAdmin) {
      return;
    }

    setIsAdminsLoading(true);
    const { data, error } = await supabase
      .from("app_admins")
      .select(ADMINS_SELECT_COLUMNS)
      .order("created_at", { ascending: false });

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      setIsAdminsLoading(false);
      return;
    }

    const nextAdmins = Array.isArray(data)
      ? data.map((row) => ({
          id: String(row?.id ?? ""),
          user_id: normalizeUserId(row?.user_id),
          created_at: String(row?.created_at ?? ""),
        }))
      : [];

    setAdmins(nextAdmins);
    setIsAdminsLoading(false);
  };

  const handleAddAdmin = async (event) => {
    event.preventDefault();

    if (!isSupabaseEnabled || !supabase || !isAuthenticated || !isAdmin) {
      return;
    }

    const normalizedUserId = normalizeUserId(newUserId);
    if (!UUID_PATTERN.test(normalizedUserId)) {
      setErrorKey("adminAdmins.errors.invalid_user_id");
      return;
    }

    setIsAdding(true);
    setErrorKey("");

    const { error } = await supabase
      .from("app_admins")
      .insert({ user_id: normalizedUserId })
      .select("id")
      .single();

    setIsAdding(false);

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    setNewUserId("");
    await refreshAdmins();
  };

  const handleRemoveAdmin = async (admin) => {
    if (!isSupabaseEnabled || !supabase || !isAuthenticated || !isAdmin || admin?.isCurrentUser) {
      return;
    }

    const isConfirmed = window.confirm(t("adminAdmins.confirm_remove"));
    if (!isConfirmed) {
      return;
    }

    setRemovingById((previousState) => ({ ...previousState, [admin.id]: true }));
    setErrorKey("");

    const { error } = await supabase.from("app_admins").delete().eq("id", admin.id);

    setRemovingById((previousState) => ({ ...previousState, [admin.id]: false }));

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    await refreshAdmins();
  };

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("adminAdmins.title")}</h1>
        <p className="section-intro page-subtitle">{t("adminAdmins.subtitle")}</p>
      </section>

      {!isSupabaseEnabled ? (
        <section className="section stack">
          <Card title={t("adminAdmins.disabled_title")}>
            <p>{t("adminAdmins.disabled_body")}</p>
          </Card>
        </section>
      ) : isSessionLoading || isAdminLoading ? (
        <section className="section stack">
          <Card title={t("adminAdmins.title")}>
            <p>{t("adminAdmins.loading")}</p>
          </Card>
        </section>
      ) : !isAuthenticated ? (
        <section className="section stack">
          <Card title={t("adminAdmins.title")}>
            <p>{t("adminAdmins.need_login")}</p>
            <a className="btn btn-primary" href="#/admin">
              {t("adminAdmins.go_to_admin")}
            </a>
          </Card>
        </section>
      ) : !isAdmin ? (
        <section className="section stack">
          <Card title={t("adminAuth.not_authorized_title")}>
            <p>{t("adminAuth.not_authorized_body")}</p>
            <a className="btn btn-primary" href="#/admin">
              {t("adminAuth.back_to_admin")}
            </a>
          </Card>
        </section>
      ) : (
        <>
          <section className="section stack">
            <Card title={t("adminAdmins.add")}>
              <form className="contact-form" onSubmit={handleAddAdmin}>
                <label htmlFor="admin-user-id">{t("adminAdmins.user_id_label")}</label>
                <input
                  id="admin-user-id"
                  type="text"
                  className="input"
                  value={newUserId}
                  onChange={(event) => setNewUserId(event.target.value)}
                  placeholder={t("adminAdmins.user_id_placeholder")}
                  autoComplete="off"
                  disabled={isBusy}
                />
                <button type="submit" className="btn btn-primary" disabled={isBusy}>
                  {isAdding ? t("adminAdmins.adding") : t("adminAdmins.add")}
                </button>
              </form>

              {errorKey ? (
                <p className="muted-text" role="alert">
                  {t(errorKey)}
                </p>
              ) : null}
            </Card>
          </section>

          <section className="section stack">
            {isAdminsLoading ? (
              <Card title={t("adminAdmins.title")}>
                <p>{t("adminAdmins.loading")}</p>
              </Card>
            ) : adminsWithMeta.length === 0 ? (
              <Card title={t("adminAdmins.title")}>
                <p>{t("adminAdmins.empty")}</p>
              </Card>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("adminAdmins.user_id_label")}</th>
                      <th>{t("adminAdmins.created_at_label")}</th>
                      <th>{t("adminAdmins.actions_label")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adminsWithMeta.map((admin) => {
                      const isRemoving = Boolean(removingById[admin.id]);
                      const createdLabel = formatDateLabel(admin.created_at, locale);

                      return (
                        <tr key={admin.id}>
                          <td>
                            <div className="chip-row">
                              <code>{admin.user_id}</code>
                              {admin.isCurrentUser ? <span className="chip">{t("adminAdmins.you_badge")}</span> : null}
                            </div>
                          </td>
                          <td>{createdLabel || "-"}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-ghost"
                              onClick={() => handleRemoveAdmin(admin)}
                              disabled={isBusy || isRemoving || admin.isCurrentUser}
                            >
                              {isRemoving ? t("adminAdmins.removing") : t("adminAdmins.remove")}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default AdminAdmins;

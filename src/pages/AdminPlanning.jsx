import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Card from "../components/Card";
import { PHASE_ORDER, TYPE_META } from "../data/planning";
import { isSupabaseConfigured, supabase } from "../lib/supabaseClient";

const PLANNING_SELECT_V3 =
  "id, lang, phase_id, type, title, description, period, status, sort_order, updated_at, responsible";
const PLANNING_SELECT_V2 =
  "id, lang, phase_id, type, title, description, period, status, sort_order, updated_at";
const PLANNING_SELECT_V1 = "id, lang, title, description, period, status, sort_order, updated_at";
const STATUS_VALUES = ["todo", "doing", "done"];
const TYPE_OPTIONS = Array.from(new Set(["task", ...Object.keys(TYPE_META)]));

function normalizeUiLang(lang) {
  if (typeof lang !== "string") {
    return "fr";
  }

  return lang.toLowerCase().startsWith("nl") ? "nl" : "fr";
}

function normalizeStatus(status) {
  if (typeof status !== "string") {
    return "todo";
  }

  const normalized = status.trim().toLowerCase();
  return STATUS_VALUES.includes(normalized) ? normalized : "todo";
}

function normalizePhase(phaseId) {
  if (typeof phaseId !== "string") {
    return "preparation";
  }

  const normalized = phaseId.trim().toLowerCase();
  return PHASE_ORDER.includes(normalized) ? normalized : "preparation";
}

function normalizeType(type, phaseId) {
  if (typeof type !== "string") {
    return normalizePhase(phaseId);
  }

  const normalized = type.trim().toLowerCase();
  return TYPE_OPTIONS.includes(normalized) ? normalized : normalizePhase(phaseId);
}

function normalizeSortOrder(sortOrder, fallbackValue = 0) {
  const parsed = Number.parseInt(String(sortOrder ?? ""), 10);
  return Number.isFinite(parsed) ? parsed : fallbackValue;
}

function getRequestErrorKey(error) {
  const message = String(error?.message ?? "").toLowerCase();
  return message.includes("network") || message.includes("fetch")
    ? "adminPlanning.errors.network"
    : "adminPlanning.errors.generic";
}

function isMissingColumnError(error) {
  const code = String(error?.code ?? "");
  const message = String(error?.message ?? "").toLowerCase();
  return code === "42703" || (message.includes("column") && message.includes("does not exist"));
}

function mapRowToItem(row, index, defaultLang) {
  const phaseId = normalizePhase(row?.phase_id);
  const nextSortOrder = normalizeSortOrder(row?.sort_order, index + 1);

  return {
    id: String(row?.id ?? `row-${index + 1}`),
    lang: normalizeUiLang(row?.lang ?? defaultLang),
    phase_id: phaseId,
    type: normalizeType(row?.type, phaseId),
    title: row?.title ?? "",
    description: row?.description ?? "",
    period: row?.period ?? "",
    responsible: row?.responsible ?? "",
    status: normalizeStatus(row?.status),
    sort_order: nextSortOrder,
    updated_at: row?.updated_at ?? "",
    isNew: false,
  };
}

function buildPayload(item, lang) {
  return {
    lang: normalizeUiLang(lang),
    phase_id: normalizePhase(item?.phase_id),
    type: normalizeType(item?.type, item?.phase_id),
    title: String(item?.title ?? "").trim(),
    description: String(item?.description ?? "").trim() || null,
    period: String(item?.period ?? "").trim() || null,
    responsible: String(item?.responsible ?? "").trim() || null,
    status: normalizeStatus(item?.status),
    sort_order: normalizeSortOrder(item?.sort_order, 0),
  };
}

function nextSortOrderFromItems(items) {
  return (
    items.reduce((maxValue, item) => Math.max(maxValue, normalizeSortOrder(item?.sort_order, 0)), 0) + 1
  );
}

function AdminPlanning() {
  const { t, i18n } = useTranslation();
  const isSupabaseEnabled = isSupabaseConfigured && Boolean(supabase);
  const currentLang = normalizeUiLang(i18n.resolvedLanguage || i18n.language);

  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(isSupabaseEnabled);
  const [items, setItems] = useState([]);
  const [isItemsLoading, setIsItemsLoading] = useState(false);
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
      setErrorKey(error ? "adminPlanning.errors.generic" : "");
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

    const loadItems = async () => {
      if (isActive) {
        setIsItemsLoading(true);
        setErrorKey("");
      }

      let response = await supabase
        .from("planning_items")
        .select(PLANNING_SELECT_V3)
        .eq("lang", currentLang)
        .order("phase_id", { ascending: true })
        .order("sort_order", { ascending: true });

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase
          .from("planning_items")
          .select(PLANNING_SELECT_V2)
          .eq("lang", currentLang)
          .order("phase_id", { ascending: true })
          .order("sort_order", { ascending: true });
      }

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase
          .from("planning_items")
          .select(PLANNING_SELECT_V1)
          .eq("lang", currentLang)
          .order("sort_order", { ascending: true });
      }

      if (!isActive) {
        return;
      }

      if (response.error) {
        setItems([]);
        setErrorKey(getRequestErrorKey(response.error));
        setIsItemsLoading(false);
        return;
      }

      const nextItems = Array.isArray(response.data)
        ? response.data.map((row, index) => mapRowToItem(row, index, currentLang))
        : [];

      setItems(nextItems);
      setIsItemsLoading(false);
    };

    loadItems();

    return () => {
      isActive = false;
    };
  }, [currentLang, isAdmin, isSupabaseEnabled, session]);

  const isAuthenticated = Boolean(session);
  const isBusy = useMemo(
    () => Object.values(savingById).some(Boolean) || Object.values(deletingById).some(Boolean),
    [deletingById, savingById]
  );

  const handleFieldChange = (rowId, fieldName, value) => {
    setItems((previousItems) =>
      previousItems.map((item) => {
        if (item.id !== rowId) {
          return item;
        }

        const nextItem = { ...item, [fieldName]: value };

        if (fieldName === "phase_id") {
          nextItem.phase_id = normalizePhase(value);
          nextItem.type = normalizeType(nextItem.type, nextItem.phase_id);
        }

        if (fieldName === "status") {
          nextItem.status = normalizeStatus(value);
        }

        if (fieldName === "sort_order") {
          nextItem.sort_order = value;
        }

        return nextItem;
      })
    );
  };

  const handleAdd = () => {
    const tempId = `new-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const nextItem = {
      id: tempId,
      lang: currentLang,
      phase_id: "preparation",
      type: "task",
      title: "",
      description: "",
      period: "",
      responsible: "",
      status: "todo",
      sort_order: nextSortOrderFromItems(items),
      updated_at: "",
      isNew: true,
    };

    setItems((previousItems) => [...previousItems, nextItem]);
    setErrorKey("");
  };

  const handleSave = async (item) => {
    if (!supabase || !isSupabaseEnabled || !isAuthenticated) {
      return;
    }

    const payloadV3 = buildPayload(item, currentLang);
    const payloadV2 = {
      lang: payloadV3.lang,
      phase_id: payloadV3.phase_id,
      type: payloadV3.type,
      title: payloadV3.title,
      description: payloadV3.description,
      period: payloadV3.period,
      status: payloadV3.status,
      sort_order: payloadV3.sort_order,
    };
    const payloadV1 = {
      lang: payloadV3.lang,
      title: payloadV3.title,
      description: payloadV3.description,
      period: payloadV3.period,
      status: payloadV3.status,
      sort_order: payloadV3.sort_order,
    };
    setSavingById((previousState) => ({ ...previousState, [item.id]: true }));
    setErrorKey("");

    if (!payloadV3.title) {
      setSavingById((previousState) => ({ ...previousState, [item.id]: false }));
      setErrorKey("adminPlanning.errors.generic");
      return;
    }

    let response;

    if (item.isNew) {
      response = await supabase.from("planning_items").insert(payloadV3).select(PLANNING_SELECT_V3).single();

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase.from("planning_items").insert(payloadV2).select(PLANNING_SELECT_V2).single();
      }

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase.from("planning_items").insert(payloadV1).select(PLANNING_SELECT_V1).single();
      }
    } else {
      response = await supabase
        .from("planning_items")
        .update(payloadV3)
        .eq("id", item.id)
        .select(PLANNING_SELECT_V3)
        .single();

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase
          .from("planning_items")
          .update(payloadV2)
          .eq("id", item.id)
          .select(PLANNING_SELECT_V2)
          .single();
      }

      if (response.error && isMissingColumnError(response.error)) {
        response = await supabase
          .from("planning_items")
          .update(payloadV1)
          .eq("id", item.id)
          .select(PLANNING_SELECT_V1)
          .single();
      }
    }

    setSavingById((previousState) => ({ ...previousState, [item.id]: false }));

    if (response.error) {
      setErrorKey(getRequestErrorKey(response.error));
      return;
    }

    const savedRow = mapRowToItem(response.data ?? {}, 0, currentLang);
    setItems((previousItems) =>
      previousItems.map((currentItem) => (currentItem.id === item.id ? { ...savedRow, isNew: false } : currentItem))
    );
  };

  const handleDelete = async (item) => {
    if (!isAuthenticated || !isSupabaseEnabled || !supabase) {
      return;
    }

    const isConfirmed = window.confirm(t("adminPlanning.confirm_delete"));
    if (!isConfirmed) {
      return;
    }

    if (item.isNew) {
      setItems((previousItems) => previousItems.filter((currentItem) => currentItem.id !== item.id));
      return;
    }

    setDeletingById((previousState) => ({ ...previousState, [item.id]: true }));
    setErrorKey("");

    const { error } = await supabase.from("planning_items").delete().eq("id", item.id);
    setDeletingById((previousState) => ({ ...previousState, [item.id]: false }));

    if (error) {
      setErrorKey(getRequestErrorKey(error));
      return;
    }

    setItems((previousItems) => previousItems.filter((currentItem) => currentItem.id !== item.id));
  };

  return (
    <div className="container page page-block">
      <section className="section section-tight stack">
        <h1 className="page-title">{t("adminPlanning.title")}</h1>
        <p className="section-intro page-subtitle">{t("adminPlanning.subtitle")}</p>
      </section>

      {!isSupabaseEnabled ? (
        <section className="section stack">
          <Card title={t("adminPlanning.disabled_title")}>
            <p>{t("adminPlanning.disabled_body")}</p>
          </Card>
        </section>
      ) : isSessionLoading || isAdminLoading ? (
        <section className="section stack">
          <Card title={t("adminPlanning.title")}>
            <p>{t("adminPlanning.loading")}</p>
          </Card>
        </section>
      ) : !isAuthenticated ? (
        <section className="section stack">
          <Card title={t("adminPlanning.title")}>
            <p>{t("adminPlanning.need_login")}</p>
            <a className="btn btn-primary" href="#/admin">
              {t("adminPlanning.go_to_admin")}
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
            <Card title={t("adminPlanning.title")}>
              <p className="muted-text">{t("adminPlanning.connected_as", { email: session?.user?.email ?? "" })}</p>
              <div className="chip-row">
                <span className="chip">{currentLang.toUpperCase()}</span>
                <button type="button" className="btn btn-primary" onClick={handleAdd} disabled={isBusy || isItemsLoading}>
                  {t("adminPlanning.add")}
                </button>
              </div>
              {isItemsLoading ? <p className="muted-text">{t("adminPlanning.loading")}</p> : null}
              {errorKey ? (
                <p className="muted-text" role="alert">
                  {t(errorKey)}
                </p>
              ) : null}
            </Card>
          </section>

          <section className="section stack">
            <h2 className="section-title">{t("adminPlanning.title")}</h2>

            {items.length === 0 && !isItemsLoading ? (
              <Card>
                <p className="muted-text">{t("adminPlanning.empty")}</p>
              </Card>
            ) : (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>{t("adminPlanning.fields.phase")}</th>
                      <th>{t("adminPlanning.fields.status")}</th>
                      <th>{t("adminPlanning.fields.type")}</th>
                      <th>{t("adminPlanning.fields.title")}</th>
                      <th>{t("adminPlanning.fields.description")}</th>
                      <th>{t("adminPlanning.fields.period")}</th>
                      <th>{t("adminPlanning.fields.responsible")}</th>
                      <th>{t("adminPlanning.fields.sort_order")}</th>
                      <th>{t("adminPlanning.fields.actions")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item) => {
                      const isSaving = Boolean(savingById[item.id]);
                      const isDeleting = Boolean(deletingById[item.id]);
                      const isDisabled = isSaving || isDeleting || isItemsLoading;

                      return (
                        <tr key={item.id}>
                          <td>
                            <select
                              className="select"
                              value={item.phase_id}
                              onChange={(event) => handleFieldChange(item.id, "phase_id", event.target.value)}
                              aria-label={t("adminPlanning.fields.phase")}
                              disabled={isDisabled}
                            >
                              {PHASE_ORDER.map((phaseId) => (
                                <option key={phaseId} value={phaseId}>
                                  {t(`planning.phases.${phaseId}`, { defaultValue: phaseId })}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <select
                              className="select"
                              value={item.status}
                              onChange={(event) => handleFieldChange(item.id, "status", event.target.value)}
                              aria-label={t("adminPlanning.fields.status")}
                              disabled={isDisabled}
                            >
                              {STATUS_VALUES.map((statusValue) => (
                                <option key={statusValue} value={statusValue}>
                                  {t(`status.${statusValue}`)}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <select
                              className="select"
                              value={item.type}
                              onChange={(event) => handleFieldChange(item.id, "type", event.target.value)}
                              aria-label={t("adminPlanning.fields.type")}
                              disabled={isDisabled}
                            >
                              {TYPE_OPTIONS.map((typeValue) => (
                                <option key={typeValue} value={typeValue}>
                                  {typeValue === "task"
                                    ? t("adminPlanning.type_task")
                                    : t(`planning.types.${typeValue}`, {
                                        defaultValue: t(`planning.phases.${typeValue}`, { defaultValue: typeValue }),
                                      })}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            <input
                              type="text"
                              className="input"
                              value={item.title}
                              onChange={(event) => handleFieldChange(item.id, "title", event.target.value)}
                              aria-label={t("adminPlanning.fields.title")}
                              disabled={isDisabled}
                            />
                          </td>

                          <td>
                            <textarea
                              className="input"
                              value={item.description}
                              onChange={(event) => handleFieldChange(item.id, "description", event.target.value)}
                              aria-label={t("adminPlanning.fields.description")}
                              rows={3}
                              disabled={isDisabled}
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="input"
                              value={item.period}
                              onChange={(event) => handleFieldChange(item.id, "period", event.target.value)}
                              aria-label={t("adminPlanning.fields.period")}
                              disabled={isDisabled}
                            />
                          </td>

                          <td>
                            <input
                              type="text"
                              className="input"
                              value={item.responsible}
                              onChange={(event) => handleFieldChange(item.id, "responsible", event.target.value)}
                              aria-label={t("adminPlanning.fields.responsible")}
                              placeholder={t("adminPlanning.responsible_placeholder")}
                              disabled={isDisabled}
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              className="input"
                              value={item.sort_order}
                              onChange={(event) => handleFieldChange(item.id, "sort_order", event.target.value)}
                              aria-label={t("adminPlanning.fields.sort_order")}
                              disabled={isDisabled}
                            />
                          </td>

                          <td>
                            <div className="chip-row">
                              <button type="button" className="btn btn-primary" onClick={() => handleSave(item)} disabled={isDisabled}>
                                {isSaving ? t("adminPlanning.saving") : t("adminPlanning.save")}
                              </button>
                              <button type="button" className="btn btn-ghost" onClick={() => handleDelete(item)} disabled={isDisabled}>
                                {isDeleting ? t("adminPlanning.deleting") : t("adminPlanning.delete")}
                              </button>
                            </div>
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

export default AdminPlanning;

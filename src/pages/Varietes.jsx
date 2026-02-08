import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Badge from "../components/Badge";
import Card from "../components/Card";
import { varieties } from "../data/varieties";

const RECAP_ID = "recap-varietes";
const VARIETE_PREFIX = "variete-";
const VARIETES_ROUTE = "/varietes";

function toSlug(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getFocusParamFromUrl() {
  const url = new URL(window.location.href);
  const focusFromSearch = url.searchParams.get("focus");
  if (focusFromSearch) {
    return focusFromSearch;
  }

  const hashValue = url.hash.replace(/^#/, "");
  const [, hashQuery = ""] = hashValue.split("?");
  return new URLSearchParams(hashQuery).get("focus");
}

function getTargetIdFromFocus(focus) {
  if (!focus) {
    return "";
  }

  if (focus === "recap") {
    return RECAP_ID;
  }

  if (focus.startsWith(VARIETE_PREFIX)) {
    return focus;
  }

  return "";
}

function updateFocusParam(focus) {
  const url = new URL(window.location.href);
  const hashValue = url.hash.replace(/^#/, "");
  const [hashPathRaw, hashQuery = ""] = hashValue.split("?");
  const hashPath = (hashPathRaw.split("#")[0] || VARIETES_ROUTE).trim();

  const params = new URLSearchParams(hashQuery);
  params.set("focus", focus);

  const nextHash = `${hashPath}?${params.toString()}`;
  window.history.replaceState({}, "", `${url.pathname}#${nextHash}`);
}

const VARIETY_TYPE_TRANSLATION_KEYS = {
  early: "varieties.type_early",
  storage: "varieties.type_storage",
};

function getVarietyTypeLabel(type, t) {
  const translationKey = VARIETY_TYPE_TRANSLATION_KEYS[type];
  if (translationKey) {
    return t(translationKey);
  }

  return type ?? "";
}

function getVarietyText(item, keyName, fallbackKeyName, t) {
  const translationKey = item?.[keyName];
  const fallbackValue = fallbackKeyName ? item?.[fallbackKeyName] : "";

  if (!translationKey) {
    return fallbackValue ?? "";
  }

  return t(translationKey, { defaultValue: fallbackValue ?? "" });
}

function Varietes() {
  const { t } = useTranslation();
  const [brokenImages, setBrokenImages] = useState({});
  const [lightbox, setLightbox] = useState(null);

  const varietyItems = useMemo(
    () =>
      varieties.map((item, index) => {
        const slug = toSlug(item.name);
        const rawImage = item.image?.trim() ?? "";
        const imgSrc = rawImage ? `${import.meta.env.BASE_URL}${rawImage}` : "";
        const hasImage = Boolean(rawImage) && !brokenImages[item.name];

        return {
          ...item,
          index,
          slug,
          targetId: `variete-${slug}`,
          imgSrc,
          hasImage,
          imageAlt: t("varieties.image_alt", { name: item.name }),
        };
      }),
    [brokenImages, t]
  );

  const hasMultipleImages = useMemo(() => varietyItems.filter((item) => item.hasImage).length > 1, [varietyItems]);

  const findNextImageIndex = useCallback(
    (startIndex, direction) => {
      const total = varietyItems.length;
      if (total === 0) {
        return -1;
      }

      let cursor = ((startIndex % total) + total) % total;
      for (let step = 0; step < total; step += 1) {
        if (varietyItems[cursor]?.hasImage) {
          return cursor;
        }
        cursor = (cursor + direction + total) % total;
      }

      return -1;
    },
    [varietyItems]
  );

  const openAt = useCallback(
    (nextIndex, direction = 1) => {
      const resolvedIndex = findNextImageIndex(nextIndex, direction);
      if (resolvedIndex === -1) {
        return;
      }

      const entry = varietyItems[resolvedIndex];
      if (!entry?.hasImage) {
        return;
      }

      setLightbox({
        index: resolvedIndex,
        src: entry.imgSrc,
        title: entry.name,
        alt: entry.imageAlt,
      });
    },
    [findNextImageIndex, varietyItems]
  );

  const openPrev = useCallback(() => {
    if (!lightbox) {
      return;
    }
    openAt(lightbox.index - 1, -1);
  }, [lightbox, openAt]);

  const openNext = useCallback(() => {
    if (!lightbox) {
      return;
    }
    openAt(lightbox.index + 1, 1);
  }, [lightbox, openAt]);

  useEffect(() => {
    const focus = getFocusParamFromUrl();
    const targetId = getTargetIdFromFocus(focus);
    if (!targetId) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 50);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (!lightbox) {
      return undefined;
    }

    function onKeyDown(event) {
      if (event.key === "Escape") {
        setLightbox(null);
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        openPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        openNext();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [lightbox, openPrev, openNext]);

  useEffect(() => {
    if (!lightbox) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [lightbox]);

  const scrollToAnchor = (event, targetId, focus) => {
    event.preventDefault();

    const target = document.getElementById(targetId);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    updateFocusParam(focus);
  };

  const openLightbox = (event, index) => {
    event.preventDefault();
    event.stopPropagation();
    openAt(index, 1);
  };

  const lightboxModal = lightbox ? (
    <div
      className="lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={t("varieties.lightbox_label", { title: lightbox.title })}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setLightbox(null);
        }
      }}
    >
      <div className="lightbox-content">
        <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label={t("varieties.lightbox_close")}>
          ✕
        </button>

        <div
          className="lightbox-image-wrap"
          onClick={(event) => {
            if (!hasMultipleImages) {
              return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            const isLeftSide = event.clientX < rect.left + rect.width / 2;
            if (isLeftSide) {
              openPrev();
            } else {
              openNext();
            }
          }}
        >
          <button
            type="button"
            className="lightbox-nav lightbox-nav-prev"
            aria-label={t("varieties.lightbox_prev")}
            onClick={(event) => {
              event.stopPropagation();
              openPrev();
            }}
            disabled={!hasMultipleImages}
          >
            ‹
          </button>

          <img
            className="lightbox-image"
            src={lightbox.src}
            alt={lightbox.alt}
            onError={() => {
              const failedName = varietyItems[lightbox.index]?.name;
              if (failedName) {
                setBrokenImages((prev) => ({ ...prev, [failedName]: true }));
              }
              setLightbox(null);
            }}
          />

          <button
            type="button"
            className="lightbox-nav lightbox-nav-next"
            aria-label={t("varieties.lightbox_next")}
            onClick={(event) => {
              event.stopPropagation();
              openNext();
            }}
            disabled={!hasMultipleImages}
          >
            ›
          </button>
        </div>

        <p className="lightbox-caption">{lightbox.title}</p>
      </div>
    </div>
  ) : null;

  return (
    <div className="container page-block">
      <section className="section section-tight">
        <h1>{t("varieties.title")}</h1>
        <p className="section-intro">{t("varieties.intro")}</p>
      </section>

      <section className="section">
        <Card title={t("varieties.season_title") }>
          <p>{t("varieties.season_text")}</p>
        </Card>
      </section>

      <section className="section anchor-offset" id={RECAP_ID}>
        <h2>{t("varieties.recap_title")}</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t("varieties.table.name")}</th>
                <th>{t("varieties.table.type")}</th>
                <th>{t("varieties.table.planting")}</th>
                <th>{t("varieties.table.harvest")}</th>
                <th>{t("varieties.table.usage")}</th>
              </tr>
            </thead>
            <tbody>
              {varietyItems.map((item) => (
                <tr key={item.name}>
                  <td>
                    <a
                      href={`#${VARIETES_ROUTE}?focus=${item.targetId}`}
                      onClick={(event) => scrollToAnchor(event, item.targetId, item.targetId)}
                    >
                      {item.name} <span aria-hidden="true">→</span>
                    </a>
                  </td>
                  <td>
                    <strong>{getVarietyTypeLabel(item.type, t)}</strong>
                  </td>
                  <td>{getVarietyText(item, "plantingKey", "planting", t)}</td>
                  <td>{getVarietyText(item, "harvestKey", "harvest", t)}</td>
                  <td>{getVarietyText(item, "usageKey", "usage", t)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>{t("varieties.details_title")}</h2>
        <div className="grid three-columns">
          {varietyItems.map((item) => {
            const showPlaceholder = !item.hasImage;

            return (
              <div key={item.name} id={item.targetId} className="anchor-offset">
                <Card>
                  <div className="variety-card-header">
                    <div className="variety-thumb-wrap">
                      {showPlaceholder ? (
                        <div className="variety-thumb-placeholder" aria-hidden="true">
                          🥔
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="image-button"
                          aria-label={t("varieties.zoom_image", { name: item.name })}
                          onClick={(event) => openLightbox(event, item.index)}
                        >
                          <img
                            src={item.imgSrc}
                            alt={item.imageAlt}
                            className="variety-thumb"
                            onError={() => {
                              setBrokenImages((prev) => ({ ...prev, [item.name]: true }));
                            }}
                          />
                        </button>
                      )}
                    </div>
                    <div>
                      <h3>{item.name}</h3>
                      <Badge tone={item.type === "early" ? "plantation" : "conservation"}>{getVarietyTypeLabel(item.type, t)}</Badge>
                    </div>
                  </div>

                  <div className="variety-meta">
                    <p>
                      <strong>{t("varieties.planting_label")}:</strong> {getVarietyText(item, "plantingKey", "planting", t)}
                    </p>
                    <p>
                      <strong>{t("varieties.harvest_label")}:</strong> {getVarietyText(item, "harvestKey", "harvest", t)}
                    </p>
                    <p>
                      <strong>{t("varieties.usage_label")}:</strong> {getVarietyText(item, "usageKey", "usage", t)}
                    </p>
                  </div>

                  <a href={`#${VARIETES_ROUTE}?focus=recap`} onClick={(event) => scrollToAnchor(event, RECAP_ID, "recap")}>
                    {t("varieties.back_to_recap")}
                  </a>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>{t("varieties.harvest_tips_title")}</h2>
        <Card>
          <ul className="tips-list">
            <li>{t("varieties.harvest_tips.t1")}</li>
            <li>{t("varieties.harvest_tips.t2")}</li>
            <li>{t("varieties.harvest_tips.t3")}</li>
          </ul>
        </Card>
      </section>

      <section className="section">
        <h2>{t("varieties.storage_tips_title")}</h2>
        <Card>
          <ul className="tips-list">
            <li>{t("varieties.storage_tips.t1")}</li>
            <li>{t("varieties.storage_tips.t2")}</li>
            <li>{t("varieties.storage_tips.t3")}</li>
          </ul>
        </Card>
      </section>

      {lightboxModal ? createPortal(lightboxModal, document.body) : null}
    </div>
  );
}

export default Varietes;

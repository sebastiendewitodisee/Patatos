import { useCallback, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
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

function Varietes() {
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
          imageAlt: `Pomme de terre ${item.name}`,
        };
      }),
    [brokenImages]
  );

  const hasMultipleImages = useMemo(
    () => varietyItems.filter((item) => item.hasImage).length > 1,
    [varietyItems]
  );

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
      aria-label={`Image ${lightbox.title}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          setLightbox(null);
        }
      }}
    >
      <div className="lightbox-content">
        <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Fermer">
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
            aria-label="Image précédente"
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
            aria-label="Image suivante"
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
        <h1>Variétés 🥔</h1>
        <p className="section-intro">
          Liste Patatos 2026: aperçu simple des variétés, périodes de saison et usages pratiques.
        </p>
      </section>

      <section className="section">
        <Card title="Repères de saison">
          <p>Toutes les périodes sont des repères: on ajuste selon météo, sol et observation des plants.</p>
        </Card>
      </section>

      <section className="section anchor-offset" id={RECAP_ID}>
        <h2>Récapitulatif</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Variété</th>
                <th>Type</th>
                <th>Plantation</th>
                <th>Récolte</th>
                <th>Usage</th>
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
                    <strong>{item.type}</strong>
                  </td>
                  <td>{item.planting}</td>
                  <td>{item.harvest}</td>
                  <td>{item.usage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="section">
        <h2>Détails des variétés</h2>
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
                          aria-label={`Agrandir l'image de ${item.name}`}
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
                      <Badge tone={item.type === "précoce" ? "plantation" : "conservation"}>{item.type}</Badge>
                    </div>
                  </div>

                  <div className="variety-meta">
                    <p>
                      <strong>Plantation:</strong> {item.planting}
                    </p>
                    <p>
                      <strong>Récolte:</strong> {item.harvest}
                    </p>
                    <p>
                      <strong>Usage:</strong> {item.usage}
                    </p>
                  </div>

                  <a
                    href={`#${VARIETES_ROUTE}?focus=recap`}
                    onClick={(event) => scrollToAnchor(event, RECAP_ID, "recap")}
                  >
                    Retour au récap ↑
                  </a>
                </Card>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <h2>Conseils récolte</h2>
        <Card>
          <ul className="tips-list">
            <li>Feuillage qui jaunit: signe que la maturité approche.</li>
            <li>Peau qui tient quand tu frottes doucement: bon indicateur.</li>
            <li>Fais un test sur un pied avant de lancer toute la récolte.</li>
          </ul>
        </Card>
      </section>

      <section className="section">
        <h2>Conseils conservation</h2>
        <Card>
          <ul className="tips-list">
            <li>Stocker au frais, au sec et à l&apos;obscurité.</li>
            <li>Ne pas laver avant stockage.</li>
            <li>Trier régulièrement pour retirer les tubercules abîmés.</li>
          </ul>
        </Card>
      </section>

      {lightboxModal ? createPortal(lightboxModal, document.body) : null}
    </div>
  );
}

export default Varietes;

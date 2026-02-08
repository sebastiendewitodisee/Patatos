export const BUILD_STAMP = "2026-02-08T20:10:00Z";
export const BUILD_SHA = import.meta.env.VITE_GIT_SHA ?? "local";
export const BUILD_INFO = `${BUILD_STAMP} · ${BUILD_SHA}`;

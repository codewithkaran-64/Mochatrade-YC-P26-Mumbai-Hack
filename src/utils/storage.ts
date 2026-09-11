const STORAGE_PREFIX = "mochaguard:";

/**
 * Thin, defensive wrapper around localStorage. Mochaguard uses local
 * storage for the hackathon MVP (see README "Data Storage") since a
 * backend was not part of the empty starting repository. All reads/writes
 * are guarded so a private-browsing mode or SSR pass never crashes the app.
 */
export function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {
    // Storage can fail (quota, private mode). Silently ignore — the app
    // still works in-memory for the current session.
  }
}

export function clearStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_PREFIX + key);
  } catch {
    // ignore
  }
}

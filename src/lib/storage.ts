export function getLS<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    if (raw === "true" || raw === "false") return (raw === "true") as unknown as T;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setLS<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    const v = typeof value === "string" ? value : JSON.stringify(value);
    localStorage.setItem(key, v);
  } catch {}
}

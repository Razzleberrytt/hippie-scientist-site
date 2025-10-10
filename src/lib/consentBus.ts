const KEY = "consent:open";

export function openConsent() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(KEY));
}

export function onOpenConsent(handler: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(KEY, handler);
  return () => window.removeEventListener(KEY, handler);
}

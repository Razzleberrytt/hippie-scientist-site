import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { CONSENT_GRANTED_EVENT, CONSENT_STORAGE_KEY, getConsent } from "./consent";
import { loadAnalytics } from "./loadAnalytics";
declare global { interface Window { gtag?: (...args:any[]) => void } }

function hasGrantedConsentFromStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.status === "granted";
  } catch {
    return false;
  }
}

export function useGA() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    if (!hasGrantedConsentFromStorage()) return;
    loadAnalytics();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onConsentGranted = (event: Event) => {
      const status = (event as CustomEvent<{ status?: string }>).detail?.status;
      if (status === "granted" || getConsent() === "granted") {
        loadAnalytics();
      }
    };
    window.addEventListener(CONSENT_GRANTED_EVENT, onConsentGranted);
    return () => window.removeEventListener(CONSENT_GRANTED_EVENT, onConsentGranted);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", "page_view", {
        page_location: window.location.href,
        page_path: pathname + search,
        page_title: document.title,
      });
    }
  }, [pathname, search]);
}

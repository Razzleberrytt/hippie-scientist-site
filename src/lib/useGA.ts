import { useEffect } from "react";
import { useLocation } from "react-router-dom";
declare global { interface Window { gtag?: (...args:any[]) => void } }
export function useGA() {
  const { pathname, search } = useLocation();
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

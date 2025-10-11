import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type TrippyContextValue = {
  trippy: boolean;
  setTrippy: (value: boolean) => void;
  enabled: boolean;
};

const TrippyContext = createContext<TrippyContextValue>({ trippy: false, setTrippy: () => undefined, enabled: true });

function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function TrippyProvider({ children }: { children: ReactNode }) {
  const [prefersReduced, setPrefersReduced] = useState(getPrefersReducedMotion);
  const [trippy, setTrippyState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const saved = window.localStorage.getItem("trippy-mode");
    if (saved === "1") return true;
    if (saved === "0") return false;
    return !prefersReduced;
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    setPrefersReduced(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, []);

  const enabled = !prefersReduced;

  useEffect(() => {
    if (!enabled) {
      setTrippyState(false);
      return;
    }
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem("trippy-mode");
    if (saved !== null) {
      setTrippyState(saved === "1");
    }
  }, [enabled]);

  const setTrippy = useCallback(
    (value: boolean) => {
      if (!enabled || typeof window === "undefined") return;
      window.localStorage.setItem("trippy-mode", value ? "1" : "0");
      setTrippyState(value);
    },
    [enabled],
  );

  const value = useMemo<TrippyContextValue>(
    () => ({
      trippy,
      setTrippy,
      enabled,
    }),
    [enabled, setTrippy, trippy],
  );

  return <TrippyContext.Provider value={value}>{children}</TrippyContext.Provider>;
}

export function useTrippy() {
  return useContext(TrippyContext);
}


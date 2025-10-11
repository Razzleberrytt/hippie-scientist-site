import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

type TrippyContextValue = {
  trippy: boolean;
  setTrippy: (value: boolean) => void;
  enabled: boolean;
};

const STORAGE_KEY = "trippy-mode";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const TrippyCtx = createContext<TrippyContextValue>({ trippy: false, setTrippy: () => {}, enabled: true });

const getInitialEnabled = () => {
  if (typeof window === "undefined") return true;
  return !window.matchMedia?.(REDUCED_QUERY)?.matches;
};

export function TrippyProvider({ children }: { children: React.ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(getInitialEnabled);
  const [trippy, setTrippyState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "1") return true;
    if (saved === "0") return false;
    return getInitialEnabled();
  });

  const setTrippy = useCallback((value: boolean) => {
    setTrippyState(value);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia(REDUCED_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      const nextEnabled = !event.matches;
      setEnabled(nextEnabled);
      if (window.localStorage.getItem(STORAGE_KEY) == null) {
        setTrippyState(nextEnabled);
      }
    };

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

  const value = useMemo<TrippyContextValue>(
    () => ({
      trippy,
      setTrippy,
      enabled,
    }),
    [enabled, setTrippy, trippy],
  );

  return <TrippyCtx.Provider value={value}>{children}</TrippyCtx.Provider>;
}

export const useTrippy = () => useContext(TrippyCtx);

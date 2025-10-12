import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { melt } from "@/state/melt";

export type TrippyLevel = "off" | "melt";

export type TrippyContextValue = {
  level: TrippyLevel;
  setLevel: (value: TrippyLevel) => void;
  enabled: boolean;
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const TrippyCtx = createContext<TrippyContextValue>({
  level: "off",
  setLevel: () => {},
  enabled: true,
});

const isBrowser = typeof window !== "undefined";

const prefersReducedMotion = () => {
  if (!isBrowser || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_QUERY).matches;
};

export const TRIPPY_LABELS: Record<TrippyLevel, string> = {
  melt: "Melt",
  off: "Off",
};

export function TrippyProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => !prefersReducedMotion());
  const [levelState, setLevelState] = useState<TrippyLevel>(() => (melt.enabled ? "melt" : "off"));

  const setLevel = useCallback((value: TrippyLevel) => {
    setLevelState(value);
    melt.set(value !== "off");
  }, []);

  useEffect(() => {
    return melt.subscribe((value) => {
      setLevelState(value ? "melt" : "off");
    });
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLevel("off");
    }
  }, [enabled, setLevel]);

  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(REDUCED_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      const nextEnabled = !event.matches;
      setEnabled(nextEnabled);
      if (!nextEnabled) {
        setLevel("off");
      }
    };

    setEnabled(!mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    if (typeof mediaQuery.addListener === "function") {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }

    return undefined;
  }, [setLevel]);

  const value = useMemo<TrippyContextValue>(
    () => ({
      level: levelState,
      setLevel,
      enabled,
    }),
    [enabled, levelState, setLevel],
  );

  return <TrippyCtx.Provider value={value}>{children}</TrippyCtx.Provider>;
}

export const useTrippy = () => useContext(TrippyCtx);

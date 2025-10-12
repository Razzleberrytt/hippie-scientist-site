import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type TrippyLevel = "off" | "melt";

export type TrippyContextValue = {
  level: TrippyLevel;
  setLevel: (value: TrippyLevel) => void;
  enabled: boolean;
};

const STORAGE_KEY = "melt";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const TrippyCtx = createContext<TrippyContextValue>({
  level: "off",
  setLevel: () => {},
  enabled: true,
});

const isBrowser = typeof window !== "undefined";

const parseStoredLevel = (value: string | null): TrippyLevel | null => {
  if (!value) return null;
  if (value === "off") return "off";
  if (value === "on" || value === "melt" || value === "calm" || value === "trippy") {
    return "melt";
  }
  return null;
};

const prefersReducedMotion = () => {
  if (!isBrowser || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_QUERY).matches;
};

const initialLevel = () => {
  if (!isBrowser) return "off";
  const stored = parseStoredLevel(window.localStorage.getItem(STORAGE_KEY));
  if (stored) return stored;
  const legacyStored = parseStoredLevel(window.localStorage.getItem("trippy-mode"));
  if (legacyStored) {
    try {
      window.localStorage.setItem(STORAGE_KEY, legacyStored === "off" ? "off" : "on");
    } catch {
      /* ignore */
    }
    return legacyStored;
  }
  return prefersReducedMotion() ? "off" : "melt";
};

export const TRIPPY_LABELS: Record<TrippyLevel, string> = {
  melt: "Melt",
  off: "Off",
};

export function TrippyProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => !prefersReducedMotion());
  const [levelState, setLevelState] = useState<TrippyLevel>(initialLevel);

  const setLevel = useCallback((value: TrippyLevel) => {
    setLevelState(value);
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value === "off" ? "off" : "on");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!enabled && levelState !== "off") {
      setLevel("off");
    }
  }, [enabled, levelState, setLevel]);

  useEffect(() => {
    if (!isBrowser || !window.matchMedia) return;

    const mediaQuery = window.matchMedia(REDUCED_QUERY);
    const handleChange = (event: MediaQueryListEvent) => {
      const nextEnabled = !event.matches;
      setEnabled(nextEnabled);
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setLevel(nextEnabled ? "melt" : "off");
      } else if (nextEnabled) {
        const stored = parseStoredLevel(window.localStorage.getItem(STORAGE_KEY));
        if (stored) {
          setLevel(stored);
        }
      }
      if (!nextEnabled) {
        setLevel("off");
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

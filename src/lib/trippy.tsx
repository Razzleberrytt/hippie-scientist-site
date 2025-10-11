import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type TrippyLevel = "off" | "calm" | "trippy" | "melt";

export type TrippyContextValue = {
  level: TrippyLevel;
  setLevel: (value: TrippyLevel) => void;
  enabled: boolean;
};

const STORAGE_KEY = "trippy-mode";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

const levelOrder: readonly TrippyLevel[] = ["calm", "trippy", "melt", "off"] as const;

const TrippyCtx = createContext<TrippyContextValue>({
  level: "off",
  setLevel: () => {},
  enabled: true,
});

const isBrowser = typeof window !== "undefined";

const parseStoredLevel = (value: string | null): TrippyLevel | null => {
  if (!value) return null;
  return levelOrder.includes(value as TrippyLevel) || value === "off"
    ? (value as TrippyLevel)
    : null;
};

const prefersReducedMotion = () => {
  if (!isBrowser || !window.matchMedia) return false;
  return window.matchMedia(REDUCED_QUERY).matches;
};

const initialLevel = () => {
  if (!isBrowser) return "off";
  const stored = parseStoredLevel(window.localStorage.getItem(STORAGE_KEY));
  if (stored) return stored;
  return prefersReducedMotion() ? "off" : "trippy";
};

export const TRIPPY_LEVELS = levelOrder;
export const TRIPPY_LABELS: Record<TrippyLevel, string> = {
  calm: "Calm",
  trippy: "Trippy",
  melt: "Melt",
  off: "Off",
};

export const nextTrippyLevel = (level: TrippyLevel) => {
  const index = levelOrder.indexOf(level);
  const safeIndex = index === -1 ? 0 : index;
  return levelOrder[(safeIndex + 1) % levelOrder.length];
};

export function TrippyProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabled] = useState<boolean>(() => !prefersReducedMotion());
  const [levelState, setLevelState] = useState<TrippyLevel>(initialLevel);

  const setLevel = useCallback((value: TrippyLevel) => {
    setLevelState(value);
    if (!isBrowser) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
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
        setLevel(nextEnabled ? "trippy" : "off");
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

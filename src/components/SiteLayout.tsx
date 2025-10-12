import { PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Wand2 } from "lucide-react";
import clsx from "clsx";
import { MeltCanvas } from "./MeltCanvas";
import ThemeToggle from "./ThemeToggle";
import { melt, type MeltIntensity, type MeltPalette, type MeltSettings } from "@/state/melt";

const paletteOrder: MeltPalette[] = ["aura", "ocean", "amethyst"];
const intensityOrder: MeltIntensity[] = ["low", "med", "high"];

const paletteLabels: Record<MeltPalette, string> = {
  aura: "Aura",
  ocean: "Ocean",
  amethyst: "Amethyst",
};

const intensityLabels: Record<MeltIntensity, string> = {
  low: "Low",
  med: "Medium",
  high: "High",
};

export default function SiteLayout({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState<MeltSettings>(() => ({
    enabled: melt.enabled,
    palette: melt.palette,
    intensity: melt.intensity,
  }));
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const longPressTriggeredRef = useRef(false);
  const longPressTimerRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    return melt.subscribeSettings((next) => {
      setSettings(next);
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    setPrefersReducedMotion(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  const cyclePalette = useCallback(() => {
    const currentIndex = paletteOrder.indexOf(settings.palette);
    const nextPalette = paletteOrder[(currentIndex + 1) % paletteOrder.length];
    melt.setPalette(nextPalette);
  }, [settings.palette]);

  const cycleIntensity = useCallback(() => {
    const currentIndex = intensityOrder.indexOf(settings.intensity);
    const nextIntensity = intensityOrder[(currentIndex + 1) % intensityOrder.length];
    melt.setIntensity(nextIntensity);
  }, [settings.intensity]);

  const buttonLabel = useMemo(() => {
    return `Melt — ${paletteLabels[settings.palette]} • ${intensityLabels[settings.intensity]}`;
  }, [settings.palette, settings.intensity]);

  const handlePointerDown = useCallback(() => {
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      longPressTriggeredRef.current = true;
      cycleIntensity();
      longPressTimerRef.current = undefined;
    }, 600);
  }, [cycleIntensity]);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = undefined;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (longPressTriggeredRef.current) {
      return;
    }
    cyclePalette();
  }, [cyclePalette]);

  const shouldAnimate = settings.enabled && !prefersReducedMotion;

  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return (
    <div className="site-shell relative min-h-screen w-full overflow-x-hidden">
      {shouldAnimate && (
        <MeltCanvas intensity={settings.intensity} palette={settings.palette} active={shouldAnimate} />
      )}
      {!shouldAnimate && (
        <div
          className="pointer-events-none fixed inset-0 z-0"
          style={{
            background:
              "radial-gradient(1200px 600px at 20% 20%, rgba(87,164,255,.25), transparent 60%), radial-gradient(1200px 700px at 80% 80%, rgba(255,130,220,.18), transparent 65%), linear-gradient(180deg, #0b0f14 0%, #0a0d12 100%)",
          }}
          aria-hidden
        />
      )}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22 viewBox=%220 0 180 180%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22 opacity=%220.9%22/></svg>')",
        }}
        aria-hidden
      />
      <div className="pointer-events-none fixed right-4 top-4 z-20 flex items-center gap-3 sm:right-6 sm:top-6">
        {!prefersReducedMotion ? (
          <button
            type="button"
            onClick={handleClick}
            onPointerDown={handlePointerDown}
            onPointerUp={clearLongPressTimer}
            onPointerLeave={clearLongPressTimer}
            onPointerCancel={clearLongPressTimer}
            className={clsx(
              "pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-2 text-sm font-medium text-white/80 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)] transition",
              "hover:border-white/30 hover:bg-black/55 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
            )}
            aria-label={`${buttonLabel}. Tap to cycle palette, long-press to change intensity.`}
          >
            <Wand2 aria-hidden className="h-4 w-4 text-fuchsia-300" />
            <span className="whitespace-nowrap">Melt</span>
            <span className="hidden text-xs font-normal text-white/60 sm:inline">{`${paletteLabels[settings.palette]} • ${intensityLabels[settings.intensity]}`}</span>
          </button>
        ) : (
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
        )}
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}

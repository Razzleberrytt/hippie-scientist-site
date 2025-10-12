import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MeltToggle from "@/components/MeltToggle";
import { MeltCanvas } from "@/components/MeltCanvas";
import ThemeToggle from "./ThemeToggle";
import { melt, type MeltIntensity, type MeltPalette, type MeltSettings } from "@/state/melt";
import { useTrippy } from "@/lib/trippy";

const links = [
  { label: "Browse", to: "/database" },
  { label: "Build", to: "/build" },
  { label: "Blog", to: "/blog" },
];

export default function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const { enabled: motionEnabled } = useTrippy();
  const [settings, setSettings] = useState<MeltSettings>(() => ({
    enabled: melt.enabled,
    palette: melt.palette,
    intensity: melt.intensity,
  }));

  useEffect(() => {
    return melt.subscribeSettings((next) => {
      setSettings(next);
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!motionEnabled) return;
        melt.toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [motionEnabled]);

  const onMeltChange = useCallback((palette: MeltPalette, intensity: MeltIntensity) => {
    setSettings((prev) => ({ ...prev, palette, intensity }));
    melt.setPalette(palette);
    melt.setIntensity(intensity);
  }, []);

  const shouldAnimate = settings.enabled && motionEnabled;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0 z-0">
        {shouldAnimate ? (
          <MeltCanvas palette={settings.palette} intensity={settings.intensity} />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(1200px 600px at 20% 20%, rgba(87,164,255,.25), transparent 60%), radial-gradient(1200px 700px at 80% 80%, rgba(255,130,220,.18), transparent 65%), linear-gradient(180deg, #0b0f14 0%, #0a0d12 100%)",
            }}
            aria-hidden
          />
        )}
      </div>

      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22180%22 height=%22180%22 viewBox=%220 0 180 180%22><filter id=%22n%22 x=%220%22 y=%220%22 width=%22100%25%22 height=%22100%25%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%22180%22 height=%22180%22 filter=%22url(%23n)%22 opacity=%220.9%22/></svg>')",
        }}
        aria-hidden
      />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[999] rounded bg-black/70 px-3 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>

      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <nav className="flex flex-1 items-center gap-2" aria-label="Site">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
            <span className="font-semibold tracking-tight text-white">THS</span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`pill ${active ? "bg-white/9 text-white" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
        {motionEnabled ? (
          <MeltToggle
            key={`${settings.palette}-${settings.intensity}`}
            onChange={onMeltChange}
          />
        ) : (
          <div className="pointer-events-auto">
            <ThemeToggle />
          </div>
        )}
      </header>

      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 hidden" aria-hidden />
    </div>
  );
}

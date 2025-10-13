import { PropsWithChildren, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import MeltToggle from "@/components/MeltToggle";
import MeltCanvas from "@/components/MeltCanvas";
import ThemeToggle from "./ThemeToggle";
import { useTrippy } from "@/lib/trippy";
import { useMelt } from "@/melt/useMelt";

const links = [
  { label: "Browse", to: "/database" },
  { label: "Build", to: "/build" },
  { label: "Blog", to: "/blog" },
];

export default function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const { enabled: motionEnabled } = useTrippy();
  const {
    enabled,
    setEnabled,
    palette,
    setPalette,
    intensity,
    setIntensity,
    prefersReducedMotion,
  } = useMelt();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!motionEnabled || prefersReducedMotion) return;
        setEnabled((value) => !value);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [motionEnabled, prefersReducedMotion, setEnabled]);

  const shouldAnimate = motionEnabled && !prefersReducedMotion && enabled;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <MeltCanvas enabled={shouldAnimate} palette={palette} intensity={intensity} />

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
        <div className="pointer-events-auto">
          {motionEnabled && !prefersReducedMotion ? (
            <MeltToggle
              enabled={enabled}
              palette={palette}
              intensity={intensity}
              onEnabled={(value) => setEnabled(value)}
              onPalette={setPalette}
              onIntensity={setIntensity}
            />
          ) : (
            <ThemeToggle />
          )}
        </div>
      </header>

      <main className="relative z-10">{children}</main>
      <footer className="relative z-10 hidden" aria-hidden />
    </div>
  );
}

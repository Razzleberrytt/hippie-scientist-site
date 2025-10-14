import { PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import BackgroundStage from "./BackgroundStage";
import { useTrippy } from "@/lib/trippy";
import { useMelt } from "@/melt/useMelt";

const links = [
  { label: "Browse", to: "/herbs" },
  { label: "Compounds", to: "/compounds" },
  { label: "Build", to: "/build" },
  { label: "Blog", to: "/blog" },
];

export default function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const { level, enabled: trippyEnabled } = useTrippy();
  const { enabled, setEnabled, effect } = useMelt();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");

    const update = () => setPrefersReducedMotion(media.matches);
    update();

    const handler = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches);

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }

    if (typeof media.addListener === "function") {
      media.addListener(handler);
      return () => media.removeListener(handler);
    }

    return undefined;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion && enabled) {
      setEnabled(false);
    }
  }, [enabled, prefersReducedMotion, setEnabled]);

  const shouldAnimate = trippyEnabled && level !== "off" && enabled && !prefersReducedMotion;

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <BackgroundStage enabled={shouldAnimate} effect={effect} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[999] rounded bg-black/70 px-3 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 shadow-[0_0_24px_-12px_rgba(147,51,234,0.6)] backdrop-blur">
        <nav className="container-safe mx-auto flex max-w-6xl items-center gap-3 px-4 py-3" aria-label="Site">
          <Link
            to="/"
            className={`inline-flex items-center gap-3 rounded-full border border-white/10 px-4 py-2.5 text-sm font-semibold transition ${
              location.pathname === "/"
                ? "bg-white/15 text-white shadow-[0_0_18px_-10px_rgba(147,51,234,0.7)]"
                : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            }`}
          >
            THS
          </Link>
          <div className="flex flex-1 items-center gap-2">
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-white/15 text-white shadow-[0_0_16px_-12px_rgba(147,51,234,0.6)]"
                      : "bg-white/5 text-white/75 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>
    </div>
  );
}

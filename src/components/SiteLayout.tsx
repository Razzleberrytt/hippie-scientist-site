import { PropsWithChildren, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import MeltButton from "./MeltButton";
import { useTrippy } from "@/lib/trippy";
import { useMelt } from "@/melt/useMelt";
import MeltBackground from "./MeltBackground";

const links = [
  { label: "Browse", to: "/database" },
  { label: "Build", to: "/build" },
  { label: "Blog", to: "/blog" },
];

export default function SiteLayout({ children }: PropsWithChildren) {
  const location = useLocation();
  const { level, enabled: trippyEnabled } = useTrippy();
  const { enabled, setEnabled } = useMelt();
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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!trippyEnabled || prefersReducedMotion || level === "off") return;
        const current = useMelt.getState().enabled;
        setEnabled(!current);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [level, prefersReducedMotion, setEnabled, trippyEnabled]);

  return (
    <div className="relative min-h-svh overflow-x-hidden">
      <MeltBackground />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[999] rounded bg-black/70 px-3 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/40 bg-black/60">
        <div className="mx-auto max-w-screen-md w-full px-4">
          <nav className="flex items-center gap-2 py-3 overflow-x-auto no-scrollbar" aria-label="Site">
            <Link
              to="/"
              className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-semibold transition ${
                location.pathname === "/" ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              THS
            </Link>
            {links.map((link) => {
              const active = location.pathname.startsWith(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`inline-flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2.5 text-sm transition ${
                    active ? "bg-white/15 text-white" : "bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <MeltButton />
          </nav>
        </div>
      </header>

      <main id="main" className="relative z-10 flex-1">
        {children}
      </main>
    </div>
  );
}

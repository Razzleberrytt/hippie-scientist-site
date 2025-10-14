// src/components/Header.tsx
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTrippy } from "@/lib/trippy";
import { useMelt } from "@/melt/useMelt";

const links = [
  { label: "Browse", to: "/herbs" },
  { label: "Compounds", to: "/compounds" },
  { label: "Build", to: "/build" },
  { label: "Blog", to: "/blog" },
];

export default function Header() {
  const { enabled: motionEnabled } = useTrippy();
  const { setEnabled } = useMelt();
  const location = useLocation();
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
    if (typeof window === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!motionEnabled || prefersReducedMotion) return;
        setEnabled(!useMelt.getState().enabled);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [motionEnabled, prefersReducedMotion, setEnabled]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[999] rounded bg-black/70 px-3 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>
      <div className="container-safe flex flex-wrap items-center gap-3 py-3" aria-label="Site">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
          <span className="font-semibold tracking-tight text-white">THS</span>
        </Link>

        <nav
          className="ml-auto flex flex-wrap items-center gap-2"
          aria-label="Site"
        >
          {links.map((link) => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`pill border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 ${active ? 'bg-white/10 text-white' : ''}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

import { useMemo } from "react";
import { useLocation } from "react-router-dom";

function Brand({ showWordmark }: { showWordmark: boolean }) {
  return (
    <a href="#/" className="flex items-center gap-3" aria-label="The Hippie Scientist">
      <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow ring-1 ring-white/10" />
      <span className="font-semibold tracking-tight text-text">THS</span>
      {showWordmark && (
        <span className="hidden text-sm font-medium text-mute sm:inline">The Hippie Scientist</span>
      )}
    </a>
  );
}

export default function Header() {
  const location = useLocation();
  const isHome = useMemo(() => {
    const hash = location.hash || "";
    const path = location.pathname || "/";
    return hash === "" || hash === "#/" || path === "/";
  }, [location.hash, location.pathname]);

  const linkClass =
    "inline-flex items-center justify-center rounded-full border border-white/10 bg-card/60 px-3 py-1.5 text-sm font-medium text-text/90 shadow-soft transition hover:border-white/20 hover:bg-card/70";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/35 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 sm:px-6">
        <Brand showWordmark={isHome} />
        <nav className="flex gap-2 sm:gap-3">
          <a href="#/database" className={linkClass}>
            Browse
          </a>
          <a href="#/build" className={linkClass}>
            Build
          </a>
          <a href="#/blog" className={linkClass}>
            Blog
          </a>
          <a href="#/theme" className={linkClass}>
            Theme
          </a>
        </nav>
      </div>
    </header>
  );
}

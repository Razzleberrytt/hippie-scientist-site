import { useMemo } from "react";
import { useLocation } from "react-router-dom";

function Brand({ compact }: { compact: boolean }) {
  return (
    <a href="#/" className="flex items-center gap-3" aria-label="The Hippie Scientist">
      <span className="inline-block h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-fuchsia-500 shadow ring-1 ring-white/10" />
      <span className="font-semibold tracking-tight text-white/90">
        {compact ? "THS" : "The Hippie Scientist"}
      </span>
    </a>
  );
}

export default function Header() {
  const location = useLocation();
  const compact = useMemo(() => {
    const hash = location.hash || `#${location.pathname || "/"}`;
    return !(hash === "#/" || hash === "#/");
  }, [location.hash, location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-zinc-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Brand compact={compact} />
        <nav className="flex gap-2">
          <a href="#/database" className="btn-pill">Browse</a>
          <a href="#/build" className="btn-pill">Build</a>
          <a href="#/blog" className="btn-pill">Blog</a>
          <a href="#/theme" className="btn-pill">Theme</a>
        </nav>
      </div>
    </header>
  );
}

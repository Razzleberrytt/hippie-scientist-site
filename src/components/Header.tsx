// src/components/Header.tsx
import React from "react";

function useIsHome() {
  const [isHome, setIsHome] = React.useState(() => {
    const h = window.location.hash || "#/";
    return h === "#/" || h === "";
  });
  React.useEffect(() => {
    const onHash = () => {
      const h = window.location.hash || "#/";
      setIsHome(h === "#/" || h === "");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return isHome;
}

export default function Header({ onOpenThemeMenu }: { onOpenThemeMenu?: () => void }) {
  const isHome = useIsHome();

  return (
    <header className="sticky top-0 z-40 bg-black/35 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="h-14 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {/* Brand */}
          <a href="/#/" className="flex items-center gap-2 shrink-0 select-none">
            <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
            <span className="font-semibold tracking-tight text-white whitespace-nowrap">
              {isHome ? "The Hippie Scientist" : "THS"}
            </span>
          </a>

          {/* Navigation */}
          <nav
            className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain no-scrollbar"
            aria-label="Main Navigation"
          >
            <div className="flex items-center gap-2 sm:gap-3 justify-start">
              <a href="/#/" className="px-3 py-1.5 rounded-xl bg-white/5 text-sm ring-1 ring-white/10 hover:bg-white/10">
                Home
              </a>
              <a href="/#/database" className="px-3 py-1.5 rounded-xl bg-white/5 text-sm ring-1 ring-white/10 hover:bg-white/10">
                Browse
              </a>
              <a href="/#/build" className="px-3 py-1.5 rounded-xl bg-white/5 text-sm ring-1 ring-white/10 hover:bg-white/10">
                Build
              </a>
              <a href="/#/blog" className="px-3 py-1.5 rounded-xl bg-white/5 text-sm ring-1 ring-white/10 hover:bg-white/10">
                Blog
              </a>
            </div>
          </nav>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onOpenThemeMenu}
            className="shrink-0 px-3 py-1.5 rounded-xl bg-white/5 text-sm ring-1 ring-white/10 hover:bg-white/10 whitespace-nowrap"
          >
            Theme
          </button>
        </div>
      </div>
    </header>
  );
}

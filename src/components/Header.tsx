// src/components/Header.tsx
import React from "react";

const links = [
  { label: "Browse", href: "/#/database" },
  { label: "Build",  href: "/#/build"     },
  { label: "Blog",   href: "/#/blog"      },
];

export default function Header({ onOpenThemeMenu }: { onOpenThemeMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-50 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <div className="mx-auto max-w-6xl px-4">
        <div className="h-14 flex items-center gap-3 overflow-x-auto no-scrollbar">
          {/* Brand */}
          <a href="/#/" className="flex items-center gap-2 shrink-0">
            <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
            <span className="text-white font-semibold tracking-tight">THS</span>
          </a>

          {/* Nav pills (scroll horizontally on small screens) */}
          <nav className="min-w-0 flex-1 overflow-x-auto no-scrollbar" aria-label="Main">
            <div className="flex items-center gap-2">
              {links.map(l => (
                <a
                  key={l.href}
                  href={l.href}
                  className="px-3 py-1.5 rounded-xl text-sm bg-white/5 ring-1 ring-white/10 hover:bg-white/10 whitespace-nowrap"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </nav>

          {/* Theme button */}
          <button
            type="button"
            onClick={onOpenThemeMenu}
            className="shrink-0 px-3 py-1.5 rounded-xl text-sm bg-white/5 ring-1 ring-white/10 hover:bg-white/10 whitespace-nowrap"
          >
            Theme
          </button>
        </div>
      </div>
    </header>
  );
}

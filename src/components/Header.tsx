// src/components/Header.tsx
import React from "react";

const links = [
  { label: "Browse", href: "/#/database" },
  { label: "Build",  href: "/#/build"     },
  { label: "Blog",   href: "/#/blog"      },
];

export default function Header({ onOpenThemeMenu }: { onOpenThemeMenu?: () => void }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="container-page flex items-center gap-4 py-3" aria-label="Site">
        <a href="/#/" className="flex items-center gap-2 shrink-0">
          <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
          <span className="font-semibold tracking-tight text-white">THS</span>
        </a>

        <nav
          className="ml-auto flex items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-none"
          aria-label="Site"
        >
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="chip whitespace-nowrap text-white/80 hover:bg-white/10"
            >
              {link.label}
            </a>
          ))}
          <button
            type="button"
            onClick={onOpenThemeMenu}
            className="chip whitespace-nowrap text-white/80 hover:bg-white/10"
          >
            Theme
          </button>
        </nav>
      </div>
    </header>
  );
}

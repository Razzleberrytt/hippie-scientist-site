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
      <nav className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8" aria-label="Site">
        <div className="flex flex-wrap items-center gap-2 py-3 sm:gap-3 sm:py-4">
          <a href="/#/" className="flex shrink-0 items-center gap-2">
            <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
            <span className="font-semibold tracking-tight text-white">THS</span>
          </a>

          <div className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            {links.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="whitespace-nowrap rounded-xl bg-white/5 px-3 py-1.5 text-sm font-medium text-white/90 ring-1 ring-white/10 transition hover:bg-white/10"
              >
                {link.label}
              </a>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenThemeMenu}
            className="shrink-0 whitespace-nowrap rounded-xl bg-white/5 px-3 py-1.5 text-sm font-medium text-white/90 ring-1 ring-white/10 transition hover:bg-white/10"
          >
            Theme
          </button>
        </div>
      </nav>
    </header>
  );
}

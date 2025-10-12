// src/components/Header.tsx
import { useEffect } from "react";
import MeltToggle from "./MeltToggle";
import { melt } from "@/state/melt";
import { useTrippy } from "@/lib/trippy";

const links = [
  { label: "Browse", href: "/#/database" },
  { label: "Build",  href: "/#/build"     },
  { label: "Blog",   href: "/#/blog"      },
];

export default function Header() {
  const { enabled } = useTrippy();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!enabled) return;
        melt.toggle();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/5 backdrop-blur supports-[backdrop-filter]:bg-black/10">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-[999] rounded bg-black/70 px-3 py-2 text-sm font-medium text-white"
      >
        Skip to content
      </a>
      <div className="container-page flex items-center gap-4 py-3" aria-label="Site">
        <a href="/#/" className="flex items-center gap-2 shrink-0">
          <span className="h-6 w-2.5 rounded-full bg-gradient-to-b from-teal-300 via-sky-400 to-fuchsia-400" />
          <span className="font-semibold tracking-tight text-white">THS</span>
        </a>

        <nav
          className="ml-auto flex flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain scrollbar-none"
          aria-label="Site"
        >
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="chip whitespace-nowrap text-white/80 hover:bg-white/20"
            >
              {link.label}
            </a>
          ))}
          <MeltToggle />
        </nav>
      </div>
    </header>
  );
}

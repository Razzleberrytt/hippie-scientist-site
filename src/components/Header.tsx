// src/components/Header.tsx
import React, { useEffect } from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { useTrippy } from "../lib/trippy";

const links = [
  { label: "Browse", href: "/#/database" },
  { label: "Build",  href: "/#/build"     },
  { label: "Blog",   href: "/#/blog"      },
];

export default function Header() {
  const { trippy, setTrippy, enabled } = useTrippy();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!enabled) return;
        setTrippy(!trippy);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [enabled, setTrippy, trippy]);

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
            aria-pressed={trippy}
            aria-label="Toggle trippy mode"
            disabled={!enabled}
            onClick={() => setTrippy(!trippy)}
            className={clsx(
              "pill relative whitespace-nowrap",
              !enabled && "cursor-not-allowed opacity-50",
              trippy && "ring-1 ring-emerald-400/40",
            )}
          >
            <Sparkles className="mr-1 h-4 w-4" aria-hidden />
            Trippy {enabled ? (trippy ? "On" : "Off") : ""}
            <span
              className={clsx(
                "pointer-events-none absolute -inset-4 -z-10 rounded-full blur-2xl",
                trippy ? "bg-emerald-500/10" : "hidden",
              )}
            />
          </button>
        </nav>
      </div>
    </header>
  );
}

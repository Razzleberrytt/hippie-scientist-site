// src/components/Header.tsx
import { useCallback, useEffect } from "react";
import { Sparkles } from "lucide-react";
import clsx from "clsx";
import { TRIPPY_LABELS, nextTrippyLevel, useTrippy } from "@/lib/trippy";

const links = [
  { label: "Browse", href: "/#/database" },
  { label: "Build",  href: "/#/build"     },
  { label: "Blog",   href: "/#/blog"      },
];

export default function Header() {
  const { level, setLevel, enabled } = useTrippy();
  const active = level !== "off";
  const cycleLevel = useCallback(() => {
    setLevel(nextTrippyLevel(level));
  }, [level, setLevel]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "t") {
        event.preventDefault();
        if (!enabled) return;
        cycleLevel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [cycleLevel, enabled]);

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
            aria-pressed={active}
            aria-label={`Trippy mode: ${TRIPPY_LABELS[level]}. Tap to change.`}
            disabled={!enabled}
            onClick={cycleLevel}
            className={clsx(
              "pill relative whitespace-nowrap",
              !enabled && "cursor-not-allowed opacity-50",
              active && "ring-1 ring-emerald-400/40",
            )}
          >
            <Sparkles className="mr-1 h-4 w-4" aria-hidden />
            {TRIPPY_LABELS[level]}
            {active && (
              <span className="pointer-events-none absolute -inset-4 -z-10 rounded-full bg-emerald-500/10 blur-2xl" aria-hidden />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

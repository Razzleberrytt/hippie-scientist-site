import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import NavLink from "./NavLink";
import { TRIPPY_LABELS, nextTrippyLevel, useTrippy } from "@/lib/trippy";
import clsx from "clsx";

const navLinks = [
  { to: "/database", label: "Browse" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

type Props = { subtleOnHome?: boolean };

export default function SiteHeader({ subtleOnHome = false }: Props) {
  const buttonClasses = "px-3 py-2 text-sm";
  const { level, setLevel, enabled } = useTrippy();
  const active = level !== "off";
  const cycleLevel = () => setLevel(nextTrippyLevel(level));

  return (
    <header className="sticky top-0 z-50 backdrop-blur supports-[backdrop-filter]:bg-black/35 bg-black/55 border-b border-white/5">
      <div className="mx-auto max-w-6xl px-4 py-2 flex items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-3 text-white"
          aria-label="The Hippie Scientist"
        >
          <span className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 shadow" aria-hidden />
          <span className="font-semibold tracking-wide">THS</span>
          <span className={subtleOnHome ? "sr-only" : "text-white/70"}>
            The Hippie Scientist
          </span>
        </Link>
        <nav className="ml-auto flex gap-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to} className={buttonClasses}>
              {link.label}
            </NavLink>
          ))}
          <button
            type="button"
            aria-pressed={active}
            aria-label={`Trippy mode: ${TRIPPY_LABELS[level]}. Tap to change.`}
            onClick={cycleLevel}
            disabled={!enabled}
            className={clsx(
              "pill relative",
              !enabled && "cursor-not-allowed opacity-50",
              active && "ring-1 ring-emerald-400/40",
            )}
          >
            <Sparkles className="mr-1 h-4 w-4" aria-hidden />
            {TRIPPY_LABELS[level]}
            {active && (
              <span className="pointer-events-none absolute -inset-3 rounded-full bg-emerald-400/10 blur-2xl" aria-hidden />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

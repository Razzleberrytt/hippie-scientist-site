import { Link, useLocation } from "react-router-dom";
import clsx from "clsx";

const navLinks = [
  { to: "/", label: "THS" },
  { to: "/herbs", label: "Browse" },
  { to: "/compounds", label: "Compounds" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

const baseClasses =
  "flex min-w-fit items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition";

export default function HeaderNav() {
  const { pathname, hash } = useLocation();

  const isActive = (to: string) => {
    const normalizedTo = to.startsWith("#")
      ? to.replace(/^#/, "") || "/"
      : to;

    const matchesPathname =
      pathname === normalizedTo ||
      (normalizedTo !== "/" && pathname.startsWith(`${normalizedTo}/`));

    const matchesHash =
      hash === to ||
      hash === `#${normalizedTo}` ||
      (normalizedTo !== "/" && hash.startsWith(`#${normalizedTo}/`));

    return matchesPathname || matchesHash;
  };

  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/60 via-black/30 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/60 via-black/30 to-transparent"
        aria-hidden
      />
      <nav
        aria-label="Primary"
        className="-mx-2 flex gap-2 overflow-x-auto px-2 pb-1 pt-1 no-scrollbar"
      >
        {navLinks.map(link => {
          const active = isActive(link.to);
          return (
            <Link
              key={link.to}
              to={link.to}
              aria-current={active ? "page" : undefined}
              className={clsx(
                baseClasses,
                "border border-white/10 bg-white/5 text-white/80 shadow-[0_1px_12px_-6px_rgba(15,23,42,0.65)] backdrop-blur-xl",
                "hover:border-white/20 hover:bg-white/10 hover:text-white",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-300/70",
                active && "border-white/40 bg-white/15 text-white",
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

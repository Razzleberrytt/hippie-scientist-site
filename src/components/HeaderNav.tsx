import { NavLink, useLocation } from "react-router-dom";
import clsx from "clsx";

const navLinks = [
  { to: "/", label: "THS" },
  { to: "/herbs", label: "Browse" },
  { to: "/compounds", label: "Compounds" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

const baseLinkClasses =
  "w-full inline-flex items-center justify-center h-8 sm:h-9 rounded-full px-2 sm:px-3 text-[11px] sm:text-sm leading-none tracking-tight text-white/80 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

export default function HeaderNav() {
  const { pathname, hash } = useLocation();

  const isActive = (to: string) => {
    const normalizedTo = to.startsWith("#") ? to.replace(/^#/, "") || "/" : to;

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
    <nav aria-label="Primary" className="w-full px-2 py-2">
      <ul className="grid grid-cols-5 gap-1">
        {navLinks.map(link => {
          const active = isActive(link.to);
          return (
            <li key={link.to}>
              <NavLink
                to={link.to}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  baseLinkClasses,
                  active && "bg-white/15 ring-white/20 text-white"
                )}
              >
                <span className="truncate">{link.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

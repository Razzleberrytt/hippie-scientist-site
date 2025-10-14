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
  "flex h-9 w-full items-center justify-center rounded-full px-3 text-xs font-medium text-white/80 transition sm:text-sm bg-white/5 ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

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
    <nav aria-label="Primary" className="w-full">
      <ul className="flex gap-1">
        {navLinks.map(link => {
          const active = isActive(link.to);
          return (
            <li key={link.to} className="min-w-0 flex-1">
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

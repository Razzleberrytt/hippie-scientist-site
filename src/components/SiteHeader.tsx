import { NavLink } from "react-router-dom";
import ThemeMenu from "./ThemeMenu";

const links = [
  { href: "/database", label: "Browse" },
  { href: "/blend", label: "Build" },
  { href: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  return (
    <header
      className="site-header sticky top-0 z-40 border-b"
      style={{
        backdropFilter: "saturate(120%) blur(10px)",
        background: "color-mix(in oklab, var(--surface-c) 80%, transparent 20%)",
      }}
    >
      <div className="container py-3 flex flex-wrap items-center justify-between gap-3">
        <NavLink
          to="/"
          className="gradient-text text-xl font-semibold"
        >
          The Hippie Scientist
        </NavLink>
        <nav className="flex flex-wrap items-center gap-3 justify-end">
          {links.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                [`btn`, "hover-glow", "focus-glow", isActive ? "primary" : ""].filter(Boolean).join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeMenu />
        </nav>
      </div>
    </header>
  );
}

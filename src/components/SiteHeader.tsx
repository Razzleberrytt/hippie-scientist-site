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
      className="sticky top-0 z-40 border-b"
      style={{
        backdropFilter: "saturate(120%) blur(10px)",
        background: "color-mix(in oklab, var(--surface-c) 80%, transparent 20%)",
      }}
    >
      <div className="container py-3 flex flex-wrap items-center justify-between gap-3">
        <NavLink
          to="/"
          className="text-xl font-semibold"
          style={{
            backgroundImage: "linear-gradient(90deg,#c4f64e,#6ee7ff,#f0a4ff)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          The Hippie Scientist
        </NavLink>
        <nav className="flex flex-wrap items-center gap-3 justify-end">
          {links.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) => `btn ${isActive ? "primary" : ""}`.trim()}
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

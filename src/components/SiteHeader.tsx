import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NavLink from "./NavLink";
import ThemeMenu from "./ThemeMenu";

const navLinks = [
  { to: "/database", label: "Browse" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="header--sticky sticky inset-x-0 top-0 z-50 h-[var(--header-h)] border-b border-white/10 bg-black/40 backdrop-blur"
    >
      <div className="container flex h-full items-center justify-between gap-4">
        <Link to="/" className="text-xl font-semibold gradient-text">
          The Hippie Scientist
        </Link>
        <nav className="flex items-center gap-2">
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to}>
              {link.label}
            </NavLink>
          ))}
          <ThemeMenu />
        </nav>
      </div>
    </motion.header>
  );
}

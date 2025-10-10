import { useEffect, useState } from "react";
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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={`header--sticky sticky inset-x-0 top-0 z-50 h-[var(--header-h)] border-b transition-all duration-300 ${
        scrolled
          ? "border-white/15 bg-black/70 backdrop-blur-xl shadow-[0_12px_30px_-20px_rgba(24,32,64,0.65)]"
          : "border-transparent bg-transparent backdrop-blur-0"
      }`}
    >
      <div className="container flex h-full items-center justify-between gap-4">
        <Link
          to="/"
          className="group flex items-center gap-2 rounded-full px-2 py-1 transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Go to The Hippie Scientist homepage"
        >
          <span
            aria-hidden="true"
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-teal-400 via-sky-400 to-purple-500 transition-all duration-300 ${
              scrolled
                ? "shadow-[0_0_16px_rgba(126,249,255,0.55)] brightness-110"
                : "opacity-80 group-hover:opacity-100"
            }`}
          />
          <span
            className={`text-sm font-semibold uppercase tracking-[0.45em] text-white transition-colors duration-300 ${
              scrolled ? "text-white/90" : "text-white/70 group-hover:text-white"
            }`}
          >
            THS
          </span>
          <span className="sr-only">The Hippie Scientist</span>
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

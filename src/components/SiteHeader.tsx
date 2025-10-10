import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeMenu from "./ThemeMenu";

const navLinks = [
  { href: "/database", label: "Browse" },
  { href: "/blend", label: "Build" },
  { href: "/blog", label: "Blog" },
];

export default function SiteHeader() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="fixed top-0 left-0 z-40 w-full border-b border-white/10 backdrop-blur-xl"
      style={{
        background: "linear-gradient(to right, rgba(12,12,20,0.65), rgba(8,8,16,0.3))",
      }}
    >
      <div className="container flex h-[60px] items-center justify-between">
        <NavLink to="/" className="text-xl font-bold gradient-text">
          The Hippie Scientist
        </NavLink>
        <nav className="flex items-center gap-3">
          {navLinks.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                [
                  "rounded-xl px-4 py-1.5 text-sm font-medium transition-all",
                  "text-white/80 hover:bg-white/10 hover:text-white",
                  isActive ? "bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.08)]" : "",
                ]
                  .filter(Boolean)
                  .join(" ")
              }
            >
              {link.label}
            </NavLink>
          ))}
          <ThemeMenu />
        </nav>
      </div>
    </motion.header>
  );
}

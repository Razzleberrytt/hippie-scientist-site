import { Link } from "react-router-dom";
import NavLink from "./NavLink";
import MeltToggle from "./MeltToggle";

const navLinks = [
  { to: "/database", label: "Browse" },
  { to: "/blend", label: "Build" },
  { to: "/blog", label: "Blog" },
];

type Props = { subtleOnHome?: boolean };

export default function SiteHeader({ subtleOnHome = false }: Props) {
  const buttonClasses = "px-3 py-2 text-sm";

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/30">
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
          <MeltToggle className="px-3" />
        </nav>
      </div>
    </header>
  );
}

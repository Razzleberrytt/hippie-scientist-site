import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", label: "THS" },
  { to: "/herbs", label: "Browse" },
  { to: "/compounds", label: "Compounds" },
  { to: "/build", label: "Build" },
  { to: "/blog", label: "Blog" },
];

export default function HeaderNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      {/* -mx-px reclaims the subpixel gutter Safari adds; safe-x respects iOS insets */}
      <nav aria-label="Primary" className="safe-x -mx-px px-1 py-2 overflow-hidden">
        <ul className="grid grid-cols-5 gap-px">
          {tabs.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                className={({ isActive }) =>
                  [
                    // min-w-0 + truncate prevent intrinsic width from forcing overflow
                    "w-full min-w-0 inline-flex items-center justify-center",
                    // ultra-compact on xs, relax on sm+
                    "h-8 sm:h-9 rounded-full px-2 sm:px-3",
                    "text-[10.5px] sm:text-xs leading-none tracking-tight",
                    "bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors",
                    isActive ? "bg-white/15 ring-white/20" : "",
                  ].join(" ")
                }
              >
                <span className="truncate">{t.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

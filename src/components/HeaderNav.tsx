import { NavLink } from "react-router-dom";

const tabs = [
  { to: "/", short: "THS", full: "THS" },
  { to: "/herbs", short: "Herbs", full: "Browse" },
  { to: "/compounds", short: "Comp.", full: "Compounds" },
  { to: "/build", short: "Build", full: "Build" },
  { to: "/blog", short: "Blog", full: "Blog" },
];

export default function HeaderNav() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
      <nav aria-label="Primary" className="px-2 py-2 [overflow:clip]">
        <ul className="grid grid-cols-5 gap-1">
          {tabs.map((t) => (
            <li key={t.to} className="min-w-0">
              <NavLink
                to={t.to}
                className={({ isActive }) =>
                  [
                    "w-full min-w-0 inline-flex items-center justify-center",
                    // compact on phones, a touch larger on sm+
                    "h-8 sm:h-9 rounded-full px-2 sm:px-3",
                    "text-[11px] sm:text-sm leading-none tracking-tight",
                    "bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors",
                    isActive ? "bg-white/15 ring-white/20" : "",
                  ].join(" ")
                }
              >
                {/* short label on mobile */}
                <span className="truncate sm:hidden">{t.short}</span>
                {/* full label on sm+ */}
                <span className="hidden sm:block truncate">{t.full}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

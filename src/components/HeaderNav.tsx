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
      {/* clip any stray overflow; counter Safari subpixel gutters */}
      <nav aria-label="Primary" className="-mx-[1px] px-[1px] py-2 [overflow:clip]">
        <ul
          className="
            grid grid-cols-5
            gap-[clamp(0px,0.5vw,6px)]
            justify-items-stretch items-stretch
          "
        >
          {tabs.map((t) => (
            <li key={t.to} className="min-w-0">
              <NavLink
                to={t.to}
                className={({ isActive }) =>
                  [
                    "w-full min-w-0 inline-flex items-center justify-center",
                    // Fluid height & padding so pills auto-shrink a few px when needed
                    "h-[clamp(32px,6.0vw,40px)] px-[clamp(6px,1.6vw,12px)]",
                    // Fluid type (≈10.5–12px); prevents wrap/overflow on 430px widths
                    "text-[clamp(10.5px,2.6vw,12px)] leading-none tracking-tight",
                    "rounded-full bg-white/5 hover:bg-white/10 ring-1 ring-white/10 transition-colors",
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

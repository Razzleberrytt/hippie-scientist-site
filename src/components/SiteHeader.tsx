import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/database', label: 'Database' },
  { to: '/blend', label: 'Build a Blend' },
  { to: '/about', label: 'About' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--bg)]/80 backdrop-blur">
      <div className="container px-4">
        <div className="flex flex-wrap items-center justify-between gap-3 py-3">
          <Link to="/" className="h1-grad text-lg font-semibold leading-none">
            The Hippie Scientist
          </Link>
          <nav className="flex w-full flex-wrap items-center gap-2 text-sm text-sub sm:w-auto sm:justify-end">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1 transition ${
                    isActive ? 'bg-white/10 text-text' : 'hover:bg-white/10 hover:text-text'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

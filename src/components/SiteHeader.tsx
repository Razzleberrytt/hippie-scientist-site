import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/database', label: 'Database' },
  { to: '/blend', label: 'Build a Blend' },
  { to: '/about', label: 'About' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 backdrop-blur">
      <div className="container">
        <div className="flex flex-wrap items-center justify-between gap-4 py-4">
          <Link to="/" className="h1-grad text-2xl font-bold tracking-tight">
            The Hippie Scientist
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm text-sub">
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
        <div className="hr" />
      </div>
    </header>
  );
}

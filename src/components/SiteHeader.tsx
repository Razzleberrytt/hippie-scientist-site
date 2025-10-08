import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/database', label: 'Database' },
  { to: '/blend', label: 'Build a Blend' },
  { to: '/about', label: 'About' },
];

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--bg)]/85 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <Link to="/" className="h1-grad text-lg font-semibold tracking-wide">
          The Hippie Scientist
        </Link>
        <nav className="flex items-center gap-3 text-sm text-sub">
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
    </header>
  );
}

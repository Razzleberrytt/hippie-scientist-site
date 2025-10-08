import { Link, NavLink } from 'react-router-dom';
import logo from '/logo.svg';

const links = [
  { to: '/database', label: 'Database' },
  { to: '/blend', label: 'Build a Blend' },
  { to: '/about', label: 'About' },
];

export default function SiteHeader() {
  return (
    <div className="sticky top-0 z-30 bg-[color:var(--bg)]/80 backdrop-blur">
      <div className="container">
        <div className="flex items-center justify-between py-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="The Hippie Scientist" className="h-8 w-auto" />
            <span className="h1-grad text-xl font-bold">The Hippie Scientist</span>
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
      </div>
    </div>
  );
}

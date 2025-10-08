import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';

const links = [
  { to: '/database', label: 'Database', hoverClass: 'hover:text-lime-300' },
  { to: '/blend', label: 'Build a Blend', hoverClass: 'hover:text-cyan-300' },
  { to: '/about', label: 'About', hoverClass: 'hover:text-pink-300' },
];

type DrawerLinkProps = ComponentProps<typeof RouterLink>;

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const DrawerLink = ({ className = '', onClick, ...props }: DrawerLinkProps) => (
    <RouterLink
      {...props}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setOpen(false);
        }
      }}
      className={`block rounded-md px-3 py-2 text-sub transition hover:bg-white/10 ${className}`.trim()}
    />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[color:var(--bg)]/85 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between px-4 py-3">
        <RouterLink
          to="/"
          className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-lg font-semibold tracking-wide text-transparent"
        >
          The Hippie Scientist
        </RouterLink>

        <nav className="hidden items-center gap-4 text-sm md:flex">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 transition hover:bg-white/10 ${link.hoverClass} ${isActive ? 'text-white' : 'text-sub'}`.trim()
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 md:hidden"
        >
          <span className="sr-only">Open menu</span>
          <div className="space-y-1.5">
            <div className={`h-0.5 w-5 bg-white transition ${open ? 'translate-y-2 rotate-45' : ''}`.trim()} />
            <div className={`h-0.5 w-5 bg-white transition ${open ? 'opacity-0' : ''}`.trim()} />
            <div className={`h-0.5 w-5 bg-white transition ${open ? '-translate-y-2 -rotate-45' : ''}`.trim()} />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[color:var(--bg)]/90 backdrop-blur md:hidden">
          <div className="container mx-auto px-2 py-2">
            {links.map(link => (
              <DrawerLink key={link.to} to={link.to} className={link.hoverClass}>
                {link.label}
              </DrawerLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

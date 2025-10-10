import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const links = [
  { to: '/database', label: 'Database', hoverClass: 'hover:text-[rgb(var(--accent))]' },
  { to: '/blend', label: 'Build a Blend', hoverClass: 'hover:text-[rgb(var(--accent))]' },
  { to: '/about', label: 'About', hoverClass: 'hover:text-[rgb(var(--accent))]' },
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
      className={`block rounded-md px-3 py-2 text-sub transition hover:bg-[rgb(var(--card))/0.08] ${className}`.trim()}
    />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[rgb(var(--border))/0.5] bg-[rgb(var(--bg))/0.85] backdrop-blur">
      <div className="container mx-auto flex items-center gap-4 px-4 py-3">
        <RouterLink
          to="/"
          className="bg-gradient-to-r from-[rgb(var(--accent))] via-[rgb(var(--accent))] to-[rgb(var(--accent))] bg-clip-text text-lg font-semibold tracking-wide text-transparent"
        >
          The Hippie Scientist
        </RouterLink>

        <div className="ml-auto flex items-center gap-3">
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sub transition hover:bg-[rgb(var(--card))/0.08] ${
                    link.hoverClass
                  } ${isActive ? 'text-[rgb(var(--accent))]' : ''}`.trim()
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(value => !value)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[rgb(var(--border))/0.5] bg-[color-mix(in_oklab,rgb(var(--card))_12%,transparent)] text-[rgb(var(--fg))] transition hover:bg-[color-mix(in_oklab,rgb(var(--card))_18%,transparent)] md:hidden"
          >
            <span className="sr-only">Open menu</span>
            <div className="space-y-1.5">
              <div className={`h-0.5 w-5 bg-[rgb(var(--fg))] transition ${open ? 'translate-y-2 rotate-45' : ''}`.trim()} />
              <div className={`h-0.5 w-5 bg-[rgb(var(--fg))] transition ${open ? 'opacity-0' : ''}`.trim()} />
              <div className={`h-0.5 w-5 bg-[rgb(var(--fg))] transition ${open ? '-translate-y-2 -rotate-45' : ''}`.trim()} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-[rgb(var(--border))/0.5] bg-[rgb(var(--bg))/0.9] backdrop-blur md:hidden">
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

import type { ComponentProps } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Link as RouterLink, NavLink, useLocation } from 'react-router-dom';
import {
  getAccent,
  getTheme,
  setAccent,
  setTheme,
  type Accent,
  type ThemeMode,
} from '../lib/theme';

const links = [
  { to: '/database', label: 'Browse' },
  { to: '/blend', label: 'Build' },
  { to: '/about', label: 'About' },
];

const themeOptions: { value: ThemeMode; label: string; description: string }[] = [
  { value: 'system', label: 'System', description: 'Match your OS preference' },
  { value: 'dark', label: 'Dark', description: 'Deep, high-contrast mode' },
  { value: 'light', label: 'Light', description: 'Airy, high-readability mode' },
];

const accentOptions: { value: Accent; label: string; swatch: string }[] = [
  { value: 'cyan', label: 'Cyan', swatch: 'var(--cyan)' },
  { value: 'lime', label: 'Lime', swatch: 'var(--lime)' },
  { value: 'pink', label: 'Pink', swatch: 'var(--pink)' },
];

type DrawerLinkProps = ComponentProps<typeof RouterLink>;

export default function SiteHeader() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [mode, setMode] = useState<ThemeMode>('system');
  const [accent, setAccentState] = useState<Accent>('cyan');
  const location = useLocation();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [drawerOpen]);

  useEffect(() => {
    setDrawerOpen(false);
    setThemeOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    setMode(getTheme());
    setAccentState(getAccent());
  }, []);

  useEffect(() => {
    if (!themeOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setThemeOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setThemeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [themeOpen]);

  const handleModeChange = (value: ThemeMode) => {
    setMode(value);
    setTheme(value);
  };

  const handleAccentChange = (value: Accent) => {
    setAccentState(value);
    setAccent(value);
  };

  const DrawerLink = ({ className = '', onClick, ...props }: DrawerLinkProps) => (
    <RouterLink
      {...props}
      onClick={event => {
        onClick?.(event);
        if (!event.defaultPrevented) {
          setDrawerOpen(false);
        }
      }}
      className={`block rounded-md px-3 py-2 text-sub transition hover:bg-[rgb(var(--card))/0.08] ${className}`.trim()}
    />
  );

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md bg-[rgb(var(--bg))/0.8] border-b border-white/10 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.5)]">
      <div className="mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
        <RouterLink
          to="/"
          className="font-semibold text-xl bg-gradient-to-r from-lime-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent"
        >
          The Hippie Scientist
        </RouterLink>

        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {links.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-[rgb(var(--fg))] transition hover:text-[rgb(var(--accent))] ${
                    isActive ? 'text-[rgb(var(--accent))]' : 'opacity-80'
                  }`.trim()
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:block" ref={dropdownRef}>
            <div className="relative">
              <button
                type="button"
                onClick={() => setThemeOpen(value => !value)}
                aria-haspopup="true"
                aria-expanded={themeOpen}
                className="px-2 py-1 rounded-md border border-white/10 text-sm text-[rgb(var(--fg))] opacity-80 transition hover:border-[rgb(var(--accent))]"
              >
                Theme
              </button>
              {themeOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-[rgb(var(--card))]/95 backdrop-blur-md shadow-lg p-4 space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--fg))] opacity-60">Mode</p>
                    <div className="grid gap-1.5">
                      {themeOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleModeChange(option.value);
                            setThemeOpen(false);
                          }}
                          className={`flex items-start justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                            mode === option.value
                              ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/15 text-[rgb(var(--fg))]'
                              : 'border-white/10 text-[rgb(var(--fg))] opacity-80 hover:border-[rgb(var(--accent))]/60'
                          }`}
                        >
                          <span className="font-medium">{option.label}</span>
                          <span className="text-xs opacity-70">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--fg))] opacity-60">Accent</p>
                    <div className="flex items-center gap-2">
                      {accentOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            handleAccentChange(option.value);
                            setThemeOpen(false);
                          }}
                          className={`h-7 w-7 rounded-full border-2 transition ${
                            accent === option.value
                              ? 'border-[rgb(var(--fg))]'
                              : 'border-transparent'
                          }`}
                          style={{ background: option.swatch }}
                          aria-label={`Use ${option.label} accent`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Menu"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(value => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 text-[rgb(var(--fg))] transition hover:border-[rgb(var(--accent))] md:hidden"
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="space-y-1.5">
              <div className={`h-0.5 w-6 bg-[rgb(var(--fg))] transition ${drawerOpen ? 'translate-y-2 rotate-45' : ''}`.trim()} />
              <div className={`h-0.5 w-6 bg-[rgb(var(--fg))] transition ${drawerOpen ? 'opacity-0' : ''}`.trim()} />
              <div className={`h-0.5 w-6 bg-[rgb(var(--fg))] transition ${drawerOpen ? '-translate-y-2 -rotate-45' : ''}`.trim()} />
            </div>
          </button>
        </div>
      </div>

      {drawerOpen && (
        <div className="border-t border-white/10 bg-[rgb(var(--bg))/0.92] backdrop-blur-md md:hidden">
          <div className="mx-auto px-4 py-4 space-y-4">
            <nav className="flex flex-col gap-2 text-sm">
              {links.map(link => (
                <DrawerLink key={link.to} to={link.to}>
                  {link.label}
                </DrawerLink>
              ))}
            </nav>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--fg))] opacity-70">Theme</p>
              <div className="flex flex-wrap gap-2">
                {themeOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleModeChange(option.value)}
                    className={`rounded-lg border px-3 py-2 text-sm transition ${
                      mode === option.value
                        ? 'border-[rgb(var(--accent))] bg-[rgb(var(--accent))]/15 text-[rgb(var(--fg))]'
                        : 'border-white/10 text-[rgb(var(--fg))] opacity-80 hover:border-[rgb(var(--accent))]/60'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {accentOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleAccentChange(option.value)}
                    className={`h-8 w-8 rounded-full border-2 transition ${
                      accent === option.value
                        ? 'border-[rgb(var(--fg))]'
                        : 'border-transparent'
                    }`}
                    style={{ background: option.swatch }}
                    aria-label={`Use ${option.label} accent`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

const THEME_KEY = 'theme.v1';
const ACCENT_KEY = 'accent.v1';

export type ThemeMode = 'light' | 'dark' | 'system';
export type Accent = 'cyan' | 'lime' | 'pink';

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function getTheme(): ThemeMode {
  try {
    return (localStorage.getItem(THEME_KEY) as ThemeMode) || 'system';
  } catch {
    return 'system';
  }
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_KEY, mode);
  applyTheme(mode, getAccent());
}

export function getAccent(): Accent {
  try {
    return (localStorage.getItem(ACCENT_KEY) as Accent) || 'cyan';
  } catch {
    return 'cyan';
  }
}

export function setAccent(accent: Accent) {
  localStorage.setItem(ACCENT_KEY, accent);
  applyTheme(getTheme(), accent);
}

export function applyTheme(mode: ThemeMode = getTheme(), accent: Accent = getAccent()) {
  const root = document.documentElement;
  const dark = mode === 'dark' || (mode === 'system' && prefersDark());
  root.setAttribute('data-theme', dark ? 'dark' : 'light');
  root.setAttribute('data-accent', accent);
}

export function initThemeOnLoad() {
  applyTheme();
  const mm = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (mm) {
    const cb = () => {
      if (getTheme() === 'system') applyTheme('system', getAccent());
    };
    mm.addEventListener?.('change', cb);
  }
}

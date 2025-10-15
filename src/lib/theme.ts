import { recordDevMessage } from '../utils/devMessages';

const THEME_KEY = 'ths:theme';
const ACCENT_KEY = 'ths:accent';

export type ThemeChoice = 'dark' | 'light';
export type AccentChoice = 'blue' | 'lime' | 'pink';

function safeSetItem(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    recordDevMessage('warning', 'Unable to persist preference', error);
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function applyTheme(theme: ThemeChoice) {
  document.documentElement.setAttribute('data-theme', theme);
  safeSetItem(THEME_KEY, theme);
}

export function applyAccent(accent: AccentChoice) {
  document.documentElement.setAttribute('data-accent', accent);
  safeSetItem(ACCENT_KEY, accent);
}

export function initTheme() {
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const storedTheme = (safeGetItem(THEME_KEY) as ThemeChoice | null) ?? (prefersDark ? 'dark' : 'light');
  const storedAccent = (safeGetItem(ACCENT_KEY) as AccentChoice | null) ?? 'blue';
  applyTheme(storedTheme);
  applyAccent(storedAccent);
}

export function getTheme(): ThemeChoice {
  return (safeGetItem(THEME_KEY) as ThemeChoice | null) ?? (document.documentElement.getAttribute('data-theme') as ThemeChoice) ?? 'dark';
}

export function getAccent(): AccentChoice {
  return (safeGetItem(ACCENT_KEY) as AccentChoice | null) ?? (document.documentElement.getAttribute('data-accent') as AccentChoice) ?? 'blue';
}

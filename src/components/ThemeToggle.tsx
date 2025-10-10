import { useEffect, useState } from 'react';
import {
  getTheme,
  setTheme,
  getAccent,
  setAccent,
  type ThemeMode,
  type Accent,
} from '../lib/theme';

const accents: Accent[] = ['cyan', 'lime', 'pink'];

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [accent, setAcc] = useState<Accent>('cyan');

  useEffect(() => {
    setMode(getTheme());
    setAcc(getAccent());
  }, []);

  function cycle() {
    const next = mode === 'system' ? 'dark' : mode === 'dark' ? 'light' : 'system';
    setMode(next);
    setTheme(next);
  }

  function pick(a: Accent) {
    setAcc(a);
    setAccent(a);
  }

  const label = mode === 'system' ? 'System' : mode === 'dark' ? 'Dark' : 'Light';

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycle}
        className="px-2.5 py-1.5 rounded-lg border border-[rgb(var(--border))/0.6] bg-[color-mix(in_oklab,rgb(var(--card))_80%,transparent)] text-sm text-[rgb(var(--fg))] transition-colors hover:bg-[color-mix(in_oklab,rgb(var(--card))_65%,transparent)]"
        title="Theme: System/Dark/Light"
        type="button"
      >
        Theme: {label}
      </button>
      <div className="flex items-center gap-1" title="Accent color">
        {accents.map(accentName => (
          <button
            key={accentName}
            onClick={() => pick(accentName)}
            className={`h-6 w-6 rounded-full border border-[rgb(var(--border))/0.6] transition ${
              accentName === 'cyan'
                ? 'bg-[rgb(56_189_248)]'
                : accentName === 'lime'
                ? 'bg-[rgb(163_230_53)]'
                : 'bg-[rgb(244_114_182)]'
            } ${accent === accentName ? 'ring-2 ring-offset-2 ring-[rgb(var(--fg))] ring-offset-[rgb(var(--bg))]' : ''}`}
            aria-label={`Accent ${accentName}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

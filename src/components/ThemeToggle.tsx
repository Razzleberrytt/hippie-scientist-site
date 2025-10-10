import { useEffect, useState } from 'react';
import {
  applyAccent,
  applyTheme,
  getAccent,
  getTheme,
  type AccentChoice,
  type ThemeChoice,
} from '../lib/theme';

const accents: AccentChoice[] = ['blue', 'lime', 'pink'];

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeChoice>('dark');
  const [accent, setAcc] = useState<AccentChoice>('blue');

  useEffect(() => {
    setMode(getTheme());
    setAcc(getAccent());
  }, []);

  function cycle() {
    const next: ThemeChoice = mode === 'dark' ? 'light' : 'dark';
    setMode(next);
    applyTheme(next);
  }

  function pick(a: AccentChoice) {
    setAcc(a);
    applyAccent(a);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={cycle}
        className="btn"
        style={{
          background: 'color-mix(in oklab, var(--surface-c) 92%, transparent 8%)',
          color: 'var(--text-c)',
        }}
        title="Toggle theme"
        type="button"
      >
        Theme: {mode === 'dark' ? 'Dark' : 'Light'}
      </button>
      <div className="flex items-center gap-1" title="Accent color">
        {accents.map(accentName => (
          <button
            key={accentName}
            onClick={() => pick(accentName)}
            className="h-6 w-6 rounded-full border-2"
            style={{
              background:
                accentName === 'blue'
                  ? 'linear-gradient(120deg, #1aa8ff, #6ee7ff)'
                  : accentName === 'lime'
                    ? 'linear-gradient(120deg, #a3f54f, #5ff477)'
                    : 'linear-gradient(120deg, #f0a4ff, #ff7dca)',
              borderColor:
                accent === accentName
                  ? 'color-mix(in oklab, var(--accent), white 25%)'
                  : 'color-mix(in oklab, var(--border-c) 70%, transparent 30%)',
            }}
            aria-label={`Accent ${accentName}`}
            type="button"
          />
        ))}
      </div>
    </div>
  );
}

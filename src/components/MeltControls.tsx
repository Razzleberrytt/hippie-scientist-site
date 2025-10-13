'use client';
import { useEffect, useState } from 'react';
import { DEFAULT_MELT, MELT_PRESETS, type MeltPresetKey } from '@/lib/melt-presets';
import clsx from 'clsx';

type Props = {
  value?: MeltPresetKey;
  onChange?: (p: MeltPresetKey) => void;
  className?: string;
};

export default function MeltControls({ value, onChange, className }: Props) {
  const [preset, setPreset] = useState<MeltPresetKey>(value ?? DEFAULT_MELT);

  useEffect(() => {
    if (value && value !== preset) {
      setPreset(value);
    }
  }, [value, preset]);

  useEffect(() => {
    onChange?.(preset);
    // persist between navigations
    try { localStorage.setItem('melt_preset', preset); } catch {}
  }, [preset]);

  useEffect(() => {
    // hydrate from storage on first mount
    try {
      const saved = localStorage.getItem('melt_preset') as MeltPresetKey | null;
      if (saved && MELT_PRESETS[saved]) setPreset(saved);
    } catch {}
  }, []);

  return (
    <div className={className}>
      <div className="flex items-center gap-2 overflow-x-auto snap-x scrollbar-none py-2 -mx-2 px-2">
        {(Object.keys(MELT_PRESETS) as MeltPresetKey[]).map(k => (
          <button
            key={k}
            onClick={() => setPreset(k)}
            className={clsx(
              'snap-start rounded-full px-3 py-1.5 text-sm border bg-white/5 border-white/10 backdrop-blur transition-colors duration-200',
              preset === k ? 'ring-2 ring-teal-400/60 text-white shadow-[0_0_0_1px_rgba(45,212,191,0.4)]' : 'text-white/80 hover:text-white'
            )}
            type="button"
          >
            {MELT_PRESETS[k].label}
          </button>
        ))}
      </div>
    </div>
  );
}

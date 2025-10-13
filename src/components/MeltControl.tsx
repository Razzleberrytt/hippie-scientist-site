'use client';
import { useState } from 'react';
import clsx from 'clsx';
import type { MeltKey } from '@/lib/melt/effects';

export const MELT_OPTIONS = [
  { key: 'aura', label: 'Aura' },
  { key: 'nebula', label: 'Nebula' },
  { key: 'vapor', label: 'Vapor' },
  { key: 'particles', label: 'Particles' },
] as const satisfies ReadonlyArray<{ key: MeltKey; label: string }>;

export type MeltControlKey = typeof MELT_OPTIONS[number]['key'];

export default function MeltControl({
  value,
  onChange,
}: {
  value: MeltControlKey;
  onChange: (k: MeltControlKey) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-full bg-zinc-900/70 px-4 py-2 text-sm ring-1 ring-white/10 transition hover:ring-white/20"
        onClick={() => setOpen((v) => !v)}
      >
        ✨ Melt
      </button>

      {open && (
        <div className="absolute right-0 mt-2 grid w-[260px] grid-cols-2 gap-2 rounded-2xl bg-zinc-900/90 p-2 ring-1 ring-white/10">
          {MELT_OPTIONS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => {
                onChange(option.key);
                setOpen(false);
              }}
              className={clsx(
                'rounded-full px-3 py-2 text-sm text-zinc-300 ring-1 ring-white/10 transition hover:text-white hover:ring-white/30',
                value === option.key && 'bg-white/10 text-white',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

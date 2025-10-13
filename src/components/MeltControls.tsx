'use client';
import { useEffect, useState } from 'react';
import { EFFECTS, DEFAULT_EFFECT, type MeltEffectKey } from '@/lib/melt-effects';
import clsx from 'clsx';

type Props = {
  className?: string;
  value?: MeltEffectKey;
  onChange?: (key: MeltEffectKey) => void;
};

export default function MeltControls({ className, value, onChange }: Props) {
  const [fx, setFx] = useState<MeltEffectKey>(value ?? DEFAULT_EFFECT);

  useEffect(() => {
    if (value && value !== fx) {
      setFx(value);
    }
  }, [value, fx]);

  useEffect(() => {
    onChange?.(fx);
    try {
      localStorage.setItem('melt_fx', fx);
    } catch {
      /* ignore persistence errors */
    }
  }, [fx, onChange]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('melt_fx') as MeltEffectKey | null;
      if (stored && EFFECTS[stored]) {
        setFx(stored);
      }
    } catch {
      /* ignore persistence errors */
    }
  }, []);

  return (
    <div className={className}>
      <div className="flex gap-2 overflow-x-auto snap-x scrollbar-none py-2 -mx-2 px-2">
        {Object.values(EFFECTS).map((effect) => (
          <button
            key={effect.key}
            type="button"
            onClick={() => setFx(effect.key)}
            className={clsx(
              'snap-start rounded-full px-3.5 py-1.5 text-sm border border-white/12 bg-white/6 backdrop-blur transition-colors duration-200',
              fx === effect.key
                ? 'ring-2 ring-teal-300/60 text-white'
                : 'text-white/85 hover:text-white',
            )}
          >
            {effect.label}
          </button>
        ))}
      </div>
    </div>
  );
}

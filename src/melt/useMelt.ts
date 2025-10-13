import { create } from 'zustand';
import { DEFAULT_EFFECT, type MeltKey } from '@/lib/melt/effects';

export type { MeltKey } from '@/lib/melt/effects';

type MeltState = {
  enabled: boolean;
  preset: MeltKey;
  setEnabled: (v: boolean) => void;
  setPreset: (p: MeltKey) => void;
};

const KEY = 'ths.melt.v2';

type PersistedState = Partial<Pick<MeltState, 'enabled' | 'preset'>>;

const load = (): PersistedState | null => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state: Pick<MeltState, 'enabled' | 'preset'>) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(KEY, JSON.stringify(state));
    }
  } catch {
    /* ignore persistence errors */
  }
};

const prefersReducedMotion = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

export const useMelt = create<MeltState>((set) => {
  const saved = typeof window !== 'undefined' ? load() : null;
  const initialEnabled = prefersReducedMotion() ? false : saved?.enabled ?? true;
  const initialPreset = saved?.preset ?? DEFAULT_EFFECT;

  const persist = (partial: Partial<MeltState>) =>
    set((state) => {
      const next = { ...state, ...partial } as MeltState;
      save({ enabled: next.enabled, preset: next.preset });
      return next;
    });

  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (event: MediaQueryListEvent | MediaQueryList) => {
      const matches = (event as MediaQueryList).matches;
      if (matches) {
        persist({ enabled: false });
      }
    };

    handleChange(media);

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', handleChange);
    } else if (typeof media.addListener === 'function') {
      media.addListener(handleChange);
    }
  }

  return {
    enabled: initialEnabled,
    preset: initialPreset,
    setEnabled: (value) => {
      const next = prefersReducedMotion() ? false : value;
      persist({ enabled: next });
    },
    setPreset: (preset) => {
      persist({ preset });
    },
  };
});

import { create } from 'zustand';

export type MeltEffect = 'aura' | 'nebula' | 'vapor' | 'plasma';

const DEFAULT_EFFECT: MeltEffect = 'aura';

type MeltState = {
  enabled: boolean;
  effect: MeltEffect;
  setEnabled: (value: boolean) => void;
  setEffect: (value: MeltEffect) => void;
};

const KEY = 'ths.melt.v3';

type PersistedState = Partial<Pick<MeltState, 'enabled' | 'effect'>>;

const load = (): PersistedState | null => {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null;
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const save = (state: Pick<MeltState, 'enabled' | 'effect'>) => {
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
  const initialEffect = saved?.effect ?? DEFAULT_EFFECT;

  const persist = (partial: Partial<MeltState>) =>
    set((state) => {
      const next = { ...state, ...partial } as MeltState;
      save({ enabled: next.enabled, effect: next.effect });
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
    effect: initialEffect,
    setEnabled: (value) => {
      const next = prefersReducedMotion() ? false : value;
      persist({ enabled: next });
    },
    setEffect: (value) => {
      persist({ effect: value });
    },
  };
});

export { DEFAULT_EFFECT };

export type MeltState = {
  enabled: boolean;
  set: (v: boolean) => void;
  toggle: () => void;
  subscribe: (fn: (v: boolean) => void) => () => void;
};

const KEY = "ths:melt";

let current =
  typeof window !== "undefined"
    ? localStorage.getItem(KEY) === "1"
    : false;

const listeners = new Set<(v: boolean) => void>();

function notify() {
  for (const fn of [...listeners]) fn(current);
}

export const melt: MeltState = {
  enabled: current,
  set(v) {
    current = v;
    melt.enabled = current;
    try {
      localStorage.setItem(KEY, v ? "1" : "0");
    } catch {}
    document.documentElement.classList.toggle("melt-on", v);
    notify();
  },
  toggle() {
    melt.set(!current);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};

if (typeof document !== "undefined") {
  document.documentElement.classList.toggle("melt-on", current);
}

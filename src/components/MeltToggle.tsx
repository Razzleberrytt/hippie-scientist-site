"use client";
import { useState } from "react";
import { Sparkles } from "lucide-react";

type EffectOption = {
  id: "aura" | "nebula" | "vapor" | "plasma";
  label: string;
};

export const EFFECTS: readonly EffectOption[] = [
  { id: "aura", label: "Aura" },
  { id: "nebula", label: "Nebula" },
  { id: "vapor", label: "Vapor" },
  { id: "plasma", label: "Plasma" },
];

type MeltState = {
  enabled: boolean;
  effect: EffectOption["id"];
};

type MeltToggleProps = {
  state: MeltState;
  onChange: (next: MeltState) => void;
};

export type { MeltState };

export default function MeltToggle({ state, onChange }: MeltToggleProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-white/90 transition hover:bg-white/10"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Melt
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-black/60 p-2 text-left backdrop-blur-xl"
          onMouseLeave={() => setOpen(false)}
        >
          <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-white/90 hover:bg-white/5">
            <input
              type="checkbox"
              checked={state.enabled}
              onChange={(event) => onChange({ ...state, enabled: event.target.checked })}
              className="accent-emerald-400"
            />
            Enabled
          </label>
          <div className="mt-1 grid grid-cols-1">
            {EFFECTS.map((effect) => (
              <button
                key={effect.id}
                type="button"
                onClick={() => {
                  onChange({ ...state, effect: effect.id });
                  setOpen(false);
                }}
                className={`text-left rounded-xl px-3 py-2 text-sm transition hover:bg-white/10 ${
                  state.effect === effect.id ? "bg-white/10" : ""
                }`}
              >
                {effect.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

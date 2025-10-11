// src/components/Counters.tsx
import React from "react";

export function Counters({
  herbs = 0,
  compounds = 0,
  articles = 0
}: { herbs?: number; compounds?: number; articles?: number }) {
  const Item = ({ n, label }: { n: number; label: string }) => (
    <div className="flex items-center gap-2 px-3 h-9 rounded-2xl bg-white/5 ring-1 ring-white/10 whitespace-nowrap">
      <span className="grid place-items-center w-7 h-7 rounded-full bg-white/10 font-semibold">{n}</span>
      <span className="text-sm text-white/80">{label}</span>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4">
      <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
        <Item n={herbs}     label="psychoactive herbs" />
        <Item n={compounds} label="active compounds" />
        <Item n={articles}  label="articles" />
      </div>
    </div>
  );
}

export default Counters;

// src/components/Counters.tsx
import React from "react";

export function Counters({
  herbs = 0,
  compounds = 0,
  articles = 0
}: { herbs?: number; compounds?: number; articles?: number }) {
  const items = [
    { value: herbs, label: "psychoactive herbs" },
    { value: compounds, label: "active compounds" },
    { value: articles, label: "articles" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4">
      <ul className="mt-4 flex flex-wrap items-center gap-3 max-w-full overflow-hidden">
        {items.map(({ value, label }) => (
          <li key={label} className="shrink min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-white/10 ring-1 ring-white/15 text-white/85 whitespace-nowrap">
              <strong className="tabular-nums text-base font-semibold">{value}</strong>
              <span className="truncate text-sm text-white/75">{label}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Counters;

import type { ReactNode } from 'react';

export default function StatBadge({
  count,
  label,
  icon,
}: {
  count: number | string;
  label: string;
  icon?: ReactNode;
}) {
  return (
    <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-card/60 px-3 py-1 text-sm text-text/90 shadow-soft ring-1 ring-white/5">
      <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold leading-none">
        {count}
      </span>
      <span className="truncate leading-none">{label}</span>
      {icon}
    </div>
  );
}

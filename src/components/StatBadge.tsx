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
    <span className="chip text-white/85">
      <strong className="font-semibold text-white">{count}</strong>
      <span className="text-white/70">{label}</span>
      {icon ? <span className="shrink-0 text-white/80">{icon}</span> : null}
    </span>
  );
}

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
    <span className="pill bg-white/10 text-white/80">
      <span className="count">{count}</span>
      <span className="text-white/70">{label}</span>
      {icon ? <span className="shrink-0 text-white/80">{icon}</span> : null}
    </span>
  );
}

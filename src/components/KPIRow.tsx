import clsx from 'clsx';

interface KPIRowProps {
  herbs: number;
  compounds: number;
  articles: number;
  className?: string;
}

function StatPill({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-zinc-200">
      <span className="grid min-w-[2.25rem] place-items-center rounded-full bg-white/10 px-2 py-1 text-sm font-semibold text-white">
        {n}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}

export default function KPIRow({ herbs, compounds, articles, className }: KPIRowProps) {
  return (
    <div className={clsx('flex flex-wrap items-center gap-3', className)}>
      <StatPill n={herbs} label="psychoactive herbs" />
      <StatPill n={compounds} label="active compounds" />
      <StatPill n={articles} label="articles" />
    </div>
  );
}

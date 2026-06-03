export type Stat = {
  label: string;
  value: number;
};

type StatBadgesProps = {
  stats: Stat[];
};

export default function StatBadges({ stats }: StatBadgesProps) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 text-white/80 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/[0.02] px-4 py-2"
        >
          <span className="inline-flex h-7 min-w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-2 text-sm font-semibold text-white">
            {stat.value}
          </span>
          <span className="text-sm">{stat.label}</span>
        </div>
      ))}
    </div>
  );
}

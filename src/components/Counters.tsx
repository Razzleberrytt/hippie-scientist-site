// src/components/Counters.tsx
import { useEffect, useState } from "react";

type Stats = { herbs: number; compounds: number; articles: number };

function pretty(n: number | undefined) {
  if (!n && n !== 0) return "—";
  if (n >= 1000) return (n / 1000).toFixed(n % 1000 === 0 ? 0 : 1) + "k";
  return String(n);
}

export default function Counters({ className = "", compact = false }:{
  className?: string; compact?: boolean;
}) {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const fallback: Stats = { herbs: 0, compounds: 0, articles: 0 };
    fetch("/stats.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : fallback))
      .then((data: Partial<Stats>) => {
        setStats({
          herbs: typeof data?.herbs === "number" ? data.herbs : fallback.herbs,
          compounds: typeof data?.compounds === "number" ? data.compounds : fallback.compounds,
          articles: typeof data?.articles === "number" ? data.articles : fallback.articles,
        });
      })
      .catch(() => setStats(fallback));
  }, []);

  const items = [
    { label: "psychoactive herbs", value: pretty(stats?.herbs) },
    { label: "active compounds",   value: pretty(stats?.compounds) },
    { label: "articles",           value: pretty(stats?.articles) }
  ];

  return (
    <div
      className={
        "flex flex-wrap items-center gap-x-3 gap-y-2 text-white/80 " +
        (compact ? "text-sm" : "text-base") + " " + className
      }
      aria-label="Site statistics"
    >
      {items.map((it, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-medium">
            {it.value}
          </span>
          <span className="whitespace-nowrap">{it.label}</span>
          {i < items.length - 1 && (
            <span className="mx-1.5 h-1 w-1 rounded-full bg-white/25" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

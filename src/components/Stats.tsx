import React from "react";

type Stat = { label: string; value: number | string; ariaLabel?: string };

type StatsProps = {
  items: Stat[];
};

export default function Stats({ items }: StatsProps) {
  return (
    <ul className="stats-grid" role="list" aria-label="Site statistics">
      {items.map((stat, index) => (
        <li
          key={`${stat.label}-${index}`}
          className="stat-pill"
          aria-label={stat.ariaLabel ?? `${stat.value} ${stat.label}`}
        >
          <span className="stat-value">{stat.value}</span>
          <span className="stat-label">{stat.label}</span>
        </li>
      ))}
    </ul>
  );
}

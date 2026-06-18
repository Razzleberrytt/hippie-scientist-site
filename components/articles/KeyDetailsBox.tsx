interface KeyDetailsItem {
  label: string;
  value: string;
}

export interface KeyDetailsBoxProps {
  title?: string;
  summary?: string;
  items: KeyDetailsItem[];
  evidenceBadge?: string;
  zone?: 'supplement' | 'harm-reduction';
}

export default function KeyDetailsBox({
  title = 'Key Details',
  summary,
  items,
  evidenceBadge,
  zone,
}: KeyDetailsBoxProps) {
  return (
    <div
      className="rounded-xl border border-brand-900/10 bg-white/80 p-5"
      data-zone={zone}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {evidenceBadge && (
          <span className="shrink-0 rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-[0.12em] text-brand-800">
            {evidenceBadge}
          </span>
        )}
      </div>
      {summary && (
        <p className="mt-2 text-sm leading-6 text-muted">{summary}</p>
      )}
      <dl className="mt-4 divide-y divide-brand-900/10">
        {items.map(({ label, value }) => (
          <div key={label} className="flex gap-4 py-2 text-sm">
            <dt className="w-32 shrink-0 font-medium text-ink">{label}</dt>
            <dd className="text-muted">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

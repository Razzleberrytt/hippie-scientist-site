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
    <section
      className="border-y border-[color:var(--hs-hairline)] py-5 sm:py-6"
      data-zone={zone}
      aria-label={title}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="section-label">Research snapshot</p>
          <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">
            {title}
          </h2>
        </div>
        {evidenceBadge ? (
          <span className="identity-kicker shrink-0">{evidenceBadge}</span>
        ) : null}
      </div>

      {summary ? (
        <p className="mt-4 max-w-3xl text-[0.98rem] leading-7 text-[color:var(--hs-body)]">{summary}</p>
      ) : null}

      <dl className="mt-5 divide-y divide-[color:var(--hs-hairline)]">
        {items.map(({ label, value }) => (
          <div key={label} className="grid gap-1 py-3 text-sm sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:gap-5">
            <dt className="font-semibold text-[color:var(--hs-ink)]">{label}</dt>
            <dd className="leading-6 text-[color:var(--hs-body)]">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

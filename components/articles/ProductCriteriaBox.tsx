import Link from 'next/link'

type ProductCriteriaBoxProps = {
  title: string
  criteria: string[]
  avoidList?: string[]
  ctaLabel?: string
  ctaHref?: string
}

export default function ProductCriteriaBox({
  title,
  criteria,
  avoidList,
  ctaLabel,
  ctaHref,
}: ProductCriteriaBoxProps) {
  return (
    <div className="my-8 rounded-xl border border-brand-900/10 bg-brand-50/40 p-5 shadow-sm">
      <p className="text-[0.68rem] font-bold uppercase tracking-wider text-brand-800">What to Look For</p>
      <h3 className="mt-1 text-base font-bold text-ink">{title}</h3>
      <ul className="mt-3 space-y-2">
        {criteria.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
            <span className="mt-0.5 shrink-0 font-bold text-brand-700" aria-hidden="true">✓</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {avoidList && avoidList.length > 0 && (
        <div className="mt-4 border-t border-brand-900/5 pt-4">
          <p className="text-[0.68rem] font-bold uppercase tracking-wider text-red-700/80">Avoid</p>
          <ul className="mt-2 space-y-2">
            {avoidList.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted">
                <span className="mt-0.5 shrink-0 font-bold text-red-600/70" aria-hidden="true">✗</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {ctaLabel && ctaHref && (
        <div className="mt-4 border-t border-brand-900/5 pt-3">
          <Link
            href={ctaHref}
            className="text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
          >
            {ctaLabel} →
          </Link>
        </div>
      )}
    </div>
  )
}

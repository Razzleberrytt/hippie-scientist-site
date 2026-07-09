import Link from 'next/link'
import { formatComparisonSlug } from '@/lib/comparison-utils'

interface CompareRelatedProps {
  comparisons: string[]
  currentSlug: string
}

export default function CompareRelated({ comparisons, currentSlug }: CompareRelatedProps) {
  const related = comparisons
    .filter((slug) => slug !== currentSlug)
    .slice(0, 6)

  if (related.length === 0) return null

  return (
    <section className="rounded-3xl border border-brand-900/10 bg-white/80 p-5 shadow-sm sm:p-6 space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Related comparisons
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Still deciding? Compare the nearby options.
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted">
            Similar supplements can differ a lot by timing, stimulation, safety, and evidence quality. These next comparisons keep visitors in decision mode instead of sending them back to search.
          </p>
        </div>
        <Link
          href="/guides/compare/"
          className="inline-flex shrink-0 rounded-full border border-brand-900/10 bg-brand-50 px-4 py-2 text-xs font-bold text-brand-800 transition-colors hover:bg-brand-100"
        >
          Open compare hub →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {related.map((slug) => (
          <Link
            key={slug}
            href={`/guides/compare/${slug}`}
            className="group rounded-2xl border border-brand-900/10 bg-paper-50 px-4 py-4 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            <span className="block font-semibold">{formatComparisonSlug(slug)}</span>
            <span className="mt-1 block text-xs leading-5 text-muted group-hover:text-brand-700/80">
              Review tradeoffs →
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

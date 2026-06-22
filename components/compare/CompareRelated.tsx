import Link from 'next/link'

interface CompareRelatedProps {
  comparisons: string[]
  currentSlug: string
}

function formatSlugToTitle(slug: string): string {
  return slug
    .replace(/-vs-/gi, ' vs ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export default function CompareRelated({ comparisons, currentSlug }: CompareRelatedProps) {
  const related = comparisons
    .filter((slug) => slug !== currentSlug)
    .slice(0, 6)

  if (related.length === 0) return null

  return (
    <section className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
          Related comparisons
        </p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          People also compare...
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {related.map((slug) => (
          <Link
            key={slug}
            href={`/compare/${slug}`}
            className="rounded-2xl border border-brand-900/10 bg-paper-50 px-4 py-4 text-sm font-medium text-ink transition-colors hover:bg-brand-50 hover:text-brand-700"
          >
            {formatSlugToTitle(slug)}
          </Link>
        ))}
      </div>
    </section>
  )
}

import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

type Props = { dataset: PublicEvidenceDataset }

function formatPct(numerator: number, denominator: number) {
  if (!denominator) return '0%'
  const value = (numerator / denominator) * 100
  return value >= 10 ? `${Math.round(value)}%` : `${value.toFixed(1)}%`
}

export default function UnassignedEvidenceStatusPanel({ dataset }: Props) {
  const { metrics } = dataset
  const unresolvedCategories = metrics.categories
    .filter(category => category.unassigned > 0)
    .sort((a, b) => b.unassigned - a.unassigned || a.category.localeCompare(b.category))

  if (!metrics.unassignedIngredients) return null

  return (
    <section className="mx-auto mb-10 max-w-6xl px-4 sm:px-6 lg:px-8" aria-labelledby="unassigned-evidence-status-title">
      <div className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Grade accounting</p>
        <h2 id="unassigned-evidence-status-title" className="mt-2 text-2xl font-semibold text-ink">
          Unassigned means no single evidence grade is being claimed
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          {metrics.unassignedIngredients} of {metrics.ingredientCount} indexable ingredients ({formatPct(metrics.unassignedIngredients, metrics.ingredientCount)}) currently remain Unassigned. This includes records where evidence varies by outcome, a single grade is not applicable, or the authored evidence signals cannot be reconciled honestly. These records are kept separate from both stronger grades and Avoid/Insufficient rather than being forced into either bucket.
        </p>

        {unresolvedCategories.length ? (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-brand-900/10 text-xs uppercase tracking-wider text-muted">
                  <th className="py-3 pr-4">Category</th>
                  <th className="py-3 pr-4">Ingredients</th>
                  <th className="py-3 pr-4">Unassigned</th>
                  <th className="py-3">Share unassigned</th>
                </tr>
              </thead>
              <tbody>
                {unresolvedCategories.slice(0, 20).map(category => (
                  <tr key={category.category} className="border-b border-brand-900/10 last:border-0">
                    <td className="py-3 pr-4 font-semibold text-ink">{category.category}</td>
                    <td className="py-3 pr-4 text-muted">{category.totalIngredients}</td>
                    <td className="py-3 pr-4 text-muted">{category.unassigned}</td>
                    <td className="py-3 text-muted">{formatPct(category.unassigned, category.totalIngredients)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  )
}

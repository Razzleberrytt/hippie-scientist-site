import { summarizeCategoryEvidenceMix } from '@/lib/evidence-report-insights'
import type { PublicEvidenceDataset } from '@/lib/public-evidence-dataset'

type Props = { dataset: PublicEvidenceDataset }

function formatPct(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function CategoryEvidenceMixPanel({ dataset }: Props) {
  const categories = summarizeCategoryEvidenceMix(dataset)
  const meaningful = categories.filter(category => category.evidenceRelationships >= 3).slice(0, 12)

  if (!meaningful.length) return null

  return (
    <section className="mx-auto mb-10 max-w-6xl px-4 sm:px-6 lg:px-8" aria-labelledby="category-evidence-mix-title">
      <div className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Human vs preclinical evidence mix</p>
        <h2 id="category-evidence-mix-title" className="mt-2 text-2xl font-semibold text-ink">
          Which categories currently rely most on mechanism, animal, or in-vitro evidence?
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-muted">
          This compares structured study-to-ingredient relationships by evidence class. “Preclinical” here means
          mechanistic, animal, or in-vitro evidence. A high share is a research-maturity signal, not a statement that
          the category is ineffective or unsafe. Categories with fewer than three structured relationships are omitted
          from this ranking to reduce tiny-sample noise.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10 text-xs uppercase tracking-wider text-muted">
                <th className="py-3 pr-4">Category</th>
                <th className="py-3 pr-4">Evidence relationships</th>
                <th className="py-3 pr-4">Preclinical</th>
                <th className="py-3 pr-4">Human</th>
                <th className="py-3">Other / unclear</th>
              </tr>
            </thead>
            <tbody>
              {meaningful.map(category => (
                <tr key={category.category} className="border-b border-brand-900/10 last:border-0">
                  <td className="py-3 pr-4 font-semibold text-ink">{category.category}</td>
                  <td className="py-3 pr-4 text-muted">{category.evidenceRelationships}</td>
                  <td className="py-3 pr-4 text-muted">
                    {category.preclinicalRelationships} · {formatPct(category.preclinicalShare)}
                  </td>
                  <td className="py-3 pr-4 text-muted">
                    {category.humanRelationships} · {formatPct(category.humanShare)}
                  </td>
                  <td className="py-3 text-muted">{category.otherRelationships}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

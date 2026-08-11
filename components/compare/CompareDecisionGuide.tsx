import Link from 'next/link'
import type { CompareItem } from '@/lib/compare'
import { evidenceLabelText } from '@/lib/compare'

interface CompareDecisionGuideProps {
  item1: CompareItem
  item2: CompareItem
  isHarmReduction: boolean
}

function coverageLabel(count: number, noun: string): string {
  if (count > 0) return `${count} ${noun}${count === 1 ? '' : 's'} surfaced in this comparison record`
  return `No structured ${noun}s surfaced here — not evidence that none exist`
}

function ItemDecisionCard({ item }: { item: CompareItem }) {
  const outcomeSignals = item.primaryBenefits.slice(0, 2)
  const interactionCount = item.keyInteractions?.length ?? 0
  const cautionCount = item.contraindications?.length ?? 0

  return (
    <article className="card-premium p-5 space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-ink">{item.name}</h3>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          {evidenceLabelText(item.evidenceLevel)}
        </p>
        <p className="mt-1 text-xs leading-5 text-muted">
          Overall profile evidence signal; evidence can differ by the exact outcome being studied.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">1. Outcome relevance</p>
        {outcomeSignals.length > 0 ? (
          <ul className="space-y-1 text-sm leading-6 text-muted">
            {outcomeSignals.map((signal) => <li key={signal}>• {signal}</li>)}
          </ul>
        ) : (
          <p className="text-sm leading-6 text-muted">No structured primary-outcome field is reported in this comparison record.</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">2. Practical context</p>
        <dl className="space-y-1 text-sm leading-6 text-muted">
          <div>
            <dt className="inline font-semibold text-ink">Timing: </dt>
            <dd className="inline">{item.bestTiming || 'Not reported in the comparison source data'}</dd>
          </div>
          <div>
            <dt className="inline font-semibold text-ink">Onset: </dt>
            <dd className="inline">{item.onsetTime || 'Not reported in the comparison source data'}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">3. Safety-data coverage</p>
        <ul className="space-y-1 text-sm leading-6 text-muted">
          <li>• {coverageLabel(interactionCount, 'interaction')}</li>
          <li>• {coverageLabel(cautionCount, 'contraindication/caution')}</li>
        </ul>
      </div>

      <Link href={item.pageUrl} className="button-secondary inline-flex text-xs px-3 py-2">
        Review full {item.name} profile →
      </Link>
    </article>
  )
}

export default function CompareDecisionGuide({ item1, item2, isHarmReduction }: CompareDecisionGuideProps) {
  return (
    <section className="card-premium max-w-4xl space-y-6 p-5 sm:p-7">
      <div className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision guide</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Compare the evidence before choosing</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This guide does not pick a supplement for you. Use it to compare the exact outcome evidence, source-reported timing, and safety-data coverage for each option before deciding what deserves a closer look.
        </p>
      </div>

      {isHarmReduction ? (
        <div className="rounded-xl border border-amber-600/20 bg-amber-50/80 px-4 py-3 text-xs leading-relaxed text-amber-900">
          <strong>Elevated-risk context:</strong> one or both items carry a harm-reduction flag. Do not use this comparison as a recommendation to start, combine, or escalate use.
        </div>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <ItemDecisionCard item={item1} />
        <ItemDecisionCard item={item2} />
      </div>

      <div className="rounded-2xl border border-brand-900/10 bg-brand-50/70 p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div>
          <p className="text-sm font-semibold text-ink">Considering both together?</p>
          <p className="mt-1 text-xs leading-5 text-muted">
            Different mechanisms do not prove compatibility, and blank interaction fields do not prove safety. Check the specific combination before stacking.
          </p>
        </div>
        <Link href="/safety-checker" className="button-primary mt-3 inline-flex shrink-0 px-4 py-2 text-xs sm:mt-0">
          Open Safety Checker →
        </Link>
      </div>
    </section>
  )
}

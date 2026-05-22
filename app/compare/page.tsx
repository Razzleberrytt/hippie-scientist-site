import type { Metadata } from 'next'
import { CompareTableClient } from '@/components/compare-table-client'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list } from '@/lib/display-utils'

export const metadata: Metadata = {
  title: 'Compare Supplements and Compounds',
  description:
    'Compare herbs, supplements, and compounds by effects, evidence tiers, safety considerations, and decision-support factors.',
}

const guidanceCards = [
  {
    title: 'Scan evidence first',
    body: 'Start with evidence strength and mechanism confidence, then decide whether weaker evidence is still acceptable for your goal.',
  },
  {
    title: 'Map safety and profile fit',
    body: 'Check caution flags, stimulation or sedation profile, and tolerance risk before focusing on convenience or trend.',
  },
  {
    title: 'Use tradeoffs, not hype',
    body: 'Compare onset, duration, and cost/value side by side. Fast effects or lower cost can come with tradeoffs in certainty or tolerability.',
  },
]

export default async function ComparePage() {
  const compounds = await getCompounds()
  const safeCompounds = compounds
    .filter((compound: any) => compound.slug && isClean(compound.name || compound.displayName || compound.slug))
    .map((compound: any) => ({
      slug: compound.slug,
      name: formatDisplayLabel(compound.displayName || compound.name || compound.slug),
      summary: cleanSummary(compound.summary || compound.description, 'compound'),
      effects: list(compound.primary_effects || compound.effects).slice(0, 4),
      evidence_tier: formatDisplayLabel(compound.evidence_tier || compound.evidenceTier || compound.evidence_grade),
      time_to_effect: formatDisplayLabel(compound.time_to_effect),
      role: formatDisplayLabel(compound.role),
      safety_flags: list(compound.safety_flags || compound.safetyNotes || compound.contraindications).slice(0, 3),
      complexity: formatDisplayLabel(compound.complexity),
      cost: formatDisplayLabel(compound.cost),
    }))

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Evidence-aware comparison</p>
        <div className="mt-3 max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            Compare herbs, supplements, and compounds
          </h1>
          <p className="text-base leading-7 text-muted sm:text-lg">
            Use this table to compare who each option may fit, where caution is needed, and which tradeoffs matter most. It is educational decision support, not a medical recommendation.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {guidanceCards.map((card) => (
          <article key={card.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-ink">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Use this cautiously.</p>
        <p className="mt-1">
          This page is educational and does not replace medical advice. Evidence quality differs by compound, product quality varies, and individual response can be unpredictable. Review medications, health conditions, pregnancy or nursing status, and clinician guidance before using supplements.
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Comparison table</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Scan for fit, then read deeper</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
            The table is meant to narrow options, not finalize a decision. Follow up by reading the individual compound pages, safety notes, and cited research context where available.
          </p>
        </div>
        <CompareTableClient compounds={safeCompounds} />
      </section>
    </main>
  )
}

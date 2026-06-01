import type { Metadata } from 'next'
import Link from 'next/link'
import { CompareTableClient } from '@/components/compare-table-client'
import { getCompounds } from '@/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list } from '@/lib/display-utils'

export const metadata: Metadata = {
  title: 'Compare Herbs & Supplements Side by Side',
  description:
    'Compare herbs and supplements side by side by evidence strength, mechanism, stimulation profile, safety, and dosing. Free research tool.',
}


const popularComparisonPairs = [
  { label: 'Rhodiola vs Ashwagandha', href: '/compare/rhodiola-vs-ashwagandha' },
  { label: 'Kava vs Alcohol', href: '/compare/kava-vs-alcohol' },
  { label: 'Kanna vs SSRIs', href: '/compare/kanna-vs-ssris' },
  { label: 'L-Theanine vs Magnesium', href: '/compare/l-theanine-vs-magnesium' },
  { label: 'Sleep herbs vs Melatonin', href: '/compare/sleep-herbs-vs-melatonin' },
  { label: 'Dynamic comparison matrix', href: '/compare/dynamic' },
]

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
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-10">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Evidence-informed comparison</p>
        <div className="mt-3 max-w-3xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            Compare herbs, supplements, and compounds
          </h1>
          <p className="text-base leading-7 text-muted sm:text-lg">
            Use this table to compare who each option may fit, where caution is needed, and which tradeoffs matter most. It is educational decision support, not a medical recommendation.
          </p>
          <div className="pt-2">
            <Link 
              href="/compare/dynamic" 
              className="inline-flex items-center gap-2 rounded-full bg-brand-850 hover:bg-brand-900 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:-translate-y-0.5 focus:outline-none"
            >
              Launch Dynamic Comparison Matrix
            </Link>
          </div>
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

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Popular comparison pairs</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Start with these focused pages, then use the full table for broader tradeoff scanning.</p>
        <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2">
          {popularComparisonPairs.map(pair => (
            <li key={pair.href}>
              <a href={pair.href} className="hover:text-brand-800 hover:underline">{pair.label}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <p className="font-semibold">Use this cautiously.</p>
        <p className="mt-1">
          This page is educational and does not replace medical advice. Evidence strength reflects research signal quality, not guaranteed outcomes, and individual response varies. Review medications, health conditions, pregnancy or nursing status, and clinician guidance before using supplements.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
        <p className="eyebrow-label">Decision next step</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Use comparisons to choose a safer path</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-muted md:grid-cols-3">
          <Link href="/goals" className="rounded-xl border border-brand-900/10 p-4 hover:bg-stone-50">
            Start from your goal
          </Link>
          <Link href="/safety-checker" className="rounded-xl border border-brand-900/10 p-4 hover:bg-stone-50">
            Check safety context
          </Link>
          <Link href="/education/product-quality" className="rounded-xl border border-brand-900/10 p-4 hover:bg-stone-50">
            Review product quality
          </Link>
        </div>
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
    </div>
  )
}

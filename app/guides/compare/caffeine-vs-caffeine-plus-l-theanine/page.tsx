import type { Metadata } from 'next'
import Link from 'next/link'

import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'
import CitationReadySummary from '@/components/seo/CitationReadySummary'
import Disclaimer from '@/src/components/Disclaimer'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Caffeine vs Caffeine + L-Theanine: Focus & Jitters',
  description:
    'Compare caffeine alone with caffeine plus L-theanine for attention, alertness, tolerability, sleep tradeoffs, and what the human evidence does and does not establish.',
  path: '/guides/compare/caffeine-vs-caffeine-plus-l-theanine/',
})

const REFERENCES = [
  {
    n: 1,
    text: 'Haskell CF, et al. (2008). The effects of L-theanine, caffeine and their combination on cognition and mood. Biological Psychology, 77(2): 113-122.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/18006208/',
  },
  {
    n: 2,
    text: 'Giesbrecht T, et al. (2010). The combination of L-theanine and caffeine improves cognitive performance and increases subjective alertness. Nutritional Neuroscience, 13(6): 283-290.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21040626/',
  },
  {
    n: 3,
    text: 'Nehlig A. (2010). Is caffeine a cognitive enhancer? Journal of Alzheimer’s Disease, 20 Suppl 1: S85-S94.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/20182035/',
  },
]

const rows = [
  {
    label: 'Core question',
    caffeine: 'Does caffeine alone already provide the alertness and task engagement you want?',
    combo: 'Does caffeine help, but the experience feel too tense, jittery, or uneven to be useful?',
  },
  {
    label: 'Human evidence context',
    caffeine: 'Caffeine has a large acute alertness and attention evidence base.',
    combo: 'Small controlled studies have tested caffeine with L-theanine on selected attention, alertness, and mood outcomes.',
  },
  {
    label: 'What the combo does not prove',
    caffeine: 'A useful acute effect does not remove caffeine-related sleep, anxiety, cardiovascular, or tolerance tradeoffs.',
    combo: 'Adding L-theanine is not proven to neutralize every caffeine side effect or make a high caffeine dose appropriate.',
  },
  {
    label: 'Decision boundary',
    caffeine: 'Prefer the simpler option when caffeine works well and is tolerated at the amount and timing you use.',
    combo: 'Consider the combination only when each ingredient has a clear job and the safety context still makes sense.',
  },
]

export default function CaffeineVsCaffeinePlusLTheaninePage() {
  return (
    <main className="container-page space-y-9 py-10">
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/guides/compare/' },
          { label: 'Caffeine vs Caffeine + L-Theanine' },
        ]}
      />

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Evidence-first focus comparison</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Caffeine alone vs caffeine + L-theanine
        </h1>
        <p className="text-lg leading-8 text-muted">
          This is a different question from caffeine versus L-theanine. The decision here is whether adding L-theanine to caffeine offers enough evidence-backed value to justify a more complex stack when caffeine alone already provides alertness.
        </p>
      </header>

      <CitationReadySummary
        answer="Caffeine alone is the simpler choice when it already improves alertness and is well tolerated. Controlled human studies suggest that combining caffeine with L-theanine can change selected attention, alertness, and mood outcomes, but the evidence does not establish that the combination reliably eliminates caffeine jitters or makes excessive caffeine safer."
        bestFor={[
          'Caffeine alone: when a defined amount and timing already work without problematic overstimulation.',
          'Caffeine + L-theanine: when caffeine is useful but tolerability or the quality of attention is the specific problem being evaluated.',
        ]}
        evidenceLevel="The combination has controlled human studies, but the evidence base is smaller and more task-specific than caffeine’s general acute alertness literature."
        safetyNote="Adding L-theanine does not erase caffeine-related sleep disruption, anxiety, palpitations, blood-pressure effects, medication context, or individual sensitivity."
        notClaiming="This page is not claiming the combination treats ADHD, anxiety disorders, chronic fatigue, or sleep deprivation."
        referencesHref="#references"
      />

      <section className="card-premium max-w-5xl p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Caffeine alone vs the combination</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Dimension</th>
                <th className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Caffeine alone</th>
                <th className="py-3 text-xs font-bold uppercase tracking-wider text-ink">Caffeine + L-theanine</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label} className="border-b border-brand-900/5 align-top last:border-0">
                  <td className="py-3 pr-4 font-semibold text-ink">{row.label}</td>
                  <td className="py-3 pr-4 leading-6 text-muted">{row.caffeine}</td>
                  <td className="py-3 leading-6 text-muted">{row.combo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid max-w-5xl gap-4 sm:grid-cols-2">
        <article className="card-premium p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Choose caffeine alone if…</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Caffeine already produces the desired alertness at a tolerable amount and timing. The simpler intervention is easier to evaluate, cheaper to maintain, and less likely to hide the real problem behind extra stack complexity.
          </p>
        </article>
        <article className="card-premium p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Consider the combination if…</p>
          <p className="mt-3 text-sm leading-6 text-muted">
            Caffeine clearly helps attention, but a controlled comparison of caffeine alone versus caffeine with L-theanine is useful because the quality or tolerability of that attention is the specific question—not because the combination is assumed superior.
          </p>
        </article>
      </section>

      <section className="max-w-5xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 dark:bg-amber-950/10">
        <h2 className="text-lg font-semibold text-ink">Neither is a good optimization target if…</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          The actual problem is sleep deprivation, escalating caffeine tolerance, panic or palpitations, uncontrolled blood pressure, medication interaction, or persistent attention impairment that needs evaluation. More stack complexity does not solve those constraints.
        </p>
      </section>

      <div className="flex flex-wrap gap-3 text-sm font-semibold">
        <Link href="/guides/compare/caffeine-vs-l-theanine/" className="text-brand-800 hover:underline">
          Caffeine vs L-Theanine →
        </Link>
        <Link href="/compounds/caffeine/" className="text-brand-800 hover:underline">
          Caffeine profile →
        </Link>
        <Link href="/compounds/l-theanine/" className="text-brand-800 hover:underline">
          L-Theanine profile →
        </Link>
        <Link href="/safety-checker/" className="text-brand-800 hover:underline">
          Safety Checker →
        </Link>
      </div>

      <Disclaimer />
      <References refs={REFERENCES} />
    </main>
  )
}

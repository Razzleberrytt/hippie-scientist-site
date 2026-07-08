import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'GABA vs Serotonin: Calm, Mood, Sleep & Safety',
  description:
    'A premium educational comparison of GABAergic and serotonergic systems, calming pathways, mood regulation, sleep, anxiety, psychoactive effects, and supplement safety decisions.',
  path: '/learn/gaba-vs-serotonin/',
})

const systemCards = [
  {
    title: 'GABAergic systems',
    body: 'GABA is the brain’s major inhibitory signaling system. In practical supplement discussions, GABA-related language usually points toward relaxation, reduced arousal, muscle tension, sleep pressure, and the boundary between calm and sedation.',
    bestFor: 'Sleep-onset support, physical tension, acute overactivation, and calming/sedating herb comparisons.',
    caution: 'Sedatives, alcohol, antihistamines, sleep medications, kava, valerian, passionflower, driving, and next-day impairment.',
    links: [
      { href: '/learn/gaba/', label: 'GABA Pathway' },
      { href: '/learn/calming/', label: 'Calming Psychoactives' },
    ],
  },
  {
    title: 'Serotonergic systems',
    body: 'Serotonin is involved in mood, emotional processing, sleep-wake signaling, gut function, perception, and certain psychedelic or entheogenic mechanisms. Serotonin support is not the same thing as sedation, and serotonergic risk can be very different from GABAergic risk.',
    bestFor: 'Mood-context education, emotional processing, perception-related pathways, and serotonergic compound safety questions.',
    caution: 'SSRIs, SNRIs, MAOIs, triptans, MDMA-like substances, 5-HTP, St. John’s wort, lithium, and serotonin-syndrome risk.',
    links: [
      { href: '/learn/serotonin/', label: 'Serotonin Pathway' },
      { href: '/guides/anxiety/', label: 'Anxiety Guides' },
    ],
  },
]

const concepts = [
  {
    title: 'Calm is not one pathway',
    body: 'A person can feel calmer because arousal drops, emotional reactivity shifts, sleep improves, caffeine feels smoother, or perception changes. GABA and serotonin can both appear in calming discussions, but they represent different mechanisms and different safety concerns.',
  },
  {
    title: 'Sedation and mood support are different decisions',
    body: 'GABA-oriented supplements are often discussed around downshifting and sleep. Serotonin-oriented supplements are more often discussed around mood, anxiety, emotional processing, or perception. Mixing the two categories into one “calming” bucket can hide important risks.',
  },
  {
    title: 'Mechanism does not prove benefit',
    body: 'A supplement can be marketed as GABAergic or serotonergic without strong human evidence for the outcome being claimed. Mechanism is a starting point for questions, not proof that an ingredient will work or be safe for a specific person.',
  },
]

const decisionQuestions = [
  'Is the target sleep, acute calming, chronic anxiety support, mood, emotional processing, perception, or focus under stress?',
  'Is the ingredient mainly sedating, calming without sedation, serotonergic, adaptogenic, or only loosely connected by mechanism?',
  'Could medications or substances create additive sedation or serotonergic overload?',
  'Would the safer move be a narrower single-ingredient trial, better sleep/caffeine timing, or professional review instead of stacking multiple calming agents?',
]

const GABA_VS_SEROTONIN_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function GabaVsSerotoninPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="GABA vs Serotonin"
        description="Educational comparison of GABAergic and serotonergic systems, calming pathways, mood regulation, sleep, anxiety, psychoactive effects, and supplement safety decisions."
        url="https://thehippiescientist.net/learn/gaba-vs-serotonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'GABA vs Serotonin' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Mechanism comparison</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          GABA vs Serotonin: Two Different Roads to Calm, Mood, Sleep, and Psychoactive Effects
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          GABAergic and serotonergic systems both show up in conversations about anxiety, sleep, mood, and psychoactive herbs, but they are not interchangeable. GABA is usually discussed through inhibition, relaxation, and sedation risk. Serotonin is more tied to mood, emotional processing, perception, gut signaling, and serotonergic medication interactions. This page helps separate the two before building a supplement stack.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="GABA and serotonin comparison concepts">
        {concepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2" aria-label="GABAergic and serotonergic systems">
        {systemCards.map((system) => (
          <article key={system.title} className="card-premium p-6 space-y-4">
            <h2 className="text-2xl font-semibold text-ink">{system.title}</h2>
            <p className="text-sm leading-7 text-muted">{system.body}</p>
            <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Best-fit questions</p>
              <p className="mt-2 text-sm leading-6 text-muted">{system.bestFor}</p>
            </div>
            <div className="rounded-xl border border-amber-900/15 bg-amber-50/70 p-3 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
              <p className="text-xs font-bold uppercase tracking-[0.14em]">Safety lens</p>
              <p className="mt-2 text-sm leading-6">{system.caution}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {system.links.map((link) => (
                <Link key={link.href} href={link.href} className="chip-readable">
                  {link.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="gaba-serotonin-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="gaba-serotonin-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The best next step depends on the problem being solved. Sleep-onset tension, panic-like arousal, low mood, intrusive worry, caffeine jitters, and altered perception are different questions. A GABA-heavy approach may be wrong for a serotonin-related medication concern, and a serotonergic ingredient may be wrong when the real issue is sleep debt or overstimulation.
          </p>
          <ol className="mt-5 space-y-3">
            {decisionQuestions.map((question, index) => (
              <li key={question} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{question}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Safety-first lens</p>
          <h2 className="mt-2 text-xl font-bold">The risk profile changes by pathway</h2>
          <p className="mt-3 text-sm leading-6">
            GABA-oriented stacks raise concern around sedation, impairment, alcohol, sleep medications, and next-day function. Serotonin-oriented stacks raise concern around antidepressants, MAOIs, 5-HTP, St. John’s wort, triptans, lithium, MDMA-like substances, and serotonin-syndrome risk. Do not treat all “calming” ingredients as interchangeable.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check stack safety
            </Link>
            <Link href="/guides/anxiety/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Anxiety guides
            </Link>
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Where to go next</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          If your question is sleep or physical tension, start with GABA and calming resources. If your question is mood, emotional processing, or serotonergic medications, start with serotonin and safety context. If your question is broad anxiety support, use the anxiety guide cluster and check interactions before stacking multiple pathway-active ingredients.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Sleep guides
          </Link>
          <Link href="/learn/calming/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Calming psychoactives
          </Link>
          <Link href="/learn/serotonin/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Serotonin pathway
          </Link>
        </div>
      </section>

      <References refs={GABA_VS_SEROTONIN_REFS} />
    </div>
  )
}

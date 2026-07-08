import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Cholinergic System: Acetylcholine, Memory, Focus & Dreaming',
  description:
    'A premium educational guide to the cholinergic system, acetylcholine signaling, memory, focus, REM sleep, dream vividness, and nootropic safety decisions.',
  path: '/learn/cholinergic-system/',
})

const systems = [
  {
    href: '/learn/dream-herbs/',
    title: 'Dream Herbs',
    body: 'Herbs and compounds discussed for dream vividness, REM intensity, and oneirogenic traditions, with evidence quality and safety uncertainty kept visible.',
    lens: 'Use this when the question is dream-state exploration rather than daytime focus or memory support.',
  },
  {
    href: '/herbs/mugwort/',
    title: 'Mugwort',
    body: 'A traditional dream herb often discussed in relation to vivid dreams, ritual use, and aromatic preparations rather than strong modern clinical evidence.',
    lens: 'Useful example of separating traditional oneirogenic use from proven cognitive enhancement.',
  },
  {
    href: '/learn/why-sleep-changes-emotional-regulation/',
    title: 'Sleep and Emotional Regulation',
    body: 'A learning page connecting sleep architecture, emotional processing, arousal, and next-day regulation.',
    lens: 'Use this to understand why REM and sleep quality matter before chasing stronger dream effects.',
  },
  {
    href: '/guides/focus/',
    title: 'Focus Guides',
    body: 'Practical focus and nootropic guides for readers comparing attention support, mental energy, and stimulant-free cognitive strategies.',
    lens: 'Use this when the decision is daytime performance rather than dream-state effects.',
  },
]

const coreConcepts = [
  {
    title: 'Acetylcholine is context-dependent',
    body: 'Acetylcholine participates in attention, learning, memory encoding, autonomic signaling, neuromuscular function, and REM sleep. That range is exactly why cholinergic claims need context: a pathway connection does not automatically mean better focus, better memory, or safer sleep.',
  },
  {
    title: 'Memory support is not just “more choline”',
    body: 'Choline donors, acetylcholinesterase inhibitors, and cholinergic herbs can affect different parts of the system. The useful question is whether a compound has human evidence for the outcome, a realistic dose, tolerable side effects, and a reason to fit the person using it.',
  },
  {
    title: 'REM and dreams are not the same as recovery',
    body: 'Some cholinergic or dream-oriented ingredients may intensify dream recall or REM-like experiences. That does not guarantee better sleep quality, emotional regulation, or next-day performance. Vivid dreams can be interesting and still be disruptive.',
  },
]

const decisionQuestions = [
  'Is the goal daytime focus, memory support, dream vividness, lucid-dream experimentation, or sleep quality?',
  'Does the ingredient act as a choline source, acetylcholinesterase inhibitor, receptor modulator, or indirect pathway support?',
  'Is there human evidence for the exact outcome, or only a plausible mechanism and anecdotal use?',
  'Could the ingredient worsen headaches, nausea, insomnia, vivid nightmares, muscle tension, mood instability, or medication interactions?',
]

const CHOLINERGIC_SYSTEM_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function CholinergicSystemPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Cholinergic System"
        description="Educational exploration of cholinergic signaling, acetylcholine, cognition pathways, memory mechanisms, REM architecture, and oneirogenic neuropharmacology."
        url="https://thehippiescientist.net/learn/cholinergic-system"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Cholinergic System' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Pathway supernode</p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Cholinergic System: Acetylcholine, Memory, Focus, REM Sleep, and Dream-State Claims
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          The cholinergic system is often mentioned in nootropic, memory, focus, and dream-herb discussions, but it is easy to oversimplify. Acetylcholine is involved in attention and learning, yet it also touches sleep architecture, autonomic signaling, muscle function, and side-effect risk. This page explains the pathway without turning “more cholinergic” into an automatic recommendation.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Core cholinergic concepts">
        {coreConcepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="cholinergic-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="cholinergic-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Cholinergic supplements and dream herbs often get grouped together because they touch acetylcholine, memory, REM sleep, or vivid-dream reports. A better framework asks which outcome is actually being targeted and whether the evidence, dose, and safety profile support that use. Focus support, memory support, and dream experimentation are different decisions.
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
          <h2 className="mt-2 text-xl font-bold">Cholinergic effects can become uncomfortable or risky</h2>
          <p className="mt-3 text-sm leading-6">
            Cholinergic-leaning ingredients can cause headaches, nausea, sweating, vivid dreams, insomnia, muscle tension, mood changes, or medication conflicts in sensitive people. Extra caution is warranted with neurological conditions, psychiatric medications, sleep disruption, anticholinergic drugs, cholinesterase inhibitors, and complex nootropic stacks.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check a stack
            </Link>
            <Link href="/guides/focus/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Focus guides
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="related-cholinergic-systems-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related systems</p>
          <h2 id="related-cholinergic-systems-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Where the cholinergic system connects next
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These related pages help separate dream-state questions from daytime focus and sleep-quality questions. Use them to compare mechanism, evidence quality, and practical safety instead of assuming every acetylcholine-related ingredient belongs in the same stack.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {systems.map((system) => (
            <Link
              key={system.href}
              href={system.href}
              className="card-premium group flex h-full flex-col p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related Educational System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h3>
                <p className="text-sm leading-6 text-muted">{system.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{system.lens}</p>
                </div>
                <span className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                  Read next -&gt;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Where to go next</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          If your goal is practical cognition, start with the focus guides and compound profiles. If your goal is dream vividness, start with dream herbs and sleep architecture. If your goal is safety, use the interaction checker before combining choline donors, dream herbs, stimulants, sedatives, or medications.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/compounds/alpha-gpc/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Alpha-GPC profile
          </Link>
          <Link href="/compounds/citicoline/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Citicoline profile
          </Link>
          <Link href="/learn/dream-herbs/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Dream herbs
          </Link>
        </div>
      </section>

      <References refs={CHOLINERGIC_SYSTEM_REFS} />
    </div>
  )
}

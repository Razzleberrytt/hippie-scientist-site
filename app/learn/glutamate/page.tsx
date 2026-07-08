import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Glutamate Pathway: Excitation, Learning, NMDA & Safety',
  description:
    'A premium educational guide to glutamatergic signaling, excitatory balance, learning, neuroplasticity, NMDA-related dissociative mechanisms, and safety-first interpretation.',
  path: '/learn/glutamate/',
})

const systems = [
  {
    href: '/learn/dissociative-mechanisms/',
    title: 'Dissociative Mechanisms',
    body: 'A related explainer for NMDA-linked altered states, dissociation, perception changes, and why mechanism does not equal safety.',
    lens: 'Best next step when the question is altered-state pharmacology rather than ordinary cognition.',
  },
  {
    href: '/learn/what-is-neuropharmacology/',
    title: 'Neuropharmacology',
    body: 'A foundation page for understanding receptors, signaling systems, evidence limits, and why pathways should not be oversold.',
    lens: 'Best next step when the reader needs the basics before comparing pathway-active substances.',
  },
  {
    href: '/learn/gaba/',
    title: 'GABA Pathway',
    body: 'The inhibitory counterpart often discussed beside glutamate when readers are trying to understand excitation, calm, sleep, and balance.',
    lens: 'Best next step when the question is excitatory-inhibitory balance rather than glutamate alone.',
  },
]

const concepts = [
  {
    title: 'Glutamate is not simply stimulation',
    body: 'Glutamate is the major excitatory signaling system in the brain, but it is not just a “more energy” pathway. It participates in learning, memory, plasticity, perception, and network timing. That makes glutamate important, but also easy to oversimplify in supplement and psychoactive marketing.',
  },
  {
    title: 'Excitation needs balance',
    body: 'Healthy signaling depends on regulation, not maximum activation. Too little excitatory drive can impair cognition and responsiveness; too much can contribute to agitation, poor sleep, sensory overload, or unsafe assumptions about “neuroplasticity boosting.”',
  },
  {
    title: 'NMDA is a decision point, not a magic word',
    body: 'NMDA receptors show up in learning, plasticity, dissociative mechanisms, and some clinical research. A molecule touching NMDA-related pathways does not automatically mean it improves cognition, treats mood, or produces safe altered states.',
  },
]

const decisionQuestions = [
  'Is the question about learning, focus, neuroplasticity, excitability, dissociation, sleep disruption, or psychoactive mechanism learning?',
  'Is the claim based on human outcome evidence, receptor theory, animal data, or anecdotal altered-state reports?',
  'Could the context include seizures, bipolar disorder, psychosis history, severe anxiety, insomnia, medication use, or substance combinations?',
  'Would a safer next step be sleep, stress, caffeine, stimulant, or medication review before assuming glutamate is the limiting pathway?',
]

const GLUTAMATE_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function GlutamatePathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Glutamate Pathway"
        description="Educational exploration of glutamatergic signaling, excitatory neurochemistry, NMDA-related mechanisms, learning, neuroplasticity, and safety-first interpretation."
        url="https://thehippiescientist.net/learn/glutamate"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Glutamate' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Pathway supernode</p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Glutamate Pathway: Excitatory Signaling, Learning, NMDA, and the Safety Boundary
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Glutamate is the brain&apos;s major excitatory signaling system, but that does not make it a simple “stimulation” pathway. It helps coordinate learning, memory, sensory processing, network timing, and neuroplasticity. It also sits near some of the most misunderstood psychoactive claims around NMDA receptors, dissociation, and altered-state pharmacology.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Core glutamate concepts">
        {concepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="glutamate-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="glutamate-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The useful question is not “how do I increase glutamate?” A better framework asks what outcome is being discussed, what level of evidence supports it, and whether the safety context makes glutamate-active experimentation inappropriate. Learning, excitability, dissociation, and neuroplasticity are related topics, but they are not the same decision.
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
          <h2 className="mt-2 text-xl font-bold">Excitatory pathways deserve conservative interpretation</h2>
          <p className="mt-3 text-sm leading-6">
            Use extra caution around seizure history, bipolar disorder, psychosis history, severe anxiety, stimulant use, sleep deprivation, dissociative substances, and complex psychoactive stacks. Glutamate-related language can sound technical while still being too vague to guide self-experimentation safely.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check safety context
            </Link>
            <Link href="/learn/harm-reduction/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Harm reduction
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="related-glutamate-systems-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related systems</p>
          <h2 id="related-glutamate-systems-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Where glutamate connects next
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These related pages help readers separate excitatory signaling from inhibitory balance, dissociative mechanisms, and basic neuropharmacology. That prevents pathway language from turning into overconfident product or substance claims.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {systems.map((system) => (
            <Link key={system.href} href={system.href} className="card-premium group flex h-full flex-col p-6 transition motion-safe:hover:-translate-y-0.5">
              <div className="space-y-3">
                <p className="eyebrow-label">Related Educational System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{system.title}</h3>
                <p className="text-sm leading-6 text-muted">{system.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{system.lens}</p>
                </div>
                <span className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">Read next -&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <References refs={GLUTAMATE_REFS} />
    </div>
  )
}

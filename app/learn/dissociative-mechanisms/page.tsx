import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Dissociative Mechanisms: NMDA, Perception & Safety',
  description:
    'A premium educational guide to dissociative mechanisms, NMDA-related neuropharmacology, altered perception, glutamatergic signaling, and harm-reduction safety framing.',
  path: '/learn/dissociative-mechanisms/',
})

const systems = [
  {
    href: '/learn/glutamate/',
    title: 'Glutamate Pathway',
    body: 'The excitatory signaling foundation behind many NMDA-related discussions, including learning, neuroplasticity, and altered-state claims.',
    lens: 'Start here when the mechanism language feels too abstract or receptor-heavy.',
  },
  {
    href: '/learn/what-is-neuropharmacology/',
    title: 'Neuropharmacology',
    body: 'A plain-language foundation for receptors, signaling systems, dose, evidence strength, and why mechanism alone does not prove outcome.',
    lens: 'Start here when the reader needs the basics before interpreting psychoactive mechanism claims.',
  },
  {
    href: '/learn/harm-reduction/',
    title: 'Harm Reduction',
    body: 'A safety-first hub for interaction awareness, conservative interpretation, red flags, and avoiding risky stacking behavior.',
    lens: 'Start here when the reader is comparing substances or thinking beyond education.',
  },
]

const concepts = [
  {
    title: 'Dissociation is not one effect',
    body: 'Dissociation can involve detachment from the body, altered sensory integration, distorted time, emotional distance, memory disruption, or changes in self-processing. Those effects can appear in clinical, trauma, anesthetic, or psychoactive contexts, so the word should not be treated as one simple category.',
  },
  {
    title: 'NMDA language needs humility',
    body: 'NMDA receptor antagonism is often discussed in relation to dissociative substances and some clinical research, but receptor language does not make a substance safe, therapeutic, or predictable. Outcome depends on dose, setting, person, substance, and risk context.',
  },
  {
    title: 'Altered states can hide impairment',
    body: 'A dissociative experience may feel detached, emotionally distant, or insightful while still impairing coordination, memory, judgment, breathing safety, or reality testing. Subjective meaning and objective risk need to be separated.',
  },
]

const decisionQuestions = [
  'Is the page being used for mechanism education, clinical research context, personal experience interpretation, or substance comparison?',
  'Is the claim about NMDA, glutamate, perception, trauma, mood, anesthesia, or spiritual meaning — and does evidence actually support that claim?',
  'Could the context involve alcohol, sedatives, opioids, stimulants, cannabis, sleep deprivation, psychosis history, mania risk, trauma, or unsafe settings?',
  'Would harm-reduction education, clinician review, or avoiding combinations be more appropriate than focusing on mechanism curiosity?',
]

const DISSOCIATIVE_MECHANISMS_REFS = [
  { n: 1, text: 'Vollenweider FX, Kometer M. (2010). The neurobiology of psychedelic drugs. Nat Rev Neurosci, 11(9): 642-651.', url: 'https://pubmed.ncbi.nlm.nih.gov/20717121/' },
]

export default function DissociativeMechanismsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dissociative Mechanisms"
        description="Educational exploration of dissociative neuropharmacology, NMDA-related mechanisms, glutamatergic signaling, altered perception, and harm-reduction safety framing."
        url="https://thehippiescientist.net/learn/dissociative-mechanisms"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Dissociative Mechanisms' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Psychoactive ecosystem</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Dissociative Mechanisms: NMDA, Perception, Detachment, and the Safety Line
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Dissociative mechanisms are often discussed through glutamate, NMDA receptors, altered perception, and detachment from ordinary self-experience. This page explains the concept without romanticizing it. Mechanism knowledge can help readers understand a category, but it should also make the risks clearer: impairment, memory disruption, unsafe combinations, and vulnerable mental-health contexts matter.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Dissociative mechanism concepts">
        {concepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="dissociative-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="dissociative-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The useful question is not only “what receptor is involved?” A better framework asks what kind of dissociation is being discussed, whether the evidence is clinical or anecdotal, and whether the safety context makes the topic educational only. Dissociative mechanisms should never be treated like harmless curiosity when combinations, vulnerability, or impairment are involved.
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
          <h2 className="mt-2 text-xl font-bold">Dissociation can impair judgment before it feels dangerous</h2>
          <p className="mt-3 text-sm leading-6">
            Avoid combining dissociative substances with alcohol, sedatives, opioids, or other intoxicants. Extra caution is warranted with psychosis history, bipolar disorder, severe anxiety, trauma vulnerability, cardiovascular risk, unsafe environments, driving, childcare, and solitary experimentation.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/learn/harm-reduction/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Harm reduction hub
            </Link>
            <Link href="/safety-checker/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Check interactions
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="related-dissociative-systems-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related systems</p>
          <h2 id="related-dissociative-systems-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            What to read before interpreting dissociative claims
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These related pages keep the topic grounded. Glutamate explains the pathway context, neuropharmacology explains how receptor claims should be interpreted, and harm reduction keeps safety visible before curiosity turns into risky behavior.
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

      <References refs={DISSOCIATIVE_MECHANISMS_REFS} />
    </div>
  )
}

import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Psychoactive Harm Reduction: Interactions, Set, Setting & Safety',
  description:
    'A premium psychoactive harm-reduction hub focused on interaction awareness, conservative interpretation, neurochemical safety, red flags, and safer educational decision-making.',
  path: '/learn/harm-reduction/',
})

const topics = [
  {
    href: '/learn/interactions/',
    title: 'Interaction Awareness',
    body: 'Learn why medication, supplement, alcohol, cannabis, sedative, stimulant, and serotonergic overlap can matter more than any single ingredient profile.',
    lens: 'Start here when the reader is combining anything or already uses prescriptions.',
  },
  {
    href: '/learn/serotonergic-stacking-risks/',
    title: 'Serotonergic Risks',
    body: 'A focused safety page for serotonergic overlap, antidepressants, 5-HTP, St. John’s wort, triptans, MAOIs, and serotonin-related red flags.',
    lens: 'Start here when mood-support or serotonin-active products are involved.',
  },
  {
    href: '/learn/gaba-vs-serotonin/',
    title: 'GABA vs Serotonin Safety',
    body: 'Compare sedating/inhibitory risk with serotonergic interaction risk so “calming” ingredients do not get treated as interchangeable.',
    lens: 'Start here when the reader is comparing sleep, calm, anxiety, and mood-support pathways.',
  },
  {
    href: '/learn/what-are-psychoactive-herbs/',
    title: 'Psychoactive Education',
    body: 'A foundation page for understanding psychoactive herbs without exaggerating tradition, mechanism, or anecdote into proof of safety.',
    lens: 'Start here when the reader needs a plain-language orientation before deeper pathway pages.',
  },
]

const principles = [
  {
    title: 'Reduce risk before chasing effects',
    body: 'The safest question is rarely “what produces the strongest effect?” A better first pass checks medications, health context, dose uncertainty, substance combinations, sleep loss, mental state, and environment.',
  },
  {
    title: 'Mechanism is not permission',
    body: 'Knowing a pathway does not make experimentation safe. GABA, serotonin, dopamine, glutamate, NMDA, and cholinergic language can help explain risk, but it should not be used as a green light.',
  },
  {
    title: 'Conservative choices are still useful',
    body: 'Harm reduction is not hype reduction only. It also means choosing not to combine, choosing not to redose, choosing a safer setting, choosing to ask a clinician, or choosing to skip an experiment entirely.',
  },
]

const framework = [
  'Check medications, diagnoses, pregnancy status, liver or kidney disease, seizure history, bipolar or psychosis history, blood pressure concerns, and sleep deprivation first.',
  'Avoid combining sedatives, alcohol, opioids, benzodiazepines, antihistamines, sleep medications, stimulants, serotonergic agents, dissociatives, or unknown blends.',
  'Treat proprietary blends, unclear plant identity, extreme extracts, missing dose information, and vague “legal high” positioning as product-quality red flags.',
  'Stop escalation when confusion, chest pain, severe agitation, overheating, fainting, severe vomiting, breathing problems, hallucinations, or loss of reality testing appear.',
]

const redFlags = [
  {
    title: 'Interaction red flags',
    body: 'Antidepressants, MAOIs, triptans, lithium, stimulants, sedatives, opioids, alcohol, anticoagulants, blood-pressure drugs, and sleep medications can completely change the risk profile.',
  },
  {
    title: 'Context red flags',
    body: 'Being alone, caring for children, driving, working, sleep deprivation, dehydration, extreme heat, panic, trauma triggers, or unsafe surroundings can turn a bad reaction into a dangerous one.',
  },
  {
    title: 'Product red flags',
    body: 'Unknown extract strength, undisclosed ingredients, contamination risk, missing third-party testing, mislabeled plant material, and aggressive effect claims should be treated as reasons to pause.',
  },
]

const HARM_REDUCTION_REFS = [
  { n: 1, text: 'Marlatt GA, Witkiewitz K. (2010). Harm reduction: evidence and challenges. Addict Sci Clin Pract, 5(1): 4-8.', url: 'https://pubmed.ncbi.nlm.nih.gov/20228740/' },
]

export default function HarmReductionPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Psychoactive Harm Reduction"
        description="Educational psychoactive harm reduction hub focused on interaction awareness, neurochemical safety, conservative interpretation, red flags, and safer decision-making."
        url="https://thehippiescientist.net/learn/harm-reduction"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Harm Reduction' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Educational safety hub</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Psychoactive Harm Reduction: Interactions, Set, Setting, Product Quality, and Red Flags
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Harm reduction is the safety layer that belongs before any psychoactive herb, compound, or pathway-active supplement decision. It is not about encouraging experimentation. It is about reducing avoidable risk by checking interactions, health context, dose uncertainty, product quality, mental state, and environment before curiosity turns into preventable harm.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Harm reduction principles">
        {principles.map((principle) => (
          <article key={principle.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{principle.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{principle.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="harm-reduction-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="harm-reduction-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            A useful harm-reduction page should give readers a sequence, not vague warnings. The safest workflow starts with personal risk factors, then checks combinations, then checks product quality, then identifies stop signs. If any major red flag appears, the safer move is to pause, simplify, or seek professional guidance.
          </p>
          <ol className="mt-5 space-y-3">
            {framework.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-red-900/15 bg-red-50/70 p-5 text-red-950 dark:border-red-200/20 dark:bg-red-950/20 dark:text-red-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Emergency line</p>
          <h2 className="mt-2 text-xl font-bold">Some symptoms are not “wait and see” situations</h2>
          <p className="mt-3 text-sm leading-6">
            Severe confusion, chest pain, trouble breathing, fainting, seizures, severe overheating, extreme agitation, suicidal thinking, dangerous behavior, or loss of reality testing should be treated as urgent. Educational content cannot replace emergency care or poison-control guidance.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-red-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-950 dark:bg-red-100 dark:text-red-950">
              Use safety checker
            </Link>
            <Link href="/learn/interactions/" className="rounded-full border border-red-900/20 px-4 py-2 text-sm font-semibold text-red-950 transition hover:bg-white/60 dark:border-red-100/30 dark:text-red-50">
              Interaction awareness
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="harm-red-flags-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Red flags</p>
          <h2 id="harm-red-flags-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            The three checks that prevent the most avoidable mistakes
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Most unsafe decisions are not caused by one isolated ingredient. They come from interaction overlap, risky context, or poor product transparency. These checks keep the page practical without turning it into fear-based advice.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {redFlags.map((flag) => (
            <article key={flag.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-bold text-ink">{flag.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{flag.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="harm-reduction-topics-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Safety systems</p>
          <h2 id="harm-reduction-topics-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Continue into the safety cluster
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These pages keep harm reduction connected to the rest of the site: interactions, serotonergic stacking, GABA-versus-serotonin safety, and basic psychoactive education.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {topics.map((topic) => (
            <Link key={topic.href} href={topic.href} className="card-premium group flex h-full flex-col p-6 transition motion-safe:hover:-translate-y-0.5">
              <div className="space-y-3">
                <p className="eyebrow-label">Safety System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{topic.title}</h3>
                <p className="text-sm leading-6 text-muted">{topic.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{topic.lens}</p>
                </div>
                <span className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">Read safety page -&gt;</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <References refs={HARM_REDUCTION_REFS} />
    </div>
  )
}

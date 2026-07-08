import type { Metadata } from 'next'
import { buildPageMetadata } from '../../../src/lib/seo'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Calming Psychoactives: GABA, Stress Regulation & Safety',
  description:
    'A premium educational guide to calming psychoactives, GABAergic signaling, stress regulation, sedation risk, and safety-first herb and compound decisions.',
  path: '/learn/calming/',
})

const profiles = [
  {
    href: '/herbs/kava/',
    title: 'Kava',
    body: 'A kavalactone-rich calming herb with clinical anxiety research and an unusually important product-quality and liver-safety discussion.',
    lens: 'Useful example of why “calming” can still require serious contraindication review.',
  },
  {
    href: '/herbs/blue-lotus/',
    title: 'Blue Lotus',
    body: 'A traditional psychoactive water lily often discussed for relaxation, dreamlike effects, and ceremonial context, with far less modern clinical certainty.',
    lens: 'Useful example of separating cultural use and subjective reports from strong human evidence.',
  },
  {
    href: '/herbs/valerian/',
    title: 'Valerian',
    body: 'A sedating sleep herb often framed around GABA-related pathways, sleep latency, odor/tolerability, and next-day grogginess questions.',
    lens: 'Useful example of calming support crossing into sedation and impairment risk.',
  },
  {
    href: '/compounds/l-theanine/',
    title: 'L-Theanine',
    body: 'A tea-derived amino acid commonly used for calm focus, caffeine smoothing, and gentler stress response support without heavy sedation for many users.',
    lens: 'Useful example of calming without necessarily chasing stronger sedation.',
  },
]

const systems = [
  {
    title: 'Inhibitory tone',
    body: 'The calming category often points toward GABAergic or inhibitory signaling, but that does not mean every calming herb acts like a benzodiazepine. Some ingredients may influence stress perception, arousal, sleep pressure, or excitatory-inhibitory balance through indirect mechanisms.',
  },
  {
    title: 'Stress response',
    body: 'A calmer state can come from reduced physiological arousal, improved coping under stress, smoother caffeine response, or better sleep timing. These are different outcomes, so a calming page should always ask what kind of calm is being targeted.',
  },
  {
    title: 'Sedation boundary',
    body: 'Calming becomes riskier when it turns into slowed reaction time, impaired driving, next-day grogginess, respiratory depression risk, or interaction with alcohol, sedatives, opioids, antihistamines, sleep medications, or anxiety medications.',
  },
]

const decisionQuestions = [
  'Is the goal calm focus, anxiety relief, sleep onset, muscle relaxation, emotional smoothing, or intoxication-like sedation?',
  'Does the ingredient have human evidence for that specific outcome, or only mechanism and tradition?',
  'Could the same pathway be duplicated by another supplement, medication, alcohol, cannabis, antihistamine, or sleep aid?',
  'Would the ingredient create a safety problem around driving, childcare, work, respiratory risk, dependence, liver stress, or next-day impairment?',
]

const CALMING_REFS = [
  { n: 1, text: 'Kimura K, et al. (2007). L-theanine and stress. Biol Psychol, 74(1): 39-45.', url: 'https://pubmed.ncbi.nlm.nih.gov/16930802/' },
]

export default function CalmingPsychoactivesPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Calming Psychoactives"
        description="Educational exploration of calming psychoactive herbs, inhibitory neuropharmacology, stress regulation, and GABAergic systems."
        url="https://thehippiescientist.net/learn/calming"
        type="CollectionPage"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Calming Psychoactives' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Psychoactive ecosystem</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Calming Psychoactives: Relaxation, GABAergic Signaling, and the Sedation Boundary
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Calming psychoactives are not one simple category. Some support calm focus, some reduce stress reactivity, some help sleep onset, and some push into meaningful sedation. This page explains how to think about calming herbs and compounds without confusing “natural” with automatically safe or “GABA-related” with clinically proven.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Calming psychoactive systems">
        {systems.map((system) => (
          <article key={system.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{system.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{system.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="calming-decision-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="calming-decision-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The most useful calming question is not “what is the strongest calming herb?” Stronger is often worse if the real goal is daytime steadiness, social ease, sleep quality, or reduced overactivation. A better framework asks what kind of calm is needed, how strong the evidence is, and where sedation or interaction risk begins.
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
          <h2 className="mt-2 text-xl font-bold">Calming stacks can become sedating stacks fast</h2>
          <p className="mt-3 text-sm leading-6">
            Combining multiple calming agents can amplify impairment even when each ingredient seems mild alone. Alcohol, cannabis, benzodiazepines, sleep medications, opioids, antihistamines, muscle relaxers, kava, valerian, passionflower, and other sedating supplements should be reviewed with extra caution.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check a calming stack
            </Link>
            <Link href="/learn/gaba-vs-serotonin/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              GABA vs serotonin
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="related-calming-profiles-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related profiles</p>
          <h2 id="related-calming-profiles-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Calming ingredients to compare carefully
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These profiles sit in different parts of the calming landscape. Read them comparatively: one may be better for daytime calm, another for sleep onset, another for stronger anxiety-focused effects, and another may carry too much uncertainty for casual use.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {profiles.map((profile) => (
            <Link
              key={profile.href}
              href={profile.href}
              className="card-premium group flex h-full flex-col p-6 transition motion-safe:hover:-translate-y-0.5"
            >
              <div className="space-y-3">
                <p className="eyebrow-label">Related Profile</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{profile.title}</h3>
                <p className="text-sm leading-6 text-muted">{profile.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{profile.lens}</p>
                </div>
                <span className="inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                  Read profile -&gt;
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Where to go next</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          If you are comparing calming ingredients for a practical decision, pair this explainer with the interaction checker, the sleep guides, and the herb or compound profiles. That gives you a more complete view of mechanism, evidence, dosing realism, and safety context.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/sleep/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Sleep guides
          </Link>
          <Link href="/guides/anxiety/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Anxiety guides
          </Link>
          <Link href="/guides/herbs/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Herb deep dives
          </Link>
        </div>
      </section>

      <References refs={CALMING_REFS} />
    </div>
  )
}

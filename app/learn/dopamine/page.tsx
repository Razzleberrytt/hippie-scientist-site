import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Dopamine Pathway: Motivation, Focus, Reward & Safety',
  description:
    'A premium educational guide to dopamine signaling, motivation, reward prediction, focus, fatigue, nootropic claims, and safety-first dopamine-support decisions.',
  alternates: { canonical: '/learn/dopamine/' },
}

const profiles = [
  {
    href: '/herbs/rhodiola/',
    title: 'Rhodiola',
    body: 'An adaptogenic herb often discussed for fatigue, stress performance, and mental stamina rather than simple dopamine boosting.',
    lens: 'Useful when the goal is stress-resilient energy, but activating effects, insomnia, and anxiety sensitivity matter.',
  },
  {
    href: '/compounds/l-tyrosine/',
    title: 'L-Tyrosine',
    body: 'A dopamine and norepinephrine precursor sometimes used in stress, sleep deprivation, or high-demand cognition contexts.',
    lens: 'Useful example of synthesis support being different from pushing dopamine directly.',
  },
  {
    href: '/compounds/mucuna-pruriens/',
    title: 'Mucuna Pruriens',
    body: 'A botanical source of L-DOPA that sits much closer to drug-like dopamine pathway manipulation than most supplement claims imply.',
    lens: 'Useful example of why “natural dopamine support” can become high-risk quickly.',
  },
  {
    href: '/learn/why-calm-focus-differs-from-stimulation/',
    title: 'Calm Focus vs Stimulation',
    body: 'A learning page for separating clear attention from jittery activation, stimulant chasing, and rebound fatigue.',
    lens: 'Useful when the real goal is sustainable attention rather than maximum stimulation.',
  },
]

const coreConcepts = [
  {
    title: 'Dopamine is not just pleasure',
    body: 'Dopamine is deeply involved in motivation, prediction, learning, salience, movement, and effort allocation. Reducing it to a “pleasure chemical” leads to bad supplement decisions because the real question is often drive, reinforcement, or task engagement — not pleasure alone.',
  },
  {
    title: 'Motivation is a system, not a switch',
    body: 'Low motivation can come from sleep debt, depression, stress load, under-recovery, ADHD, low reward clarity, medication effects, or metabolic fatigue. A dopamine pathway page should help readers ask better questions before assuming a dopamine supplement is the answer.',
  },
  {
    title: 'More activation can backfire',
    body: 'Pushing stimulation too hard can worsen anxiety, irritability, impulsivity, insomnia, appetite disruption, and crash cycles. For many readers, the best focus strategy is not stronger activation, but cleaner energy, better sleep, and fewer competing rewards.',
  },
]

const decisionQuestions = [
  'Is the goal motivation, focus, mood, fatigue resistance, reward sensitivity, or stimulant replacement?',
  'Is the ingredient supporting precursor availability, stress resilience, wakefulness, or direct dopamine pathway manipulation?',
  'Could sleep debt, caffeine load, nicotine, stimulant medication, depression, ADHD, or burnout explain the problem better than a supplement gap?',
  'Would pushing activation create risk around anxiety, insomnia, mania, blood pressure, appetite, dependence, or medication interactions?',
]

const DOPAMINE_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function DopaminePathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Dopamine Pathway"
        description="Educational overview of dopaminergic signaling, motivation systems, cognition, reward processing, focus-related neuropharmacology, and safety-first supplement decisions."
        url="https://thehippiescientist.net/learn/dopamine"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Dopamine' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Pathway supernode</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Dopamine Pathway: Motivation, Focus, Reward Prediction, and the Problem with “Dopamine Boosters”
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Dopamine is often marketed as the brain’s pleasure switch, but that framing is too shallow for useful decisions. Dopaminergic signaling helps the brain assign salience, learn from outcomes, pursue rewards, regulate movement, and decide whether effort feels worth it. This page explains the pathway without turning every focus, fatigue, or motivation problem into a supplement shopping list.
        </p>
        <figure className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
            <Image
              src="/images/learn/dopamine.jpg"
              alt="Dopamine molecular model with runner and coffee"
              width={1536}
              height={1024}
              priority
              className="h-auto w-full"
            />
          </div>
          <figcaption className="mt-3 text-center text-sm text-muted">
            Dopamine is better understood as part of motivation, learning, and salience — not simply pleasure.
          </figcaption>
        </figure>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Core dopamine concepts">
        {coreConcepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="dopamine-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="dopamine-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The useful question is not “how do I raise dopamine?” A better question is what problem needs solving: inconsistent focus, low effort tolerance, stimulant crash, burnout, poor sleep, reward chasing, or true clinical symptoms. Dopamine-related supplements can sit anywhere from gentle support to high-risk pathway manipulation.
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
          <h2 className="mt-2 text-xl font-bold">Dopamine support is not always gentle</h2>
          <p className="mt-3 text-sm leading-6">
            Be especially cautious with stimulant medications, MAOIs, psychiatric conditions, bipolar disorder, psychosis history, blood-pressure concerns, insomnia, nicotine use, high caffeine intake, and L-DOPA-containing products. Natural does not automatically mean mild when the pathway affects motivation, movement, arousal, and reward learning.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check a focus stack
            </Link>
            <Link href="/guides/focus/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Focus guides
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="related-dopamine-systems-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related systems</p>
          <h2 id="related-dopamine-systems-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Ingredients and guides to compare carefully
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These related pages show why dopamine-oriented decisions need nuance. A precursor, adaptogen, L-DOPA source, and focus guide do not belong in the same risk category, even when marketers flatten them into “dopamine support.”
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
                <p className="eyebrow-label">Related System</p>
                <h3 className="text-2xl font-semibold tracking-tight text-ink">{profile.title}</h3>
                <p className="text-sm leading-6 text-muted">{profile.body}</p>
                <div className="rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Decision lens</p>
                  <p className="mt-2 text-sm leading-6 text-muted">{profile.lens}</p>
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
          If the goal is practical focus, continue into the focus guide cluster. If the goal is fatigue, compare sleep, stress, and recovery explanations before assuming dopamine is the limiting factor. If the goal is product selection, use the safety checker before combining stimulants, precursors, adaptogens, nicotine, caffeine, or prescription medications.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/focus/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Focus guides
          </Link>
          <Link href="/learn/why-calm-focus-differs-from-stimulation/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Calm focus vs stimulation
          </Link>
          <Link href="/compounds/l-tyrosine/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            L-Tyrosine profile
          </Link>
        </div>
      </section>

      <References refs={DOPAMINE_REFS} />
    </div>
  )
}

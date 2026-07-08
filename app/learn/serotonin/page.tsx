import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import References from '@/components/References'

export const metadata: Metadata = {
  title: 'Serotonin Pathway: Mood, Sleep, Gut-Brain Signaling & Safety',
  description:
    'A premium educational guide to serotonergic signaling, mood regulation, sleep, gut-brain pathways, serotonin-support supplement claims, and safety-first interaction decisions.',
  alternates: { canonical: '/learn/serotonin/' },
}

const profiles = [
  {
    href: '/herbs/kanna/',
    title: 'Kanna',
    description: 'A serotonergic ethnobotanical associated with mood, emotional processing, and psychoactive traditional use.',
    lens: 'Useful example of why serotonergic herbs deserve medication and interaction screening before casual use.',
  },
  {
    href: '/herbs/saffron/',
    title: 'Saffron',
    description: 'A mood-supportive botanical often discussed around emotional regulation, stress response, and clinical mood research.',
    lens: 'Useful example of mood-support evidence that still requires context around medications and expectations.',
  },
  {
    href: '/herbs/rhodiola/',
    title: 'Rhodiola',
    description: 'An adaptogenic herb associated with stress modulation, fatigue regulation, and mood support rather than simple serotonin boosting.',
    lens: 'Useful example of stress resilience overlapping with mood without being a pure serotonergic strategy.',
  },
  {
    href: '/compounds/5-htp/',
    title: '5-HTP',
    description: 'A serotonin precursor compound associated with mood and sleep pathways, but also one of the higher-caution supplement categories.',
    lens: 'Useful example of why precursor logic can become risky with antidepressants or serotonergic stacks.',
  },
]

const concepts = [
  {
    title: 'Serotonin is not simply happiness',
    body: 'Serotonin participates in mood, emotional processing, sleep-wake timing, appetite, gut signaling, pain processing, cognition, and perception. Calling it a “happiness chemical” makes supplement decisions feel simpler than they really are.',
  },
  {
    title: 'Gut serotonin and brain serotonin are not interchangeable',
    body: 'Much of the body’s serotonin is outside the brain, especially in the gut. That matters for physiology, but it does not mean every gut-focused supplement directly raises brain serotonin or improves mood in a predictable way.',
  },
  {
    title: 'Serotonergic safety is medication-sensitive',
    body: 'SSRIs, SNRIs, MAOIs, triptans, lithium, MDMA-like substances, St. John’s wort, 5-HTP, and other serotonergic agents can create interaction concerns. “Natural mood support” can still be pathway-active enough to matter.',
  },
]

const decisionQuestions = [
  'Is the goal mood support, anxiety support, sleep timing, emotional processing, appetite, gut-brain context, or psychoactive mechanism learning?',
  'Is the ingredient a serotonin precursor, reuptake-influencing herb, adaptogen, nutrient, or only loosely marketed as mood support?',
  'Could the person be using antidepressants, migraine medications, stimulants, lithium, MAOIs, psychedelics, MDMA-like substances, or other serotonergic supplements?',
  'Would a lower-risk intervention like sleep consistency, morning light, exercise, therapy, nutrition, or clinician review fit the problem better than a serotonin-active stack?',
]

const safetyChecks = [
  {
    title: 'Medication overlap',
    body: 'Do not treat serotonergic supplements casually with SSRIs, SNRIs, MAOIs, triptans, lithium, linezolid, tramadol, MDMA-like substances, or multiple mood-support products.',
  },
  {
    title: 'Mood destabilization',
    body: 'Bipolar disorder, psychosis history, panic sensitivity, severe insomnia, and rapid mood shifts deserve clinician review before experimenting with serotonin-active supplements.',
  },
  {
    title: 'Symptom seriousness',
    body: 'Persistent depression, suicidal thinking, severe anxiety, eating changes, or major sleep disruption should not be handled by supplement stacking. Use education to prepare better clinical questions.',
  },
]

const SEROTONIN_REFS = [
  { n: 1, text: 'Kandel ER, et al. (2013). Principles of Neural Science: synaptic transmission. McGraw-Hill.', url: '' },
  { n: 2, text: 'Cooper JR, Bloom FE, Roth RH. (2003). The Biochemical Basis of Neuropharmacology, 8th ed. Oxford.', url: '' },
  { n: 3, text: 'Südhof TC. (2013). Neurotransmitter release. Neuron, 80(3): 675-690.', url: 'https://pubmed.ncbi.nlm.nih.gov/24183020/' },
]

export default function SerotoninPathwayPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd
        title="Serotonin Pathway"
        description="Educational overview of serotonergic signaling, mood regulation, psychoactive neuropharmacology, gut-brain context, and safety-first supplement decisions."
        url="https://thehippiescientist.net/learn/serotonin"
        type="Article"
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Learn', href: '/learn/' },
          { label: 'Serotonin' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="eyebrow-label">Pathway supernode</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Serotonin Pathway: Mood, Sleep, Gut-Brain Signaling, and the Safety Problem with “Mood Boosters”
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
          Serotonin is often described as a happiness chemical, but that shortcut can mislead readers. Serotonergic signaling is involved in mood, emotional processing, sleep-wake rhythms, appetite, gut function, perception, and medication interactions. This page explains the pathway without turning serotonin support into a casual supplement stack.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm dark:border-white/10 dark:bg-white/5">
          <Image
            src="/images/learn/serotonin.jpg"
            alt="Molecular illustration representing serotonin neurotransmitter signaling"
            width={1200}
            height={630}
            className="h-auto w-full"
          />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Core serotonin concepts">
        {concepts.map((concept) => (
          <article key={concept.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
            <h2 className="text-lg font-bold text-ink">{concept.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{concept.body}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="serotonin-framework-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="serotonin-framework-heading" className="text-2xl font-bold text-ink">The premium decision framework</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The useful question is not “how do I increase serotonin?” A better framework asks what problem is being targeted, whether the ingredient has human evidence for that outcome, and whether the safety context allows serotonin-active experimentation at all. Mood support, sleep timing, gut-brain physiology, and psychoactive effects are different decisions.
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
          <h2 className="mt-2 text-xl font-bold">Serotonin-active stacks deserve extra caution</h2>
          <p className="mt-3 text-sm leading-6">
            The main risk is not just feeling too calm. Serotonergic overlap can involve agitation, sweating, tremor, diarrhea, fever, confusion, mood destabilization, or emergency interaction risk. Medication context matters more here than in ordinary nutrition decisions.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check interaction risk
            </Link>
            <Link href="/learn/gaba-vs-serotonin/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              GABA vs serotonin
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="serotonin-safety-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Safety checks</p>
          <h2 id="serotonin-safety-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            What to check before using serotonin-support supplements
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Serotonin-related supplements should be filtered through interaction risk before product interest. These checks keep the page useful without encouraging unsafe self-treatment.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {safetyChecks.map((check) => (
            <article key={check.title} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-bold text-ink">{check.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{check.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="serotonin-profiles-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Related profiles</p>
          <h2 id="serotonin-profiles-heading" className="mt-2 text-2xl font-bold tracking-tight text-ink">
            Serotonin-adjacent herbs and compounds to compare carefully
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            These profiles do not all mean the same thing. A serotonergic ethnobotanical, a mood-support botanical, an adaptogen, and a serotonin precursor each carry a different evidence and safety story.
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
                <p className="text-sm leading-7 text-muted">{profile.description}</p>
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
          If the goal is anxiety or mood support, use the anxiety guide cluster and safety checker before combining supplements. If the goal is mechanism learning, compare serotonin with GABA. If the goal is practical sleep or stress support, start with the sleep and calming resources before assuming serotonin is the limiting pathway.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/guides/anxiety/" className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800">
            Anxiety guides
          </Link>
          <Link href="/guides/sleep/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Sleep guides
          </Link>
          <Link href="/learn/calming/" className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10">
            Calming psychoactives
          </Link>
        </div>
      </section>

      <References refs={SEROTONIN_REFS} />
    </div>
  )
}

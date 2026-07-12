import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = {
  title: 'Herb Deep-Dive Guides',
  description:
    'Premium herb deep-dive guide hub covering evidence, safety, dosing, product quality, and practical fit for ashwagandha, kava, passionflower, rhodiola, turmeric, elderberry, and more.',
  alternates: { canonical: `${SITE_URL}/guides/herbs/` },
  openGraph: {
    title: 'Herb Deep-Dive Guides',
    description: 'Evidence-first herb guides with safety, dosing, product quality, and practical decision context.',
    url: `${SITE_URL}/guides/herbs/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const GUIDES = [
  {
    slug: 'ashwagandha',
    title: 'Ashwagandha — Complete Guide',
    desc: 'Full monograph: stress, sleep, cortisol, thyroid, athletic performance, and safety.',
    fit: 'Best for readers comparing adaptogen use for stress resilience, sleep quality, and performance recovery.',
    caution: 'Review thyroid conditions, pregnancy, sedatives, autoimmune disease, and liver-safety context before use.',
  },
  {
    slug: 'l-theanine',
    title: 'L-Theanine — Complete Guide',
    desc: 'Mechanism, dosing, and evidence for calm focus, sleep, and anxiety.',
    fit: 'Best for calm-focus, caffeine smoothing, and gentle wind-down questions where sedation should stay low.',
    caution: 'Watch additive calming effects when combined with sedatives, alcohol, sleep aids, or anxiety medications.',
  },
  {
    slug: 'kava',
    title: 'Kava — Complete Guide',
    desc: 'Kavalactones, safety, tradition, and clinical evidence for anxiety.',
    fit: 'Best for readers who need a safety-heavy look at anxiety research, extract quality, and kavalactone context.',
    caution: 'Do not treat kava casually: liver history, alcohol, sedatives, pregnancy, and product quality matter.',
  },
  {
    slug: 'passionflower',
    title: 'Passionflower — Complete Guide',
    desc: 'GABAergic calming herb for sleep and anxiety — evidence and preparation.',
    fit: 'Best for gentle calming, sleep-onset, and nervous-system support questions where stronger sedatives feel excessive.',
    caution: 'Review sedatives, pregnancy, breastfeeding, driving, and stacked calming herbs before combining.',
  },
  {
    slug: 'rhodiola-complete-guide',
    title: 'Rhodiola — Complete Guide',
    desc: 'Adaptogenic support for fatigue, cognition, and stress resilience.',
    fit: 'Best for fatigue, burnout, stress-performance, and mental stamina questions with stimulation sensitivity in mind.',
    caution: 'Use caution with bipolar disorder, stimulants, insomnia, anxiety spikes, and activating stacks.',
  },
  {
    slug: 'rhodiola-energy',
    title: 'Rhodiola for Energy',
    desc: 'Using rhodiola for physical and mental fatigue.',
    fit: 'Best for readers comparing fatigue support without jumping straight to high-caffeine or stimulant-heavy formulas.',
    caution: 'Timing matters: late-day use, insomnia tendency, and stimulant overlap can make rhodiola a poor fit.',
  },
  {
    slug: 'rhodiola-extract-vs-powder',
    title: 'Rhodiola Extract vs Powder',
    desc: 'Forms, standardization, and which to choose.',
    fit: 'Best for product-quality decisions where rosavins, salidroside, extract ratio, and label clarity matter.',
    caution: 'Avoid vague proprietary blends and products that do not disclose extract standardization or plant identity.',
  },
  {
    slug: 'turmeric-curcumin',
    title: 'Turmeric & Curcumin Guide',
    desc: 'Absorption, dosing, and evidence for inflammation and pain.',
    fit: 'Best for readers comparing turmeric food use, curcumin extracts, absorption enhancers, and inflammation claims.',
    caution: 'Review anticoagulants, gallbladder issues, surgery, reflux, iron status, and piperine-enhanced products.',
  },
  {
    slug: 'elderberry',
    title: 'Elderberry Guide',
    desc: 'Immune support evidence, safety, and preparation methods.',
    fit: 'Best for immune-season questions where preparation method and realistic evidence claims need separating.',
    caution: 'Raw elderberry parts can be unsafe; autoimmune disease, pregnancy, and persistent symptoms need clinician context.',
  },
  {
    slug: 'melatonin-vs-valerian',
    title: 'Melatonin vs Valerian for Sleep',
    desc: 'Comparing two popular natural sleep aids.',
    fit: 'Best for choosing between circadian timing support and herbal calming support for sleep problems.',
    caution: 'Do not stack sleep aids casually; sedation, next-day impairment, medications, and timing all matter.',
  },
]

const principles = [
  {
    title: 'Identify the plant and preparation',
    body: 'A herb name alone is not enough. Plant part, extract ratio, standardization, dose, and product testing can change the evidence and safety picture completely.',
  },
  {
    title: 'Separate tradition from proof',
    body: 'Traditional use can suggest where to investigate, but the guide still needs human evidence, plausible dosing, safety review, and product-quality context before it becomes actionable.',
  },
  {
    title: 'Treat safety as part of the evidence',
    body: 'The best herb on paper may still be wrong with pregnancy, liver disease, psychiatric medication, sedatives, anticoagulants, surgery, or a complex supplement stack.',
  },
]

const readingWorkflow = [
  'Start with the herb guide that matches the decision you are actually making: sleep, stress, anxiety, inflammation, fatigue, or product-form choice.',
  'Scan safety first. Herbs can interact with medications, alcohol, sedatives, stimulants, anticoagulants, blood pressure drugs, and hormone-sensitive conditions.',
  'Compare the preparation used in evidence against the product being considered. Powder, tea, tincture, standardized extract, and isolated actives are not interchangeable.',
  'Use the herb profile, safety checker, and product-quality guide before stacking multiple botanicals that share calming, stimulating, blood-pressure, liver, or bleeding-risk effects.',
]

export default function HerbsGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/herbs/',
    title: 'Herb Deep-Dive Guides',
    description:
      'Herb deep-dive guide hub covering evidence, safety, dosing, product quality, and practical fit for ashwagandha, kava, passionflower, rhodiola, turmeric, elderberry, and more.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Herb Profiles', url: `${SITE_URL}/guides/herbs/` },
    ],
    itemListName: 'Herb Deep-Dive Guides',
    items: GUIDES.map((g) => ({ name: g.title, url: `/guides/herbs/${g.slug}/` })),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-8 sm:pt-10">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Herb Profiles</span>
      </nav>

      <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">
          Herb education hub
        </p>
        <h1 className="mt-3 max-w-4xl text-3xl font-bold text-ink sm:text-5xl">
          Herb Deep-Dive Guides Built for Evidence, Safety, and Real Product Decisions
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Use this hub when a quick herb profile is not enough. These deep-dive guides connect traditional context, active compounds, clinical evidence, dosing realism, product quality, and safety tradeoffs so readers can understand what an herb may help with — and when it should be skipped.
        </p>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {principles.map((principle) => (
            <div key={principle.title} className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-sm font-bold text-ink">{principle.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]" aria-labelledby="herb-workflow-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="herb-workflow-heading" className="text-2xl font-bold text-ink">How to read an herb guide without getting misled</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Herbs are messy in the real world. The same common name can refer to different plant parts, extraction methods, active-marker targets, quality standards, and dose ranges. A premium herb guide should help you avoid two common mistakes: assuming “natural” means safe, and assuming a mechanism automatically means proven clinical benefit.
          </p>
          <ol className="mt-5 space-y-3">
            {readingWorkflow.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Clinical caution lens</p>
          <h2 className="mt-2 text-xl font-bold">Herbs can be biologically active enough to matter</h2>
          <p className="mt-3 text-sm leading-6">
            Botanical products can affect sedation, stimulation, liver enzymes, bleeding risk, blood pressure, hormones, immune activity, and medication metabolism. That is why these guides keep contraindications, preparation quality, and dose realism near the decision — not buried after a shopping list.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check herb interactions
            </Link>
            <Link href="/learn/product-quality/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Product quality basics
            </Link>
          </div>
        </aside>
      </section>

      <section className="space-y-4" aria-labelledby="herb-guides-heading">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">Deep dives</p>
          <h2 id="herb-guides-heading" className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            Choose the herb question you are actually trying to answer
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Start with the guide that matches the decision in front of you: calming support, sleep support, fatigue, inflammation, immune context, or form selection. Each card below explains the best fit and the safety question to check before going deeper.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/herbs/${guide.slug}/`}
              className="group flex h-full flex-col rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/30 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <h3 className="text-lg font-semibold leading-snug text-ink">{guide.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{guide.desc}</p>
              <div className="mt-4 space-y-3 rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Best fit</p>
                <p className="text-sm leading-6 text-muted">{guide.fit}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-100">Safety lens</p>
                <p className="text-sm leading-6 text-muted">{guide.caution}</p>
              </div>
              <span className="mt-5 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                Read herb guide -&gt;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Need the full herb database instead?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          These are long-form editorial guides for high-interest herbs and herb decisions. For a broader scan of the full catalog, use the herb database, compare guides, or site search to find plant profiles by name, effect, safety concern, or related compound.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/herbs/"
            className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Browse herb database
          </Link>
          <Link
            href="/guides/compare/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10"
          >
            Compare herbs and compounds
          </Link>
          <Link
            href="/search/"
            className="inline-flex min-h-[44px] items-center rounded-full border border-brand-900/10 px-5 text-sm font-semibold text-ink transition hover:bg-white/70 dark:border-white/10 dark:hover:bg-white/10"
          >
            Search the library
          </Link>
        </div>
      </section>
    </div>
  )
}

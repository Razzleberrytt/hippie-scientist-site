import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, SITE_URL } from '@/src/lib/seo'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = buildPageMetadata({
  title: 'Best Supplement Guides by Goal',
  description:
    'Browse evidence-informed best supplement guides for ADHD, stress, blood pressure, fat loss, gut health, and joint support, with safety-first decision context.',
  path: '/guides/best/',
})

const bestGuides = [
  {
    title: 'Best Magnesium Supplements for ADHD',
    href: '/guides/best/magnesium-supplements-for-adhd/',
    description: 'Compare magnesium forms by ADHD fit, tolerability, sleep context, and practical dosing.',
    bestFor: 'People comparing glycinate, threonate, citrate, and other magnesium forms for attention, sleep, and nervous-system support.',
    caution: 'Medication use, kidney disease, loose stools, and sedating stacks should be reviewed carefully.',
  },
  {
    title: 'Best Supplements for Stress',
    href: '/guides/best/supplements-for-stress/',
    description: 'Separate calmer, adaptogen, and nervous-system support options with safety context visible.',
    bestFor: 'Readers trying to lower daily stress load without building an oversized adaptogen stack.',
    caution: 'Watch sedatives, antidepressants, thyroid issues, pregnancy, and blood-pressure effects.',
  },
  {
    title: 'Best Supplements for Blood Pressure',
    href: '/guides/best/supplements-for-blood-pressure/',
    description: 'Review cardiovascular-support options with medication and monitoring cautions kept upfront.',
    bestFor: 'People comparing heart-health supplements alongside lifestyle and clinician-guided monitoring.',
    caution: 'Blood-pressure medication, anticoagulants, kidney disease, and heart rhythm concerns make professional review especially important.',
  },
  {
    title: 'Best Supplements for Fat Loss',
    href: '/guides/best/supplements-for-fat-loss/',
    description: 'Compare realistic weight-support options without proprietary-blend or stimulant hype.',
    bestFor: 'Readers looking for modest evidence-based support rather than miracle fat-burning claims.',
    caution: 'Avoid stimulant stacking, appetite-suppressant extremes, and products with undisclosed blends.',
  },
  {
    title: 'Best Supplements for Gut Health',
    href: '/guides/best/supplements-for-gut-health/',
    description: 'Scan fiber, digestive, and gut-support options by tolerance, timing, and evidence strength.',
    bestFor: 'People comparing probiotics, fibers, digestive aids, and gut-support basics by symptom fit.',
    caution: 'Start low with fermentable fibers and review immune compromise, severe GI disease, or persistent symptoms with a clinician.',
  },
  {
    title: 'Best Supplements for Joint Support',
    href: '/guides/best/supplements-for-joint-support/',
    description: 'Compare joint and mobility support options by evidence signal, safety, and practical fit.',
    bestFor: 'Readers comparing inflammation, cartilage, tendon, and mobility-support ingredients without overstacking.',
    caution: 'Anticoagulants, surgery, autoimmune disease, and NSAID use can change the safety calculus.',
  },
]

const decisionPrinciples = [
  {
    title: 'Evidence before excitement',
    body: 'A best-of page should not rank products by hype, commission, or ingredient popularity. The starting question is whether human evidence exists for the exact outcome, dose range, and population being discussed.',
  },
  {
    title: 'Safety before stacking',
    body: 'More ingredients rarely means a better plan. When two supplements push similar pathways, the smarter move is often to choose the cleaner option first and avoid unnecessary overlap.',
  },
  {
    title: 'Fit before novelty',
    body: 'The best supplement for a real person depends on sleep, caffeine use, medications, budget, tolerance, and the problem they are actually trying to solve.',
  },
]

const workflows = [
  'Pick the guide that matches one goal, not every goal at once.',
  'Read the safety and medication cautions before scanning product examples.',
  'Compare the active ingredient, studied dose, product form, and third-party testing standard.',
  'Use the safety checker before combining multiple calming, stimulating, blood-pressure, or serotonergic ingredients.',
]

export default function BestSupplementGuidesHub() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/best/',
    title: 'Best Supplement Guides by Goal',
    description:
      'Browse evidence-informed best supplement guides for ADHD, stress, blood pressure, fat loss, gut health, and joint support, with safety-first decision context.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Best Supplement Guides', url: `${SITE_URL}/guides/best/` },
    ],
    itemListName: 'Best Supplement Guides by Goal',
    items: bestGuides.map((g) => ({ name: g.title, url: g.href })),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-8 sm:pt-10">
      <SchemaGraphScript graph={schemaGraph} />
      <header className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-white/5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">
          Curated supplement guides
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-ink sm:text-5xl">
          Best Supplement Guides, Ranked by Evidence, Safety, and Real-World Fit
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          Start here when you already know the outcome you care about, but you do not want a generic top-10 list. These best-of guides compare supplements by evidence strength, safety context, mechanism plausibility, product quality, and whether the option makes sense for a real person outside a marketing funnel.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Best guide quality standards">
          {decisionPrinciples.map((principle) => (
            <div key={principle.title} className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-4 dark:border-white/10 dark:bg-white/5">
              <h2 className="text-sm font-bold text-ink">{principle.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{principle.body}</p>
            </div>
          ))}
        </div>
      </header>

      <section className="space-y-4" aria-labelledby="best-guides-heading">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700 dark:text-brand-200">Choose by outcome</p>
          <h2 id="best-guides-heading" className="mt-2 text-2xl font-bold text-ink sm:text-3xl">
            Evidence-informed best-of guides
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Each guide is designed to answer a practical decision: what is worth considering, what is overhyped, what should be avoided, and which safety questions matter before a supplement ever goes in the cart.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bestGuides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group flex h-full flex-col rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <h3 className="text-lg font-semibold leading-snug text-ink">{guide.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{guide.description}</p>
              <div className="mt-4 space-y-3 rounded-xl border border-brand-900/10 bg-brand-50/50 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800 dark:text-brand-100">Best fit</p>
                <p className="text-sm leading-6 text-muted">{guide.bestFor}</p>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800 dark:text-amber-100">Safety lens</p>
                <p className="text-sm leading-6 text-muted">{guide.caution}</p>
              </div>
              <span className="mt-5 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5 dark:text-brand-100">
                Read guide -&gt;
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]" aria-labelledby="how-to-use-heading">
        <div className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
          <h2 id="how-to-use-heading" className="text-2xl font-bold text-ink">How to use these best supplement guides</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            The safest way to use a best-of guide is to treat it like a decision framework, not a shopping command. The right supplement depends on your goal, current stack, medications, health context, and tolerance. A popular product can still be the wrong fit if it duplicates another mechanism or creates avoidable risk.
          </p>
          <ol className="mt-5 space-y-3">
            {workflows.map((item, index) => (
              <li key={item} className="flex gap-3 rounded-xl border border-brand-900/10 bg-brand-50/40 p-3 text-sm leading-6 text-muted dark:border-white/10 dark:bg-white/5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-bold text-white">{index + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-amber-950 dark:border-amber-200/20 dark:bg-amber-950/20 dark:text-amber-50">
          <p className="text-sm font-bold uppercase tracking-[0.16em]">Safety-first reminder</p>
          <h2 className="mt-2 text-xl font-bold">A “best” supplement can still be wrong for you</h2>
          <p className="mt-3 text-sm leading-6">
            Pregnancy, breastfeeding, surgery, liver or kidney disease, psychiatric medications, anticoagulants, blood-pressure drugs, stimulants, sedatives, and use in children all change the risk-benefit picture. When those contexts apply, use these guides to prepare better questions for a clinician or pharmacist rather than to self-prescribe.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/safety-checker/" className="rounded-full bg-amber-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-950 dark:bg-amber-100 dark:text-amber-950">
              Check interactions
            </Link>
            <Link href="/learn/product-quality/" className="rounded-full border border-amber-900/20 px-4 py-2 text-sm font-semibold text-amber-950 transition hover:bg-white/60 dark:border-amber-100/30 dark:text-amber-50">
              Product quality basics
            </Link>
          </div>
        </aside>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 dark:border-white/10 dark:bg-white/5">
        <h2 className="text-xl font-semibold text-ink">Need a broader starting point?</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">
          Use the full guide index to compare ADHD, sleep, anxiety, focus, herb, and comparison clusters before narrowing to a best-of page. If you are still deciding which goal matters most, start broad, then move into a focused best supplement guide once the target is clear.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/guides/"
            className="inline-flex min-h-[44px] items-center rounded-full bg-brand-700 px-5 text-sm font-semibold text-white transition hover:bg-brand-800"
          >
            Browse all guides
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

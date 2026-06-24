import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import RecommendationSection, { type RecommendationProduct } from '@/components/RecommendationSection'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { getRevenueProductSet } from '@/config/revenue-products'
import { buildSchemaGraph } from '@/src/lib/schema-graph'
import {
  breadcrumbJsonLd,
  buildPageMetadata,
  collectionPageJsonLd,
  faqPageJsonLd,
  itemListJsonLd,
  SITE_URL,
  toAbsoluteUrl,
} from '@/src/lib/seo'

const PATH = '/best-supplements-for-sleep'
const TITLE = 'Best Supplements for Sleep'
const DESCRIPTION =
  'Compare sleep supplements by sleep problem, timing, evidence context, grogginess risk, product quality, and safety before buying.'

export const metadata: Metadata = buildPageMetadata({
  title: 'Best Supplements for Sleep: Evidence-First Buyer Guide',
  description: DESCRIPTION,
  path: PATH,
  image: '/og/guides/best-supplements-for-sleep.png',
  openGraphType: 'article',
})

type SleepSupplement = {
  name: string
  href: string
  rank: number
  bestFor: string
  why: string
  evidence: string
  timing: string
  downside: string
  safety: string
  grogginess: string
  readNext: string
}

const quickFits = [
  {
    problem: 'Trouble falling asleep',
    fit: 'Melatonin or L-theanine',
    note: 'Melatonin fits circadian timing issues. L-theanine fits mental chatter or stress arousal.',
  },
  {
    problem: 'Wired-at-night stress',
    fit: 'L-theanine, magnesium glycinate',
    note: 'Theanine is more acute. Magnesium is slower, steadier support for tension and relaxation.',
  },
  {
    problem: 'Nighttime tension',
    fit: 'Magnesium glycinate',
    note: 'Best fit when muscle tension, low intake, or physical restlessness overlaps with poor sleep.',
  },
  {
    problem: 'Sleep quality support',
    fit: 'Glycine or magnesium',
    note: 'Both are usually framed as sleep-quality support, not knockout sedatives.',
  },
  {
    problem: 'Herbal sleep support',
    fit: 'Valerian',
    note: 'A traditional herbal option with mixed human evidence and more sedative cautions.',
  },
  {
    problem: 'Sensitive to grogginess',
    fit: 'Compare gentler options first',
    note: 'Avoid heavy sedative stacking. Start with one low-dose option and reassess the next morning.',
  },
]

const supplements: SleepSupplement[] = [
  {
    rank: 1,
    name: 'Magnesium glycinate',
    href: '/compounds/magnesium',
    bestFor: 'Nighttime tension, low magnesium intake, and sleep-quality support.',
    why: 'People use it to support relaxation, muscle ease, and a calmer wind-down routine.',
    evidence:
      'Human evidence is context-dependent and strongest when magnesium status, age, or deficiency risk matters. It is not a fast hypnotic.',
    timing: 'Evening or 30-90 minutes before bed, often with food for tolerance.',
    downside: 'GI upset can happen, especially if the elemental dose is high or the form is not glycinate.',
    safety:
      'Avoid unsupervised use with kidney disease. Separate from levothyroxine, bisphosphonates, tetracycline antibiotics, and quinolone antibiotics.',
    grogginess: 'Low to moderate',
    readNext: 'Magnesium profile',
  },
  {
    rank: 2,
    name: 'Melatonin',
    href: '/compounds/melatonin',
    bestFor: 'Sleep timing, jet lag, delayed schedule, or occasional sleep-onset timing problems.',
    why: 'People use it as a circadian signal, especially when the issue is when sleep starts.',
    evidence:
      'Human evidence is strongest for circadian timing and sleep-onset latency, not as a general sedative or sleep-depth enhancer.',
    timing: 'Usually 30-60 minutes before the desired bedtime; timing matters as much as dose.',
    downside: 'Higher doses can cause vivid dreams, morning grogginess, or a mistimed circadian signal.',
    safety:
      'Use caution with children, pregnancy, autoimmune conditions, anticoagulants, seizure disorders, and psychiatric medication.',
    grogginess: 'Dose-sensitive',
    readNext: 'Melatonin profile',
  },
  {
    rank: 3,
    name: 'L-theanine',
    href: '/compounds/l-theanine',
    bestFor: 'Wired-at-night stress, racing thoughts, and sleep onset when calm is the missing piece.',
    why: 'People use it for relaxed alertness and reduced mental arousal without heavy sedation.',
    evidence:
      'Human evidence is moderate-to-limited for stress and sleep-quality contexts, with stronger plausibility for relaxation than direct insomnia treatment.',
    timing: 'About 30-60 minutes before bed, or earlier in the evening if stress ramps up before bedtime.',
    downside: 'It may feel too subtle if the main issue is circadian timing, pain, sleep apnea, or severe insomnia.',
    safety:
      'Use caution with sedatives, alcohol, anxiety medication, blood-pressure medication, and other calming supplements.',
    grogginess: 'Low',
    readNext: 'L-theanine profile',
  },
  {
    rank: 4,
    name: 'Glycine',
    href: '/compounds/glycine',
    bestFor: 'Sleep quality support and feeling more refreshed when tolerated well.',
    why: 'People use it as a simple amino acid option, often when they want something gentler than sedative herbs.',
    evidence:
      'Small human studies suggest sleep-quality benefits, but the evidence base is narrower than melatonin for timing.',
    timing: 'Commonly taken 30-60 minutes before bed.',
    downside: 'Capsule burden or powder taste can be annoying, and effects are not dramatic for everyone.',
    safety:
      'Use caution with complex medical conditions, pregnancy, psychiatric medication, or when combining with multiple sleep aids.',
    grogginess: 'Low',
    readNext: 'Glycine profile',
  },
  {
    rank: 5,
    name: 'Valerian',
    href: '/herbs/valerian',
    bestFor: 'Traditional herbal sleep support when gentler options have been compared first.',
    why: 'People use it for occasional sleep support and nervous tension, usually as a bedtime herb.',
    evidence:
      'Human evidence is mixed. Product standardization and study quality vary, so claims should stay modest.',
    timing: 'Often 30-60 minutes before bed.',
    downside: 'May cause next-day drowsiness, vivid dreams, headache, or paradoxical stimulation in some people.',
    safety:
      'Avoid combining with alcohol, benzodiazepines, Z-drugs, opioids, barbiturates, anesthesia, or other sedative stacks unless medically supervised.',
    grogginess: 'Moderate',
    readNext: 'Valerian profile',
  },
]

const rankingCriteria = [
  'Human evidence and whether it applies to the sleep problem people actually have.',
  'Match to a specific use case: timing, stress arousal, tension, or sleep-quality support.',
  'Safety profile, interaction concerns, and suitability for conservative first steps.',
  'Practical dosing and timing clarity from common clinical or product-use contexts.',
  'Product-quality clarity, including form, standardization, and label transparency.',
  'Risk of next-day impairment, especially when people may drive or work early.',
]

const safetyCautions = [
  'Do not combine sleep supplements with sedatives, benzodiazepines, Z-drugs, opioids, barbiturates, or anesthesia without clinician guidance.',
  'Avoid mixing sleep supplements with alcohol. Additive impairment can be unpredictable.',
  'Check with a clinician if you use antidepressants, anxiety medication, antipsychotics, mood stabilizers, or psychiatric medication.',
  'Avoid routine sleep-supplement use during pregnancy or breastfeeding unless a qualified clinician approves it.',
  'Children and adolescents need clinician guidance, especially with melatonin or sedating herbs.',
  'Kidney disease is a major caution for magnesium. Liver disease is a caution for sedative herbs and complex supplement blends.',
  'People with bipolar disorder, seizure disorders, or complex psychiatric histories should be cautious with melatonin and calming stacks.',
  'Assess next-day alertness before driving, operating machinery, or doing safety-sensitive work.',
  'Start with one sleep aid at a time. Stacking multiple sedative products makes side effects harder to interpret.',
]

const buyerChecklist = [
  'Choose the right form, such as magnesium glycinate instead of oxide for sleep-focused use.',
  'Avoid mega-doses, especially high-dose melatonin or multi-ingredient sedative blends.',
  'Start with one supplement, not a stack, and track sleep quality plus morning alertness.',
  'Look for third-party testing, clear serving size, and transparent active ingredient labeling.',
  'Check medication interactions before buying, especially with sedatives, antidepressants, thyroid medication, antibiotics, and blood-pressure medication.',
  'Reassess grogginess the next morning before increasing dose or adding another product.',
]

const faqs = [
  {
    question: 'What is the best supplement for sleep?',
    answer:
      'There is no single best supplement for everyone. Magnesium glycinate is a reasonable first comparison for nighttime tension and sleep-quality support, melatonin fits circadian timing problems, and L-theanine fits stress or racing thoughts.',
  },
  {
    question: 'Is magnesium or melatonin better for sleep?',
    answer:
      'Magnesium and melatonin solve different problems. Magnesium is usually a better fit for tension, relaxation, and longer-term sleep-quality support. Melatonin is a timing signal and is usually a better fit for jet lag, delayed sleep phase, or schedule shifts.',
  },
  {
    question: 'Can you take magnesium and melatonin together?',
    answer:
      'Some adults use them together, but it is better to test one at a time first. Combining products makes it harder to identify grogginess, GI effects, vivid dreams, or timing problems. Medication use, pregnancy, kidney disease, and psychiatric conditions change the risk picture.',
  },
  {
    question: 'What sleep supplement is least likely to cause grogginess?',
    answer:
      'L-theanine and glycine are usually less sedating than valerian or high-dose melatonin. Individual response still varies, so start low, avoid alcohol, and reassess alertness the next morning.',
  },
  {
    question: 'Are sleep supplements safe long-term?',
    answer:
      'Long-term safety depends on the supplement, dose, medical history, and medications. Persistent insomnia, sleep apnea symptoms, severe daytime sleepiness, or escalating supplement use should be discussed with a clinician rather than managed by adding more sleep aids.',
  },
  {
    question: 'What should I try first if stress keeps me awake?',
    answer:
      'If stress or racing thoughts are the main issue, L-theanine is a reasonable first comparison because it is calming without being a heavy sedative. Magnesium glycinate may fit better when physical tension or low magnesium intake overlaps.',
  },
]

const relatedLinks = [
  { href: '/goals/sleep', label: 'Sleep goal guide', note: 'Ranked decision support by sleep problem.' },
  { href: '/articles/best-herbs-for-sleep', label: 'Best herbs for sleep', note: 'Herbal options and traditional sleep support.' },
  { href: '/articles/magnesium-types-for-sleep', label: 'Magnesium types for sleep', note: 'Glycinate, citrate, threonate, and label details.' },
  { href: '/articles/sleep-stack-guide', label: 'Sleep stack guide', note: 'How to think about combining options cautiously.' },
  { href: '/compare/sleep-herbs-vs-melatonin', label: 'Sleep herbs vs melatonin', note: 'Timing signal versus calming support.' },
  { href: '/guides/magnesium-vs-melatonin', label: 'Magnesium vs melatonin', note: 'Direct comparison for two popular options.' },
  { href: '/methodology', label: 'Methodology', note: 'How evidence and safety are reviewed.' },
  { href: '/disclaimer', label: 'Medical disclaimer', note: 'Educational use and clinician guidance.' },
]

function getProductPicks(): RecommendationProduct[] {
  return ['magnesium', 'melatonin', 'l-theanine', 'glycine', 'valerian']
    .map((slug) => getRevenueProductSet(slug)?.products.find((product) => product.slot === 'overall'))
    .filter((product): product is RecommendationProduct => Boolean(product))
}

function buildSleepSchemaGraph() {
  const canonical = `${SITE_URL}${PATH}/`
  const breadcrumbId = `${canonical}#breadcrumb`
  const itemListId = `${canonical}#item-list`
  const faqId = `${canonical}#faq`
  const webpageId = `${canonical}#webpage`

  const page = {
    ...collectionPageJsonLd({
      title: TITLE,
      description: DESCRIPTION,
      path: PATH,
      itemListId,
      breadcrumbId,
    }),
    '@id': webpageId,
    '@type': ['CollectionPage', 'WebPage'],
    mainEntityOfPage: canonical,
    hasPart: { '@id': faqId },
  }

  const breadcrumb = {
    ...breadcrumbJsonLd(
      [
        { name: 'Home', url: `${SITE_URL}/` },
        { name: 'Supplement Guides', url: `${SITE_URL}/guides/` },
        { name: TITLE, url: canonical },
      ],
      { id: breadcrumbId },
    ),
    '@id': breadcrumbId,
  }

  const itemList = {
    ...itemListJsonLd({
      id: itemListId,
      name: 'Ranked sleep supplements',
      path: PATH,
      items: supplements.map((item) => ({
        name: item.name,
        url: toAbsoluteUrl(item.href),
      })),
    }),
    isPartOf: { '@id': webpageId },
  }

  const faq = faqPageJsonLd({ pagePath: PATH, questions: faqs })
  const faqNode = faq ? { ...faq, '@id': faqId, isPartOf: { '@id': webpageId } } : null

  return buildSchemaGraph([page, breadcrumb, itemList, faqNode])
}

export default function BestSupplementsForSleepPage() {
  const productPicks = getProductPicks()
  const schemaGraph = buildSleepSchemaGraph()

  return (
    <main className="container-page space-y-8 py-8 sm:py-10">
      <SchemaGraphScript graph={schemaGraph} />

      <nav className="flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-ink">Guides</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{TITLE}</span>
      </nav>

      <section className="hero-shell rounded-[1.5rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="max-w-4xl">
          <p className="eyebrow-label">Sleep pillar guide</p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Best Supplements for Sleep
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-[#46574d] sm:text-lg">
            Compare options by sleep problem, timing, evidence context, grogginess risk, and safety
            before choosing a product or building a stack.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="#comparison-table"
              className="rounded-full bg-brand-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-800"
            >
              Compare supplements
            </a>
            <Link
              href="/goals/sleep"
              className="rounded-full border border-brand-900/10 bg-white/80 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-brand-700/30"
            >
              Open sleep goal guide
            </Link>
          </div>
        </div>
      </section>

      <section className="card-premium p-5 sm:p-6" aria-labelledby="quick-answer">
        <p className="eyebrow-label">Quick answer</p>
        <h2 id="quick-answer" className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Best fit by sleep problem
        </h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickFits.map((item) => (
            <div key={item.problem} className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4">
              <h3 className="text-sm font-bold text-ink">{item.problem}</h3>
              <p className="mt-2 text-sm font-semibold text-brand-800">{item.fit}</p>
              <p className="mt-2 text-sm leading-6 text-[#46574d]">{item.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="ranked-supplements">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Ranked options</p>
          <h2 id="ranked-supplements" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Sleep supplements worth comparing first
          </h2>
          <p className="mt-3 text-sm leading-7 text-[#46574d]">
            Rankings favor practical fit, human evidence, safety, and clear product-quality criteria.
            They are not promises that a supplement will treat insomnia or replace medical care.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {supplements.map((item) => (
            <article key={item.name} className="card-premium p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow-label">#{item.rank}</p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{item.name}</h3>
                </div>
                <Link href={item.href} className="chip-readable whitespace-nowrap">
                  Read next
                </Link>
              </div>
              <dl className="mt-5 grid gap-4 text-sm leading-6 text-[#46574d]">
                <div>
                  <dt className="font-bold text-ink">Best for</dt>
                  <dd className="mt-1">{item.bestFor}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Why people use it</dt>
                  <dd className="mt-1">{item.why}</dd>
                </div>
                <div>
                  <dt className="font-bold text-ink">Evidence context</dt>
                  <dd className="mt-1">{item.evidence}</dd>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="font-bold text-ink">Typical timing</dt>
                    <dd className="mt-1">{item.timing}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-ink">Main downside</dt>
                    <dd className="mt-1">{item.downside}</dd>
                  </div>
                </div>
                <div>
                  <dt className="font-bold text-ink">Safety cautions</dt>
                  <dd className="mt-1">{item.safety}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section id="comparison-table" className="card-premium p-5 sm:p-6" aria-labelledby="comparison-heading">
        <p className="eyebrow-label">Comparison table</p>
        <h2 id="comparison-heading" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Compare sleep supplements side by side
        </h2>
        <div className="mt-5">
          <ResponsiveTable label="Sleep supplement comparison table">
            <table className="min-w-[960px] w-full text-left text-sm">
              <thead className="bg-brand-50/80">
                <tr className="border-b border-brand-900/10">
                  {['Supplement', 'Best fit', 'Timing', 'Evidence context', 'Grogginess risk', 'Main safety caution', 'Read next'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-900">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10 bg-white">
                {supplements.map((item) => (
                  <tr key={item.name} className="align-top">
                    <td className="px-4 py-4 font-semibold text-ink">{item.name}</td>
                    <td className="px-4 py-4 text-[#46574d]">{item.bestFor}</td>
                    <td className="px-4 py-4 text-[#46574d]">{item.timing}</td>
                    <td className="px-4 py-4 text-[#46574d]">{item.evidence}</td>
                    <td className="px-4 py-4 text-[#46574d]">{item.grogginess}</td>
                    <td className="px-4 py-4 text-[#46574d]">{item.safety}</td>
                    <td className="px-4 py-4">
                      <Link href={item.href} className="font-semibold text-brand-700 hover:text-brand-800 hover:underline">
                        {item.readNext}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.7fr)]">
        <section className="card-premium p-5 sm:p-6" aria-labelledby="ranking-method">
          <p className="eyebrow-label">Method</p>
          <h2 id="ranking-method" className="mt-2 text-2xl font-semibold tracking-tight text-ink">
            How we ranked these
          </h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-[#46574d] sm:grid-cols-2">
            {rankingCriteria.map((item) => (
              <li key={item} className="rounded-[0.85rem] border border-brand-900/10 bg-brand-50/50 p-4">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm leading-7 text-[#46574d]">
            See the full <Link href="/methodology" className="font-semibold text-brand-700 hover:underline">methodology</Link> for
            how evidence, safety, and product-quality signals are handled across the site.
          </p>
        </section>

        <section className="rounded-[1rem] border border-amber-900/15 bg-amber-50/80 p-5 sm:p-6" aria-labelledby="buyer-checklist">
          <p className="eyebrow-label text-amber-800">Buyer checklist</p>
          <h2 id="buyer-checklist" className="mt-2 text-2xl font-semibold tracking-tight text-amber-950">
            Before you buy
          </h2>
          <ul className="mt-4 space-y-3 text-sm leading-6 text-amber-950/90">
            {buyerChecklist.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-700" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-[1rem] border border-red-900/15 bg-red-50/80 p-5 sm:p-6" aria-labelledby="safety-first">
        <p className="eyebrow-label text-red-800">Safety first</p>
        <h2 id="safety-first" className="mt-2 text-3xl font-semibold tracking-tight text-red-950">
          Sleep aids deserve extra caution
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-red-950/85">
          Anything that changes sleep, sedation, alertness, or circadian timing can interact with
          medications and next-day performance. Use this page for education, not diagnosis or treatment.
        </p>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {safetyCautions.map((item) => (
            <div key={item} className="rounded-[0.85rem] border border-red-900/10 bg-white/70 p-4 text-sm leading-6 text-red-950/85">
              {item}
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm leading-7 text-red-950/85">
          Review the <Link href="/disclaimer" className="font-semibold text-red-900 hover:underline">medical disclaimer</Link> and
          involve a qualified clinician for persistent insomnia, sleep apnea symptoms, complex medication
          use, pregnancy, breastfeeding, children, or chronic disease.
        </p>
      </section>

      {productPicks.length > 0 ? (
        <div className="space-y-4">
          <AffiliateDisclosure />
          <RecommendationSection
            title="Quality-focused sleep supplement picks"
            description="Restrained affiliate picks for common sleep-support categories. Use these as sourcing starting points and compare form, dose, testing, medication interactions, and next-day alertness before buying."
            products={productPicks}
          />
        </div>
      ) : null}

      <section className="card-premium p-5 sm:p-6" aria-labelledby="faq">
        <p className="eyebrow-label">FAQ</p>
        <h2 id="faq" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
          Common questions
        </h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {faqs.map((faq) => (
            <div key={faq.question} className="rounded-[0.85rem] border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-[#46574d]">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-5 sm:p-6" aria-labelledby="keep-reading">
        <p className="eyebrow-label">Keep reading</p>
        <h2 id="keep-reading" className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Sleep cluster links
        </h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {relatedLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 transition hover:border-brand-700/30"
            >
              <span className="font-semibold text-ink">{item.label}</span>
              <span className="mt-2 block text-xs leading-5 text-[#46574d]">{item.note}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}

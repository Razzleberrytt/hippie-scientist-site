import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const PAGE_URL = `${SITE_URL}/guides/sleep/best-supplements-for-sleep`

export const metadata: Metadata = {
  title: 'Best Sleep Supplements by Problem: Evidence, Doses & Safety',
  description:
    'Compare magnesium glycinate, melatonin, L-theanine, ashwagandha, valerian, and passionflower by sleep problem, evidence strength, dose, and safety.',
  alternates: { canonical: '/guides/sleep/best-supplements-for-sleep/' },
  openGraph: {
    title: 'Best Sleep Supplements by Problem: Evidence, Doses & Safety',
    description:
      'A practical, evidence-graded guide to choosing a sleep supplement based on the actual bottleneck: timing, racing thoughts, tension, or stress.',
    url: '/guides/sleep/best-supplements-for-sleep/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const SLEEP_SUPPLEMENTS = [
  {
    name: 'Melatonin',
    bestFor: 'Jet lag, delayed sleep timing, shift-work schedule changes, and some sleep-onset problems',
    evidence: 'Strongest for circadian-timing problems; more modest for general insomnia',
    dose: 'Often 0.5–1 mg for circadian use; some people use up to 3 mg for sleep onset',
    safety: 'Can cause next-day sleepiness, vivid dreams, headache, or dizziness. Timing matters as much as dose.',
    href: '/compounds/melatonin/',
    badge: 'Best for timing',
  },
  {
    name: 'Magnesium Glycinate',
    bestFor: 'Low magnesium intake, muscle tension, restlessness, or sleep problems that overlap with deficiency risk',
    evidence: 'Mixed overall; the clearest signal is in older adults or people with low magnesium status',
    dose: 'Use the elemental-magnesium amount on the label; common supplemental totals are 100–300 mg in the evening',
    safety: 'May cause diarrhea or stomach upset. People with significant kidney disease should get clinical guidance first.',
    href: '/compounds/magnesium-glycinate/',
    badge: 'Conditional fit',
  },
  {
    name: 'L-Theanine',
    bestFor: 'Racing thoughts, stress-related arousal, and people who want relaxation without a heavy sedative effect',
    evidence: 'Better supported for relaxation and stress physiology than for treating insomnia by itself',
    dose: 'Common study and product doses are 100–200 mg, usually 30–60 minutes before bed',
    safety: 'Usually well tolerated in short studies, but pregnancy, breastfeeding, medication use, and long-term use remain less certain.',
    href: '/guides/herbs/l-theanine/',
    badge: 'Best for arousal',
  },
  {
    name: 'Ashwagandha',
    bestFor: 'Stress-linked sleep problems when daytime stress and poor sleep reinforce each other',
    evidence: 'Moderate evidence for some standardized extracts in stressed adults; results do not apply equally to every product',
    dose: 'Often 300–600 mg daily for standardized extracts, depending on the formulation',
    safety: 'Can cause GI effects or drowsiness. Rare liver injury has been reported; thyroid, pregnancy, and medication concerns deserve caution.',
    href: '/herbs/ashwagandha/',
    badge: 'Best for stress',
  },
  {
    name: 'Valerian Root',
    bestFor: 'People seeking a traditional sedating herb who understand the evidence is inconsistent',
    evidence: 'Mixed trial and review results; preparation, dose, and product chemistry vary substantially',
    dose: 'Common extract doses are 300–600 mg before bed, but product standardization differs',
    safety: 'May impair alertness or add to alcohol and sedative effects. Avoid driving until you know your response.',
    href: '/herbs/valerian/',
    badge: 'Mixed evidence',
  },
  {
    name: 'Passionflower',
    bestFor: 'Mild anxiety-related sleep disruption or a gentler herbal option',
    evidence: 'Preliminary human evidence; not as well established as melatonin for circadian use',
    dose: 'Product-specific extracts vary; follow the studied or labeled preparation rather than assuming equivalence',
    safety: 'May cause drowsiness and could add to other sedating substances. Pregnancy safety is uncertain.',
    href: '/guides/passionflower/',
    badge: 'Preliminary',
  },
] as const

const BUYING_CHECKLIST = [
  ['Match the problem', 'Do not buy a “strong sleep” product before deciding whether your issue is timing, mental arousal, tension, or persistent insomnia.'],
  ['Check the active dose', 'Compare the actual active amount, not just capsule count, blend weight, or front-label marketing.'],
  ['Prefer simpler formulas', 'Single-ingredient products make it easier to judge benefit, side effects, and value before trying a stack.'],
  ['Look for verification', 'Independent identity, potency, and contamination testing is more useful than vague “premium” language.'],
  ['Avoid automatic megadosing', 'Higher doses can increase side effects without improving the problem you are trying to solve.'],
] as const

const HEADINGS: Heading[] = [
  { id: 'quick-answer', text: 'Quick answer', level: 2 },
  { id: 'match', text: 'Match the supplement to the sleep problem', level: 2 },
  { id: 'profiles', text: 'Evidence profiles', level: 2 },
  { id: 'buying', text: 'How to choose a product', level: 2 },
  { id: 'stacking', text: 'Should you combine supplements?', level: 2 },
  { id: 'red-flags', text: 'When supplements are the wrong next step', level: 2 },
  { id: 'references', text: 'References', level: 2 },
]

const REFERENCES = [
  ['AASM guideline for pharmacologic treatment of chronic insomnia', 'https://pubmed.ncbi.nlm.nih.gov/27998379/'],
  ['AASM circadian rhythm sleep-wake disorder guideline', 'https://pubmed.ncbi.nlm.nih.gov/26414986/'],
  ['Melatonin for preventing and treating jet lag', 'https://pubmed.ncbi.nlm.nih.gov/12076414/'],
  ['Magnesium supplementation trial in older adults with insomnia', 'https://pubmed.ncbi.nlm.nih.gov/23853635/'],
  ['L-theanine and stress-related symptoms in healthy adults', 'https://pubmed.ncbi.nlm.nih.gov/31623400/'],
  ['Valerian for sleep: systematic review and meta-analysis', 'https://pubmed.ncbi.nlm.nih.gov/17145239/'],
] as const

export default function BestSupplementsForSleepPage() {
  const magnesiumProducts = getRevenueProductSet('magnesium')
  const toc = <TableOfContents headings={HEADINGS} />

  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Sleep Supplements by Problem: Evidence, Doses & Safety"
        description="Compare common sleep supplements by the problem they fit best, evidence strength, typical dose, safety limits, and product-selection criteria."
        datePublished="2026-06-16"
        dateModified="2026-07-15"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Sleep Supplements', href: '/guides/sleep/best-supplements-for-sleep' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
        <div className="space-y-14">
          <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
            <p className="eyebrow-label">Evidence-based sleep guide</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Best Sleep Supplements by Problem
            </h1>
            <p className="mt-2 text-xs text-muted">
              Written and edited by{' '}
              <Link href="/info/author/" rel="author" className="font-medium text-brand-700 hover:underline">
                Willie B. Randolph III
              </Link>{' '}
              · Last updated July 15, 2026
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
              The best sleep supplement is not the strongest one. It is the one that matches the reason you are not sleeping.
              Melatonin fits circadian timing. L-theanine fits mental arousal. Magnesium is more plausible when low intake,
              tension, or deficiency risk is part of the picture. Persistent insomnia needs a different conversation entirely.
            </p>

            <figure className="mt-6">
              <div className="overflow-hidden rounded-2xl border border-brand-900/10 bg-white shadow-sm">
                <Image
                  src="/images/guides/best-supplements-for-sleep.jpg"
                  alt="An assortment of sleep supplements and calming herbs on a bedside surface"
                  width={1536}
                  height={1024}
                  priority
                  className="h-auto w-full"
                />
              </div>
            </figure>
          </section>

          <section id="quick-answer" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-brand-50/45 p-6">
            <p className="eyebrow-label">Quick answer</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">What should you choose first?</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ['Shifted schedule or jet lag', 'Melatonin', '/compounds/melatonin/'],
                ['Racing thoughts at bedtime', 'L-theanine', '/guides/herbs/l-theanine/'],
                ['Tension plus low-magnesium risk', 'Magnesium glycinate', '/compounds/magnesium-glycinate/'],
                ['Stress-linked poor sleep', 'Ashwagandha', '/herbs/ashwagandha/'],
                ['Traditional sedating herb', 'Valerian, with caution', '/herbs/valerian/'],
                ['Insomnia lasting months', 'Clinical evaluation', '/education/insomnia/'],
              ].map(([problem, answer, href]) => (
                <div key={problem} className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">Best fit</p>
                  <p className="mt-1 text-sm font-semibold text-ink">{problem}</p>
                  <Link href={href} className="mt-2 block text-sm font-semibold text-brand-800 hover:underline">
                    {answer} →
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section id="match" className="scroll-mt-20 space-y-4">
            <p className="eyebrow-label">Decision rule</p>
            <h2 className="text-2xl font-semibold tracking-tight text-ink">Match the supplement to the sleep problem</h2>
            <p className="max-w-3xl text-sm leading-7 text-muted">
              A supplement can look ineffective when the real problem is a mismatch. A circadian signal will not necessarily fix
              stress, sleep apnea, restless legs, medication effects, pain, or a severely inconsistent schedule.
            </p>
          </section>

          <section id="profiles" className="scroll-mt-20 space-y-5">
            <div>
              <p className="eyebrow-label">Evidence profiles</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Common sleep supplements compared</h2>
            </div>
            <div className="space-y-5">
              {SLEEP_SUPPLEMENTS.map((supplement) => (
                <article key={supplement.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={supplement.href} className="text-xl font-semibold text-brand-800 hover:underline">
                      {supplement.name}
                    </Link>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-800">
                      {supplement.badge}
                    </span>
                  </div>
                  <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="font-semibold text-ink">Best for</dt>
                      <dd className="mt-1 leading-6 text-muted">{supplement.bestFor}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Evidence</dt>
                      <dd className="mt-1 leading-6 text-muted">{supplement.evidence}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Typical dose context</dt>
                      <dd className="mt-1 leading-6 text-muted">{supplement.dose}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-ink">Safety boundary</dt>
                      <dd className="mt-1 leading-6 text-muted">{supplement.safety}</dd>
                    </div>
                  </dl>
                  <Link href={supplement.href} className="mt-5 inline-block text-sm font-semibold text-brand-700 hover:underline">
                    Read the full profile →
                  </Link>
                </article>
              ))}
            </div>
          </section>

          <section id="buying" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">Buying guide</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">How to choose a sleep supplement product</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {BUYING_CHECKLIST.map(([title, detail]) => (
                <div key={title} className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4">
                  <h3 className="text-sm font-semibold text-ink">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section id="stacking" className="scroll-mt-20 rounded-[1.65rem] border border-amber-200 bg-amber-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-amber-950">Should you combine sleep supplements?</h2>
            <p className="mt-3 text-sm leading-7 text-amber-900">
              Start with one ingredient. That is the only clean way to learn whether it helps and whether it causes side effects.
              Combining sedating products, alcohol, antihistamines, or prescription sleep medicines can increase impairment and
              makes the result harder to interpret. A plausible mechanism is not the same thing as a proven or universally safe stack.
            </p>
          </section>

          <section id="red-flags" className="scroll-mt-20 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6">
            <h2 className="text-2xl font-semibold tracking-tight text-red-950">When supplements are the wrong next step</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-red-900">
              <li>• Loud snoring, gasping, morning headaches, or severe daytime sleepiness.</li>
              <li>• An urge to move the legs, especially at night.</li>
              <li>• Insomnia lasting for months or causing major daytime impairment.</li>
              <li>• New sleep problems after starting or changing a medication.</li>
              <li>• Pregnancy, breastfeeding, significant liver or kidney disease, or use of multiple sedating medicines.</li>
            </ul>
          </section>

          {magnesiumProducts && <RecommendationSection products={magnesiumProducts.products} />}

          <section id="references" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
            <p className="eyebrow-label">References</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Evidence sources used for this guide</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6 sm:grid-cols-2">
              {REFERENCES.map(([label, href]) => (
                <li key={href} className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4">
                  <a href={href} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-700 hover:underline">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
            <Link href="/guides/sleep/magnesium-vs-melatonin/" className="hover:text-brand-800">Magnesium vs Melatonin →</Link>
            <Link href="/guides/sleep/magnesium-for-sleep/" className="hover:text-brand-800">Magnesium for Sleep →</Link>
            <Link href="/guides/herbs/l-theanine/" className="hover:text-brand-800">L-Theanine for Sleep →</Link>
            <Link href="/guides/" className="hover:text-brand-800">All Guides →</Link>
          </nav>
        </div>
      </ArticleLayout>
    </>
  )
}

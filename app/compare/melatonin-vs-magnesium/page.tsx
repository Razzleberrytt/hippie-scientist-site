import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import { SITE_URL } from '../../../src/lib/seo'
import { getItemBySlug, buildFAQs } from '@/lib/compare'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import CompareDecisionWidget from '@/components/compare/CompareDecisionWidget'
import CompareMechanisms from '@/components/compare/CompareMechanisms'
import CompareEvidenceMatrix from '@/components/compare/CompareEvidenceMatrix'
import CompareSafety from '@/components/compare/CompareSafety'
import CompareDosing from '@/components/compare/CompareDosing'
import CompareSynergy from '@/components/compare/CompareSynergy'
import CompareFAQ from '@/components/compare/CompareFAQ'

const SLUG = 'melatonin-vs-magnesium'
const CANONICAL = `${SITE_URL}/compare/${SLUG}/`

export const metadata: Metadata = {
  ...buildPageMetadata({
    title: 'Melatonin vs Magnesium: Which Is Better for Sleep?',
    description:
      'Melatonin is usually more direct for falling asleep and sleep timing, while magnesium may better support relaxation, tension, and sleep quality. Here\'s how to choose.',
    path: `/compare/${SLUG}/`,
    openGraphType: 'article',
  }),
  alternates: { canonical: CANONICAL },
}

export default function MelatoninVsMagnesiumPage() {
  const item1 = getItemBySlug('melatonin')
  const item2 = getItemBySlug('magnesium')

  if (!item1 || !item2) return null

  const faqs = buildFAQs(item1, item2)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 space-y-12">
      <AuthorityJsonLd
        title="Melatonin vs Magnesium: Which Is Better for Sleep?"
        description="Melatonin is usually more direct for falling asleep and sleep timing, while magnesium may better support relaxation, tension, and sleep quality."
        url={CANONICAL}
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: `${SITE_URL}/` },
          { name: 'Compare', url: `${SITE_URL}/compare/` },
          { name: 'Melatonin vs Magnesium', url: CANONICAL },
        ]}
        faqItems={faqs}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Compare', href: '/compare' },
          { label: 'Melatonin vs Magnesium' },
        ]}
      />

      {/* Hero */}
      <section className="space-y-5 max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Sleep Comparison</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink leading-tight sm:text-5xl">
          Melatonin vs Magnesium: Which Should You Take for Sleep?
        </h1>
        <p className="text-base leading-relaxed text-muted">
          Both are widely used at bedtime, but they solve different problems.
          Melatonin is a circadian timing hormone — it shifts when you feel sleepy.
          Magnesium is a mineral that supports muscle relaxation and nervous-system tone.
          The right choice depends on what your sleep problem actually is.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link href="/compounds/melatonin" className="chip-readable text-xs font-semibold">
            Melatonin profile →
          </Link>
          <Link href="/compounds/magnesium-glycinate" className="chip-readable text-xs font-semibold">
            Magnesium glycinate profile →
          </Link>
        </div>
      </section>

      {/* Short Answer Box */}
      <section
        aria-label="Quick decision guide"
        className="rounded-2xl border border-brand-200 bg-brand-50 px-6 py-5 space-y-4 max-w-3xl"
      >
        <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Quick Answer</p>
        <ul className="space-y-3">
          <li className="flex gap-3 text-sm leading-relaxed text-ink">
            <span className="mt-0.5 shrink-0 font-bold text-brand-700">→</span>
            <span>
              <strong>Choose melatonin</strong> if your main issue is falling asleep, jet lag, or shifting
              your sleep schedule.
            </span>
          </li>
          <li className="flex gap-3 text-sm leading-relaxed text-ink">
            <span className="mt-0.5 shrink-0 font-bold text-brand-700">→</span>
            <span>
              <strong>Choose magnesium</strong> if your main issue is stress, muscle tension, restlessness,
              or poor sleep quality.
            </span>
          </li>
          <li className="flex gap-3 text-sm leading-relaxed text-ink">
            <span className="mt-0.5 shrink-0 font-bold text-brand-700">→</span>
            <span>
              <strong>Some people use both</strong>, but timing, dose, medications, and side effects matter.
            </span>
          </li>
        </ul>
        <p className="text-xs text-muted">
          Not medical advice. Consult a healthcare professional before starting any supplement.
        </p>
      </section>

      {/* Comparison Table */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Side-by-Side</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            How They Compare for Sleep
          </h2>
          <p className="mt-1 text-sm text-muted">
            A practical breakdown of the key differences for sleep use.
          </p>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/80">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10 bg-paper-50">
                <th
                  scope="col"
                  className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700 w-1/3"
                >
                  Factor
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
                >
                  Melatonin
                </th>
                <th
                  scope="col"
                  className="py-3 px-4 text-left text-xs font-bold uppercase tracking-[0.13em] text-brand-700"
                >
                  Magnesium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-900/10 text-muted">
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  Best for
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Falling asleep, jet lag, shifting sleep timing
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Relaxation, muscle tension, sleep quality
                </td>
              </tr>
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  Main sleep use
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Directly shifts when you feel sleepy
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Supports nervous-system wind-down
                </td>
              </tr>
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  How it works
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Activates melatonin receptors in the brain&apos;s circadian clock
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Blocks excitatory NMDA receptors; supports GABA and glycine tone
                </td>
              </tr>
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  When to take it
                </td>
                <td className="py-3 px-4 leading-relaxed">30–60 minutes before desired bedtime</td>
                <td className="py-3 px-4 leading-relaxed">With dinner or 1 hour before bed</td>
              </tr>
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  Main downside
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Grogginess or vivid dreams, especially at high doses
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Loose stool at high doses; avoid in kidney disease
                </td>
              </tr>
              <tr className="hover:bg-paper-50 transition-colors duration-150 align-top">
                <td className="py-3 px-4 text-xs font-bold uppercase tracking-[0.11em] text-brand-700">
                  Beginner choice
                </td>
                <td className="py-3 px-4 leading-relaxed">
                  Yes — but start low (0.3–1 mg, not the typical 5–10 mg retail dose)
                </td>
                <td className="py-3 px-4 font-semibold text-ink leading-relaxed">
                  Gentler overall; magnesium glycinate is easiest to tolerate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Decision Widget */}
      <CompareDecisionWidget item1={item1} item2={item2} isHarmReduction={false} />

      {/* Mechanism Detail */}
      <CompareMechanisms item1={item1} item2={item2} />

      {/* Evidence */}
      <CompareEvidenceMatrix item1={item1} item2={item2} />

      {/* Synergy */}
      <CompareSynergy item1={item1} item2={item2} />

      {/* Safety */}
      <CompareSafety item1={item1} item2={item2} />

      {/* Dosing */}
      <CompareDosing item1={item1} item2={item2} />

      {/* Internal Links */}
      <section className="space-y-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Explore Further</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">Related Guides</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/compounds/melatonin"
            className="card-premium p-4 space-y-1 block hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Compound</p>
            <p className="font-semibold text-ink">Melatonin →</p>
            <p className="text-xs text-muted">Evidence, dosing, and safety details</p>
          </Link>
          <Link
            href="/compounds/magnesium-glycinate"
            className="card-premium p-4 space-y-1 block hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Compound</p>
            <p className="font-semibold text-ink">Magnesium Glycinate →</p>
            <p className="text-xs text-muted">The most common form for sleep support</p>
          </Link>
          <Link
            href="/goals/sleep"
            className="card-premium p-4 space-y-1 block hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Goal Guide</p>
            <p className="font-semibold text-ink">Sleep Support Decisions →</p>
            <p className="text-xs text-muted">Compare all sleep supplement options</p>
          </Link>
          <Link
            href="/best-supplements-for-sleep"
            className="card-premium p-4 space-y-1 block hover:shadow-md transition-shadow"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-brand-700">Ranked List</p>
            <p className="font-semibold text-ink">Best Supplements for Sleep →</p>
            <p className="text-xs text-muted">Ranked by evidence, timing, and safety</p>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <CompareFAQ faqs={faqs} />
    </div>
  )
}

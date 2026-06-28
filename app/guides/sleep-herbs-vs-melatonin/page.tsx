import type { Metadata } from 'next'
import Link from 'next/link'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

export const metadata: Metadata = {
  title: 'Sleep Herbs vs Melatonin',
  description: 'Understand the difference between melatonin (circadian timing) and calming sleep herbs (Magnesium, L-Theanine, Valerian) for sleep routines.',
  alternates: { canonical: '/guides/sleep-herbs-vs-melatonin/' },
  openGraph: {
    title: 'Sleep Herbs vs Melatonin',
    description: 'Understand the difference between melatonin (circadian timing) and calming sleep herbs (Magnesium, L-Theanine, Valerian) for sleep routines.',
    url: '/guides/sleep-herbs-vs-melatonin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sleep Herbs vs Melatonin',
    description: 'Compare melatonin, magnesium, L-Theanine, and valerian for sleep support.',
  },
}

const HEADINGS: Heading[] = [
  { id: 'comparison', text: 'Comparing Roles, Onsets, and Precautions', level: 2 },
  { id: 'choice', text: 'Which Sleep Tool Fits Your Bedtime Need?', level: 2 },
  { id: 'evidence', text: 'Evidence-Driven Precaution', level: 2 },
]

export default function SleepHerbsVsMelatoninPage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const valerianProducts = getRevenueProductSet('valerian')

  const options = [
    {
      name: 'Melatonin',
      type: 'Circadian Hormone',
      role: 'Circadian Timing Signal',
      onset: '30 to 60 minutes',
      description: 'Signals to the brain that it is night. Helps align the sleep-wake schedule (e.g. for jet lag or shift work). Does not relax muscles or reduce active anxiety.',
      cautions: 'Avoid high doses (keep to 0.3mg - 1mg). May cause daytime grogginess or vivid dreams.',
      href: '/guides/magnesium-vs-melatonin',
    },
    {
      name: 'Magnesium',
      type: 'Essential Mineral',
      role: 'Neuromuscular Relaxation',
      onset: 'Days to weeks (builds up)',
      description: 'Modulates GABA receptors and acts as an NMDA receptor antagonist to relax physical muscle tissue, lower heart rate, and support wind-down.',
      cautions: 'Avoid excessive intake to prevent loose stools. Renal impairment requires caution.',
      href: '/compounds/magnesium',
    },
    {
      name: 'L-Theanine',
      type: 'Amino Acid',
      role: 'Mental Quieting / Focus Buffer',
      onset: '30 to 90 minutes',
      description: 'Crosses the blood-brain barrier to increase alpha brain waves (associated with relaxed alertness) and modulates glutamate to quiet a racing mind at bedtime.',
      cautions: 'Very low risk. Avoid if stacking multiple high-strength central depressants.',
      href: '/compounds/l-theanine',
    },
    {
      name: 'Valerian Root (Valeriana officinalis)',
      type: 'Botanical Herb',
      role: 'Mild Sedative Support',
      onset: '30 to 60 minutes',
      description: 'Increases GABA availability in the synaptic cleft by inhibiting its breakdown and reuptake. Traditionally used for situational insomnia and nervous sleep distress.',
      cautions: 'Can cause mild morning drowsiness. Evaluate potential interactions with pharmaceutical sleep aids.',
      href: '/herbs/valerian',
    },
  ]

  return (
    <ArticleLayout toc={toc} zone="supplement">
    <div className="space-y-8">
      <AffiliateDisclosure variant="compact" className="mb-6" />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">Comparison Guide</p>
        <h1 className="heading-premium mt-3 text-ink">
          Sleep Herbs vs Melatonin
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Choosing between melatonin and botanical options depends on the source of your sleep issues. Melatonin acts as a timing signal to adjust when you fall asleep, while relaxing herbs and minerals target physical tension and mental chatter.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/compare/sleep-herbs-vs-melatonin" className="text-brand-700 hover:text-brand-800 hover:underline">
            Full Evidence Comparison →
          </Link>
          <Link href="/compare/l-theanine-vs-magnesium" className="text-brand-700 hover:text-brand-800 hover:underline">
            L-Theanine vs Magnesium →
          </Link>
          <Link href="/guides/magnesium-vs-melatonin" className="text-brand-700 hover:text-brand-800 hover:underline">
            Magnesium vs Melatonin Guide →
          </Link>
          <Link href="/best-supplements-for-sleep/" className="text-brand-700 hover:text-brand-800 hover:underline">
            Browse Sleep Supplements →
          </Link>
        </div>
      </section>

      {/* Comparison Grid */}
      <section id="comparison" className="scroll-mt-20 space-y-4">
        <h2 className="text-2xl font-semibold text-ink">Comparing Roles, Onsets, and Precautions</h2>
        <p className="text-sm text-muted">A structured breakdown of hormone-based circadian shifting versus botanical relaxation tools.</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {options.map((opt) => (
            <article key={opt.name} className="card-premium p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold text-ink">{opt.name}</h3>
                  <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-800 border border-brand-100/50">
                    {opt.type}
                  </span>
                </div>
                <p className="mt-2 text-xs font-semibold text-brand-700">Primary Role: {opt.role}</p>
                <p className="mt-2 text-xs text-muted leading-relaxed">{opt.description}</p>
                <div className="mt-3 pt-3 border-t border-brand-900/5 text-xs text-muted space-y-1">
                  <p><strong>Onset:</strong> {opt.onset}</p>
                  <p className="text-[#5f4a24]"><strong>Cautions:</strong> {opt.cautions}</p>
                </div>
              </div>
              <Link
                href={opt.href}
                className="inline-flex items-center justify-between text-xs font-semibold text-brand-700 hover:text-brand-800 hover:underline"
              >
                <span>Explore research and dosing</span>
                <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* Sleep Hygiene Context */}
      <section id="choice" className="scroll-mt-20 rounded-2xl border border-brand-900/10 bg-white/90 p-5 sm:p-6 space-y-4 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Which Sleep Tool Fits Your Bedtime Need?</h2>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">Difficulty Falling Asleep (Shifted Schedule)</h3>
            <p className="text-muted text-xs leading-relaxed">
              If your body clock is out of sync (e.g. from travel or screen exposure), low-dose <strong>Melatonin</strong> can help shift your circadian rhythm.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">Racing Thoughts & Bedroom Worry Loops</h3>
            <p className="text-muted text-xs leading-relaxed">
              If your mind is over-activated at night, <strong>L-Theanine</strong> supports relaxation without causing heavy next-morning sedation.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-ink">Physical Restlessness & Muscle Tension</h3>
            <p className="text-muted text-xs leading-relaxed">
              If you feel physically tight or struggle to relax your body, daily <strong>Magnesium</strong> supplementation supports systemic wind-down.
            </p>
          </div>
        </div>
      </section>

      {valerianProducts && (
        <RecommendationSection products={valerianProducts.products} />
      )}

      <EmailCapture location="guides-sleep-herbs-vs-melatonin" className="mt-6" />

      {/* Safety Notice */}
      <section id="evidence" className="scroll-mt-20 rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950">
        <h2 className="font-semibold text-amber-950">Evidence-Driven Precaution</h2>
        <p className="mt-2 text-xs">
          Hormones and sedating botanicals interact with your nervous system. Melatonin should be kept at physiological doses (0.3mg to 1mg) to prevent receptor desensitization and grogginess. Botanical options like Valerian or Lemon Balm should be evaluated for potential polypharmacy interactions if you are already taking clinical sleep medications.
        </p>
        <div className="mt-4 flex gap-3">
          <Link href="/compare/" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Side-by-Side Compare Tool →
          </Link>
          <Link href="/safety-checker/" className="text-xs font-bold text-amber-900 hover:text-amber-950 hover:underline">
            Interactive Safety Checker →
          </Link>
        </div>
      </section>
    </div>
    </ArticleLayout>
  )
}

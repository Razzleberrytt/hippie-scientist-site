import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { EnhancedEmailCapture } from '@/components/monetization/EnhancedEmailCapture'
import { RelatedDiscoveryWidget } from '@/components/monetization/RelatedDiscoveryWidget'
import { MoneyPageCTAStack } from '@/components/monetization/MoneyPageCTAStack'
import { RecommendationGrid } from '@/components/monetization/RecommendationGrid'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'
import { TrustMethodologyCallout } from '@/components/monetization/TrustMethodologyCallout'

type SleepHerb = {
  slug: string
  name?: string
  displayName?: string
  evidence_grade?: string
  net_score?: number | string
  primary_effects?: string[] | string
  goal_tags?: string[] | string
  mechanism_summary?: string
  summary?: string
}

const EVIDENCE_WEIGHT: Record<string, number> = { A: 3, B: 2, C: 1 }

const normalizeArray = (value: string[] | string | undefined): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(item => String(item).trim().toLowerCase()).filter(Boolean)
  return value.split(',').map(item => item.trim().toLowerCase()).filter(Boolean)
}

const toScore = (value: number | string | undefined): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : -Infinity
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : -Infinity
  }
  return -Infinity
}

const getEvidenceRank = (grade?: string): number => EVIDENCE_WEIGHT[(grade ?? '').trim().toUpperCase()] ?? 0

const herbLabel = (herb: SleepHerb): string => {
  const preferred = herb.displayName?.trim() || herb.name?.trim()
  if (preferred) return preferred
  return herb.slug.split('-').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
}

const includesSleep = (herb: SleepHerb): boolean => {
  const primaryEffects = normalizeArray(herb.primary_effects)
  const goalTags = normalizeArray(herb.goal_tags)
  return [...primaryEffects, ...goalTags].includes('sleep')
}

export const metadata: Metadata = {
  title: 'Best Herbs for Sleep (Natural Sleep Aids Guide 2026)',
  description:
    'Discover natural sleep aids and herbs for insomnia, relaxation, and better rest. Ranked using evidence, mechanisms, and real-world usage.',
  alternates: { canonical: '/top/sleep' },
}

export default async function TopSleepPage() {
  const herbs = (await getHerbs()) as SleepHerb[]

  const ranked = herbs
    .filter(includesSleep)
    .sort((a, b) => {
      const scoreDiff = toScore(b.net_score) - toScore(a.net_score)
      if (scoreDiff !== 0) return scoreDiff
      return getEvidenceRank(b.evidence_grade) - getEvidenceRank(a.evidence_grade)
    })

  const topThree = ranked.slice(0, 3)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Sleep guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Herbs for Sleep</h1>
        <p className='mt-4 text-muted'>
          These herbs are often discussed as natural sleep aids for insomnia, relaxation, and sleep-quality support.
        </p>
        <p className='mt-3 text-sm text-muted'>
          Quick framing: most options are better understood as "sleep context" tools (wind-down, calm, stress load) rather than direct insomnia treatments.
        </p>
      </section>

      <div className='grid gap-4 lg:grid-cols-[1.1fr_0.9fr]'>
        <TrustMethodologyCallout />
        <SafetyDisclaimerBox compact />
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How to use this ranking responsibly</h2>
        <p className='mt-3 text-sm leading-6 text-muted'>
          This page is an educational comparison starting point. Ranking position reflects dataset signals, not a guarantee that one option will work best for you.
        </p>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Evidence quality and study design vary by herb or compound.</li>
          <li>Safety context matters: medications, health conditions, and pregnancy or nursing status can change fit.</li>
          <li>Individual response varies, so use full profiles and clinical guidance before decisions.</li>
        </ul>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>What herbs help with sleep and insomnia?</h2>
        <p className='mt-3 text-sm text-muted'>
          Natural sleep herbs often support relaxation, reduce stress, or improve sleep onset. Popular examples include valerian, ashwagandha, lemon balm, and calming botanicals.
        </p>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/compare/ashwagandha-vs-rhodiola' className='text-sm font-medium text-emerald-700 hover:underline'>Ashwagandha vs Rhodiola</Link>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/focus' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
          <Link href='/methodology' className='text-sm font-medium text-emerald-700 hover:underline'>Methodology</Link>
          <Link href='/affiliate-disclosure' className='text-sm font-medium text-emerald-700 hover:underline'>Affiliate disclosure</Link>
          <Link href='/free-guide' className='text-sm font-medium text-emerald-700 hover:underline'>Free guide</Link>
        </div>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Beginner decision notes</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>If your issue is a racing mind, start with calmer, gentler profiles first.</li>
          <li>If the issue is stress spillover, prioritize stress-support context over "strongest sleep herb."</li>
          <li>Keep timing and next-day grogginess in mind when comparing options.</li>
        </ul>
      </section>

      <MoneyPageCTAStack goal='sleep' />

      <section>
        <h2 className='text-2xl font-semibold text-ink'>Top 3 Herbs</h2>
        <div className='mt-4 grid gap-4'>
          {topThree.map(herb => {
            const label = herbLabel(herb)
            const links = getHerbSearchLinks(label)
            return (
              <article key={herb.slug} className='card-premium p-6'>
                <h3 className='text-xl font-semibold text-ink'>{label}</h3>
                <p className='mt-2 text-sm text-muted'>
                  {cleanSummary(herb.mechanism_summary || herb.summary, 'herb')}
                </p>
                <div className='mt-4 flex gap-4'>
                  <Link href={`/herbs/${herb.slug}`} className='text-sm font-medium text-emerald-700 hover:underline'>Read profile</Link>
                  {links[0] && (
                    <a href={links[0].url} target='_blank' rel='noopener noreferrer nofollow sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare products</a>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <div className='space-y-3'>
        <AffiliateDisclosure variant='compact' />
        <section className='card-premium p-6'>
          <h2 className='text-2xl font-semibold text-ink'>Sleep-support recommendation cards</h2>
          <p className='mt-3 text-sm leading-7 text-muted'>
            These are category-level sourcing paths, not promises to treat insomnia. Compare next-day grogginess risk, sedative combinations, alcohol use, pregnancy or nursing status, and medication context before buying.
          </p>
          <RecommendationGrid goal='sleep' className='mt-6' />
        </section>
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How to choose cautiously</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li>Start with the sleep pattern: wind-down difficulty, stress spillover, or schedule disruption need different tools.</li>
          <li>Be cautious with sedatives, alcohol, next-day driving or work demands, and any medication that affects alertness.</li>
          <li>Do not combine several calming products casually; one change at a time makes response and side effects easier to read.</li>
          <li>Ask a clinician if sleep problems are persistent, severe, worsening, or tied to pregnancy, nursing, or a health condition.</li>
        </ul>
      </section>

      <EnhancedEmailCapture
        headline='Sleep guide + product recommendations'
        description='Get curated natural sleep aids, protocols, and comparison guides delivered to your inbox.'
        benefit1='Evidence-graded sleep herbs ranked by mechanism and safety context'
        benefit2='Stress-spillover vs. onset-difficulty decision frameworks'
        benefit3='Protocol guides for wind-down routines and circadian support'
        ctaLabel='Join the list'
        location='top-sleep-email-capture'
      />

      <RelatedDiscoveryWidget
        heading='Deepen your sleep research'
        subheading='Explore related comparisons, protocols, and guides to build a comprehensive sleep strategy.'
        items={[
          {
            type: 'comparison',
            label: 'Comparison',
            title: 'Ashwagandha vs Rhodiola',
            description: 'Both calm and energize, but on different timelines. Compare which fits sleep vs stress-energy needs.',
            href: '/compare/ashwagandha-vs-rhodiola-for-stress',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Stress & Sleep Connection',
            description: 'How stress spillover sabotages sleep and which calming herbs address the root cause vs. symptoms.',
            href: '/top/stress',
          },
          {
            type: 'protocol',
            label: 'Protocol',
            title: 'Wind-Down Protocol',
            description: 'A 4-week framework combining herbs, timing, and routine shifts to reset sleep patterns.',
            href: '/protocols/wind-down',
          },
          {
            type: 'herb',
            label: 'Herb',
            title: 'Valerian Root',
            description: 'Classical sleep herb with centuries of use. Strong evidence for sleep onset, notable taste.',
            href: '/herbs/valerian-root',
          },
          {
            type: 'compound',
            label: 'Compound',
            title: 'Magnesium Glycinate',
            description: 'Mineral co-factor for relaxation and nervous system calm. Better absorbed than other forms.',
            href: '/compounds/magnesium-glycinate',
          },
          {
            type: 'guide',
            label: 'Guide',
            title: 'Supplement Timing',
            description: 'When to take sleep aids relative to bedtime, food, and other medications for best effect.',
            href: '/guides/supplement-timing-for-sleep',
          },
        ]}
      />

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/top/stress' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for stress</Link>
          <Link href='/top/focus' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
        </div>
      </section>
    </main>
  )
}

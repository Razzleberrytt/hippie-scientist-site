import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'

type HerbRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  evidence_grade?: string | null
  net_score?: number | string | null
  primary_effects?: unknown
  goal_tags?: unknown
  mechanism_summary?: string | null
}

const KEYWORDS = ['stress', 'anxiety', 'cortisol', 'calm', 'relax', 'adaptogen']

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim()

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const normalized = text(value)
  return normalized ? normalized.split(/,|;|\|/).map(item => item.trim()).filter(Boolean) : []
}

const titleFor = (herb: HerbRecord): string =>
  text(herb.displayName) || text(herb.name) || herb.slug.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const scoreFor = (herb: HerbRecord): number => {
  const raw = herb.net_score
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const matchesGoal = (herb: HerbRecord): boolean => {
  const haystack = [
    herb.slug,
    herb.name,
    herb.displayName,
    herb.summary,
    herb.description,
    herb.mechanism_summary,
    ...list(herb.primary_effects),
    ...list(herb.goal_tags),
  ].map(text).join(' ').toLowerCase()
  return KEYWORDS.some(keyword => haystack.includes(keyword))
}

export const metadata: Metadata = {
  title: 'Best Herbs for Stress (2026 Evidence-Aware Guide)',
  description:
    'Compare herbs for stress, anxiety, calm, cortisol, and adaptogen support. Ranked from The Hippie Scientist workbook dataset with safety-first context.',
  alternates: { canonical: '/top/stress' },
}

export default async function StressPage() {
  const herbs = (await getHerbs()) as HerbRecord[]
  const ranked = herbs.filter(matchesGoal).sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, 12)
  const revenueProducts = ['ashwagandha', 'rhodiola', 'l-theanine']
    .map(slug => getRevenueProductSet(slug))
    .filter((set): set is NonNullable<typeof set> => Boolean(set))
    .flatMap(set => set.products)

  return (
    <main className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Stress guide</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Herbs for Stress</h1>
        <p className='mt-4 text-muted'>
          These herbs are commonly connected with stress, anxiety, calm, cortisol, and adaptogen-style support. Rankings use the current workbook dataset as a discovery layer, not as personal medical advice.
        </p>
        <p className='mt-3 text-sm text-muted'>
          Practical use: treat this page as a shortlist builder. The right fit often depends on whether stress shows up as tension, fatigue, or sleep disruption.
        </p>
      </section>

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
        <h2 className='text-xl font-semibold text-ink'>What herbs help with stress and anxiety?</h2>
        <p className='mt-3 text-sm text-muted'>
          Common stress-support herbs include adaptogens and calming botanicals such as ashwagandha, rhodiola, lemon balm, passionflower, and other plants that may appear in the dataset when their profile mentions stress, calm, cortisol, anxiety, relaxation, or adaptogen context.
        </p>
        <div className='mt-4 flex flex-wrap gap-4'>
          <Link href='/compare/ashwagandha-vs-rhodiola' className='text-sm font-medium text-emerald-700 hover:underline'>Compare ashwagandha vs rhodiola</Link>
          <Link href='/top/sleep' className='text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
        </div>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>How stress-support approaches differ</h2>
        <ul className='mt-3 space-y-2 text-sm leading-6 text-muted'>
          <li><strong className='text-ink'>Adaptogen-leaning picks:</strong> often discussed for resilience and all-day load management.</li>
          <li><strong className='text-ink'>Calming botanicals:</strong> usually used for situational tension or evening downshift.</li>
          <li><strong className='text-ink'>Mixed-profile options:</strong> can overlap with sleep and focus goals, so context matters.</li>
        </ul>
      </section>

      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {ranked.map((herb, index) => {
          const label = titleFor(herb)
          const links = getHerbSearchLinks(label)
          return (
            <article key={herb.slug} className='card-premium p-6 flex flex-col justify-between'>
              <div>
                <div className='flex items-start justify-between gap-3'>
                  <h2 className='text-xl font-semibold text-ink'>#{index + 1} {label}</h2>
                  <span className='rounded-full border border-brand-900/10 bg-brand-900/5 px-3 py-1 text-xs text-muted'>Score {scoreFor(herb) || 'N/A'}</span>
                </div>
                <p className='mt-3 text-sm text-muted'>{cleanSummary(text(herb.summary) || text(herb.description), 'herb')}</p>
              </div>
              <div className='mt-4 flex flex-col gap-2'>
                <Link href={`/herbs/${herb.slug}/`} className='text-sm font-medium text-emerald-700 hover:underline'>Read {label} profile</Link>
                {links[0] ? <a href={links[0].url} target='_blank' rel='noopener noreferrer sponsored' className='text-sm font-medium text-emerald-700 hover:underline'>Compare products</a> : null}
              </div>
            </article>
          )
        })}
      </section>

      <EmailCapture
        headline='Get the stress supplement shortlist'
        description='Occasional notes on stress-support evidence, adaptogen tradeoffs, safety context, and product-quality checks.'
        location='top-stress'
      />

      <div className='space-y-3'>
        <AffiliateDisclosure />
        <RecommendationSection
          title='Stress-support product picks'
          description='Affiliate recommendations for common stress-support compounds. Review safety, dose, and product quality before buying.'
          products={revenueProducts}
        />
      </div>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related natural wellness guides</h2>
        <div className='mt-4 grid gap-4 sm:grid-cols-3'>
          <Link href='/top/sleep' className='block rounded-2xl border border-brand-900/10 p-4 hover:bg-stone-50/50 text-sm font-medium text-emerald-700 hover:underline'>Best herbs for sleep</Link>
          <Link href='/top/focus' className='block rounded-2xl border border-brand-900/10 p-4 hover:bg-stone-50/50 text-sm font-medium text-emerald-700 hover:underline'>Best supplements for focus</Link>
          <Link href='/herbs' className='block rounded-2xl border border-brand-900/10 p-4 hover:bg-stone-50/50 text-sm font-medium text-emerald-700 hover:underline'>Browse all herbs</Link>
        </div>
      </section>
    </main>
  )
}


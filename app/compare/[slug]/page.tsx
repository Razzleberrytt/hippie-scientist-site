import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getHerbs } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

type Params = { params: Promise<{ slug: string }> }

type LibraryRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  net_score?: number | string | null
  mechanisms?: unknown
  mechanism_summary?: unknown
}

type ResolvedRecord = LibraryRecord & { kind: 'herb' | 'compound' }

type ComparisonConfig = {
  slug: string
  title: string
  a: string
  b: string
  angle: string
  winnerHint?: string
}

const COMPARISONS: ComparisonConfig[] = [
  {
    slug: 'ashwagandha-vs-rhodiola-rosea',
    title: 'Ashwagandha vs Rhodiola Rosea',
    a: 'ashwagandha',
    b: 'rhodiola-rosea',
    angle: 'Compare two popular adaptogen herbs for stress, fatigue, calm, and practical use cases.',
    winnerHint: 'Ashwagandha is usually the calmer stress pick; rhodiola is usually the fatigue-and-energy pick.',
  },
  {
    slug: 'creatine-vs-caffeine',
    title: 'Creatine vs Caffeine',
    a: 'creatine',
    b: 'caffeine',
    angle: 'Compare daily performance support, energy, and cognitive-performance context.',
    winnerHint: 'Caffeine is the fast acute option; creatine is the steadier daily-performance option.',
  },
  {
    slug: 'caffeine-vs-l-theanine',
    title: 'Caffeine vs L-Theanine',
    a: 'caffeine',
    b: 'l-theanine',
    angle: 'Compare stimulation, calm focus, and the classic caffeine-plus-theanine stack.',
    winnerHint: 'Caffeine is stronger stimulation; L-theanine is smoother calm-focus support.',
  },
  {
    slug: 'magnesium-vs-l-theanine',
    title: 'Magnesium vs L-Theanine',
    a: 'magnesium',
    b: 'l-theanine',
    angle: 'Compare relaxation, sleep-adjacent support, and calm-focus use cases.',
    winnerHint: 'Magnesium fits relaxation and deficiency context; L-theanine fits calm focus.',
  },
  {
    slug: 'magnesium-vs-melatonin',
    title: 'Magnesium vs Melatonin',
    a: 'magnesium',
    b: 'melatonin',
    angle: 'Compare relaxation support with sleep-timing support.',
    winnerHint: 'Magnesium is more relaxation-oriented; melatonin is more sleep-timing oriented.',
  },
  {
    slug: 'lemon-balm-vs-valerian',
    title: 'Lemon Balm vs Valerian',
    a: 'lemon-balm',
    b: 'valerian',
    angle: 'Compare two calming herbs often discussed for relaxation and sleep support.',
    winnerHint: 'Lemon balm is gentler for calm; valerian is more sleep-onset oriented.',
  },
  {
    slug: 'epa-vs-dha',
    title: 'EPA vs DHA',
    a: 'epa',
    b: 'dha',
    angle: 'Compare two omega-3 fatty acids by use case and evidence context.',
  },
  {
    slug: 'nac-vs-glutathione',
    title: 'NAC vs Glutathione',
    a: 'nac',
    b: 'glutathione',
    angle: 'Compare antioxidant and glutathione-support options using current workbook data.',
  },
]

const text = (value: unknown): string => {
  if (typeof value === 'string') return value.trim()
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).trim()
}

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const normalized = text(value)
  return normalized ? normalized.split(/;|\||\n/).map(item => item.trim()).filter(Boolean) : []
}

const formatSlug = (slug: string): string =>
  slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const titleFor = (record: ResolvedRecord | undefined, fallback: string): string =>
  text(record?.displayName) || text(record?.name) || formatSlug(fallback)

const summaryFor = (record: ResolvedRecord | undefined): string => {
  const value = text(record?.summary) || text(record?.description) || 'This profile is still being expanded from the workbook.'
  return value.length > 230 ? `${value.slice(0, 229).trimEnd()}…` : value
}

const scoreFor = (record: ResolvedRecord | undefined): number => {
  const raw = record?.net_score
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const profileHref = (record: ResolvedRecord): string =>
  record.kind === 'herb' ? `/herbs/${record.slug}/` : `/compounds/${record.slug}/`

const findRecord = (records: ResolvedRecord[], slug: string): ResolvedRecord | undefined => {
  const target = slug.toLowerCase()
  return records.find(record =>
    record.slug.toLowerCase() === target ||
    text(record.name).toLowerCase() === target ||
    text(record.displayName).toLowerCase() === target,
  )
}

export function generateStaticParams() {
  return COMPARISONS.map(comparison => ({ slug: comparison.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) return { title: 'Comparison Not Found | The Hippie Scientist' }

  return {
    title: `${comparison.title} | Which Is Better?`,
    description: comparison.angle,
    alternates: { canonical: `/compare/${comparison.slug}` },
  }
}

export default async function ComparePage({ params }: Params) {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) notFound()

  const [herbs, compounds] = await Promise.all([getHerbs(), getCompounds()])
  const records: ResolvedRecord[] = [
    ...(herbs as LibraryRecord[]).map(item => ({ ...item, kind: 'herb' as const })),
    ...(compounds as LibraryRecord[]).map(item => ({ ...item, kind: 'compound' as const })),
  ]

  const left = findRecord(records, comparison.a)
  const right = findRecord(records, comparison.b)

  const leftTitle = titleFor(left, comparison.a)
  const rightTitle = titleFor(right, comparison.b)
  const leftScore = scoreFor(left)
  const rightScore = scoreFor(right)
  const winnerTitle = leftScore >= rightScore ? leftTitle : rightTitle

  const cards = [
    { key: comparison.a, record: left, title: leftTitle, score: leftScore },
    { key: comparison.b, record: right, title: rightTitle, score: rightScore },
  ]

  return (
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 text-white sm:px-6 lg:px-8'>
      <nav className='flex flex-wrap gap-2 text-sm text-white/60'>
        <Link href='/herbs' className='rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white'>← Herbs</Link>
        <Link href='/compounds' className='rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white'>Compounds</Link>
        <Link href='/top/stress' className='rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white'>Stress guide</Link>
      </nav>

      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Comparison guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight sm:text-6xl'>{comparison.title}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>{comparison.angle}</p>
      </section>

      <section className='rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-100/70'>Quick read</p>
        <h2 className='mt-2 text-2xl font-bold'>Top pick: {winnerTitle}</h2>
        <p className='mt-2 text-sm leading-6 text-white/65'>{comparison.winnerHint || 'Picked using the current workbook-generated score when available. Treat this as a decision aid, not medical advice.'}</p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {cards.map(card => (
          <article key={card.key} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-white/45'>{card.record?.kind ?? 'Option'}</p>
                <h2 className='mt-2 text-2xl font-bold'>{card.title}</h2>
              </div>
              <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60'>Score {card.score || 'N/A'}</span>
            </div>

            <p className='mt-4 text-sm leading-6 text-white/65'>{summaryFor(card.record)}</p>

            {list(card.record?.mechanism_summary ?? card.record?.mechanisms).length ? (
              <div className='mt-4 rounded-2xl border border-white/10 bg-black/15 p-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-white/40'>Mechanisms</p>
                <p className='mt-2 text-sm leading-6 text-white/65'>{list(card.record?.mechanism_summary ?? card.record?.mechanisms).slice(0, 2).join('; ')}</p>
              </div>
            ) : null}

            <div className='mt-4 flex flex-wrap gap-2'>
              <a href={buildAmazonSearchUrl(`${card.title} supplement`)} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200'>View {card.title} products →</a>
              {card.record ? <Link href={profileHref(card.record)} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>Learn more →</Link> : null}
            </div>
          </article>
        ))}
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/top/top-3-herbs-for-stress' className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100'>Top 3 herbs for stress</Link>
          <Link href='/top/top-3-natural-sleep-aids' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Top natural sleep aids</Link>
          <Link href='/top/top-3-supplements-for-focus' className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70'>Top focus supplements</Link>
        </div>
      </section>
    </main>
  )
}

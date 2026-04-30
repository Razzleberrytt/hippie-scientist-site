import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

type Params = { params: Promise<{ slug: string }> }

type CompoundRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  net_score?: number | string | null
  evidence_grade?: string | null
  evidenceLevel?: string | null
  mechanisms?: unknown
}

type ComparisonConfig = {
  slug: string
  title: string
  a: string
  b: string
  angle: string
}

const COMPARISONS: ComparisonConfig[] = [
  {
    slug: 'creatine-vs-caffeine',
    title: 'Creatine vs Caffeine',
    a: 'creatine',
    b: 'caffeine',
    angle: 'Compare daily performance support, energy, and research context.',
  },
  {
    slug: 'epa-vs-dha',
    title: 'EPA vs DHA',
    a: 'epa',
    b: 'dha',
    angle: 'Compare two omega-3 fatty acids by use case and evidence context.',
  },
  {
    slug: 'magnesium-vs-l-theanine',
    title: 'Magnesium vs L-Theanine',
    a: 'magnesium',
    b: 'l-theanine',
    angle: 'Compare calm, sleep, and relaxation support options.',
  },
]

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim()

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  const normalized = text(value)
  return normalized ? [normalized] : []
}

const titleFor = (record: CompoundRecord | undefined, fallback: string): string =>
  text(record?.displayName) || text(record?.name) || fallback.split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const summaryFor = (record: CompoundRecord | undefined): string => {
  const value = text(record?.summary) || text(record?.description) || 'This profile is still being expanded from the workbook.'
  return value.length > 220 ? `${value.slice(0, 219).trimEnd()}…` : value
}

const scoreFor = (record: CompoundRecord | undefined): number => {
  const raw = record?.net_score
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0
  if (typeof raw === 'string') {
    const parsed = Number.parseFloat(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

const findCompound = (records: CompoundRecord[], slug: string): CompoundRecord | undefined => {
  const target = slug.toLowerCase()
  return records.find(record => record.slug.toLowerCase() === target || text(record.name).toLowerCase() === target || text(record.displayName).toLowerCase() === target)
}

export function generateStaticParams() {
  return COMPARISONS.map(comparison => ({ slug: comparison.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) return { title: 'Comparison Not Found | The Hippie Scientist' }

  return {
    title: `${comparison.title} | Supplement Comparison`,
    description: comparison.angle,
    alternates: { canonical: `/compare/${comparison.slug}` },
  }
}

export default async function ComparePage({ params }: Params) {
  const { slug } = await params
  const comparison = COMPARISONS.find(item => item.slug === slug)
  if (!comparison) notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const left = findCompound(compounds, comparison.a)
  const right = findCompound(compounds, comparison.b)

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
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8'>
      <nav className='flex flex-wrap gap-2 text-sm text-white/60'>
        <Link href='/compounds' className='rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white'>← Compounds</Link>
        <Link href='/herbs' className='rounded-full border border-white/10 px-4 py-2 transition hover:bg-white/5 hover:text-white'>Herbs</Link>
      </nav>

      <section className='rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-6 shadow-2xl shadow-black/25 sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100/70'>Comparison guide</p>
        <h1 className='mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl'>{comparison.title}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/70'>{comparison.angle}</p>
      </section>

      <section className='rounded-3xl border border-amber-300/20 bg-amber-300/10 p-5'>
        <p className='text-xs font-bold uppercase tracking-[0.2em] text-amber-100/70'>Quick read</p>
        <h2 className='mt-2 text-2xl font-bold text-white'>Top pick: {winnerTitle}</h2>
        <p className='mt-2 text-sm leading-6 text-white/65'>Picked using the current workbook-generated score when available. Treat this as a decision aid, not medical advice.</p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {cards.map(card => (
          <article key={card.key} className='rounded-3xl border border-white/10 bg-white/[0.04] p-5'>
            <div className='flex items-start justify-between gap-3'>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.18em] text-white/45'>Option</p>
                <h2 className='mt-2 text-2xl font-bold text-white'>{card.title}</h2>
              </div>
              <span className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/60'>Score {card.score || 'N/A'}</span>
            </div>

            <p className='mt-4 text-sm leading-6 text-white/65'>{summaryFor(card.record)}</p>

            {list(card.record?.mechanisms).length ? (
              <div className='mt-4 rounded-2xl border border-white/10 bg-black/15 p-3'>
                <p className='text-xs font-semibold uppercase tracking-[0.16em] text-white/40'>Mechanisms</p>
                <p className='mt-2 text-sm leading-6 text-white/65'>{list(card.record?.mechanisms).slice(0, 2).join('; ')}</p>
              </div>
            ) : null}

            <div className='mt-4 flex flex-wrap gap-2'>
              <a href={buildAmazonSearchUrl(`${card.title} supplement`)} target='_blank' rel='noopener noreferrer sponsored' className='rounded-2xl bg-emerald-300 px-4 py-2 text-sm font-bold text-slate-950 transition hover:bg-emerald-200'>Compare products →</a>
              {card.record ? <Link href={`/compounds/${card.record.slug}/`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>Open profile</Link> : null}
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

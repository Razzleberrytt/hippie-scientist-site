import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getClaims,
  getCompounds,
  getHerbBySlug,
  getHerbCompoundMap,
  getHerbs,
} from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

type HerbDetail = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
  mechanisms?: unknown
  safetyNotes?: unknown
  contraindications?: unknown
  interactions?: unknown
  dosage?: unknown
  preparation?: unknown
  evidenceLevel?: unknown
  confidenceTier?: unknown
  sources?: unknown
  primaryDomain?: unknown
  claimRows?: unknown
  evidence_grade?: unknown
  net_score?: unknown
  primary_effects?: unknown
  mechanism_summary?: unknown
  dosage_range?: unknown
  oral_form?: unknown
  contraindications_interactions?: unknown
}

type RelatedLinkItem = {
  href: string
  title: string
  description: string
  eyebrow?: string
}

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/\n|;|\|/)
      .map(item => item.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
  }
  const normalized = text(value)
  return normalized ? [normalized] : []
}

const getHerbLabel = (herb: Partial<HerbDetail>): string =>
  text(herb.displayName) || text(herb.name) || formatSlugLabel(herb.slug ?? 'herb')

const getLeadText = (herb: HerbDetail): string =>
  text(herb.summary) || text(herb.description) || 'A full write-up for this herb is being prepared.'

const truncate = (value: string, max = 145): string =>
  value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`

const unique = (items: string[]): string[] => [...new Set(items.map(text).filter(Boolean))]

const getBestForTags = (herb: HerbDetail, claims: string[]): string[] =>
  unique([
    ...list(herb.primary_effects),
    text(herb.primaryDomain),
    ...claims.slice(0, 3).map(claim => claim.replace(/^best for\s+/i, '')),
  ]).slice(0, 5)

const getRelatedCompounds = async (herb: HerbDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, compounds] = await Promise.all([getHerbCompoundMap(), getCompounds()])
  const validCompoundSlugs = new Set(compounds.map((compound: any) => compound.slug))

  return compoundMap
    .filter((entry: any) => (entry.herbSlug || entry.herb_slug) === herb.slug)
    .map((entry: any) => ({
      slug: entry.canonicalCompoundId || entry.compound_slug || '',
      name: entry.canonicalCompoundName || '',
    }))
    .filter(entry => validCompoundSlugs.has(entry.slug))
    .slice(0, 6)
    .map(entry => ({
      href: `/compounds/${entry.slug}/`,
      title: text(entry.name) || formatSlugLabel(entry.slug),
      description: `Explore how this compound relates to ${getHerbLabel(herb)}.`,
      eyebrow: 'Compound',
    }))
}

export async function generateStaticParams() {
  const herbs = (await getHerbs()) as HerbDetail[]
  return herbs.map(herb => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = (await getHerbBySlug(slug)) as HerbDetail | null

  if (!herb) return { title: 'Herb Not Found | The Hippie Scientist' }

  return {
    title: `${getHerbLabel(herb)} | Herb`,
    description: getLeadText(herb),
    alternates: { canonical: `/herbs/${herb.slug}` },
  }
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null
  return (
    <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>{title}</p>
      <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-white/70'>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </section>
  )
}

function KeyFacts({ items }: { items: Array<{ label: string; value: string }> }) {
  const visible = items.filter(item => item.value)
  if (!visible.length) return null
  return (
    <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
      <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Key facts</p>
      <dl className='mt-4 grid gap-3 text-sm'>
        {visible.map(item => (
          <div key={item.label} className='rounded-2xl border border-white/10 bg-black/15 p-3'>
            <dt className='text-xs uppercase tracking-[0.16em] text-white/38'>{item.label}</dt>
            <dd className='mt-1 text-white/75'>{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = (await getHerbBySlug(slug)) as HerbDetail | null

  if (!herb) notFound()

  const label = getHerbLabel(herb)
  const leadText = getLeadText(herb)
  const affiliateLinks = getHerbSearchLinks(label)
  const claims = (await getClaims())
    .filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug)
    .map((item: any) => text(item.claim || item.text || item.title))
    .filter(Boolean)
  const bestForTags = getBestForTags(herb, claims)
  const relatedCompounds = await getRelatedCompounds(herb)
  const mechanisms = unique([text(herb.mechanism_summary), ...list(herb.mechanisms)])
  const safety = unique([
    text(herb.safetyNotes),
    ...list(herb.contraindications),
    ...list(herb.interactions),
    ...list(herb.contraindications_interactions),
  ])
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)

  return (
    <div className='space-y-5'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: label,
            description: leadText,
            url: `https://thehippiescientist.net/herbs/${herb.slug}`,
            publisher: { '@type': 'Organization', name: 'The Hippie Scientist' },
          }),
        }}
      />
      {faqJsonLd ? (
        <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      ) : null}

      <nav className='flex flex-wrap gap-2 text-sm text-white/60'>
        <Link href='/herbs' className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'>← Herbs</Link>
        <Link href='/compounds' className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'>Compounds</Link>
      </nav>

      <section className='overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.18),transparent_35%),linear-gradient(135deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-black/25 sm:p-8'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100'>Herb profile</span>
          {text(herb.evidence_grade) ? <span className='rounded-full border border-amber-300/25 bg-amber-300/10 px-3 py-1 text-xs font-semibold text-amber-100'>{text(herb.evidence_grade)}</span> : null}
        </div>

        <h1 className='mt-4 text-4xl font-black tracking-tight text-white sm:text-6xl'>{label}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-white/72 sm:text-lg'>{leadText}</p>

        {bestForTags.length ? (
          <div className='mt-5 flex flex-wrap gap-2'>
            {bestForTags.map(tag => (
              <span key={tag} className='rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-semibold text-white/70'>
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div className='grid gap-5 lg:grid-cols-[1.35fr_0.85fr]'>
        <main className='space-y-5'>
          <KeyFacts
            items={[
              { label: 'Name', value: text(herb.name) || label },
              { label: 'Primary effects', value: list(herb.primary_effects).join(', ') },
              { label: 'Dosage range', value: text(herb.dosage_range) || text(herb.dosage) },
              { label: 'Oral form', value: text(herb.oral_form) || text(herb.preparation) },
              { label: 'Net score', value: text(herb.net_score) },
            ]}
          />
          <MiniList title='Mechanism notes' items={mechanisms} />
          <MiniList title='Evidence claims' items={claims.slice(0, 8)} />
          <MiniList title='Safety notes' items={safety} />
        </main>

        <aside className='space-y-5'>
          <section className='rounded-3xl border border-emerald-300/20 bg-emerald-300/10 p-5 shadow-xl shadow-emerald-950/10'>
            <p className='text-xs font-bold uppercase tracking-[0.2em] text-emerald-100'>Compare product forms</p>
            <h2 className='mt-2 text-2xl font-bold text-white'>Find {label} products</h2>
            <p className='mt-2 text-xs leading-5 text-emerald-100/70'>As an Amazon Associate I earn from qualifying purchases.</p>
            <div className='mt-4 grid gap-2'>
              {affiliateLinks.map(link => (
                <a key={link.label} href={link.url} target='_blank' rel='noopener noreferrer sponsored' className='flex items-center justify-between rounded-2xl border border-emerald-300/25 bg-black/20 px-4 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-emerald-300/20'>
                  <span><span className='block'>{link.label}</span><span className='block text-xs font-normal text-emerald-100/60'>{link.helperText}</span></span>
                  <span>→</span>
                </a>
              ))}
            </div>
          </section>

          <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
            <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Reminder</p>
            <p className='mt-3 text-sm leading-6 text-white/68'>Educational research context only. Check medications, conditions, pregnancy, surgery, and clinician guidance before using supplements.</p>
          </section>
        </aside>
      </div>

      {relatedCompounds.length ? (
        <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.2em] text-white/45'>Related compounds</p>
          <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {relatedCompounds.map(item => (
              <Link key={item.href} href={item.href} className='rounded-2xl border border-white/10 bg-black/15 p-3 transition hover:border-emerald-300/30 hover:bg-white/[0.055]'>
                <h3 className='font-semibold text-white'>{item.title}</h3>
                <p className='mt-1 text-sm leading-5 text-white/55'>{truncate(item.description)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

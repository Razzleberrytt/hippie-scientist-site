import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { DetailCard, EvidenceBadge } from '@/components/ui'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }
type HerbDetail = Record<string, any>
type RelatedLinkItem = { href: string; title: string; description: string }

const PLACEHOLDER_PATTERNS = [/lean monograph row enriched/i, /enriched in bulk mode/i, /bulk mode/i, /placeholder/i, /^n\/?a$/i, /^unknown$/i, /^tbd$/i]

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const isRenderable = (value: string) => {
  const normalized = text(value)
  return Boolean(normalized) && !PLACEHOLDER_PATTERNS.some(pattern => pattern.test(normalized))
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(text).filter(isRenderable)
  return text(value)
    .split(/\n|;|\|/)
    .flatMap(item => item.split(/,(?=\s*[a-zA-Z])/))
    .map(item => item.replace(/^[-*•]\s*/, '').trim())
    .filter(isRenderable)
}

const unique = (items: string[]) => {
  const seen = new Set<string>()
  return items.filter(item => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const formatSlugLabel = (slug: string) => slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const getHerbLabel = (herb: HerbDetail) => text(herb.displayName) || text(herb.name) || formatSlugLabel(herb.slug)
const truncate = (value: string, max = 145) => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`

const sentenceList = (items: string[]) => {
  const clean = unique(items).slice(0, 3)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean[0]}, ${clean[1]}, and ${clean[2]}`
}

const getLeadText = (herb: HerbDetail) => {
  const effects = unique(list(herb.primary_effects)).slice(0, 3)
  if (effects.length) return `Traditionally used for ${sentenceList(effects)}.`
  return text(herb.summary) || text(herb.description) || 'Evidence-aware herb profile with mechanism and safety context.'
}

const cleanMechanism = (item: string) => {
  const cleaned = item.replace(/\([^)]*\)/g, '').replace(/\bmay\b/gi, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
  if (/^(supports|influences|modulates|helps|affects|promotes|inhibits|activates)\b/i.test(cleaned)) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return `Supports ${lower}`
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items).slice(0, 8)
  return {
    avoidIf: cleaned.filter(item => /avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
    useCautionWith: cleaned.filter(item => !/avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
  }
}

const evidenceSentence = (value?: string) => {
  const label = text(value) || 'limited'
  const normalized = label.toLowerCase()
  if (/high|strong|likely|effective/.test(normalized)) return `Classified as ${label} evidence; this is one of the stronger signals in the database.`
  if (/moderate|mixed|emerging/.test(normalized)) return `Classified as ${label} evidence; useful, but context and study quality still matter.`
  return `Classified as ${label} evidence; treat this as preliminary and review the full context before use.`
}

const pmidUrl = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id.replace(/\D/g, '')}`

const getRelatedCompounds = async (herb: HerbDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, compounds] = await Promise.all([getHerbCompoundMap(), getCompounds()])
  const validCompoundSlugs = new Set(compounds.map((compound: any) => compound.slug).filter(Boolean))
  const seen = new Set<string>()
  return compoundMap
    .filter((entry: any) => (entry.herbSlug || entry.herb_slug) === herb.slug)
    .map((entry: any) => ({ slug: entry.canonicalCompoundId || entry.compound_slug || '', name: entry.canonicalCompoundName || entry.compound_name || '' }))
    .filter(entry => entry.slug && validCompoundSlugs.has(entry.slug))
    .filter(entry => {
      if (seen.has(entry.slug)) return false
      seen.add(entry.slug)
      return true
    })
    .slice(0, 6)
    .map(entry => ({ href: `/compounds/${entry.slug}/`, title: text(entry.name) || formatSlugLabel(entry.slug), description: 'Shares similar mechanisms or occurs in this herb.' }))
}

export async function generateStaticParams() {
  const herbs = await getHerbs()
  return herbs.map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) return { title: 'Herb Not Found | The Hippie Scientist' }
  return { title: `${getHerbLabel(herb)} | Herb`, description: getLeadText(herb), alternates: { canonical: `/herbs/${herb.slug}` } }
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) notFound()

  const label = getHerbLabel(herb)
  const leadText = getLeadText(herb)
  const affiliateLinks = getHerbSearchLinks(label)
  const relatedCompounds = await getRelatedCompounds(herb)
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)
  const claims = unique((await getClaims()).filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug).map((item: any) => text(item.claim || item.text || item.title))).slice(0, 6)

  const bestFor = unique([...list(herb.primary_effects), text(herb.primaryDomain), ...claims.map(claim => claim.replace(/^best for\s+/i, ''))]).slice(0, 6)
  const mechanisms = unique([text(herb.mechanism_summary), ...list(herb.mechanisms)].map(cleanMechanism).filter(Boolean)).slice(0, 6)
  const safetyItems = unique([text(herb.safetyNotes), ...list(herb.contraindications), ...list(herb.interactions), ...list(herb.contraindications_interactions)])
  const safety = splitSafety(safetyItems)
  const evidence = text(herb.evidence_grade) || text(herb.evidenceLevel) || 'Limited'
  const dosage = text(herb.dosage_range) || text(herb.dosage)
  const form = text(herb.oral_form) || text(herb.preparation)
  const timeToEffect = text(herb.time_to_effect)
  const updatedAt = text(herb.updated_at || herb.last_updated || herb.lastReviewedAt)
  const pmids = unique([...list(herb.pmid_list), ...list(herb.pmids), ...list(herb.references)]).filter(id => /\d/.test(id)).slice(0, 10)

  const toc = [['evidence', 'Evidence']].filter(Boolean) as string[][]

  return (
    <div className='grid gap-8 px-4 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: label, description: leadText, url: `https://thehippiescientist.net/herbs/${herb.slug}`, publisher: { '@type': 'Organization', name: 'The Hippie Scientist' } }) }} />
      {faqJsonLd ? <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <aside className='hidden lg:block'>
        <nav className='sticky top-24 rounded-2xl border border-brand-900/10 bg-[rgba(255,253,247,0.92)] p-4 shadow-[0_10px_40px_rgba(29,74,47,0.06)]'>
          <p className='eyebrow text-brand-700'>On this page</p>
          <div className='mt-3 grid gap-2 text-sm'>
            {toc.map(([href, title]) => <a key={href} href={`#${href}`} className='rounded-lg px-3 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black'>{title}</a>)}
          </div>
        </nav>
      </aside>

      <main className='space-y-10'>
        <section className='hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 bg-[linear-gradient(180deg,#fffdf7_0%,#fbf6e9_100%)] p-6 shadow-[0_10px_40px_rgba(29,74,47,0.06)] sm:p-8 lg:p-10'>
          <div className='flex flex-wrap items-center gap-3'>
            <Leaf className='text-brand-700' aria-hidden='true' />
            <h1 className='heading-premium max-w-4xl text-ink'>{label}</h1>
            <EvidenceBadge value={evidence} />
          </div>

          <p className='text-reading mt-5 max-w-reading text-lg text-muted-soft'>
            {leadText}
          </p>

          <div className='mt-5 flex flex-wrap gap-3'>
            <span className='rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-muted-soft'>
              Evidence-based
            </span>
            <span className='rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-muted-soft'>
              Human data prioritized
            </span>
            <span className='rounded-full border border-brand-900/10 bg-white/70 px-4 py-2 text-sm font-medium text-muted-soft'>
              No industry bias
            </span>
          </div>

          {updatedAt ? <p className='mt-5 text-sm text-muted-soft'>Last updated {updatedAt}</p> : null}
        </section>
      </main>
    </div>
  )
}

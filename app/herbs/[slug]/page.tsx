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

  const toc = [
    bestFor.length ? ['best-for', 'Best For'] : null,
    ['evidence', 'Evidence'],
    dosage || form || timeToEffect ? ['use', 'Use'] : null,
    safety.avoidIf.length || safety.useCautionWith.length ? ['safety', 'Safety'] : null,
    mechanisms.length ? ['mechanisms', 'Mechanisms'] : null,
    claims.length ? ['evidence-notes', 'Evidence Notes'] : null,
    relatedCompounds.length ? ['compounds', 'Related Compounds'] : null,
    affiliateLinks.length ? ['forms', 'Forms'] : null,
    pmids.length ? ['references', 'References'] : null,
  ].filter(Boolean) as string[][]

  return (
    <div className='grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: label, description: leadText, url: `https://thehippiescientist.net/herbs/${herb.slug}`, publisher: { '@type': 'Organization', name: 'The Hippie Scientist' } }) }} />
      {faqJsonLd ? <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <aside className='hidden lg:block'>
        <nav className='sticky top-24 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]'>
          <p className='text-xs font-bold uppercase tracking-[0.16em] text-teal-700'>On this page</p>
          <div className='mt-3 grid gap-2 text-sm'>
            {toc.map(([href, title]) => <a key={href} href={`#${href}`} className='rounded-lg px-3 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black'>{title}</a>)}
          </div>
        </nav>
      </aside>

      <main className='space-y-10'>
        <nav className='flex flex-wrap gap-2 text-sm'>
          <Link href='/herbs' className='min-h-11 rounded-full border border-neutral-200 bg-white px-4 py-2.5 font-bold text-muted shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800'>← Herbs</Link>
          <Link href='/compounds' className='min-h-11 rounded-full border border-neutral-200 bg-white px-4 py-2.5 font-bold text-muted shadow-sm hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800'>Compounds</Link>
        </nav>

        <nav className='flex gap-2 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-2 text-sm lg:hidden'>
          {toc.map(([href, title]) => <a key={href} href={`#${href}`} className='min-h-10 shrink-0 rounded-lg px-3 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black'>{title}</a>)}
        </nav>

        <DetailCard>
          <div className='flex flex-wrap items-center gap-3'>
            <Leaf className='text-teal-600' aria-hidden='true' />
            <h1 className='text-4xl font-bold tracking-tight text-ink sm:text-5xl'>{label}</h1>
            <EvidenceBadge value={evidence} />
          </div>
          <p className='mt-4 max-w-3xl text-[15px] leading-7 text-muted'>{leadText}</p>
          <p className='mt-3 text-xs text-neutral-500'>Evidence-based • Human data prioritized • No industry bias</p>
          {updatedAt ? <p className='mt-3 text-xs text-muted'>Last updated {updatedAt}</p> : null}
        </DetailCard>

        {bestFor.length ? (
          <DetailCard id='best-for' title='Best For'>
            <div className='flex flex-wrap gap-2'>{bestFor.map(item => <span key={item} className='rounded-full bg-neutral-100/80 px-3 py-1 text-xs font-medium text-neutral-700'>{item}</span>)}</div>
          </DetailCard>
        ) : null}

        <DetailCard id='evidence' title='Evidence'>
          <EvidenceBadge value={evidence} />
          <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>{evidenceSentence(evidence)}</p>
        </DetailCard>

        {(dosage || form || timeToEffect) ? (
          <DetailCard id='use' title='Use Context'>
            <dl className='grid gap-3 text-sm sm:grid-cols-3'>
              {dosage ? <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'><dt className='font-bold text-ink'>Dose</dt><dd className='mt-1 text-muted'>{dosage}</dd></div> : null}
              {form ? <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'><dt className='font-bold text-ink'>Form</dt><dd className='mt-1 text-muted'>{form}</dd></div> : null}
              {timeToEffect ? <div className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'><dt className='font-bold text-ink'>Time to effect</dt><dd className='mt-1 text-muted'>{timeToEffect}</dd></div> : null}
            </dl>
          </DetailCard>
        ) : null}

        {(safety.avoidIf.length || safety.useCautionWith.length) ? (
          <DetailCard id='safety' title='Safety & Side Effects' className='border-amber-200/70 bg-amber-50/60'>
            <div className='grid gap-4 sm:grid-cols-2'>
              {safety.avoidIf.length ? <div><h3 className='text-sm font-bold text-amber-800'>Avoid if</h3><ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700'>{safety.avoidIf.map(item => <li key={item}>{item}</li>)}</ul></div> : null}
              {safety.useCautionWith.length ? <div><h3 className='text-sm font-bold text-amber-800'>Use caution with</h3><ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-neutral-700'>{safety.useCautionWith.map(item => <li key={item}>{item}</li>)}</ul></div> : null}
            </div>
          </DetailCard>
        ) : null}

        {mechanisms.length ? (
          <DetailCard id='mechanisms' title='Mechanisms of Action'>
            <details className='rounded-2xl border border-neutral-200 bg-neutral-50 p-4'>
              <summary className='cursor-pointer font-semibold text-ink'>View mechanisms</summary>
              <ul className='mt-3 space-y-2 text-sm leading-6 text-neutral-700'>{mechanisms.map(item => <li key={item}>• {item}</li>)}</ul>
            </details>
          </DetailCard>
        ) : null}

        {claims.length ? (
          <DetailCard id='evidence-notes' title='Evidence Notes'>
            <ul className='space-y-2 text-sm leading-6 text-neutral-700'>{claims.map(item => <li key={item}>• {item}</li>)}</ul>
          </DetailCard>
        ) : null}

        {relatedCompounds.length ? (
          <DetailCard id='compounds' title='Similar Active Compounds' description='These compounds share similar mechanisms or occur in this herb.'>
            <div className='grid gap-3 sm:grid-cols-2'>{relatedCompounds.map(item => <Link key={item.href} href={item.href} className='block min-h-11 rounded-xl border border-neutral-200 bg-neutral-50 p-4 hover:border-teal-200 hover:bg-white'><h3 className='font-bold text-ink'>{item.title}</h3><p className='mt-1 text-sm text-muted'>{truncate(item.description)}</p></Link>)}</div>
          </DetailCard>
        ) : null}

        {affiliateLinks.length ? (
          <DetailCard id='forms' title={`Find ${label}`} description='Different forms affect potency, absorption, and convenience.'>
            <p className='text-xs leading-5 text-muted'>As an Amazon Associate I earn from qualifying purchases.</p>
            <div className='mt-4 grid gap-2'>{affiliateLinks.map(link => <a key={link.label} href={link.url} target='_blank' rel='noopener noreferrer sponsored' className='flex min-h-11 w-full items-center justify-between rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-bold text-ink hover:bg-teal-100'><span><span className='block'>{link.label}</span><span className='block text-xs font-normal text-muted'>{link.helperText}</span></span><span aria-hidden='true'>→</span></a>)}</div>
          </DetailCard>
        ) : null}

        {pmids.length ? (
          <DetailCard id='references' title='References'>
            <ul className='space-y-2 text-sm'>{pmids.map(id => <li key={id}><a href={pmidUrl(id)} target='_blank' rel='noopener noreferrer' className='font-semibold text-teal-700 underline'>PMID {id.replace(/\D/g, '') || id}</a></li>)}</ul>
          </DetailCard>
        ) : null}
      </main>
    </div>
  )
}

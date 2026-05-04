import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DecisionSnapshot from '@/components/decision-snapshot'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
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
  time_to_effect?: unknown
}

type RelatedLinkItem = { href: string; title: string; description: string; eyebrow?: string }

const PLACEHOLDER_PATTERNS = [/lean monograph row enriched/i, /enriched in bulk mode/i, /bulk mode/i, /placeholder/i, /^n\/?a$/i, /^unknown$/i, /^tbd$/i]
const formatSlugLabel = (slug: string): string => slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const isRenderable = (value: string): boolean => {
  const normalized = text(value)
  if (!normalized) return false
  return !PLACEHOLDER_PATTERNS.some(pattern => pattern.test(normalized))
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(text).filter(isRenderable)
  if (typeof value === 'string') {
    return value.split(/\n|;|\|/).flatMap(item => item.split(/,(?=\s*[a-zA-Z])/)).map(item => item.replace(/^[-*•]\s*/, '').trim()).filter(isRenderable)
  }
  const normalized = text(value)
  return isRenderable(normalized) ? [normalized] : []
}

const getHerbLabel = (herb: Partial<HerbDetail>): string => text(herb.displayName) || text(herb.name) || formatSlugLabel(herb.slug ?? 'herb')

const unique = (items: string[]): string[] => {
  const seen = new Set<string>()
  return items.map(text).filter(isRenderable).filter(item => {
    const key = item.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

const sentenceList = (items: string[]): string => {
  const clean = unique(items).slice(0, 3)
  if (clean.length === 0) return ''
  if (clean.length === 1) return clean[0]
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`
  return `${clean[0]}, ${clean[1]}, and ${clean[2]}`
}

const getLeadText = (herb: HerbDetail): string => {
  const effects = unique(list(herb.primary_effects)).slice(0, 3)
  if (effects.length) return `Traditionally used for ${sentenceList(effects)}.`
  return text(herb.summary) || text(herb.description) || 'Traditionally used in herbal medicine for a range of supportive applications.'
}

const cleanMechanism = (item: string): string => {
  const cleaned = item.replace(/\([^)]*\)/g, '').replace(/\bmay\b/gi, '').replace(/\s+/g, ' ').trim()
  if (!cleaned) return ''
  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
  if (/^(supports|influences|modulates|helps|affects|promotes|inhibits|activates)\b/i.test(cleaned)) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return `Supports ${lower}`
}

const truncate = (value: string, max = 145): string => value.length <= max ? value : `${value.slice(0, max - 1).trimEnd()}…`
const visibleTags = (items: string[], max = 4) => {
  const cleaned = unique(items)
  return { shown: cleaned.slice(0, max), hidden: Math.max(cleaned.length - max, 0) }
}

const scoreTone = (score: string) => {
  const n = Number(score)
  if (Number.isNaN(n)) return 'border-slate-200 bg-slate-50 text-slate-700'
  if (n < 0) return 'border-red-200 bg-red-50 text-red-800'
  if (n <= 50) return 'border-amber-200 bg-amber-50 text-amber-900'
  return 'border-emerald-200 bg-emerald-50 text-emerald-900'
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items).slice(0, 5)
  return {
    avoidIf: cleaned.filter(item => /avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
    useCautionWith: cleaned.filter(item => !/avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
  }
}

const getBestForTags = (herb: HerbDetail, claims: string[]): string[] => unique([...list(herb.primary_effects), text(herb.primaryDomain), ...claims.slice(0, 3).map(claim => claim.replace(/^best for\s+/i, ''))])

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
    .map(entry => ({ href: `/compounds/${entry.slug}/`, title: text(entry.name) || formatSlugLabel(entry.slug), description: 'Shares similar mechanisms or occurs in this herb.', eyebrow: 'Compound' }))
}

export async function generateStaticParams() {
  const herbs = (await getHerbs()) as HerbDetail[]
  return herbs.map(herb => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = (await getHerbBySlug(slug)) as HerbDetail | null
  if (!herb) return { title: 'Herb Not Found | The Hippie Scientist' }
  return { title: `${getHerbLabel(herb)} | Herb`, description: getLeadText(herb), alternates: { canonical: `/herbs/${herb.slug}` } }
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  const visible = unique(items).slice(0, 4)
  if (!visible.length) return null
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='text-lg font-black text-slate-950'>{title}</h2>
      <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>{visible.map(item => <li key={item}>{item}</li>)}</ul>
    </section>
  )
}

function KeyFacts({ items }: { items: Array<{ label: string; value: string; hint?: string; tone?: string }> }) {
  const visible = items.filter(item => isRenderable(item.value))
  if (!visible.length) return null
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='text-lg font-black text-slate-950'>Key Facts</h2>
      <dl className='mt-4 grid gap-3 text-sm'>
        {visible.map(item => (
          <div key={item.label} className={`rounded-xl border p-3 ${item.tone || 'border-slate-200 bg-slate-50 text-slate-700'}`}>
            <dt className='text-xs font-black uppercase tracking-[0.16em] opacity-70'>{item.label}</dt>
            <dd className='mt-1 font-semibold'>{item.value}</dd>
            {item.hint ? <dd className='mt-1 text-xs opacity-70'>{item.hint}</dd> : null}
          </div>
        ))}
      </dl>
    </section>
  )
}

function SafetyPanel({ avoidIf, useCautionWith }: { avoidIf: string[]; useCautionWith: string[] }) {
  if (!avoidIf.length && !useCautionWith.length) return null
  return (
    <section className='rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm'>
      <h2 className='text-lg font-black text-slate-950'>Safety</h2>
      <div className='mt-4 grid gap-4 sm:grid-cols-2'>
        {avoidIf.length ? <div><h3 className='text-sm font-black text-red-800'>Avoid if</h3><ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>{avoidIf.map(item => <li key={item}>{item}</li>)}</ul></div> : null}
        {useCautionWith.length ? <div><h3 className='text-sm font-black text-amber-800'>Use caution with</h3><ul className='mt-2 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>{useCautionWith.map(item => <li key={item}>{item}</li>)}</ul></div> : null}
      </div>
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
  const commonUses = unique(list(herb.primary_effects)).slice(0, 6)
  const claims = unique((await getClaims()).filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug).map((item: any) => text(item.claim || item.text || item.title)))
  const bestForTags = getBestForTags(herb, claims)
  const tagState = visibleTags(bestForTags)
  const relatedCompounds = await getRelatedCompounds(herb)
  const mechanisms = unique([text(herb.mechanism_summary), ...list(herb.mechanisms)]).map(cleanMechanism).filter(Boolean).slice(0, 4)
  const safetyItems = unique([text(herb.safetyNotes), ...list(herb.contraindications), ...list(herb.interactions), ...list(herb.contraindications_interactions)])
  const safety = splitSafety(safetyItems)
  const netScore = text(herb.net_score)
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)
  const bestFor = sentenceList(unique(list(herb.primary_effects)).slice(0, 3))
  const timeToEffect = text(herb.time_to_effect) || 'Varies'
  const evidence = text(herb.evidence_grade) || text(herb.evidenceLevel) || 'Limited'
  const safetySummary = sentenceList(safetyItems) || 'Review safety notes'

  return (
    <div className='space-y-6'>
      <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: label, description: leadText, url: `https://thehippiescientist.net/herbs/${herb.slug}`, publisher: { '@type': 'Organization', name: 'The Hippie Scientist' } }) }} />
      {faqJsonLd ? <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <nav className='flex flex-wrap gap-2 text-sm'>
        <Link href='/herbs' className='min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'>← Herbs</Link>
        <Link href='/compounds' className='min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'>Compounds</Link>
      </nav>

      <DecisionSnapshot verdict={safetySummary} bestFor={bestFor} safety={safetySummary} timeToEffect={timeToEffect} evidence={evidence} />

      <section className='hero-panel'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='premium-chip-green'>Herb profile</span>
          {isRenderable(text(herb.evidence_grade)) ? <span className='premium-chip'>{text(herb.evidence_grade)}</span> : null}
        </div>
        <h1 className='mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl'>{label}</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg'>{leadText}</p>
        <p className='mt-3 text-sm font-bold text-emerald-800'>Built from human evidence and mechanism-backed compound data.</p>
        {tagState.shown.length ? <div className='mt-5 flex flex-wrap gap-2'>{tagState.shown.map(tag => <span key={tag} className='max-w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow-sm'>{tag}</span>)}{tagState.hidden > 0 ? <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm'>+{tagState.hidden} more</span> : null}</div> : null}
      </section>

      {commonUses.length ? <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'><h2 className='text-lg font-black text-slate-950'>Common Uses</h2><ul className='mt-3 grid gap-2 text-sm leading-6 text-slate-700 sm:grid-cols-2'>{commonUses.map(use => <li key={use} className='rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold'>{use}</li>)}</ul></section> : null}

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-lg font-black text-slate-950'>Who this is for</h2>
        <p className='mt-2 text-sm text-slate-700'>Best suited for people looking for {bestFor || 'general support'} with safety context reviewed first.</p>
      </section>

      <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
        <h2 className='text-lg font-black text-slate-950'>What to expect</h2>
        <p className='mt-2 text-sm text-slate-700'>Effects typically appear in {timeToEffect}. Evidence strength is {evidence.toLowerCase()}.</p>
      </section>

      <div className='grid gap-6 lg:grid-cols-[1.35fr_0.85fr]'>
        <main className='space-y-6'>
          <KeyFacts items={[{ label: 'Name', value: text(herb.name) || label }, { label: 'Primary effects', value: unique(list(herb.primary_effects)).slice(0, 4).join(', ') }, { label: 'Dosage range', value: text(herb.dosage_range) || text(herb.dosage) }, { label: 'Oral form', value: text(herb.oral_form) || text(herb.preparation) }, { label: 'Overall Confidence Score', value: netScore, hint: '-100 to +100', tone: scoreTone(netScore) }]} />
          <MiniList title='How It Works' items={mechanisms} />
          <MiniList title='Evidence Notes' items={claims} />
          <SafetyPanel avoidIf={safety.avoidIf} useCautionWith={safety.useCautionWith} />
        </main>
        <aside className='space-y-6'>
          <section className='rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm'>
            <p className='text-xs font-black uppercase tracking-[0.2em] text-emerald-800'>Choose the Right Form</p>
            <h2 className='mt-2 text-lg font-black text-slate-950'>Find {label}</h2>
            <p className='mt-2 text-sm leading-6 text-slate-700'>Different forms affect potency, absorption, and convenience.</p>
            <p className='mt-1 text-xs leading-5 text-slate-500'>As an Amazon Associate I earn from qualifying purchases.</p>
            <div className='mt-4 grid gap-2'>{affiliateLinks.map(link => <a key={link.label} href={link.url} target='_blank' rel='noopener noreferrer sponsored' className='flex min-h-11 w-full items-center justify-between rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-100 active:scale-[0.99]'><span><span className='block'>{link.label}</span><span className='block text-xs font-normal text-slate-500'>{link.helperText}</span></span><span aria-hidden='true'>→</span></a>)}</div>
          </section>
          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'><h2 className='text-lg font-black text-slate-950'>Reminder</h2><p className='mt-3 text-sm leading-6 text-slate-700'>Educational research context only. Check medications, conditions, pregnancy, surgery, and clinician guidance before using supplements.</p></section>
        </aside>
      </div>

      {relatedCompounds.length ? <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'><h2 className='text-lg font-black text-slate-950'>Similar Active Compounds</h2><p className='mt-2 text-sm leading-6 text-slate-600'>These compounds share similar mechanisms or occur in this herb.</p><div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>{relatedCompounds.map(item => <Link key={item.href} href={item.href} className='block min-h-11 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-emerald-300 hover:bg-white active:scale-[0.99]'><h3 className='font-black text-slate-950'>{item.title}</h3><p className='mt-1 text-sm leading-5 text-slate-600'>{truncate(item.description)}</p></Link>)}</div></section> : null}
    </div>
  )
}

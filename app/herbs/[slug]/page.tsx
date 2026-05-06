import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Leaf } from 'lucide-react'
import { DetailCard, EvidenceBadge } from '@/components/ui'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'
import { cleanSummary, formatDisplayLabel, hideInternalValue, isClean, list, text, unique } from '@/lib/display-utils'

type Params = { params: Promise<{ slug: string }> }
type HerbDetail = Record<string, any>
type RelatedLinkItem = { href: string; title: string; description: string }

const formatSlugLabel = (slug: string) => slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const getHerbLabel = (herb: HerbDetail) => formatDisplayLabel(herb.displayName) || formatDisplayLabel(herb.name) || formatSlugLabel(herb.slug)

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

  return cleanSummary(text(herb.summary) || text(herb.description), 'herb')
}

const cleanMechanism = (item: string) => {
  const cleaned = formatDisplayLabel(item).replace(/\([^)]*\)/g, '').replace(/\bmay\b/gi, '').replace(/\s+/g, ' ').trim()
  if (!isClean(cleaned)) return ''
  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
  if (/^(supports|influences|modulates|helps|affects|promotes|inhibits|activates)\b/i.test(cleaned)) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return `Supports ${lower}`
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items.map(formatDisplayLabel).filter(isClean)).slice(0, 10)
  return {
    avoidIf: cleaned.filter(item => /avoid|contraindicat|pregnan|allerg|do not|kidney disease|seizure|children/i.test(item)).slice(0, 5),
    useCautionWith: cleaned.filter(item => !/avoid|contraindicat|pregnan|allerg|do not|kidney disease|seizure|children/i.test(item)).slice(0, 5),
  }
}

const pmidUrl = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id.replace(/\D/g, '')}`

const getRelatedCompounds = async (herb: HerbDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, compounds] = await Promise.all([getHerbCompoundMap(), getCompounds()])
  const validCompoundSlugs = new Set(compounds.map((compound: any) => compound.slug).filter(Boolean))
  const seen = new Set<string>()

  return compoundMap
    .filter((entry: any) => (entry.herbSlug || entry.herb_slug) === herb.slug)
    .map((entry: any) => ({
      slug: entry.canonicalCompoundId || entry.compound_slug || '',
      name: entry.canonicalCompoundName || entry.compound_name || '',
      reason: entry.relationship_reason || entry.reason || entry.mechanism,
    }))
    .filter(entry => entry.slug && validCompoundSlugs.has(entry.slug))
    .filter(entry => {
      if (seen.has(entry.slug)) return false
      seen.add(entry.slug)
      return true
    })
    .slice(0, 6)
    .map(entry => ({
      href: `/compounds/${entry.slug}/`,
      title: formatDisplayLabel(entry.name) || formatSlugLabel(entry.slug),
      description: isClean(entry.reason)
        ? formatDisplayLabel(entry.reason)
        : 'Occurs in this herb or shares related mechanism context.'
    }))
}

const BulletList = ({ items, color = 'bg-brand-700' }: { items: string[], color?: string }) => (
  <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
    {items.map((item, index) => (
      <li key={`${item}-${index}`} className="flex gap-3">
        <span className={`mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full ${color}`} />
        <span>{item}</span>
      </li>
    ))}
  </ul>
)

export async function generateStaticParams() {
  const herbs = await getHerbs()
  return herbs.map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) return { title: 'Herb Not Found | The Hippie Scientist' }

  return {
    title: `${getHerbLabel(herb)} | Herb`,
    description: getLeadText(herb),
    alternates: { canonical: `/herbs/${herb.slug}` }
  }
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)
  if (!herb) notFound()

  const label = getHerbLabel(herb)
  const leadText = getLeadText(herb)
  const affiliateLinks = getHerbSearchLinks(label).filter(link => link.url && link.label)
  const relatedCompounds = await getRelatedCompounds(herb)
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)

  const claims = unique(
    (await getClaims())
      .filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug)
      .map((item: any) => formatDisplayLabel(item.claim || item.text || item.title))
      .filter(isClean)
  ).slice(0, 6)

  const bestFor = unique([
    ...list(herb.primary_effects),
    formatDisplayLabel(herb.primaryDomain),
    ...claims.map(claim => claim.replace(/^best for\s+/i, '')),
  ].filter(isClean)).slice(0, 6)

  const mechanisms = unique([
    text(herb.mechanism_summary),
    ...list(herb.mechanisms)
  ].map(cleanMechanism).filter(isClean)).slice(0, 6)

  const safetyNote = formatDisplayLabel(herb.safetyNotes)

  const safetyItems = unique([
    safetyNote,
    ...list(herb.contraindications),
    ...list(herb.interactions),
    ...list(herb.contraindications_interactions)
  ].filter(isClean))

  const safety = splitSafety(safetyItems)

  const evidence = formatDisplayLabel(herb.evidence_grade) || formatDisplayLabel(herb.evidenceLevel) || 'Limited'
  const dosage = formatDisplayLabel(herb.dosage_range) || formatDisplayLabel(herb.dosage)
  const form = formatDisplayLabel(herb.oral_form) || formatDisplayLabel(herb.preparation)
  const timeToEffect = formatDisplayLabel(herb.time_to_effect)
  const updatedAt = text(herb.updated_at || herb.last_updated || herb.lastReviewedAt)

  const pmids = unique([
    ...list(herb.pmid_list),
    ...list(herb.pmids),
    ...list(herb.references)
  ].filter(id => /\d/.test(id))).slice(0, 10)

  const hasSafety = Boolean(safetyNote || safety.avoidIf.length || safety.useCautionWith.length)
  const hasForms = Boolean(form || dosage || timeToEffect)
  const hasCta = relatedCompounds.length > 0 || affiliateLinks.length > 0

  const toc = [
    bestFor.length ? ['best-for', 'Best for'] : null,
    mechanisms.length ? ['mechanisms', 'Mechanisms'] : null,
    hasSafety ? ['safety', 'Safety'] : null,
    hasForms ? ['forms', 'Forms & dosage'] : null,
    relatedCompounds.length ? ['related-compounds', 'Related compounds'] : null,
    pmids.length ? ['sources', 'Sources'] : null,
    affiliateLinks.length ? ['products', 'Product research'] : null,
  ].filter(Boolean) as string[][]

  return (
    <div className="grid gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: label, description: leadText, url: `https://thehippiescientist.net/herbs/${herb.slug}`, publisher: { '@type': 'Organization', name: 'The Hippie Scientist' } }) }} />
      {faqJsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <aside className="hidden lg:block">
        {toc.length > 0 ? (
          <nav className="sticky top-24 rounded-2xl border border-brand-900/10 bg-[rgba(255,253,247,0.92)] p-4 shadow-[0_10px_40px_rgba(29,74,47,0.06)]">
            <p className="eyebrow text-brand-700">On this page</p>
            <div className="mt-3 grid gap-2 text-sm">
              {toc.map(([href, title]) => (
                <a key={href} href={`#${href}`} className="rounded-lg px-3 py-2 font-medium text-[#46574d] transition-colors hover:bg-white hover:text-brand-800">
                  {title}
                </a>
              ))}
            </div>
          </nav>
        ) : null}
      </aside>

      <main className="detail-stack">
        <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 bg-[linear-gradient(180deg,#fffdf7_0%,#fbf6e9_100%)] p-6 shadow-card sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-3">
            <Leaf className="text-brand-700" aria-hidden="true" />
            <h1 className="heading-premium max-w-4xl text-ink">{label}</h1>
            <EvidenceBadge value={evidence} />
          </div>

          <p className="text-reading mt-5 max-w-reading text-lg text-muted-soft">
            {leadText}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <span className="chip-readable">Evidence-aware</span>
            <span className="chip-readable">Human data prioritized</span>
            <span className="chip-readable">Safety context included</span>
          </div>

          {updatedAt ? <p className="mt-5 text-sm text-muted-soft">Last updated {updatedAt}</p> : null}
        </section>
      </main>
    </div>
  )
}

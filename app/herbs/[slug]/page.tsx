import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Leaf } from 'lucide-react'
import { DetailCard, EvidenceBadge } from '@/components/ui'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }
type HerbDetail = Record<string, any>
type RelatedLinkItem = { href: string; title: string; description: string }

const PLACEHOLDER_PATTERNS = [
  /research[_\s-]*only/i,
  /lean monograph row enriched/i,
  /lean herb row/i,
  /enriched in bulk mode/i,
  /bulk mode/i,
  /schema artifact/i,
  /placeholder/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^none$/i,
]

const LABEL_MAP: Record<string, string> = {
  healthy_aging: 'Healthy aging',
  fat_loss: 'Fat loss',
  stress_mood: 'Stress & mood',
  sleep_quality: 'Sleep quality',
  general_wellness: 'General wellness',
}

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const humanize = (value: unknown): string => {
  const raw = text(value)
  if (!raw) return ''
  const key = raw.toLowerCase().trim()
  if (key === 'research_only') return ''
  if (LABEL_MAP[key]) return LABEL_MAP[key]

  return raw
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, char => char.toUpperCase())
}

const isRenderable = (value: unknown) => {
  const normalized = text(value)
  return Boolean(normalized) && !PLACEHOLDER_PATTERNS.some(pattern => pattern.test(normalized))
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(humanize).filter(isRenderable)
  return text(value)
    .split(/\n|;|\|/)
    .flatMap(item => item.split(/,(?=\s*[a-zA-Z])/))
    .map(item => humanize(item.replace(/^[-*•]\s*/, '').trim()))
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
const getHerbLabel = (herb: HerbDetail) => humanize(herb.displayName) || humanize(herb.name) || formatSlugLabel(herb.slug)

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
  const summary = text(herb.summary) || text(herb.description)
  return isRenderable(summary) ? summary : 'Evidence-aware herb profile with mechanism and safety context.'
}

const cleanMechanism = (item: string) => {
  const cleaned = humanize(item).replace(/\([^)]*\)/g, '').replace(/\bmay\b/gi, '').replace(/\s+/g, ' ').trim()
  if (!isRenderable(cleaned)) return ''
  const lower = cleaned.charAt(0).toLowerCase() + cleaned.slice(1)
  if (/^(supports|influences|modulates|helps|affects|promotes|inhibits|activates)\b/i.test(cleaned)) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
  return `Supports ${lower}`
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items.map(humanize).filter(isRenderable)).slice(0, 10)
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
    .map((entry: any) => ({ slug: entry.canonicalCompoundId || entry.compound_slug || '', name: entry.canonicalCompoundName || entry.compound_name || '' }))
    .filter(entry => entry.slug && validCompoundSlugs.has(entry.slug))
    .filter(entry => {
      if (seen.has(entry.slug)) return false
      seen.add(entry.slug)
      return true
    })
    .slice(0, 6)
    .map(entry => ({ href: `/compounds/${entry.slug}/`, title: humanize(entry.name) || formatSlugLabel(entry.slug), description: 'Occurs in this herb or shares related mechanism context.' }))
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
  return { title: `${getHerbLabel(herb)} | Herb`, description: getLeadText(herb), alternates: { canonical: `/herbs/${herb.slug}` } }
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
  const claims = unique((await getClaims()).filter((item: any) => (item.target_slug || item.targetSlug) === herb.slug).map((item: any) => humanize(item.claim || item.text || item.title)).filter(isRenderable)).slice(0, 6)

  const bestFor = unique([...list(herb.primary_effects), humanize(herb.primaryDomain), ...claims.map(claim => claim.replace(/^best for\s+/i, ''))].filter(isRenderable)).slice(0, 6)
  const mechanisms = unique([text(herb.mechanism_summary), ...list(herb.mechanisms)].map(cleanMechanism).filter(isRenderable)).slice(0, 6)
  const safetyNote = humanize(herb.safetyNotes)
  const safetyItems = unique([safetyNote, ...list(herb.contraindications), ...list(herb.interactions), ...list(herb.contraindications_interactions)].filter(isRenderable))
  const safety = splitSafety(safetyItems)
  const evidence = humanize(herb.evidence_grade) || humanize(herb.evidenceLevel) || 'Limited'
  const dosage = humanize(herb.dosage_range) || humanize(herb.dosage)
  const form = humanize(herb.oral_form) || humanize(herb.preparation)
  const timeToEffect = humanize(herb.time_to_effect)
  const updatedAt = text(herb.updated_at || herb.last_updated || herb.lastReviewedAt)
  const pmids = unique([...list(herb.pmid_list), ...list(herb.pmids), ...list(herb.references)].filter(id => /\d/.test(id))).slice(0, 10)

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

        {bestFor.length > 0 ? (
          <DetailCard eyebrow="Profile Snapshot" title="Best for" description="Top use-cases surfaced from the current herb profile and linked claim data." id="best-for">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bestFor.map(item => (
                <div key={item} className="surface-subtle rounded-2xl p-4">
                  <p className="text-sm font-semibold leading-6 text-ink">{item}</p>
                </div>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {mechanisms.length > 0 ? (
          <DetailCard eyebrow="Mechanism Context" title="Mechanisms" description="Mechanistic signals are framed conservatively and should not be read as proven clinical effects." id="mechanisms">
            <BulletList items={mechanisms} />
          </DetailCard>
        ) : null}

        {hasSafety ? (
          <DetailCard eyebrow="Safety Context" title="Safety" description="Safety notes are shown only when profile data is present." id="safety">
            <div className="grid gap-6 lg:grid-cols-2">
              {safety.avoidIf.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-red-700/10 bg-red-50/70 p-5">
                  <h3 className="text-base font-semibold text-ink">Avoid if</h3>
                  <BulletList items={safety.avoidIf} color="bg-red-700" />
                </div>
              ) : null}

              {safety.useCautionWith.length > 0 ? (
                <div className="space-y-3 rounded-2xl border border-amber-700/15 bg-amber-50/80 p-5">
                  <h3 className="text-base font-semibold text-ink">Use caution with</h3>
                  <BulletList items={safety.useCautionWith} color="bg-amber-600" />
                </div>
              ) : null}
            </div>

            {safetyNote ? (
              <div className="mt-6 rounded-2xl border border-brand-900/10 bg-white/80 p-5">
                <h3 className="text-base font-semibold text-ink">General safety note</h3>
                <p className="mt-2 text-sm leading-7 text-[#46574d]">{safetyNote}</p>
              </div>
            ) : null}
          </DetailCard>
        ) : null}

        {hasForms ? (
          <DetailCard eyebrow="Practical Context" title="Forms & dosage" description="Shown only when the profile includes preparation, dosage, or timing information." id="forms">
            <div className="grid gap-4 md:grid-cols-3">
              {form ? (
                <div className="surface-subtle rounded-2xl p-5">
                  <p className="eyebrow-label">Forms / preparation</p>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{form}</p>
                </div>
              ) : null}

              {dosage ? (
                <div className="surface-subtle rounded-2xl p-5">
                  <p className="eyebrow-label">Dosage note</p>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{dosage}</p>
                </div>
              ) : null}

              {timeToEffect ? (
                <div className="surface-subtle rounded-2xl p-5">
                  <p className="eyebrow-label">Time to effect</p>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{timeToEffect}</p>
                </div>
              ) : null}
            </div>
          </DetailCard>
        ) : null}

        {relatedCompounds.length > 0 ? (
          <DetailCard eyebrow="Compound Links" title="Related compounds" description="Compounds linked to this herb through occurrence or shared mechanism context." id="related-compounds">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedCompounds.map(item => (
                <Link key={item.href} href={item.href} className="card-premium block p-5 hover:-translate-y-1">
                  <h3 className="text-base font-semibold tracking-tight text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-800">Open compound →</p>
                </Link>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {pmids.length > 0 ? (
          <DetailCard eyebrow="Source Trail" title="PubMed links" description="Reference identifiers surfaced from the current profile data." id="sources">
            <div className="flex flex-wrap gap-3">
              {pmids.map(id => (
                <a key={id} href={pmidUrl(id)} target="_blank" rel="noreferrer" className="chip-readable hover:text-brand-800">
                  PMID {id.replace(/\D/g, '')}
                  <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {affiliateLinks.length > 0 ? (
          <DetailCard eyebrow="Product Research" title="Search product options" description="Use these as research starting points; compare labels, standardization, serving size, and third-party testing before buying." id="products">
            <div className="grid gap-4 md:grid-cols-3">
              {affiliateLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="sponsored noreferrer" className="surface-subtle rounded-2xl p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <h3 className="text-base font-semibold text-ink">{link.label}</h3>
                  <p className="mt-2 text-sm leading-7 text-[#46574d]">{link.helperText}</p>
                  <p className="mt-4 inline-flex items-center text-sm font-semibold text-brand-800">
                    Search options <ExternalLink className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
                  </p>
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {hasCta ? (
          <section className="surface-depth card-spacing rounded-[2rem]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="eyebrow-label">Next step</p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink">Keep researching {label}</h2>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                {relatedCompounds.length > 0 ? (
                  <a href="#related-compounds" className="button-secondary rounded-full">Compare related compounds</a>
                ) : null}
                {affiliateLinks.length > 0 ? (
                  <a href="#products" className="button-primary rounded-full">Search product options</a>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  )
}

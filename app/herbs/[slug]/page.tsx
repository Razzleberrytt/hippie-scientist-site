import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ExternalLink, Leaf } from 'lucide-react'
import blogPosts from '../../../data/blog/posts.json'
import { DetailCard, EvidenceBadge } from '@/components/ui'
import CompareWithCard from '@/components/ui/CompareWithCard'
import RelatedPathways from '@/components/ui/RelatedPathways'
import ResearchFocusAreas from '@/components/ui/ResearchFocusAreas'
import ResearchGapsCard from '@/components/ui/ResearchGapsCard'
import ResearchStyleBadge from '@/components/ui/ResearchStyleBadge'
import ScientificConsensusCard from '@/components/ui/ScientificConsensusCard'
import { EvidenceMaturityRibbon, ResearchContinuityBlock } from '@/components/scientific-discovery'
import { getClaims, getCompounds, getHerbBySlug, getHerbCompoundMap, getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { commonSupplementFaqJsonLd } from '@/lib/seo'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import {
  deriveConsensusSummary,
  deriveEvidenceFraming,
  deriveRelatedPathways,
  deriveResearchFocusAreas,
  deriveResearchStyle,
  deriveEvidenceLimitations,
  inferResearchGaps,
} from '@/lib/research-intelligence'
import { buildSemanticTopics, findRelatedArticles } from '@/lib/editorial-discovery'

type Params = { params: Promise<{ slug: string }> }
type HerbDetail = Record<string, any>
type RelatedLinkItem = { href: string; title: string; description: string }

type EditorialCard = {
  title: string
  text: string
}

const formatSlugLabel = (slug: string) => slug.split('-').filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')
const getHerbLabel = (herb: HerbDetail) => formatDisplayLabel(herb.displayName) || formatDisplayLabel(herb.name) || formatSlugLabel(herb.slug)

const getLeadText = (herb: HerbDetail) => {
  const effects = unique([...list(herb.primary_effects), ...list(herb.primaryActions)]).slice(0, 3)
  if (effects.length) {
    return `Traditionally used for ${effects.join(', ')}.`
  }

  return cleanSummary(text(herb.summary) || text(herb.description), 'herb')
}

const getOutcomeText = (label: string) => {
  const value = label.toLowerCase()

  if (/sleep/.test(value)) return 'Often explored for sleep quality, nighttime recovery, or stress-related rest support.'
  if (/stress|mood|anxiety|calm/.test(value)) return 'Traditionally framed around resilience, calm, and adaptive stress-response support.'
  if (/energy|fatigue|stamina|vitality/.test(value)) return 'Usually positioned around perceived energy, stamina, and daily vitality support.'
  if (/digest|gut|bile|liver/.test(value)) return 'Most relevant to digestive comfort, preparation form, and context-specific use.'
  if (/immune|respiratory/.test(value)) return 'Best read as immune or respiratory support context rather than disease treatment.'
  if (/inflamm|joint|pain/.test(value)) return 'Connected to inflammatory-pathway or comfort-related support signals in the profile.'
  if (/metabolic|glucose|weight|fat loss/.test(value)) return 'Most relevant to metabolic-support framing where the evidence context allows it.'
  if (/cognition|focus|memory|brain/.test(value)) return 'Explored for cognitive, focus, or nervous-system support signals.'

  return 'A profile signal surfaced from available effect, claim, or traditional-use data.'
}

const getMechanismText = (label: string) => {
  const value = label.toLowerCase()

  if (/nf.?kb|inflamm|cytokine/.test(value)) return 'Inflammatory pathway modulation signal.'
  if (/gaba|glutamate|neurotransmitter|serotonin|dopamine/.test(value)) return 'Nervous-system and neurotransmitter signaling context.'
  if (/cortisol|hpa|adrenal|stress/.test(value)) return 'Stress-response and neuroendocrine signaling context.'
  if (/antioxidant|oxidative|nrf2/.test(value)) return 'Oxidative-stress and cellular defense pathway support.'
  if (/ampk|glucose|insulin|metabolic/.test(value)) return 'Metabolic signaling and energy-balance pathway context.'
  if (/nitric|endothelial|vascular|blood pressure/.test(value)) return 'Vascular or endothelial signaling context.'
  if (/immune/.test(value)) return 'Immune-signaling context that should be interpreted conservatively.'

  return 'Mechanistic signal from the current profile data; not proof of a clinical outcome.'
}

const groupMechanisms = (cards: EditorialCard[]) => {
  const groups = [
    { title: 'Nervous system', matcher: /gaba|glutamate|neurotransmitter|serotonin|dopamine|cortisol|hpa|stress|brain|cognition/i, items: [] as EditorialCard[] },
    { title: 'Inflammatory / immune', matcher: /nf.?kb|inflamm|cytokine|immune/i, items: [] as EditorialCard[] },
    { title: 'Metabolic / vascular', matcher: /ampk|glucose|insulin|metabolic|nitric|endothelial|vascular|blood pressure/i, items: [] as EditorialCard[] },
    { title: 'Antioxidant / cellular defense', matcher: /antioxidant|oxidative|nrf2/i, items: [] as EditorialCard[] },
    { title: 'Other mechanisms', matcher: /.*/, items: [] as EditorialCard[] },
  ]

  cards.forEach(card => {
    const group = groups.find(item => item.matcher.test(card.title) || item.matcher.test(card.text)) || groups[groups.length - 1]
    group.items.push(card)
  })

  return groups.filter(group => group.items.length > 0)
}

const splitSafety = (items: string[]) => {
  const cleaned = unique(items.map(formatDisplayLabel).filter(isClean)).slice(0, 10)

  return {
    avoidIf: cleaned.filter(item => /avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
    useCautionWith: cleaned.filter(item => !/avoid|contraindicat|pregnan|allerg|do not/i.test(item)).slice(0, 5),
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
      href: `/compounds/${entry.canonicalCompoundId || entry.compound_slug}/`,
      title: formatDisplayLabel(entry.canonicalCompoundName || entry.compound_name),
      description: formatDisplayLabel(entry.relationship_reason || entry.reason || entry.mechanism || 'Related mechanism context'),
      slug: entry.canonicalCompoundId || entry.compound_slug,
    }))
    .filter((entry: any) => entry.slug && validCompoundSlugs.has(entry.slug))
    .filter((entry: any) => {
      if (seen.has(entry.slug)) return false
      seen.add(entry.slug)
      return true
    })
    .slice(0, 6)
}

const BulletList = ({ items, color = 'bg-brand-700' }: { items: string[], color?: string }) => {
  const visibleItems = items.map(formatDisplayLabel).filter(isClean)

  if (!visibleItems.length) return null

  return (
    <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
      {visibleItems.map((item, index) => (
        <li key={`${item}-${index}`} className="flex gap-3">
          <span className={`mt-[0.55rem] h-1.5 w-1.5 flex-none rounded-full ${color}`} />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

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
    ...claims,
  ].filter(isClean)).slice(0, 6)

  const outcomeCards: EditorialCard[] = bestFor.map(item => ({
    title: formatDisplayLabel(item),
    text: getOutcomeText(item),
  })).filter(card => card.title && isClean(card.title))

  const mechanisms = unique([
    ...list(herb.mechanisms),
    formatDisplayLabel(herb.mechanism_summary)
  ].filter(isClean)).slice(0, 6)

  const mechanismCards: EditorialCard[] = mechanisms.map(item => ({
    title: formatDisplayLabel(item),
    text: getMechanismText(item),
  })).filter(card => card.title && isClean(card.title))

  const mechanismGroups = groupMechanisms(mechanismCards)

  const safetyNote = formatDisplayLabel(herb.safetyNotes)

  const safetyItems = unique([
    safetyNote,
    ...list(herb.contraindications),
    ...list(herb.interactions),
  ].filter(isClean))

  const safety = splitSafety(safetyItems)

  const evidence = formatDisplayLabel(herb.evidence_grade) || formatDisplayLabel(herb.evidenceLevel) || 'Limited'
  const dosage = formatDisplayLabel(herb.dosage_range) || formatDisplayLabel(herb.dosage)
  const form = formatDisplayLabel(herb.oral_form) || formatDisplayLabel(herb.preparation)
  const timeToEffect = formatDisplayLabel(herb.time_to_effect)
  const overviewSummary = cleanSummary(text(herb.summary) || text(herb.description), 'herb')

  const profileOverview = [
    overviewSummary,
    outcomeCards.length > 0 ? `The strongest visible profile signals center on ${outcomeCards.slice(0, 3).map(card => card.title.toLowerCase()).join(', ')}.` : '',
    mechanismCards.length > 0 ? `Mechanistic notes point toward ${mechanismCards.slice(0, 2).map(card => card.title.toLowerCase()).join(' and ')}, which should be interpreted as context rather than a guaranteed outcome.` : '',
  ].filter(item => item && isClean(item)).join(' ')

  const pmids = unique([
    ...list(herb.pmid_list),
    ...list(herb.pmids),
    ...list(herb.references)
  ].filter(id => /\d/.test(id))).slice(0, 10)

  const researchInputs = { profile: herb, claims, pmids, mechanisms }
  const semanticTopics = buildSemanticTopics(herb)
  const relatedArticles = findRelatedArticles(herb, blogPosts as any[], 4)
  const evidenceFrame = deriveEvidenceFraming(researchInputs)
  const researchStyle = deriveResearchStyle(researchInputs)
  const consensusSummary = deriveConsensusSummary(researchInputs)
  const relatedPathways = deriveRelatedPathways(mechanisms)
  const researchGaps = inferResearchGaps(researchInputs)
  const evidenceLimitations = deriveEvidenceLimitations(researchInputs)
  const focusAreas = deriveResearchFocusAreas(researchInputs)
  const compareItems = relatedCompounds.map(item => ({
    href: item.href,
    title: item.title,
    description: item.description,
  }))

  const hasForms = Boolean(form || dosage || timeToEffect)

  const productGuidance = [
    form ? `Start by matching the product form to the preparation used in the profile: ${form}.` : '',
    dosage ? `Compare serving sizes against the dosage note instead of assuming every extract is equivalent.` : '',
    'Prefer transparent labels, clear plant part or extract details, and avoid vague proprietary blends when possible.',
  ].filter(Boolean)

  const toc = [
    profileOverview ? ['overview', 'Overview'] : null,
    ['evidence-framing', 'Evidence framing'],
    consensusSummary ? ['scientific-consensus', 'Consensus'] : null,
    focusAreas.length ? ['research-focus', 'Research focus'] : null,
    relatedPathways.length ? ['related-pathways', 'Related pathways'] : null,
    outcomeCards.length ? ['best-for', 'Explored for'] : null,
    mechanismGroups.length ? ['mechanisms', 'Mechanisms'] : null,
    researchGaps.length || evidenceLimitations.length ? ['research-gaps', 'Research gaps'] : null,
    compareItems.length ? ['compare-with', 'Compare with'] : null,
    safetyItems.length ? ['safety', 'Safety'] : null,
    hasForms ? ['forms', 'Forms & dosage'] : null,
    relatedArticles.length ? ['related-articles', 'Related articles'] : null,
    relatedCompounds.length ? ['related-compounds', 'Related compounds'] : null,
    pmids.length ? ['sources', 'Sources'] : null,
    affiliateLinks.length ? ['products', 'Product research'] : null,
  ].filter(Boolean) as string[][]

  return (
    <div className="grid gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
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
            <ResearchStyleBadge style={researchStyle} />
            <EvidenceMaturityRibbon label={semanticTopics.maturity} />
          </div>

          <p className="text-reading mt-5 max-w-reading text-lg text-[#46574d]">
            {leadText}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            {[
              ['Most researched for', semanticTopics.effects[0] || 'General wellness context'],
              ['Pathway cluster', semanticTopics.mechanisms[0] || 'Whole-system context'],
              ['Research style', semanticTopics.researchStyle],
            ].map(([title, value]) => (
              <div key={title} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4">
                <p className="identity-meta">{title}</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {profileOverview ? (
          <DetailCard id="overview" eyebrow="Profile Overview" title="Scientific snapshot" description="A concise interpretation of the available profile fields without adding unsupported claims.">
            <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
              <p className="detail-reading text-[#46574d]">
                {profileOverview}
              </p>
              <aside className="pull-quote-science">
                Current evidence suggests this profile is best read as a set of signals — not a guaranteed outcome or treatment claim.
              </aside>
            </div>
          </DetailCard>
        ) : null}

        <DetailCard id="evidence-framing" eyebrow="Evidence Intelligence" title="Evidence framing" description="A conservative reading of the visible profile signals.">
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            {[
              `Evidence maturity: ${semanticTopics.maturity}`,
              `Primary cluster: ${semanticTopics.effects[0] || 'Context dependent'}`,
              `Main pathway: ${semanticTopics.mechanisms[0] || 'Not yet specific'}`,
            ].map(item => (
              <div key={item} className="mobile-reading-card text-sm font-semibold leading-7 text-ink">{item}</div>
            ))}
          </div>
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="surface-depth rounded-2xl p-5">
              <p className="eyebrow-label">Research maturity</p>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{evidenceFrame.maturity}</h3>
              <p className="mt-3 text-sm leading-7 text-[#46574d]">{evidenceFrame.summary}</p>
            </div>

            <div className="surface-subtle rounded-2xl p-5">
              <p className="eyebrow-label">How to read this profile</p>
              <div className="mt-4">
                <BulletList items={evidenceFrame.notes} />
              </div>
            </div>
          </div>
        </DetailCard>


        {consensusSummary ? (
          <DetailCard id="scientific-consensus" eyebrow="Research Intelligence" title="Scientific consensus" description="A conservative summary derived from existing structured profile signals.">
            <ScientificConsensusCard summary={consensusSummary} style={researchStyle} />
          </DetailCard>
        ) : null}

        {focusAreas.length ? (
          <DetailCard id="research-focus" eyebrow="Semantic Discovery" title="Research focus areas" description="Clean topic clusters surfaced from existing effects, claims, and mechanisms.">
            <ResearchFocusAreas areas={focusAreas} />
          </DetailCard>
        ) : null}

        {relatedPathways.length ? (
          <DetailCard id="related-pathways" eyebrow="Mechanism Discovery" title="Related pathways" description="Pathway chips derived only from mechanisms already listed in this profile.">
            <RelatedPathways pathways={relatedPathways} />
          </DetailCard>
        ) : null}

        {researchGaps.length || evidenceLimitations.length ? (
          <DetailCard id="research-gaps" eyebrow="Uncertainty" title="Research gaps & limitations" description="Important constraints that keep the profile scientifically conservative.">
            <ResearchGapsCard gaps={researchGaps} limitations={evidenceLimitations} />
          </DetailCard>
        ) : null}

        {compareItems.length ? (
          <DetailCard id="compare-with" eyebrow="Compound Links" title="Compare with" description="Compounds shown here come from existing related compound data for this herb.">
            <CompareWithCard items={compareItems} />
          </DetailCard>
        ) : null}


        {outcomeCards.length > 0 ? (
          <DetailCard id="best-for" eyebrow="Use Cases" title="Commonly explored for" description="Conservative use-case signals surfaced from the current profile and linked claim data.">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {outcomeCards.map(card => (
                <div key={card.title} className="surface-subtle rounded-2xl p-5">
                  <h3 className="text-base font-semibold text-ink">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{card.text}</p>
                </div>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {mechanismGroups.length > 0 ? (
          <DetailCard id="mechanisms" eyebrow="Mechanism Context" title="Mechanisms" description="Mechanisms are grouped by theme and interpreted conservatively.">
            <div className="space-y-6">
              {mechanismGroups.map(group => (
                <div key={group.title} className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-brand-700">{group.title}</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {group.items.map(card => (
                      <div key={card.title} className="surface-subtle rounded-2xl p-5">
                        <h4 className="text-base font-semibold text-ink">{card.title}</h4>
                        <p className="mt-3 text-sm leading-7 text-[#46574d]">{card.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {safetyItems.length > 0 ? (
          <DetailCard id="safety" eyebrow="Safety Context" title="Safety">
            <div className="grid gap-6 lg:grid-cols-2">
              {safety.avoidIf.length > 0 ? (
                <div className="rounded-2xl border border-red-700/10 bg-red-50/70 p-5">
                  <h3 className="text-base font-semibold text-ink">Avoid if</h3>
                  <div className="mt-4">
                    <BulletList items={safety.avoidIf} color="bg-red-700" />
                  </div>
                </div>
              ) : null}

              {safety.useCautionWith.length > 0 ? (
                <div className="rounded-2xl border border-amber-700/10 bg-amber-50/70 p-5">
                  <h3 className="text-base font-semibold text-ink">Use caution with</h3>
                  <div className="mt-4">
                    <BulletList items={safety.useCautionWith} color="bg-amber-600" />
                  </div>
                </div>
              ) : null}
            </div>

            {safetyNote ? (
              <div className="mt-6 surface-subtle rounded-2xl p-5">
                <h3 className="text-base font-semibold text-ink">General safety note</h3>
                <p className="mt-3 text-sm leading-7 text-[#46574d]">{safetyNote}</p>
              </div>
            ) : null}
          </DetailCard>
        ) : null}

        {hasForms ? (
          <DetailCard id="forms" eyebrow="Practical Context" title="Forms & dosage">
            <div className="grid gap-4 md:grid-cols-3">
              {form ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Forms</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{form}</p></div> : null}
              {dosage ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Dosage note</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{dosage}</p></div> : null}
              {timeToEffect ? <div className="surface-subtle rounded-2xl p-5"><p className="eyebrow-label">Time to effect</p><p className="mt-3 text-sm leading-7 text-[#46574d]">{timeToEffect}</p></div> : null}
            </div>
          </DetailCard>
        ) : null}

        {relatedArticles.length > 0 ? (
          <DetailCard id="related-articles" eyebrow="Editorial Graph" title="Related articles" description="Research notes and explainers connected by title, profile language, mechanisms, and effect clusters.">
            <ResearchContinuityBlock
              title="Continue researching this topic"
              description="Move from the profile into publication-style context, then return to related herbs and compounds."
              items={relatedArticles}
            />
          </DetailCard>
        ) : null}

        {relatedCompounds.length > 0 ? (
          <DetailCard id="related-compounds" eyebrow="Compound Links" title="Related compounds">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {relatedCompounds.map(item => (
                <Link key={item.href} href={item.href} className="card-premium block p-5 hover:-translate-y-1">
                  <h3 className="text-base font-semibold text-ink">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{item.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-800">Open compound →</p>
                </Link>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {pmids.length > 0 ? (
          <DetailCard id="sources" eyebrow="Research References" title="PubMed links">
            <div className="flex flex-wrap gap-3">
              {pmids.map(id => (
                <a key={id} href={pmidUrl(id)} target="_blank" rel="noreferrer" className="chip-readable hover:text-brand-800">
                  PMID {id.replace(/\D/g, '')}
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {affiliateLinks.length > 0 ? (
          <DetailCard id="products" eyebrow="Product Research" title="Search product options" description="Use these as research starting points; compare labels, standardization, serving size, and third-party testing before buying.">
            {hasForms ? (
              <div className="mb-6 rounded-2xl border border-brand-900/10 bg-white/80 p-5">
                <h3 className="text-base font-semibold text-ink">What to look for</h3>
                <div className="mt-4">
                  <BulletList items={productGuidance} />
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-3">
              {affiliateLinks.map(link => (
                <a key={link.url} href={link.url} target="_blank" rel="sponsored noreferrer" className="surface-subtle rounded-2xl p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <h3 className="text-base font-semibold text-ink">{link.label}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#46574d]">{link.helperText}</p>
                  <p className="mt-4 inline-flex items-center text-sm font-semibold text-brand-800">
                    Search options <ExternalLink className="ml-1 h-3.5 w-3.5" />
                  </p>
                </a>
              ))}
            </div>
          </DetailCard>
        ) : null}
      </main>
    </div>
  )
}

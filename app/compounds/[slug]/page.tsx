import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCompoundBySlug } from '@/lib/runtime-data'
import { getCompoundMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import ReadingProgress from '@/components/ui/ReadingProgress'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { faqPageJsonLd, generateDetailMetadata, isMeaningfulFaqAnswer, SITE_URL } from '@/lib/seo'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import CompoundSourceHerbs from '@/components/seo/CompoundSourceHerbs'
import { getClusterSeeAlso, buildProfileSchemaGraphWithCluster } from '@/lib/cluster-linking'
import SeeAlsoCluster from '@/components/SeeAlsoCluster'
import { getGoalsForEntity } from '@/lib/goal-hub-links'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ScrollEngagementPrompt from '@/components/monetization/ScrollEngagementPrompt'
import { getEvidenceSnapshot } from '@/lib/semantic-runtime'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getConditionHerbEntries, getEntityConditionEntries, type RuntimeMapEntry } from '@/lib/runtime-related-maps'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getAffiliateShopLinks } from '@/lib/affiliate'
import { SourcingCta } from '@/components/sourcing/SourcingCta'
import { normalizeEvidenceLevel, normalizeSafetyLevel } from '@/lib/evidence-utils'
import AuthorCredentials from '@/components/AuthorCredentials'
import Disclaimer from '@/components/Disclaimer'
import EvidenceScoreBadge from '@/components/ui/EvidenceScoreBadge'
import EvidenceMeter from '@/components/ui/EvidenceMeter'
import EvidenceGradeExplainer from '@/components/ui/EvidenceGradeExplainer'
import ShowMeTheStudies from '@/components/ui/ShowMeTheStudies'
import { extractCitationsFromRecord } from '@/lib/citations'
import EmailCapture from '../../../components/EmailCapture'
import RecommendationSection from '../../../components/RecommendationSection'
import StackRecommendationSection from '../../../components/StackRecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { getStackRecommendations } from '@/lib/recommendation-engine'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import { isRestrictedRecord } from '@/lib/restricted-ingredients'
import PathwayDiagram from '@/components/PathwayDiagram'
import { generatePathwayDiagram } from '@/lib/generate-pathway'

type PageProps = {
  params: Promise<{ slug: string }>
}

type RegulatoryStateRow = {
  state: string
  naturalKratom: string
  concentrated7oh: string
  keyDetails: string
  notes: string
}

const DEPRECATED_COMPOUND_CANONICALS: Record<string, string> = {
  coq10: 'coenzyme-q10',
  'coenzyme-q10-ubiquinol': 'coenzyme-q10',
  theanine: 'l-theanine',
  'l-theanine-sleep': 'l-theanine',
  methyleugenol: 'methyl-eugenol',
  bcaas: 'bcaa',
  'green-tea-egcg-isolated': 'green-tea-extract',
  'green-tea-extract-egcg': 'green-tea-extract',
  nr: 'nicotinamide-riboside',
  'berberine-hcl': 'berberine',
  'probiotic-multistrain': 'probiotics',
  'probiotic-strain-bifidobacterium': 'probiotics',
  'probiotic-strain-lactobacillus': 'probiotics',
  'probiotics-bifidobacterium': 'probiotics',
  'probiotics-lactobacillus': 'probiotics',
  'taurine-blend': 'taurine',
  'taurine-sleep': 'taurine',
  'glycine-sleep': 'glycine',
  'inositol-sleep': 'inositol',
  'ashwagandha-extract-ksm-66': '/herbs/ashwagandha',
  'ashwagandha-root-extract': '/herbs/ashwagandha',
  garlic: '/herbs/garlic',
  'garlic-extract': '/herbs/garlic',
  'garlic-aged-extract': '/herbs/garlic',
  'aged-garlic-extract': '/herbs/garlic',
  ginger: '/herbs/ginger',
  gingerol: '/herbs/ginger',
  gingerols: '/herbs/ginger',
  valerian: '/herbs/valerian',
  'valerian-extract-standardized': '/herbs/valerian',
  'valerian-root-extract': '/herbs/valerian',
  'lions-mane': '/herbs/lions-mane',
  passionflower: '/herbs/passionflower',
  'passionflower-extract': '/herbs/passionflower',
  'passionflower-extract-standardized': '/herbs/passionflower',
  kava: '/herbs/kava',
  kavalactones: '/herbs/kava',
  reishi: '/herbs/reishi',
  maca: '/herbs/maca',
  'maca-root-extract': '/herbs/maca',
  elderberry: '/herbs/elderberry',
  resveratrol: '/herbs/resveratrol',
  'trans-resveratrol': '/herbs/resveratrol',
}

const CANONICAL_COMPOUND_NOTES: Record<string, { title: string; body: string; items?: string[] }> = {
  'coenzyme-q10': {
    title: 'Forms',
    body: 'CoQ10 products commonly appear as ubiquinone or ubiquinol. Ubiquinone is the oxidized form, while ubiquinol is the reduced form; both point back to the same CoQ10 decision context.',
    items: ['Ubiquinone: common CoQ10 form used in many standard products.', 'Ubiquinol: reduced CoQ10 form often marketed for absorption-focused formulas.'],
  },
  'l-theanine': {
    title: 'Focus and sleep context',
    body: 'L-theanine is studied and used in both calm-focus contexts and sleep-support contexts, especially where stress, stimulation smoothing, or wind-down quality is the practical question.',
  },
  'green-tea-extract': {
    title: 'EGCG context',
    body: 'EGCG is the primary active catechin discussed in green tea extract research, but isolated EGCG and green tea extract should be interpreted inside the broader extract, dose, and safety context.',
  },
  probiotics: {
    title: 'Strains',
    body: 'Probiotic evidence is strain- and condition-specific. The two primary clinically studied genera represented in this catalog are:',
    items: ['Lactobacillus', 'Bifidobacterium'],
  },
}

const LEGAL_STATUS_WARNINGS: Record<string, { title: string; body: string; items?: string[]; suppressAffiliate?: boolean }> = {
  '5-meo-dmt': {
    title: 'US legal status warning',
    body: '5-MeO-DMT is treated as a Schedule I controlled substance in the United States. This profile is educational and harm-reduction oriented only.',
    items: ['Do not buy, sell, possess, or use where prohibited.', 'Legal status varies by country and can change quickly.'],
    suppressAffiliate: true,
  },
  dmt: {
    title: 'US legal status warning',
    body: 'DMT is a Schedule I controlled substance in the United States. This page is not a sourcing guide or use recommendation.',
    items: ['Do not buy, sell, possess, or use where prohibited.', 'Review local law before relying on any general educational summary.'],
    suppressAffiliate: true,
  },
  psilocybin: {
    title: 'US legal status warning',
    body: 'Psilocybin is federally Schedule I in the United States, even though some states and municipalities have separate reforms or supervised-use programs.',
    items: ['Federal, state, and local rules may conflict.', 'This page is educational and does not provide legal or medical advice.'],
    suppressAffiliate: true,
  },
  mescaline: {
    title: 'US legal status warning',
    body: 'Mescaline is federally Schedule I in the United States, with narrow legal exceptions that do not apply to general supplement use.',
    items: ['Do not treat ceremonial or religious exceptions as general legality.', 'Legal status varies by source material and jurisdiction.'],
    suppressAffiliate: true,
  },
  ibogaine: {
    title: 'US legal status warning',
    body: 'Ibogaine is a Schedule I controlled substance in the United States and has serious cardiac safety concerns reported in clinical and observational contexts.',
    items: ['This profile is not a treatment recommendation.', 'Medical screening and legal context are essential before any real-world decision.'],
    suppressAffiliate: true,
  },
  'salvinorin-a': {
    title: 'Legal status warning',
    body: 'Salvinorin A and Salvia divinorum are not uniformly regulated across jurisdictions. Some US states and countries restrict possession, sale, or use.',
    items: ['Check current local law before relying on any general summary.', 'This page is educational and harm-reduction oriented only.'],
    suppressAffiliate: true,
  },
  ketamine: {
    title: 'Controlled prescription drug warning',
    body: 'Ketamine is a controlled prescription drug in the United States and should only be used in lawful medical contexts under qualified supervision.',
    items: ['This profile is not a self-treatment guide.', 'Avoid combining with alcohol, sedatives, or other depressants outside clinician direction.'],
    suppressAffiliate: true,
  },
  '7-hydroxymitragynine': {
    title: 'Regulatory and safety warning',
    body: '7-hydroxymitragynine is a potent kratom alkaloid under active regulatory scrutiny. Kratom legality varies by state and country, and concentrated products raise safety concerns.',
    items: ['Check current local restrictions.', 'Avoid interpreting this profile as a buying or dosing recommendation.'],
    suppressAffiliate: true,
  },
  'hcg-diet': {
    title: 'FDA enforcement warning',
    body: 'The FDA has warned that over-the-counter HCG weight-loss products are illegal and unsupported, and HCG diet plans often pair the product with unsafe severe calorie restriction.',
    items: ['HCG is not approved for over-the-counter weight loss.', 'This profile is a warning-oriented reference, not a diet recommendation.'],
    suppressAffiliate: true,
  },
}

export async function generateStaticParams() {
  const { compounds } = await getUnifiedRuntimeRecords()

  const dynamicParams = compounds
    .filter((compound: Record<string, unknown>) => getRuntimeVisibility(compound).canRender)
    .filter((compound: Record<string, unknown>) => !DEPRECATED_COMPOUND_CANONICALS[String(compound.slug || '')])
    .map((compound: Record<string, unknown>) => ({ slug: compound.slug }))

  // Include deprecated slugs so legacy /compounds/old-slug can redirect instead of 404 in static export
  const legacyRedirectParams = Object.keys(DEPRECATED_COMPOUND_CANONICALS).map((slug) => ({ slug }))

  return [
    ...dynamicParams,
    ...legacyRedirectParams,
  ]
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const redirectedCanonical = DEPRECATED_COMPOUND_CANONICALS[normalizedSlug]
  if (redirectedCanonical?.startsWith('/')) {
    return {
      alternates: { canonical: `${SITE_URL}${redirectedCanonical}/` },
      robots: { index: true, follow: true },
    }
  }

  const canonicalSlug = redirectedCanonical || normalizedSlug
  const compound = await getCompoundMetadataRecord(canonicalSlug)

  if (!compound) return {}

  const metadata = generateDetailMetadata(compound, 'compound')
  if (canonicalSlug !== normalizedSlug) {
    return {
      ...metadata,
      alternates: { canonical: `${SITE_URL}/compounds/${canonicalSlug}/` },
      robots: { index: true, follow: true },
    }
  }

  return {
    ...metadata,
    robots: { index: true, follow: true },
  }
}


const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i
const CAUTION_PATTERN = /avoid|caution|interaction|contraindication|warning|risk|pregnancy|liver|kidney|sedat|bleed/i



function getSafetyTone(summary: string, avoidIf: string[]) {
  if (avoidIf.length || CAUTION_PATTERN.test(summary)) return 'Use extra caution'
  return 'Standard caution'
}

function firstSentences(value: string, limit = 2) {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(sentence => sentence.trim()).filter(Boolean) || []
  return sentences.slice(0, limit).join(' ')
}

function cleanItems(value: unknown, limit = 6) {
  const values = Array.isArray(value) ? value.flatMap(item => list(item)) : list(value)

  return unique(
    values
      .map(formatDisplayLabel)
      .filter(item => item && isClean(item) && !WEAK_PATTERN.test(item)),
  ).slice(0, limit)
}

function cleanText(value: unknown) {
  const formatted = text(value)
  if (!formatted || !isClean(formatted) || WEAK_PATTERN.test(formatted)) return ''
  return formatted
}

function getTimeline(compound: Record<string, unknown>) {
  return cleanText(compound.time_to_effect || compound.timeToEffect || compound.time_to_notice || compound.timeToNotice || compound.onset)
}

function getAvoidIf(compound: Record<string, unknown>) {
  return cleanItems([
    compound.avoid_if,
    compound.avoidIf,
    compound.who_should_skip,
    compound.whoShouldSkip,
    compound.contraindications,
    compound.interactions,
  ], 4)
}

function getSafetySummary(compound: Record<string, unknown>, avoidIf: string[]) {
  const note = cleanText(compound.safetyNotes || compound.safety_notes || compound.safety)
  if (avoidIf.length) return `Review before use if any apply: ${avoidIf.slice(0, 3).join(', ')}.`
  if (note) return firstSentences(note, 2)
  return 'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.'
}

function getMechanismHints(compound: Record<string, unknown>, provided: string[]) {
  return unique([
    ...provided,
    ...cleanItems(compound.primary_mechanisms || compound.primaryMechanisms || compound.pathways, 6),
  ]).slice(0, 6)
}

function shouldSuppressAffiliate(record: Record<string, unknown>): boolean {
  if (!record) return false
  const safetyText = String(record.safety || record.safetyNotes || record.safety_level || record.safety_rating || '').toLowerCase()
  return safetyText.includes('high caution') || safetyText.includes('needs-review') || safetyText.includes('needs review') || safetyText.includes('severe')
}

function parseRegulatoryStateRows(value: unknown): RegulatoryStateRow[] {
  if (!value || typeof value !== 'string') return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((row) => ({
        state: cleanText(row?.state),
        naturalKratom: cleanText(row?.naturalKratom),
        concentrated7oh: cleanText(row?.concentrated7oh),
        keyDetails: cleanText(row?.keyDetails),
        notes: cleanText(row?.notes),
      }))
      .filter((row) => row.state)
  } catch {
    return []
  }
}

function splitRegulatoryParagraphs(value: unknown) {
  return cleanText(value)
    .split(/\n\s*\n|(?:\s*\|\s*)/g)
    .map((item) => cleanText(item))
    .filter(Boolean)
}

function splitRegulatorySources(value: unknown): string[] {
  const rawValues: unknown[] = Array.isArray(value) ? value : [value]
  const values = rawValues.flatMap((item) => String(item ?? '').split(/[\n|;,]+/))
  return unique(
    values
      .map((item: string) => cleanText(item))
      .filter((item: string) => /^https?:\/\//i.test(item)),
  ).slice(0, 8)
}

function RegulatoryStatusSection({ compound }: { compound: Record<string, unknown> }) {
  const federalParagraphs = splitRegulatoryParagraphs(compound.regulatory_federal || compound.regulatory_status)
  const stateRows = parseRegulatoryStateRows(compound.regulatory_states_table)
  const stateSummary = cleanText(compound.regulatory_states_summary)
  const changelog = splitRegulatoryParagraphs(compound.regulatory_changelog)
  const sources = splitRegulatorySources(compound.regulatory_sources)
  const lastChecked = cleanText(compound.last_regulatory_check)

  if (!federalParagraphs.length && !stateRows.length && !stateSummary) return null

  return (
    <section className="rounded-2xl border border-red-200 bg-red-50/70 p-4 sm:p-5 space-y-5" aria-labelledby="regulatory-status-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-red-800">Regulatory status</p>
          <h2 id="regulatory-status-heading" className="mt-1 text-lg font-bold text-red-950">
            2026 federal and state regulatory context
          </h2>
        </div>
        {lastChecked ? (
          <span className="rounded-full border border-red-200 bg-white px-3 py-1 text-xs font-semibold text-red-900">
            Last checked {lastChecked}
          </span>
        ) : null}
      </div>

      <div className="space-y-3 text-sm leading-6 text-red-950">
        {federalParagraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      {stateSummary ? (
        <div className="rounded-xl border border-red-200 bg-white/80 p-3 text-sm leading-6 text-red-950">
          <strong>State-level pattern:</strong> {stateSummary}
        </div>
      ) : null}

      {stateRows.length ? (
        <div className="space-y-3">
          <ResponsiveTable label="50-state 7-OH regulatory table" className="border-red-200">
            <table className="min-w-[920px] w-full text-left text-sm">
              <caption className="sr-only">
                State-by-state triage table distinguishing natural kratom leaf from concentrated or synthetic 7-hydroxymitragynine products.
              </caption>
              <thead className="bg-red-100/80 text-red-950">
                <tr>
                  <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider">State</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Natural kratom</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Concentrated/synthetic 7-OH</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Key details / limits</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold uppercase tracking-wider">Notes / dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-100">
                {stateRows.map((row) => (
                  <tr key={row.state} className="align-top">
                    <th scope="row" className="px-3 py-3 font-semibold text-red-950">{row.state}</th>
                    <td className="px-3 py-3 leading-6 text-[#5f382f]">{row.naturalKratom}</td>
                    <td className="px-3 py-3 leading-6 text-[#5f382f]">{row.concentrated7oh}</td>
                    <td className="px-3 py-3 leading-6 text-[#5f382f]">{row.keyDetails}</td>
                    <td className="px-3 py-3 leading-6 text-[#5f382f]">{row.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </ResponsiveTable>
          <p className="text-xs leading-5 text-red-900">
            Regulations change quickly and local bans can be stricter than state law. Treat this table as regulatory triage, not legal advice; verify against official state and local sources before relying on any status.
          </p>
        </div>
      ) : null}

      {changelog.length ? (
        <div className="rounded-xl border border-red-200 bg-white/80 p-3">
          <h3 className="text-sm font-bold text-red-950">Regulatory changelog</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-red-950">
            {changelog.map((entry) => <li key={entry}>{entry}</li>)}
          </ul>
        </div>
      ) : null}

      {sources.length ? (
        <div className="text-xs leading-5 text-red-900">
          <p className="font-bold uppercase tracking-wider">Primary sources</p>
          <ul className="mt-2 space-y-1">
            {sources.map((source) => (
              <li key={source}>
                <a href={source} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-red-800 hover:underline">
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}



export default async function CompoundPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_COMPOUND_CANONICALS[normalizedSlug]
  if (canonicalSlug) {
    redirect(canonicalSlug.startsWith('/') ? `${canonicalSlug}/` : `/compounds/${canonicalSlug}/`)
  }

  const compound = await getCompoundBySlug(normalizedSlug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
  }

  if (slug !== normalizedSlug || normalizeSlug(compound.slug) != normalizedSlug) {
    redirect(`/compounds/${normalizeSlug(compound.slug)}/`)
  }

  const legalStatusWarning = LEGAL_STATUS_WARNINGS[normalizedSlug]
  const suppressAffiliate =
    shouldSuppressAffiliate(compound) ||
    Boolean(legalStatusWarning?.suppressAffiliate) ||
    isRestrictedRecord(compound)

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item: Record<string, unknown>) => item.slug))
  const compoundSlugs = new Set(compounds.map((item: Record<string, unknown>) => item.slug))
  const sourceSlug = String(compound.slug || normalizedSlug)

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const effects = list(compound.effects || compound.primary_effects || compound.primaryActions)
    .map((effect:string) => formatDisplayLabel(effect))
    .filter(isClean)

  const mechanisms = list(compound.mechanisms)
    .map((item: string) => formatDisplayLabel(item))
    .filter(isClean)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier || compound.evidenceLevel || compound.evidence_grade)
  const safetyLevel = normalizeSafetyLevel(compound.safety || compound.safetyNotes)

  const snapshot = getEvidenceSnapshot(compound)

  const [
    relatedBySlug,
    comparisonBySlug,
    _stackBySlug,
    ecosystemContinuityRecords,
    conditionLinks,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [compound], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [compound], allRecords, 8),
    getBatchedRuntimeRecords('stack', [compound], allRecords, 6),
    getEcosystemContinuityRecords(compound, allRecords, 6),
    getEntityConditionEntries(sourceSlug),
  ])

  const conditionHerbEntries = conditionLinks[0]?.slug
    ? await getConditionHerbEntries(conditionLinks[0].slug)
    : []


  const relatedCandidates = (relatedBySlug[sourceSlug] || [])
    .filter((item: Record<string, unknown>) => getRuntimeVisibility(item).canRender)

  const relatedCompounds = relatedCandidates
    .filter((item: Record<string, unknown>) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: Record<string, unknown>) => ({ ...item, entityType: 'compound' }))

  const relatedHerbs = relatedCandidates
    .filter((item: Record<string, unknown>) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: Record<string, unknown>) => ({ ...item, entityType: 'herb' }))

  const visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item): item is Record<string, unknown> => Boolean(item && getRuntimeVisibility(item).canRender))

  const semanticRelated = mergeEcosystemContinuityRecords(
    [...relatedCompounds, ...relatedHerbs],
    visibleEcosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (comparisonBySlug[sourceSlug] || [])
    .filter((item: Record<string, unknown>) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const displayName = formatDisplayLabel(compound.name || compound.slug)
  const quickSummary = firstSentences(summary, 1) || 'Compound profile with safety, mechanism, and fit context.'
  const timeline = getTimeline(compound)
  const avoidIf = getAvoidIf(compound)
  const safetySummary = getSafetySummary(compound, avoidIf)
  const mechanismHints = getMechanismHints(compound, mechanisms)
  const safetyTone = getSafetyTone(safetySummary, avoidIf)

  const breadcrumbId = `${SITE_URL}/compounds/${compound.slug}/#breadcrumb`

  const activeShopLinks = getAffiliateShopLinks(compound, displayName, 'compound')
  const affiliateCtaLink = activeShopLinks.find(link => link.url)
  const revenueProducts = getRevenueProductSet(normalizedSlug)
  const stackRecommendations = getStackRecommendations(normalizedSlug, 3)
  const canonicalNote = CANONICAL_COMPOUND_NOTES[normalizedSlug]
  const citations = extractCitationsFromRecord(compound)
  const clusterSeeAlso = getClusterSeeAlso(normalizedSlug, 'compound', 8)

  const schemaGraph = buildProfileSchemaGraphWithCluster({
    kind: 'compound',
    slug: compound.slug,
    compound: {
      name: displayName,
      slug: compound.slug,
      description: summary,
      category: compound.compoundClass || compound.class || undefined,
      evidenceGrade: evidenceLevel || undefined,
      safetyNotes: compound.safetyNotes || compound.safety_notes || compound.safety || undefined,
      // Phase-1-ready molecular identifiers (undefined until the workbook populates them).
      pubchemCid: (compound.pubchem_cid as string | number | undefined) || undefined,
      casNumber: (compound.cas_number as string | undefined) || undefined,
      molecularFormula: (compound.molecular_formula as string | undefined) || undefined,
      breadcrumbId,
    },
    breadcrumbs: [
      { name: 'Compounds', url: `${SITE_URL}/compounds/` },
      { name: displayName, url: `${SITE_URL}/compounds/${compound.slug}/` },
    ],
    workbookRecord: { ...compound, slug: normalizedSlug },
    seeAlsoEntries: clusterSeeAlso,
  })

  const faqSchema = faqPageJsonLd({
    pagePath: `/compounds/${normalizedSlug}/`,
    questions: [
      {
        question: `What is ${displayName} used for?`,
        answer: cleanText(compound.clinicalUse || compound.clinical_use || summary) || quickSummary,
      },
      {
        question: `Is ${displayName} safe?`,
        answer:
          cleanText(
            compound.safetyProfile ||
              compound.safety_profile ||
              compound.safetyNotes ||
              compound.safety_notes ||
              compound.safety,
          ) || safetySummary,
      },
      {
        question: `What is the dose of ${displayName}?`,
        answer:
          cleanText(compound.dosing || compound.dose || compound.dosage || compound.doseInfo || '') ||
          'See dosing guidelines and product labeling.',
      },
    ].filter((entry) => isMeaningfulFaqAnswer(entry.answer)),
  })
  const pathwayDiagram = generatePathwayDiagram({ ...compound, name: displayName })
  const goalLinks = getGoalsForEntity(normalizedSlug)
  const lastReviewed =
    compound.last_updated ||
    compound.lastUpdated ||
    compound.updatedAt ||
    compound.updated_at ||
    compound.reviewed_date ||
    compound.reviewed_at

  return (
    <>
      <SchemaGraphScript graph={schemaGraph} />
      {faqSchema ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      ) : null}

      <ReadingProgress />

      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 pb-20">
        <ScrollEngagementPrompt storageKey={`compound-prompt-${normalizedSlug}`} />
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Compounds', href: '/compounds' },
            { label: compound.name },
          ]}
        />

        {/* Title Header */}
        <header className="space-y-3">
          <div className="space-y-1">
            <p className="eyebrow-label">Compound Profile</p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              {displayName}
            </h1>
            {compound.compoundClass || compound.class ? (
              <p className="text-sm italic text-muted">{compound.compoundClass || compound.class}</p>
            ) : null}
          </div>
          <p className="text-base leading-7 text-[#46574d]">{quickSummary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <LastUpdatedBadge date={lastReviewed} />
            <EvidenceScoreBadge record={compound} />
          </div>
        </header>

        {goalLinks.length > 0 ? (
          <section className="rounded-2xl border border-brand-900/10 bg-white/80 p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Goal guides</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {goalLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-brand-900/10 bg-brand-50/50 px-3 py-1.5 text-xs font-semibold capitalize text-brand-800 hover:bg-brand-50"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <SeeAlsoCluster slug={normalizedSlug} kind="compound" limit={6} />

        {conditionLinks.length > 0 ? (
          <section className="rounded-2xl border border-brand-900/10 bg-white/80 p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Condition guides</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {conditionLinks.slice(0, 5).map((link: RuntimeMapEntry) => (
                <Link
                  key={link.slug}
                  href={link.href || `/goals/${link.slug}`}
                  className="rounded-full border border-brand-900/10 bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 hover:bg-brand-50"
                >
                  {link.label || formatDisplayLabel(link.slug)}
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {legalStatusWarning ? (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 space-y-3">
            <h2 className="text-lg font-bold text-red-950">{legalStatusWarning.title}</h2>
            <p className="text-sm leading-6 text-red-900">{legalStatusWarning.body}</p>
            {legalStatusWarning.items ? (
              <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-red-900">
                {legalStatusWarning.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ) : null}

        <RegulatoryStatusSection compound={compound} />

        {/* Section 1: Quick Stats */}
        <section className="hero-shell rounded-2xl border border-brand-900/10 p-4 sm:p-5 space-y-4">
          <h2 className="text-lg font-bold text-ink">Quick Stats</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence level</p>
              <p className="mt-1 text-sm font-semibold text-ink">{evidenceLevel || 'Mixed or uncertain'}</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Typical onset</p>
              <p className="mt-1 text-sm font-semibold text-ink">{timeline || 'Varies by prep'}</p>
            </div>
            <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Safety rating</p>
              <p className="mt-1 text-sm font-semibold text-ink">{safetyTone}: {safetyLevel || 'Standard'} caution</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {effects.length > 0 && (
              <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-semibold">Best for</p>
                <p className="mt-1 text-sm text-ink">{effects.slice(0, 3).join(', ')}</p>
              </div>
            )}
            {avoidIf.length > 0 && (
              <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-900 font-semibold">Avoid / review if</p>
                <p className="mt-1 text-sm text-[#5f4a24]">{avoidIf.slice(0, 3).join(', ')}</p>
              </div>
            )}
          </div>
        </section>

        {/* Source herbs — internal links from the curated relationship map */}
        <CompoundSourceHerbs compoundSlug={compound.slug} compoundName={displayName} />

        {/* Affiliate CTA right after Quick Stats */}
        {affiliateCtaLink && !suppressAffiliate && (
          <section className="bg-emerald-50/50 border border-emerald-700/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Sourcing Options</h4>
              <p className="text-sm text-emerald-900/80">Compare options and check trusted third-party tested formats.</p>
              <AffiliateDisclosure variant="compact" />
            </div>
            <a
              href={affiliateCtaLink.url}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="button-primary w-full sm:w-auto text-center font-bold px-5 py-2.5 rounded-full"
            >
              {affiliateCtaLink.label} →
            </a>
          </section>
        )}

        {canonicalNote ? (
          <section className="card-premium p-4 sm:p-5 space-y-3">
            <h2 className="text-lg font-bold text-ink">{canonicalNote.title}</h2>
            <p className="text-sm leading-6 text-muted">{canonicalNote.body}</p>
            {canonicalNote.items ? (
              <ul className="list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
                {canonicalNote.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            ) : null}
          </section>
        ) : null}

        {/* Section 2: Safety */}
        <section className="rounded-2xl bg-amber-50/70 border border-amber-900/10 p-4 sm:p-5 space-y-3">
          <h2 className="text-lg font-bold text-ink">Safety &amp; Cautions</h2>
          <p className="text-sm leading-6 text-[#5f4a24]">{safetySummary}</p>
        </section>

        {/* Section 3: Evidence Summary */}
        <section className="card-premium p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-ink">Evidence Summary</h2>
            <EvidenceScoreBadge record={compound} size="sm" />
          </div>
          <EvidenceMeter level={evidenceLevel || 'moderate'} />
          <div className="space-y-3 text-sm leading-6 text-[#46574d]">
            <p>
              {displayName} has a <strong>{evidenceLevel?.toLowerCase() || 'mixed or uncertain'}</strong> evidence rating.
            </p>
            <EvidenceSnapshotCard snapshot={snapshot} />
          </div>
          <EvidenceGradeExplainer />
          <ShowMeTheStudies citations={citations} />
        </section>

        <EmailCapture
          headline={`Get the ${displayName} evidence notes`}
          description="Occasional research updates, safety context, and product-quality checks for supplement decisions."
          location={`compound-${normalizedSlug}`}
        />

        {suppressAffiliate ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
            <h3 className="text-lg font-bold text-red-950 flex items-center gap-2">
              <span role="img" aria-label="Warning">⚠️</span> Sourcing Options Disabled for Safety
            </h3>
            <p className="text-sm leading-relaxed text-red-900">
              Direct product recommendations and affiliate links are suppressed for this compound due to its high caution or needs-review safety classification.
            </p>
            <p className="text-xs text-red-800">
              Evaluate the safety checks, contraindications, and potential medication interactions below under clinician supervision before use.
            </p>
          </div>
        ) : revenueProducts ? (
          <div className="space-y-6">
            <RecommendationSection
              title={revenueProducts.title}
              description={`Affiliate recommendations for ${displayName}. Review safety, dose, and product quality before buying.`}
              products={revenueProducts.products}
            />
            <div className="rounded-2xl border border-brand-900/10 bg-white/85 p-5 space-y-3 shadow-sm">
              <h4 className="text-sm font-bold text-ink uppercase tracking-wider">Product Form &amp; Quality Guidelines</h4>
              <p className="text-xs leading-relaxed text-muted">
                When sourcing {displayName}, verify the label for:
              </p>
              <ul className="list-disc pl-5 text-xs text-muted space-y-1">
                <li><strong>Standardized Extract:</strong> Confirm active content percentages on the supplement facts panel (e.g. standardized to specific marker compounds) rather than simple raw herb weights.</li>
                <li><strong>Third-Party Testing:</strong> Look for independent purity labels (USP, NSF, ConsumerLab, or Eurofins) to ensure the product is free from heavy metals, solvents, and contaminants.</li>
                <li><strong>Form Bioavailability:</strong> Ensure the form matches evidence-supported configurations (e.g. chelated bisglycinate/glycinate for magnesium, micronized monohydrate for creatine) for optimal onset and digestion tolerance.</li>
              </ul>
            </div>
          </div>
        ) : null}

        <StackRecommendationSection
          productName={displayName}
          recommendations={stackRecommendations}
        />

        {/* Section 3b: Mechanism Pathway Diagram */}
        {pathwayDiagram && (
          <section className="card-premium p-4 sm:p-5 space-y-3">
            <h2 className="text-lg font-bold text-ink">How {displayName} Works</h2>
            <p className="text-xs text-muted leading-5">
              Simplified mechanism pathway based on preclinical and pharmacological evidence. Does not confirm clinical efficacy.
            </p>
            <PathwayDiagram data={pathwayDiagram} />
          </section>
        )}

        {/* Section 4: Mechanisms (Collapsible) */}
        {mechanismHints.length > 0 && (
          <section className="card-premium p-4 sm:p-5">
            <details className="group">
              <summary className="flex cursor-pointer items-center justify-between font-bold text-ink text-lg select-none">
                <span>Mechanisms &amp; Biological Pathways</span>
                <span className="text-brand-500 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="mt-4 pt-4 border-t border-brand-900/10 space-y-4">
                <p className="text-sm leading-6 text-muted">
                  Preclinical mechanism details from scientific profiles; these represent plausible pathways but do not guarantee clinical efficacy in humans.
                </p>
                <div className="flex flex-wrap gap-2">
                  {mechanismHints.map(m => (
                    <span key={m} className="chip-readable text-xs">{m}</span>
                  ))}
                </div>
              </div>
            </details>
          </section>
        )}

        {/* Section 5: Compare Nearby + CTA */}
        <section className="card-premium p-4 sm:p-5 space-y-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-ink">Compare &amp; Sourcing</h2>
            <p className="text-sm text-muted">Compare side-by-side tradeoffs or verify active marker guidelines.</p>
          </div>
          {!suppressAffiliate && <SourcingCta record={compound} displayName={displayName} />}

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {semanticRelated.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Related alternatives</h3>
                <div className="flex flex-col gap-2">
                  {semanticRelated.slice(0, 4).map(item => (
                    <Link key={item.slug} href={item.entityType === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`} className="text-sm font-semibold text-brand-800 hover:underline">{formatDisplayLabel(item.name || item.slug)}</Link>
                  ))}
                </div>
              </div>
            )}
            {conditionHerbEntries.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Herbs for similar conditions</h3>
                <div className="flex flex-col gap-2">
                  {conditionHerbEntries
                    .filter((item: RuntimeMapEntry) => item.slug !== sourceSlug)
                    .slice(0, 4)
                    .map((item: RuntimeMapEntry) => (
                      <Link key={item.slug} href={`/herbs/${item.slug}`} className="text-sm font-semibold text-brand-800 hover:underline">
                        {item.title || formatDisplayLabel(item.slug)}
                      </Link>
                    ))}
                </div>
              </div>
            )}
            {comparisonRecords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Tradeoffs</h3>
                <div className="flex flex-col gap-2">
                  {comparisonRecords
                    .filter((item: Record<string, unknown>) => item?.slug)
                    .map((item: Record<string, unknown>) => {
                      const compSlug = getValidComparisonSlug(sourceSlug, String(item.slug || ''))
                      if (!compSlug) return null
                      return (
                        <Link key={String(item.slug || compSlug)} href={`/compare/${compSlug}`} className="text-sm font-semibold text-brand-800 hover:underline">Compare {formatDisplayLabel(item.name || item.slug)}</Link>
                      )
                    })
                    .filter(Boolean)}
                </div>
              </div>
            )}
          </div>
        </section>

        <Disclaimer className="border-amber-900/15 bg-amber-50/70 !text-amber-950 [&_p]:!text-amber-950 [&_a]:!text-brand-800 mt-6" />
        <AuthorCredentials />

        <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
          <Link href="/compounds" className="inline-flex rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-sand-50">
            ← Back to compounds library
          </Link>
        </div>
      </div>
    </>
  )
}

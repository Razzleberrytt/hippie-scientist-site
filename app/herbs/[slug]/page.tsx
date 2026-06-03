import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { getHerbBySlug } from '@/lib/runtime-data'
import { getHerbMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import {
  herbJsonLd as generateHerbJsonLd,
  breadcrumbJsonLd as generateBreadcrumbJsonLd,
  generateDetailMetadata,
  productJsonLd,
  SITE_URL,
} from '@/lib/seo'
import { getGoalsForEntity } from '@/lib/goal-hub-links'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import ScrollEngagementPrompt from '@/components/monetization/ScrollEngagementPrompt'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getSafetySensitivity, getSafetyLabels, getSafetyClassifications } from '@/lib/safety-classification'
import { getEvidenceLabel } from '@/lib/evidence'
import {
  classifyResearchMaturity,
  deriveEvidenceLimitations,
  deriveResearchFocusAreas,
  deriveResearchStyle,
} from '@/lib/research-intelligence'
import { SourcingCta } from '@/components/sourcing/SourcingCta'
import AuthorCredentials from '@/components/AuthorCredentials'
import RecommendationSection from '../../../components/RecommendationSection'
import StackRecommendationSection from '../../../components/StackRecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import { getStackRecommendations } from '@/lib/recommendation-engine'
import { AshwagandhaStressClaim } from './AshwagandhaStressClaim'


type PageProps = {
  params: Promise<{ slug: string }>
}

const HERB_CANONICAL_SOURCE_ALIASES: Record<string, string> = {
  passionflower: 'passiflora-incarnata',
  kava: 'piper-methysticum',
}

const DEPRECATED_HERB_CANONICALS: Record<string, string> = {
  'allium-sativum': 'garlic',
  'valeriana-officinalis': 'valerian',
  'hericium-erinaceus': 'lions-mane',
  'passiflora-incarnata': 'passionflower',
  'piper-methysticum': 'kava',
  'ganoderma-lucidum': 'reishi',
}

export async function generateStaticParams() {
  const { herbs } = await getUnifiedRuntimeRecords()

  const dynamicParams = herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .filter((herb: any) => !DEPRECATED_HERB_CANONICALS[normalizeSlug(herb.slug)])
    .map((herb: any) => ({ slug: herb.slug }))

  return [
    ...dynamicParams,
    ...Object.keys(HERB_CANONICAL_SOURCE_ALIASES).map((slug) => ({ slug })),
  ]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_HERB_CANONICALS[normalizedSlug] || normalizedSlug
  const sourceSlug = HERB_CANONICAL_SOURCE_ALIASES[canonicalSlug] || canonicalSlug
  const herb = await getHerbMetadataRecord(sourceSlug)

  if (!herb) {
    return {
      title: 'Herb Not Found',
    }
  }

  const metadata = generateDetailMetadata({ ...herb, slug: canonicalSlug }, 'herb')
  if (canonicalSlug !== normalizedSlug) {
    return {
      ...metadata,
      alternates: { canonical: `${SITE_URL}/herbs/${canonicalSlug}/` },
      robots: { index: false, follow: true },
    }
  }

  return metadata
}

function getEffects(herb: any) {
  return unique([
    ...list(herb.primary_effects),
    ...list(herb.effects),
    ...list(herb.primaryActions),
  ])
    .filter(isClean)
    .slice(0, 6)
}


const WEAK_PATTERN = /research[-\s]?pending|placeholder|unknown|not specified|not available|insufficient|needs review|minimal/i

function cleanItems(value: unknown, limit = 8) {
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

function firstSentences(value: string, limit = 2) {
  const sentences = value.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map(sentence => sentence.trim()).filter(Boolean) || []
  return sentences.slice(0, limit).join(' ')
}

function getCommonName(herbName: string): string {
  if (!herbName) return ''
  // Extract only the common name (first capitalized word/phrase before scientific names)
  // Remove anything after scientific name indicators like "Withania", "var.", etc.
  const commonNameMatch = herbName.match(/^([A-Za-z\s'-]+?)(?:\s+[A-Z][a-z]+\s+[a-z]+|$)/)
  return commonNameMatch ? commonNameMatch[1].trim() : herbName.split(/\s+/)[0]
}

function getPlainEnglishSummary(herb: any) {
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  return firstSentences(summary, 1) || `${formatDisplayLabel(herb.name || herb.slug)} profile with safety, use, and evidence context.`
}

function getEvidenceStrength(herb: any) {
  return formatDisplayLabel(herb.evidenceLevel || herb.evidence_tier || herb.evidenceTier || herb.evidence_grade || getEvidenceLabel(herb))
}

function getSafetySummary(herb: any) {
  const labels = getSafetyLabels(herb, 3)
  const notes = cleanText(herb.safetyNotes || herb.safety_notes || herb.safety)
  const contraindications = cleanItems(herb.contraindications, 3)
  const interactions = cleanItems(herb.interactions, 3)

  if (notes) return firstSentences(notes, 2)
  if (contraindications.length) return `Review before use if any apply: ${contraindications.join(', ')}.`
  if (interactions.length) return `Interaction watchouts include ${interactions.join(', ')}.`
  if (labels.length) return `Safety flags: ${labels.join(', ')}.`
  return 'Review personal medications, pregnancy status, chronic conditions, and clinician guidance before use.'
}


function getAvoidIf(herb: any) {
  return cleanItems([
    herb.avoid_if,
    herb.avoidIf,
    herb.who_should_skip,
    herb.whoShouldSkip,
    herb.contraindications,
    herb.interactions,
    herb.avoid,
  ], 5)
}

function getSafetyTone(summary: string, avoidIf: string[]) {
  const highCaution = /avoid|contraindicat|pregnancy|breastfeeding|liver|kidney|bleed|sedative|interaction|medication/i
  if (avoidIf.length || highCaution.test(summary)) return 'Use extra caution'
  return 'Standard caution'
}

function getSafetyDetailGroups(herb: any) {
  const safetyNotes = cleanText(herb.safetyNotes || herb.safety_notes || herb.safety)
  const interactions = cleanItems(herb.interactions, 10)

  // Prefer explicit pregnancy-specific fields; fall back to contraindications only for
  // items not already shown in the interactions list to avoid verbatim duplication.
  const pregnancySpecific = cleanItems(
    herb.pregnancy_cautions || herb.pregnancy_contraindications || herb.contraindications_pregnancy,
    10,
  )
  const interactionSet = new Set(interactions.map((s: string) => s.toLowerCase()))
  const contraindicationsRaw = cleanItems(herb.contraindications || herb.avoid, 10)
  const pregnancyItems = pregnancySpecific.length > 0
    ? pregnancySpecific
    : contraindicationsRaw.filter((s: string) => !interactionSet.has(s.toLowerCase()))

  const cautions = cleanItems(herb.cautions || herb.warnings || herb.safety?.cautionSignals, 10)
  const classifications = getSafetyClassifications(herb, 8)
  const labels = getSafetyLabels(herb, 8)

  return [
    { title: 'Medication interactions', items: interactions },
    { title: 'Pregnancy, breastfeeding, and contraindications', items: pregnancyItems },
    { title: 'Chronic-condition and sensitivity cautions', items: cautions },
    { title: 'Safety classifications', items: classifications.map((item: any) => `${item.label}: ${item.description}`) },
    { title: 'Full safety note', items: safetyNotes ? [safetyNotes] : [] },
    { title: 'Safety labels', items: labels },
  ].filter(group => group.items.length > 0)
}

function getTimeline(herb: any) {
  return cleanText(herb.time_to_effect || herb.onset || herb.timeline || herb.minimum_effective_dose)
}

function getMechanisms(herb: any) {
  return cleanItems([herb.mechanisms, herb.primary_mechanisms, herb.pathways], 16)
}

function getTraditionalUses(herb: any) {
  return cleanItems(herb.traditionalUses || herb.traditional_uses, 10)
}

function getRelatedLinks(records: any[], entityType: 'herb' | 'compound', limit = 4) {
  return records
    .filter(record => record?.slug)
    .map(record => ({
      label: formatDisplayLabel(record.name || record.title || record.slug),
      href: `/${entityType === 'herb' ? 'herbs' : 'compounds'}/${record.slug}`,
    }))
    .filter(item => item.label)
    .slice(0, limit)
}

function shouldSuppressAffiliate(record: any): boolean {
  if (!record) return false
  const safetyText = String(record.safety || record.safetyNotes || record.safety_level || record.safety_rating || '').toLowerCase()
  return safetyText.includes('high caution') || safetyText.includes('needs-review') || safetyText.includes('needs review') || safetyText.includes('severe')
}

export default async function HerbDetailPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_HERB_CANONICALS[normalizedSlug]
  if (canonicalSlug) {
    redirect(`/herbs/${canonicalSlug}/`)
  }

  const sourceSlug = HERB_CANONICAL_SOURCE_ALIASES[normalizedSlug] || normalizedSlug
  const herb = await getHerbBySlug(sourceSlug)

  if (!herb || !getRuntimeVisibility(herb).canRender) {
    notFound()
  }

  if (slug !== normalizedSlug) {
    redirect(`/herbs/${normalizedSlug}/`)
  }

  const suppressAffiliate = shouldSuppressAffiliate(herb)

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item: any) => item.slug))
  const compoundSlugs = new Set(compounds.map((item: any) => item.slug))
  const sourceRecordSlug = herb.slug

  const [
    relatedBySlug,
    comparisonBySlug,
    _stackBySlug,
    ecosystemContinuityRecords,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [herb], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [herb], allRecords, 8),
    getBatchedRuntimeRecords('stack', [herb], allRecords, 6),
    getEcosystemContinuityRecords(herb, allRecords, 6),
  ])

  const relatedCandidates = (relatedBySlug[sourceRecordSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedHerbs = relatedCandidates
    .filter((item: any) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'herb' }))

  const _relatedCompounds = relatedCandidates
    .filter((item: any) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'compound' }))

  const _visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item: any) => getRuntimeVisibility(item).canRender)


  const comparisonRecords = (comparisonBySlug[sourceRecordSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const effects = getEffects(herb)
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  const displayName = formatDisplayLabel(getCommonName(herb.name || herb.slug))
  const botanicalName = cleanText(herb.latin_name || herb.botanical_name || herb.scientific_name)
  const briefSummary = getPlainEnglishSummary(herb)
  const evidenceStrength = getEvidenceStrength(herb)
  const safetySummary = getSafetySummary(herb)
  const safetySensitivity = getSafetySensitivity(herb)
  const safetyGroups = getSafetyDetailGroups(herb)
  const avoidIf = getAvoidIf(herb)
  const timeline = getTimeline(herb)
  const mechanisms = getMechanisms(herb)
  const traditionalUses = getTraditionalUses(herb)
  const researchMaturity = classifyResearchMaturity({ profile: herb })
  const researchStyle = deriveResearchStyle({ profile: herb })
  const evidenceLimitations = deriveEvidenceLimitations({ profile: herb })
  const topUses = unique([...effects, ...traditionalUses, ...deriveResearchFocusAreas({ profile: herb })]).slice(0, 8)
  const safetyTone = getSafetyTone(safetySummary, avoidIf)
  const relatedHerbLinks = getRelatedLinks(relatedHerbs, 'herb')
  const revenueProducts = getRevenueProductSet(normalizedSlug)
  const stackRecommendations = getStackRecommendations(normalizedSlug, 3)

  const affiliateUrl =
    revenueProducts?.products.find((p) => p.slot === 'overall')?.affiliateUrl ??
    revenueProducts?.products[0]?.affiliateUrl
  const productSchemaJsonLd =
    affiliateUrl && !suppressAffiliate
      ? productJsonLd({
          name: `${displayName} Supplement`,
          description: `${displayName} supplement sourcing guide — safety context, dosage notes, and curated product picks.`,
          url: affiliateUrl,
        })
      : null
  const goalLinks = getGoalsForEntity(normalizedSlug)
  const lastReviewed =
    herb.reviewed_date || herb.reviewed_at || herb.updated_at || herb.updatedAt || herb.last_updated

  const comparisonLinks = comparisonRecords
    .filter((record: any) => record?.slug)
    .map((record: any) => {
      const compSlug = getValidComparisonSlug(sourceRecordSlug, record.slug)
      if (!compSlug) return null
      return {
        label: formatDisplayLabel(record.name || record.title || record.slug),
        href: `/compare/${compSlug}`,
      }
    })
    .filter((item): item is { label: string; href: string } => item !== null)
    .slice(0, 4)

  const herbJsonLd = generateHerbJsonLd({
    name: displayName,
    slug: normalizedSlug,
    description: summary,
    latinName: botanicalName || undefined,
    evidenceGrade: getEvidenceStrength(herb),
    safetyNotes: herb.safetyNotes || herb.safety_notes || herb.safety || undefined,
    primaryEffects: getEffects(herb),
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Herbs', url: `${SITE_URL}/herbs/` },
    { name: displayName, url: `${SITE_URL}/herbs/${normalizedSlug}/` },
  ])


  return (
    <main className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <ScrollEngagementPrompt storageKey={`herb-prompt-${normalizedSlug}`} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(herbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {productSchemaJsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemaJsonLd) }}
        />
      ) : null}

      {/* Header Breadcrumb - use only common name, not scientific name */}
      <nav className="flex items-center gap-2 text-xs text-muted">
        <Link href="/herbs" className="transition hover:text-ink">Herbs</Link>
        <span>/</span>
        <span className="text-ink font-medium">{displayName}</span>
      </nav>

      {/* Title Header */}
      <header className="space-y-3">
        <div className="space-y-1">
          <p className="eyebrow-label">Herb Profile</p>
          <h1 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {displayName}
          </h1>
          {botanicalName ? <p className="text-sm italic text-muted">{botanicalName}</p> : null}
        </div>
        <p className="text-base leading-7 text-[#46574d]">{briefSummary}</p>
        <div className="mt-3">
          <LastUpdatedBadge date={lastReviewed} />
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

      {/* Section 1: Quick Stats */}
      <section className="hero-shell rounded-2xl border border-brand-900/10 p-4 sm:p-5 space-y-4">
        <h2 className="text-lg font-bold text-ink">Quick Stats</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence level</p>
            <p className="mt-1 text-sm font-semibold text-ink">{evidenceStrength || 'Mixed or uncertain'}</p>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Typical onset</p>
            <p className="mt-1 text-sm font-semibold text-ink">{timeline || 'Varies by prep'}</p>
          </div>
          <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Safety rating</p>
            <p className="mt-1 text-sm font-semibold text-ink">{safetyTone}: {formatDisplayLabel(safetySensitivity)} caution</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {topUses.length > 0 && (
            <div className="rounded-xl border border-brand-900/10 bg-white/90 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted font-semibold">Best for</p>
              <p className="mt-1 text-sm text-ink">{topUses.slice(0, 3).join(', ')}</p>
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

      {normalizedSlug === 'ashwagandha' && <AshwagandhaStressClaim />}

      {/* Section 2: Safety */}
      <section className="rounded-2xl bg-amber-50/70 border border-amber-900/10 p-4 sm:p-5 space-y-3">
        <h2 className="text-lg font-bold text-ink">Safety &amp; Cautions</h2>
        <p className="text-sm leading-6 text-[#5f4a24]">{safetySummary}</p>
        {safetyGroups.length > 0 && (
          <div className="mt-4 grid gap-4 pt-3 border-t border-amber-900/10 sm:grid-cols-2">
            {safetyGroups.map(group => (
              <div key={group.title} className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#5f4a24] font-semibold">{group.title}</h3>
                <ul className="space-y-1 text-xs text-[#5f4a24]">
                  {group.items.map(item => <li key={item}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Section 3: Evidence Summary */}
      <section className="card-premium p-4 sm:p-5 space-y-4">
        <h2 className="text-lg font-bold text-ink">Evidence Summary</h2>
        <div className="space-y-3 text-sm leading-6 text-[#46574d]">
          <p>
            {displayName} has a <strong>{evidenceStrength.toLowerCase()}</strong> evidence level. It is categorized as {researchMaturity.toLowerCase()} with a {researchStyle.toLowerCase()} evidence style.
          </p>
          {evidenceLimitations.length > 0 && (
            <div className="space-y-1.5">
              <h3 className="font-semibold text-ink">Evidence limitations:</h3>
              <ul className="list-disc pl-4 space-y-1">
                {evidenceLimitations.map(item => <li key={item}>{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Section 4: Mechanisms (Collapsible) */}
      {mechanisms.length > 0 && (
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
                {mechanisms.map(m => (
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
        {!suppressAffiliate && <SourcingCta record={herb} displayName={displayName} />}

        {suppressAffiliate ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-5 space-y-3">
            <h3 className="text-lg font-bold text-red-950 flex items-center gap-2">
              <span role="img" aria-label="Warning">⚠️</span> Sourcing Options Disabled for Safety
            </h3>
            <p className="text-sm leading-relaxed text-red-900">
              Direct product recommendations and affiliate links are suppressed for this herb due to its high caution or needs-review safety classification.
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
                <li><strong>Form Bioavailability:</strong> Ensure the form matches evidence-supported configurations (e.g. standardized active extracts like bacosides, withanolides, or curcuminoids) for optimal onset and digestion tolerance.</li>
              </ul>
            </div>
          </div>
        ) : null}

        <StackRecommendationSection
          productName={displayName}
          recommendations={stackRecommendations}
        />

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {relatedHerbLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Compare herbs</h3>
              <div className="flex flex-col gap-2">
                {relatedHerbLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-brand-800 hover:underline">{link.label}</Link>
                ))}
              </div>
            </div>
          )}
          {comparisonLinks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted font-semibold">Tradeoffs</h3>
              <div className="flex flex-col gap-2">
                {comparisonLinks.map(link => (
                  <Link key={link.href} href={link.href} className="text-sm font-semibold text-brand-800 hover:underline">Compare {link.label}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <AuthorCredentials />

      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/herbs" className="inline-flex rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-sand-50">
          ← Back to herbs library
        </Link>
      </div>
    </main>
  )
}

import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getCompoundBySlug } from '@/lib/runtime-data'
import { getCompoundMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import ReadingProgress from '@/components/ui/ReadingProgress'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { normalizeSlug } from '@/lib/slug-utils'
import { compoundJsonLd as generateCompoundJsonLd, breadcrumbJsonLd as generateBreadcrumbJsonLd, generateDetailMetadata } from '@/lib/seo'
import { getEvidenceSnapshot } from '@/lib/semantic-runtime'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { getValidComparisonSlug } from '@/lib/comparison-utils'
import { getAffiliateShopLinks } from '@/lib/affiliate'
import { SourcingCta } from '@/components/sourcing/SourcingCta'
import { normalizeEvidenceLevel, normalizeSafetyLevel } from '@/lib/evidence-utils'
import EmailCapture from '../../../components/EmailCapture'
import RecommendationSection from '../../../components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'

type PageProps = {
  params: Promise<{ slug: string }>
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
  'probiotic-multistrain': 'probiotics',
  'probiotic-strain-bifidobacterium': 'probiotics',
  'probiotic-strain-lactobacillus': 'probiotics',
  'probiotics-bifidobacterium': 'probiotics',
  'probiotics-lactobacillus': 'probiotics',
  'taurine-blend': 'taurine',
  'taurine-sleep': 'taurine',
  'glycine-sleep': 'glycine',
  'inositol-sleep': 'inositol',
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

export async function generateStaticParams() {
  const { compounds } = await getUnifiedRuntimeRecords()

  return compounds
    .filter((compound:any) => getRuntimeVisibility(compound).canRender)
    .filter((compound:any) => !DEPRECATED_COMPOUND_CANONICALS[compound.slug])
    .map((compound:any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const canonicalSlug = DEPRECATED_COMPOUND_CANONICALS[normalizeSlug(slug)] || slug
  const compound = await getCompoundMetadataRecord(canonicalSlug)

  if (!compound) return {}

  const metadata = generateDetailMetadata(compound, 'compound')
  if (canonicalSlug !== slug) {
    return {
      ...metadata,
      alternates: { canonical: `https://www.thehippiescientist.net/compounds/${canonicalSlug}` },
      robots: { index: false, follow: true },
    }
  }

  return metadata
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

function getTimeline(compound: any) {
  return cleanText(compound.time_to_effect || compound.timeToEffect || compound.time_to_notice || compound.timeToNotice || compound.onset)
}

function getAvoidIf(compound: any) {
  return cleanItems([
    compound.avoid_if,
    compound.avoidIf,
    compound.who_should_skip,
    compound.whoShouldSkip,
    compound.contraindications,
    compound.interactions,
  ], 4)
}

function getSafetySummary(compound: any, avoidIf: string[]) {
  const note = cleanText(compound.safetyNotes || compound.safety_notes || compound.safety)
  if (avoidIf.length) return `Review before use if any apply: ${avoidIf.slice(0, 3).join(', ')}.`
  if (note) return firstSentences(note, 2)
  return 'Review medications, pregnancy status, chronic conditions, and clinician guidance before use.'
}

function getMechanismHints(compound: any, provided: string[]) {
  return unique([
    ...provided,
    ...cleanItems(compound.primary_mechanisms || compound.primaryMechanisms || compound.pathways, 6),
  ]).slice(0, 6)
}



export default async function CompoundPage({ params }: PageProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const canonicalSlug = DEPRECATED_COMPOUND_CANONICALS[normalizedSlug]
  if (canonicalSlug) {
    redirect(`/compounds/${canonicalSlug}/`)
  }

  const compound = await getCompoundBySlug(normalizedSlug)

  if (!compound || !getRuntimeVisibility(compound).canRender) {
    notFound()
  }

  if (slug !== normalizedSlug || normalizeSlug(compound.slug) != normalizedSlug) {
    redirect(`/compounds/${normalizeSlug(compound.slug)}/`)
  }

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item:any) => item.slug))
  const compoundSlugs = new Set(compounds.map((item:any) => item.slug))
  const sourceSlug = compound.slug

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const effects = list(compound.effects || compound.primary_effects || compound.primaryActions)
    .map((effect:string) => formatDisplayLabel(effect))
    .filter(isClean)

  const mechanisms = list(compound.mechanisms)
    .map((item:any) => formatDisplayLabel(item))
    .filter(isClean)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier || compound.evidenceLevel || compound.evidence_grade)
  const safetyLevel = normalizeSafetyLevel(compound.safety || compound.safetyNotes)

  const snapshot = getEvidenceSnapshot(compound)

  const [
    relatedBySlug,
    comparisonBySlug,
    _stackBySlug,
    ecosystemContinuityRecords,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [compound], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [compound], allRecords, 8),
    getBatchedRuntimeRecords('stack', [compound], allRecords, 6),
    getEcosystemContinuityRecords(compound, allRecords, 6),
  ])


  const relatedCandidates = (relatedBySlug[sourceSlug] || [])
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const relatedCompounds = relatedCandidates
    .filter((item:any) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item:any) => ({ ...item, entityType: 'compound' }))

  const relatedHerbs = relatedCandidates
    .filter((item:any) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item:any) => ({ ...item, entityType: 'herb' }))

  const visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item:any) => getRuntimeVisibility(item).canRender)

  const semanticRelated = mergeEcosystemContinuityRecords(
    [...relatedCompounds, ...relatedHerbs],
    visibleEcosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (comparisonBySlug[sourceSlug] || [])
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const displayName = formatDisplayLabel(compound.name || compound.slug)
  const quickSummary = firstSentences(summary, 1) || 'Compound profile with safety, mechanism, and fit context.'
  const timeline = getTimeline(compound)
  const avoidIf = getAvoidIf(compound)
  const safetySummary = getSafetySummary(compound, avoidIf)
  const mechanismHints = getMechanismHints(compound, mechanisms)
  const safetyTone = getSafetyTone(safetySummary, avoidIf)

  const compoundJsonLd = generateCompoundJsonLd({
    name: displayName,
    slug: compound.slug,
    description: summary,
    category: compound.compoundClass || compound.class || undefined,
    evidenceGrade: evidenceLevel || undefined,
    safetyNotes: compound.safetyNotes || compound.safety_notes || compound.safety || undefined,
  })

  const breadcrumbJsonLd = generateBreadcrumbJsonLd([
    { name: 'Compounds', url: 'https://www.thehippiescientist.net/compounds' },
    { name: displayName, url: `https://www.thehippiescientist.net/compounds/${compound.slug}` },
  ])

  const activeShopLinks = getAffiliateShopLinks(compound, displayName, 'compound')
  const affiliateCtaLink = activeShopLinks.find(link => link.url)
  const revenueProducts = getRevenueProductSet(normalizedSlug)
  const canonicalNote = CANONICAL_COMPOUND_NOTES[normalizedSlug]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(compoundJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ReadingProgress />

      <main className="mx-auto max-w-4xl space-y-8 px-4 py-6 pb-20">
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
        </header>

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

        {/* Affiliate CTA right after Quick Stats */}
        {affiliateCtaLink && (
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
          <h2 className="text-lg font-bold text-ink">Evidence Summary</h2>
          <div className="space-y-3 text-sm leading-6 text-[#46574d]">
            <p>
              {displayName} has a <strong>{evidenceLevel?.toLowerCase() || 'mixed or uncertain'}</strong> evidence rating.
            </p>
            <EvidenceSnapshotCard snapshot={snapshot} />
          </div>
        </section>

        <EmailCapture
          headline={`Get the ${displayName} evidence notes`}
          description="Occasional research updates, safety context, and product-quality checks for supplement decisions."
          location={`compound-${normalizedSlug}`}
        />

        {revenueProducts ? (
          <RecommendationSection
            title={revenueProducts.title}
            description={`Affiliate recommendations for ${displayName}. Review safety, dose, and product quality before buying.`}
            products={revenueProducts.products}
          />
        ) : null}

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
          <SourcingCta record={compound} displayName={displayName} />

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
            {comparisonRecords.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Tradeoffs</h3>
                <div className="flex flex-col gap-2">
                  {comparisonRecords
                    .filter((item: any) => item?.slug)
                    .map((item: any) => {
                      const compSlug = getValidComparisonSlug(sourceSlug, item.slug)
                      if (!compSlug) return null
                      return (
                        <Link key={item.slug} href={`/compare/${compSlug}`} className="text-sm font-semibold text-brand-800 hover:underline">Compare {formatDisplayLabel(item.name || item.slug)}</Link>
                      )
                    })
                    .filter(Boolean)}
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
          <Link href="/compounds" className="inline-flex rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-sand-50">
            ← Back to compounds library
          </Link>
        </div>
      </main>
    </>
  )
}

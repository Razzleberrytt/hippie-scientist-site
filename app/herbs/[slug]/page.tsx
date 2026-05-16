import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHerbBySlug } from '@/lib/runtime-data'
import { getHerbMetadataRecord } from '@/lib/runtime-metadata-cache'
import { getUnifiedRuntimeRecords } from '@/lib/runtime-record-index'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { getBatchedRuntimeRecords } from '@/lib/related-runtime'
import { getEcosystemContinuityRecords, mergeEcosystemContinuityRecords } from '@/lib/ecosystem-continuity'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'
import { buildSemanticNarrative, buildContinuationPrompts } from '@/lib/semantic-exploration-narratives'
import { buildSourcingNotes, getMonetizationReadiness } from '@/lib/monetization-context'
import {
  buildSemanticAssistantSummary,
  buildSemanticNavigationSuggestions,
} from '@/lib/ai-semantic-navigation'
import { buildMeta } from '@/lib/seo'
import { buildAuthorityProfileModel } from '@/lib/authority-profile'
import { buildInternalLinkDensity } from '@/lib/internal-link-density'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'
import { getEvidenceLabel } from '@/lib/evidence'
import { getSafetyClassifications, getSafetyLabels, getSafetySensitivity } from '@/lib/safety-classification'
import {
  classifyResearchMaturity,
  deriveEvidenceLimitations,
  derivePathwayClusters,
  deriveResearchFocusAreas,
  deriveResearchStyle,
} from '@/lib/research-intelligence'
import { CompactRelatedPathways } from '@/app/pathways/pathway-hub'
import { getFeaturedCollections } from '@/lib/collections'
import ProfileAuthoritySections from '@/components/profile-authority-sections'
import { ProfileDecisionLayer } from '@/components/profile-decision-layer'
import DecisionClarityFieldManual from '@/components/decision-clarity-field-manual'
import DecisionVisualGrid from '@/components/decision-visual-grid'
import WhyThisInsteadPanel from '@/components/why-this-instead-panel'
import RuntimeOrchestratedDiscovery from '@/components/runtime/runtime-orchestrated-discovery'
import AuthorityEditorialLayer from '@/components/profile/AuthorityEditorialLayer'
import AuthorityProfileShell from '@/components/authority/AuthorityProfileShell'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import GuidedExplorationPanel from '@/components/guided-exploration-panel'
import EvidenceAwareCTA from '@/components/evidence-aware-cta'
import SemanticAssistantPanel from '@/components/semantic-assistant-panel'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const { herbs } = await getUnifiedRuntimeRecords()

  return herbs
    .filter((herb: any) => getRuntimeVisibility(herb).canRender)
    .map((herb: any) => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const herb = await getHerbMetadataRecord(slug)

  if (!herb) {
    return {
      title: 'Herb Not Found',
    }
  }

  const visibility = getRuntimeVisibility(herb)
  const meta = buildMeta({
    title: `${formatDisplayLabel(herb.name || herb.slug)} | Herb`,
    description: cleanSummary(herb.summary || herb.description || '', 'herb'),
    path: `/herbs/${herb.slug}`,
  })

  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: meta.url },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'article',
      url: meta.url,
      images: [meta.image],
    },
    robots: visibility.canIndex
      ? undefined
      : {
          index: false,
          follow: true,
        },
  }
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

function getPlainEnglishSummary(herb: any) {
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  return firstSentences(summary, 2) || `${formatDisplayLabel(herb.name || herb.slug)} is tracked as an evidence-aware botanical profile with safety, use, and mechanism context.`
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

function getSafetyDetailGroups(herb: any) {
  const safetyNotes = cleanText(herb.safetyNotes || herb.safety_notes || herb.safety)
  const interactions = cleanItems(herb.interactions, 10)
  const contraindications = cleanItems(herb.contraindications || herb.avoid, 10)
  const cautions = cleanItems(herb.cautions || herb.warnings || herb.safety?.cautionSignals, 10)
  const classifications = getSafetyClassifications(herb, 8)
  const labels = getSafetyLabels(herb, 8)

  return [
    { title: 'Medication interactions', items: interactions },
    { title: 'Pregnancy, breastfeeding, and contraindications', items: contraindications },
    { title: 'Chronic-condition and sensitivity cautions', items: cautions },
    { title: 'Safety classifications', items: classifications.map(item => `${item.label}: ${item.description}`) },
    { title: 'Full safety note', items: safetyNotes ? [safetyNotes] : [] },
    { title: 'Safety labels', items: labels },
  ].filter(group => group.items.length > 0)
}

function getTimeline(herb: any) {
  return cleanText(herb.time_to_effect || herb.onset || herb.timeline || herb.minimum_effective_dose)
}

function getStackContext(stackRecords: any[]) {
  return stackRecords
    .map(record => ({ label: formatDisplayLabel(record?.name || record?.title || record?.slug), href: record?.slug ? `/stacks/${record.slug}` : '' }))
    .filter(item => item.label && item.href)
    .slice(0, 3)
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

function BriefCard({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  if (!value && !children) return null

  return (
    <div className="rounded-2xl border border-brand-900/10 bg-white/70 p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      {value ? <p className="mt-2 text-sm font-semibold leading-6 text-ink">{value}</p> : null}
      {children ? <div className="mt-2">{children}</div> : null}
    </div>
  )
}

function ChipList({ items, limit = items.length }: { items: string[]; limit?: number }) {
  const visible = items.slice(0, limit)
  if (!visible.length) return null

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map((item) => (
        <span key={item} className="chip-readable text-xs">
          {item}
        </span>
      ))}
    </div>
  )
}

function CompactDetails({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <details className="group rounded-3xl border border-brand-900/10 bg-white/65 p-4 shadow-sm open:bg-white/80 sm:p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
            {description ? <p className="text-sm leading-6 text-muted">{description}</p> : null}
          </div>
          <span className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted group-open:hidden">
            Open
          </span>
          <span className="hidden rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-muted group-open:inline-flex">
            Hide
          </span>
        </div>
      </summary>
      <div className="mt-5 space-y-5 border-t border-brand-900/10 pt-5">
        {children}
      </div>
    </details>
  )
}

function LinkDensitySection({ links }: { links: ReturnType<typeof buildInternalLinkDensity> }) {
  const items = [...links.guides, ...links.ecosystems, ...links.compares].slice(0, 9)
  if (items.length === 0) return null

  return (
    <section className="compact-card section-rhythm-compact">
      <div className="space-y-1">
        <p className="eyebrow-label">Continue Research</p>
        <h2 className="max-w-none text-2xl font-semibold tracking-tight text-ink">
          Related guides, ecosystems, and comparisons
        </h2>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-700/30 hover:bg-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function HerbDetailPage({ params }: PageProps) {
  const { slug } = await params
  const herb = await getHerbBySlug(slug)

  if (!herb || !getRuntimeVisibility(herb).canRender) {
    notFound()
  }

  const {
    herbs,
    compounds,
    allRecords,
  } = await getUnifiedRuntimeRecords()

  const herbSlugs = new Set(herbs.map((item: any) => item.slug))
  const compoundSlugs = new Set(compounds.map((item: any) => item.slug))
  const sourceSlug = herb.slug

  const [
    relatedBySlug,
    comparisonBySlug,
    stackBySlug,
    ecosystemContinuityRecords,
  ] = await Promise.all([
    getBatchedRuntimeRecords('related', [herb], allRecords, 8),
    getBatchedRuntimeRecords('comparison', [herb], allRecords, 8),
    getBatchedRuntimeRecords('stack', [herb], allRecords, 6),
    getEcosystemContinuityRecords(herb, allRecords, 6),
  ])

  const relatedCandidates = (relatedBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedHerbs = relatedCandidates
    .filter((item: any) => herbSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'herb' }))

  const relatedCompounds = relatedCandidates
    .filter((item: any) => compoundSlugs.has(item.slug))
    .slice(0, 4)
    .map((item: any) => ({ ...item, entityType: 'compound' }))

  const visibleEcosystemContinuityRecords = ecosystemContinuityRecords
    .filter((item: any) => getRuntimeVisibility(item).canRender)

  const relatedProfiles = mergeEcosystemContinuityRecords(
    [...relatedHerbs, ...relatedCompounds],
    visibleEcosystemContinuityRecords,
    6,
  )

  const comparisonRecords = (comparisonBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .slice(0, 8)

  const stackRecords = (stackBySlug[sourceSlug] || [])
    .filter((item: any) => getRuntimeVisibility(item).canRender)
    .slice(0, 6)

  const featuredCollections = getFeaturedCollections(herb)
  const effects = getEffects(herb)
  const summary = cleanSummary(herb.summary || herb.description || '', 'herb')
  const graph = buildSemanticGraphVisual(herb, relatedProfiles, 14)
  const narrative = buildSemanticNarrative(herb, relatedProfiles)
  const prompts = buildContinuationPrompts(herb, relatedProfiles)
  const assistant = buildSemanticAssistantSummary(herb, relatedProfiles)
  const assistantSuggestions = buildSemanticNavigationSuggestions(herb, relatedProfiles, 5)
  const readiness = getMonetizationReadiness(herb)
  const sourcingNotes = buildSourcingNotes(herb)
  const authorityModel = buildAuthorityProfileModel(herb)
  const internalLinks = buildInternalLinkDensity(herb)
  const displayName = formatDisplayLabel(herb.name || herb.slug)
  const botanicalName = cleanText(herb.latin_name || herb.botanical_name || herb.scientific_name)
  const briefSummary = getPlainEnglishSummary(herb)
  const evidenceStrength = getEvidenceStrength(herb)
  const safetySummary = getSafetySummary(herb)
  const safetySensitivity = getSafetySensitivity(herb)
  const safetyGroups = getSafetyDetailGroups(herb)
  const timeline = getTimeline(herb)
  const mechanisms = getMechanisms(herb)
  const traditionalUses = getTraditionalUses(herb)
  const stackContext = getStackContext(stackRecords)
  const researchMaturity = classifyResearchMaturity({ profile: herb })
  const researchStyle = deriveResearchStyle({ profile: herb })
  const focusAreas = deriveResearchFocusAreas({ profile: herb })
  const evidenceLimitations = deriveEvidenceLimitations({ profile: herb })
  const pathwayClusters = derivePathwayClusters({ profile: herb })
  const topUses = unique([...effects, ...traditionalUses, ...focusAreas]).slice(0, 8)
  const hiddenUses = unique([...effects, ...traditionalUses, ...focusAreas]).slice(8)
  const keyTakeaways = unique([
    topUses.length ? `Most often explored for ${topUses.slice(0, 3).join(', ')}.` : '',
    evidenceStrength ? `Evidence context: ${evidenceStrength}; overall maturity reads as ${researchMaturity.toLowerCase()}.` : '',
    safetySummary ? `Safety first: ${safetySummary}` : '',
    timeline ? `Timeline/onset context: ${timeline}.` : '',
    mechanisms.length ? `Mechanism signals include ${mechanisms.slice(0, 3).join(', ')}.` : '',
  ].filter(Boolean)).slice(0, 5)
  const relatedHerbLinks = getRelatedLinks(relatedHerbs, 'herb')
  const relatedCompoundLinks = getRelatedLinks(relatedCompounds, 'compound')
  const comparisonLinks = comparisonRecords
    .filter((record: any) => record?.slug)
    .map((record: any) => ({ label: formatDisplayLabel(record.name || record.title || record.slug), href: `/compare/${record.slug}` }))
    .filter((item: any) => item.label)
    .slice(0, 4)

  const herbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DietarySupplement',
    name: displayName,
    description: summary,
    url: `https://www.thehippiescientist.net/herbs/${herb.slug}`,
    ...(herb.latin_name ? { alternateName: herb.latin_name } : {}),
    ...(effects.length > 0 ? { activeIngredient: effects.join(', ') } : {}),
    safetyConsideration:
      'Educational content only. Consult a healthcare professional before use.',
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Herbs',
        item: 'https://www.thehippiescientist.net/herbs',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: displayName,
        item: `https://www.thehippiescientist.net/herbs/${herb.slug}`,
      },
    ],
  }

  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:space-y-10 sm:py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(herbJsonLd) }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <nav className="flex flex-wrap items-center gap-2 text-sm text-muted">
        <Link href="/herbs" className="transition hover:text-ink">
          Herbs
        </Link>
        <span>/</span>
        <span className="text-ink">{displayName}</span>
      </nav>

      <section className="rounded-[1.75rem] border border-brand-900/10 bg-white/70 p-5 shadow-card sm:p-7">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/herbs" className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-muted transition hover:text-ink">
              Back to herbs
            </Link>
            <Link href="/compare" className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-muted transition hover:text-ink">
              Compare
            </Link>
            <Link href={`/search?q=${encodeURIComponent(displayName)}`} className="rounded-full border border-brand-900/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-muted transition hover:text-ink">
              Search related
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="eyebrow-label">Herb research brief</p>
                <h1 className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                  {displayName}
                </h1>
                {botanicalName ? <p className="text-sm italic text-muted">{botanicalName}</p> : null}
              </div>

              <p className="max-w-3xl text-base leading-7 text-[#46574d] sm:text-lg">
                {briefSummary}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <EvidenceBadgeGroup record={herb} compact />
                <span className="rounded-full border border-amber-800/20 bg-amber-50/80 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-amber-900">
                  Safety: {formatDisplayLabel(safetySensitivity)} caution
                </span>
              </div>

              <ChipList items={topUses} limit={6} />
            </div>

            <aside className="rounded-3xl border border-brand-900/10 bg-sand-50/85 p-4 shadow-sm">
              <p className="eyebrow-label">Decision cues</p>
              <div className="mt-3 grid gap-3">
                <BriefCard label="Evidence" value={evidenceStrength || researchMaturity} />
                <BriefCard label="Safety" value={safetySummary} />
                <BriefCard label="Timeline" value={timeline || 'Timing varies by preparation, dose, and context.'} />
                <BriefCard label="Mechanism hints" value={mechanisms.slice(0, 3).join(', ')} />
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Decision snapshot</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Fast orientation before the deep dive</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <BriefCard label="Best known for" value={topUses.slice(0, 3).join(', ')} />
          <BriefCard label="Evidence strength" value={evidenceStrength || researchMaturity} />
          <BriefCard label="Safety watchouts" value={safetyGroups.length ? safetyGroups[0].items.slice(0, 2).join(', ') : safetySummary} />
          <BriefCard label="Timeline / onset" value={timeline} />
          <BriefCard label="Stack context">
            {stackContext.length ? (
              <div className="space-y-2">
                {stackContext.map(item => (
                  <Link key={item.href} href={item.href} className="block text-sm font-semibold text-ink underline-offset-4 hover:underline">
                    {item.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </BriefCard>
        </div>
      </section>

      {keyTakeaways.length > 0 ? (
        <section className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
          <p className="eyebrow-label">Key takeaways</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-[#46574d]">
            {keyTakeaways.map(item => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-3xl border border-amber-800/20 bg-amber-50/80 p-5 shadow-sm">
        <div className="space-y-2">
          <p className="eyebrow-label text-amber-900">Safety first</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Review cautions before use</h2>
          <p className="max-w-4xl text-sm leading-6 text-[#5f4a24]">{safetySummary}</p>
        </div>

        {safetyGroups.length > 0 ? (
          <details className="mt-4 rounded-2xl border border-amber-900/10 bg-white/60 p-4">
            <summary className="cursor-pointer text-sm font-bold text-ink">View full safety notes</summary>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {safetyGroups.map(group => (
                <div key={group.title} className="space-y-2">
                  <h3 className="text-sm font-semibold text-ink">{group.title}</h3>
                  <ul className="space-y-1 text-sm leading-6 text-[#5f4a24]">
                    {group.items.map(item => <li key={item}>• {item}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        ) : null}
      </section>

      <section className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
        <div className="space-y-2">
          <p className="eyebrow-label">Evidence summary</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">What the current profile supports</h2>
          <p className="max-w-4xl text-sm leading-6 text-[#46574d]">
            {displayName} is categorized as {researchMaturity.toLowerCase()} with a {researchStyle.toLowerCase()} evidence style. Interpret benefits by outcome, preparation, dose, and the safety context above.
          </p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {focusAreas.length > 0 ? <BriefCard label="Primary evidence topics"><ChipList items={focusAreas} limit={6} /></BriefCard> : null}
          {evidenceLimitations.length > 0 ? <BriefCard label="Evidence limitations" value={evidenceLimitations.slice(0, 2).join(' ')} /> : null}
        </div>

        <div className="mt-5 space-y-3">
          {focusAreas.length > 0 ? (
            <CompactDetails title="Human evidence" description="Outcome areas and human-facing evidence signals exposed by the profile.">
              <ChipList items={focusAreas} />
            </CompactDetails>
          ) : null}
          {mechanisms.length > 0 ? (
            <CompactDetails title="Animal / preclinical evidence and mechanisms" description="Mechanistic and pathway context; not proof of clinical effect by itself.">
              <ChipList items={mechanisms} />
            </CompactDetails>
          ) : null}
          {traditionalUses.length > 0 ? (
            <CompactDetails title="Traditional use" description="Traditional or historical-use language from the source profile.">
              <ChipList items={traditionalUses} />
            </CompactDetails>
          ) : null}
          {pathwayClusters.length > 0 ? (
            <CompactDetails title="Mechanism clusters" description="Grouped pathway signals for deeper research.">
              <div className="grid gap-3 md:grid-cols-2">
                {pathwayClusters.map(cluster => (
                  <div key={cluster.title} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4">
                    <h3 className="text-sm font-semibold text-ink">{cluster.title}</h3>
                    <p className="mt-1 text-xs leading-5 text-muted">{cluster.description}</p>
                    <div className="mt-3"><ChipList items={cluster.mechanisms} /></div>
                  </div>
                ))}
              </div>
            </CompactDetails>
          ) : null}
          {evidenceLimitations.length > 0 ? (
            <CompactDetails title="Limitations" description="Reasons to avoid over-reading the available profile data.">
              <ul className="space-y-2 text-sm leading-6 text-[#46574d]">
                {evidenceLimitations.map(item => <li key={item}>• {item}</li>)}
              </ul>
            </CompactDetails>
          ) : null}
        </div>
      </section>

      {topUses.length > 0 ? (
        <section className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
          <p className="eyebrow-label">Uses and effects</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Most visible signals</h2>
          <div className="mt-4"><ChipList items={topUses} /></div>
          {hiddenUses.length > 0 ? (
            <details className="mt-4 rounded-2xl border border-brand-900/10 bg-white/60 p-4">
              <summary className="cursor-pointer text-sm font-bold text-ink">Show all reported effects</summary>
              <div className="mt-4"><ChipList items={hiddenUses} /></div>
            </details>
          ) : null}
        </section>
      ) : null}

      <section className="space-y-4">
        <div className="space-y-1">
          <p className="eyebrow-label">Deep research</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Long-form context, collapsed by default</h2>
        </div>

        <CompactDetails title="Decision tools and alternatives" description="Decision layer, visual grid, alternatives, and field-manual context.">
          <ProfileDecisionLayer record={herb} entityType="herb" relatedRecords={relatedProfiles} effects={effects} summary={summary} />
          <DecisionVisualGrid record={herb} />
          <WhyThisInsteadPanel record={herb} alternatives={relatedProfiles} />
          <DecisionClarityFieldManual record={herb} entityType="herb" relatedRecords={relatedProfiles} effects={effects} summary={summary} />
        </CompactDetails>

        <CompactDetails title="Authority, editorial, and assistant panels" description="Generated authority shell, editorial layer, assistant panel, and detailed authority sections.">
          <AuthorityProfileShell model={authorityModel} record={herb} />
          <AuthorityEditorialLayer record={herb} entityType="herb" effects={effects} summary={summary} />
          <SemanticAssistantPanel headline={assistant.headline} body={assistant.body} signals={assistant.signals} suggestions={assistantSuggestions} />
          <ProfileAuthoritySections record={herb} entityType="herb" relatedRecords={relatedProfiles} comparisonRecords={comparisonRecords} stackRecords={stackRecords} effects={effects} summary={summary} />
        </CompactDetails>

        <CompactDetails title="Exploration map and discovery rails" description="Guided exploration, semantic graph map, orchestrated discovery, pathways, and collection links.">
          <SemanticArtworkPanel slug={herb.slug} kind="botanical" title={displayName} subtitle="Botanical ecosystem artwork for evidence-aware pathway exploration." height={260} />
          <GuidedExplorationPanel overview={narrative.overview} pathways={narrative.pathways} exploration={narrative.exploration} prompts={prompts} />
          <SemanticVisibilityGate minHeight={420}>
            <SemanticGraphMap title="Profile relationship map" description="A lightweight map of pathway signals, mechanism overlap, and connected semantic profiles." nodes={graph.nodes} edges={graph.edges} />
          </SemanticVisibilityGate>
          <RuntimeOrchestratedDiscovery record={herb} />
          <CompactRelatedPathways record={herb} />
          {featuredCollections.length > 0 ? (
            <div className="rounded-3xl border border-brand-900/10 bg-white/70 p-5">
              <p className="eyebrow-label">Featured in collections</p>
              <div className="mt-3 flex flex-wrap gap-3">
                {featuredCollections.slice(0, 4).map((collection) => (
                  <Link key={collection.slug} href={collection.href} className="surface-subtle rounded-2xl border border-brand-900/10 px-4 py-3 text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-white/60">
                    {collection.title}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </CompactDetails>

        <CompactDetails title="Sourcing, CTAs, and internal research links" description="Monetization readiness, sourcing notes, and broader internal-link density.">
          <EvidenceAwareCTA readiness={readiness} sourcingNotes={sourcingNotes} record={herb} />
          <LinkDensitySection links={internalLinks} />
        </CompactDetails>
      </section>

      <section className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
        <div className="space-y-1">
          <p className="eyebrow-label">Related navigation</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Keep researching</h2>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {relatedHerbLinks.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Related herbs</h3>
              {relatedHerbLinks.map(item => <Link key={item.href} href={item.href} className="block text-sm text-[#46574d] underline-offset-4 hover:underline">{item.label}</Link>)}
            </div>
          ) : null}
          {relatedCompoundLinks.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Related compounds</h3>
              {relatedCompoundLinks.map(item => <Link key={item.href} href={item.href} className="block text-sm text-[#46574d] underline-offset-4 hover:underline">{item.label}</Link>)}
            </div>
          ) : null}
          {comparisonLinks.length > 0 ? (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-ink">Relevant comparisons</h3>
              {comparisonLinks.map(item => <Link key={item.href} href={item.href} className="block text-sm text-[#46574d] underline-offset-4 hover:underline">{item.label}</Link>)}
            </div>
          ) : null}
        </div>
        <Link href="/herbs" className="mt-5 inline-flex rounded-full border border-brand-900/10 bg-white px-4 py-2 text-sm font-bold text-ink transition hover:bg-sand-50">
          Back to herbs library
        </Link>
      </section>
    </main>
  )
}

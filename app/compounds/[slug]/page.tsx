import { notFound } from 'next/navigation'
import DecisionCard from '@/components/ui/DecisionCard'
import SectionBlock from '@/components/ui/SectionBlock'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import TableOfContents from '@/components/ui/TableOfContents'
import ScrollCTA from '@/components/ui/ScrollCTA'
import CompareBar from '@/components/ui/CompareBar'
import TrustBar from '@/components/ui/TrustBar'
import EvidenceMeter from '@/components/ui/EvidenceMeter'
import CompoundStats from '@/components/ui/CompoundStats'
import MechanismGrid from '@/components/ui/MechanismGrid'
import UseCases from '@/components/ui/UseCases'
import ResearchHighlights from '@/components/ui/ResearchHighlights'
import CompoundHero from '@/components/ui/CompoundHero'
import TimelineCard from '@/components/ui/TimelineCard'
import StackCompatibility from '@/components/ui/StackCompatibility'
import ConfidencePanel from '@/components/ui/ConfidencePanel'
import ReadingProgress from '@/components/ui/ReadingProgress'
import EvidenceSnapshotCard from '@/components/ui/EvidenceSnapshotCard'
import SemanticRecommendationCard from '@/components/ui/SemanticRecommendationCard'
import data from '../../../public/data/compounds.json'
import {
  normalizeEvidenceLevel,
  normalizeSafetyLevel,
  getEffects,
  getSources
} from '@/lib/evidence-utils'
import {
  getEvidenceSnapshot,
  getRelatedCompounds,
  getStackCandidates,
  getComparisonCandidates,
  classifyArchetype,
} from '@/lib/semantic-runtime'
import { getRelatedLabel, getRelatedRuntimeRecords } from '@/lib/related-runtime'
import Link from 'next/link'
import { EvidenceMaturityRibbon, SemanticBrowseModule } from '@/components/scientific-discovery'
import { buildSemanticTopics } from '@/lib/editorial-discovery'
import { cleanSummary, formatDisplayLabel, isClean, isSafeInternalHref, list, text } from '@/lib/display-utils'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { buildMeta } from '@/lib/seo'
import { EvidenceBadgeGroup } from '@/components/evidence/evidence-badge'

export async function generateStaticParams() {
  return (data as any[])
    .filter((compound) => getRuntimeVisibility(compound).canRender)
    .map((c)=>({ slug:c.slug }))
}

export function generateMetadata({ params }: any) {
  const compound = (data as any[]).find(c => c.slug === params.slug)
  if (!compound) return {}

  const visibility = getRuntimeVisibility(compound)
  const meta = buildMeta({
    title: `${compound.name} Benefits, Effects & Safety | Hippie Scientist`,
    description: cleanSummary(compound.summary || compound.description, 'compound'),
    path: `/compounds/${compound.slug}`,
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

function cleanLabel(value: unknown) {
  return formatDisplayLabel(value)
}

const knownComparisonSlugs = new Set([
  ...generatedComparisons,
  ...supplementComparisons.map((comparison) => comparison.slug),
])

function normalizeText(value: string = '') {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export default function Page({ params }: any) {
  const compounds = data as any[]
  const compound = compounds.find(c => c.slug === params.slug)
  if (!compound || !getRuntimeVisibility(compound).canRender) notFound()

  const effects = getEffects(compound)
    .map((effect:string) => cleanLabel(effect))
    .filter((effect:string) => isClean(effect) && !/^no\s+strong\s+effects\s+established\s+yet$/i.test(effect))
  const sources = getSources(compound)
    .map((source:any) => text(source))
    .filter(isClean)

  const related = getRelatedCompounds(compound)
    .map((item:any) => ({
      ...item,
      name: formatDisplayLabel(item.name || item.slug),
      relationship_reason: cleanSummary(item.relationship_reason, 'compound'),
      evidence_tier: formatDisplayLabel(item.evidence_tier),
      archetype: formatDisplayLabel(classifyArchetype(item)),
    }))
    .filter((item:any) => item.slug && item.name && isClean(item.name))

  const semanticRelated = getRelatedRuntimeRecords(compound, compounds, 6)
    .filter((item:any) => getRuntimeVisibility(item).canRender)
    .map((item:any) => ({
      ...item,
      name: formatDisplayLabel(item.name || item.slug),
      overlap: (item.relatedOverlap || []).map(formatDisplayLabel).filter(isClean),
    }))

  const stackCandidates = getStackCandidates(compound)
    .map((candidate:any) => ({
      ...candidate,
      name: formatDisplayLabel(candidate.name || candidate.slug),
      reason: text(candidate.reason) ? cleanSummary(candidate.reason, 'compound') : '',
      confidence: formatDisplayLabel(candidate.confidence || 'Exploratory'),
    }))
    .filter((candidate:any) => candidate.slug && candidate.name && isClean(candidate.reason))

  const comparisonCandidates = getComparisonCandidates(compound).filter((candidate:any) => candidate.slug && knownComparisonSlugs.has(candidate.slug) && isSafeInternalHref(candidate.href))
  const snapshot = getEvidenceSnapshot(compound)
  const rawSemanticTopics = buildSemanticTopics(compound)

  const semanticTopics = {
    maturity: formatDisplayLabel(rawSemanticTopics.maturity) || 'Evidence maturity',
    researchStyle: formatDisplayLabel(rawSemanticTopics.researchStyle) || 'Research context',
    effects: rawSemanticTopics.effects.map(formatDisplayLabel).filter(isClean),
    mechanisms: rawSemanticTopics.mechanisms.map(formatDisplayLabel).filter(isClean),
  }

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier)
  const safetyLevel = normalizeSafetyLevel(compound.safety)

  const mechanisms = list(compound.mechanisms).filter(isClean)

  const summary = cleanSummary(compound.summary || compound.description, 'compound')

  const quickVerdict =
    summary && summary.length > 140
      ? `${summary.slice(0, 160).trimEnd()}…`
      : ''

  const showQuickVerdict =
    quickVerdict && normalizeText(quickVerdict) !== normalizeText(summary)

  const faq = [
    {
      q:`What is ${compound.name} used for?`,
      a: summary,
    },
    {
      q:`Is ${compound.name} safe?`,
      a: cleanLabel(compound.safety || 'Generally well tolerated, though individual response varies.'),
    }
  ].filter(item => {
    if (!item.a) return false
    return normalizeText(item.a) !== normalizeText(summary)
  })

  const timelineData = Array.isArray(compound.timeline)
    ? compound.timeline
    : Array.isArray(compound.time_to_effect)
      ? compound.time_to_effect
      : []

  const meaningfulTimeline = timelineData
    .map((item:any) => ({
      title: formatDisplayLabel(item?.title),
      text: text(item?.text),
    }))
    .filter((item:any) => isClean(item.title) && isClean(item.text))

  return (
    <>
      <ReadingProgress />

      <main className="mx-auto flex max-w-7xl gap-10 px-4 pb-28 sm:pb-32">

        <TableOfContents />

        <div className="flex-1 space-y-10">

          <Breadcrumbs items={[
            { label:'Home', href:'/' },
            { label:'Compounds', href:'/compounds' },
            { label:compound.name }
          ]}/>

          <TrustBar />

          <div className="space-y-4">
            <CompoundHero
              compound={{ ...compound, summary }}
              evidenceLevel={evidenceLevel}
              safetyLevel={safetyLevel}
            />

            <EvidenceBadgeGroup record={compound} />

            <div className="flex flex-wrap gap-3">
              <EvidenceMaturityRibbon label={semanticTopics.maturity} />

              {[semanticTopics.researchStyle, ...semanticTopics.effects.slice(0, 2), ...semanticTopics.mechanisms.slice(0, 2)]
                .filter(isClean)
                .map(item => (
                  <span key={item} className="chip-readable">{item}</span>
                ))}
            </div>
          </div>

          <EvidenceSnapshotCard snapshot={snapshot} />

          <div className="space-y-5">
            <EvidenceMeter level={evidenceLevel} />

            <ConfidencePanel level={evidenceLevel} />

            <CompoundStats compound={{
              ...compound,
              effects,
              sources
            }} />

            {effects.length > 0 ? (
              <UseCases effects={effects} />
            ) : null}
          </div>

          <DecisionCard
            bestFor={effects}
            avoid={compound.avoid||[]}
            time="Varies"
            evidence={compound.evidence_tier || 'Human data available'}
          />

          {semanticRelated.length > 0 ? (
            <SectionBlock title={getRelatedLabel(compound)}>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {semanticRelated.map((item:any)=>(
                  <Link
                    key={item.slug}
                    href={`/compounds/${item.slug}`}
                    className="card-premium group p-5"
                  >
                    <div className="space-y-4">
                      <EvidenceBadgeGroup record={item} compact />

                      <div className="flex flex-wrap gap-2">
                        {(item.overlap || []).slice(0, 2).map((signal:string) => (
                          <span key={signal} className="chip-readable">
                            {signal}
                          </span>
                        ))}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-ink transition group-hover:text-brand-700">
                          {item.name}
                        </h3>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#46574d]">
                          {cleanSummary(item.summary || item.description, 'compound')}
                        </p>
                      </div>

                      <div className="identity-meta">
                        {item.relatedScore} shared semantic signals
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </SectionBlock>
          ) : null}

        </div>

        <ScrollCTA />
        <CompareBar items={related} />

      </main>
    </>
  )
}

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
import Link from 'next/link'
import { EvidenceMaturityRibbon, SemanticBrowseModule } from '@/components/scientific-discovery'
import { buildSemanticTopics } from '@/lib/editorial-discovery'
import { cleanSummary, formatDisplayLabel, isClean, isSafeInternalHref, list } from '@/lib/display-utils'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'

export async function generateStaticParams() {
  return (data as any[]).map((c)=>({ slug:c.slug }))
}

export function generateMetadata({ params }: any) {
  const compound = (data as any[]).find(c => c.slug === params.slug)
  if (!compound) return {}

  return {
    title: `${compound.name} Benefits, Effects & Safety | Hippie Scientist`,
    description: cleanSummary(compound.summary || compound.description, 'compound')
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
  if (!compound) return null

  const effects = getEffects(compound)
    .map((effect:string) => cleanLabel(effect))
    .filter((effect:string) => isClean(effect) && !/^no\s+strong\s+effects\s+established\s+yet$/i.test(effect))
  const sources = getSources(compound).filter((source:any) => isClean(typeof source === 'string' ? source : JSON.stringify(source)))

  const related = getRelatedCompounds(compound)
    .filter((item:any) => item.slug && item.name && isClean(item.name))
    .map((item:any)=>({
      ...item,
      archetype: classifyArchetype(item),
    }))

  const stackCandidates = getStackCandidates(compound).filter((candidate:any) => candidate.slug && candidate.name && isClean(candidate.reason))
  const comparisonCandidates = getComparisonCandidates(compound).filter((candidate:any) => candidate.slug && knownComparisonSlugs.has(candidate.slug) && isSafeInternalHref(candidate.href))
  const snapshot = getEvidenceSnapshot(compound)
  const semanticTopics = buildSemanticTopics(compound)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier)
  const safetyLevel = normalizeSafetyLevel(compound.safety)

  const mechanisms = list(compound.mechanisms)

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

  const meaningfulTimeline = timelineData.filter((item:any) => isClean(item?.title) && isClean(item?.text))

  return (
    <>
      <ReadingProgress />

      <main className="mx-auto flex max-w-7xl gap-10 px-4 pb-40 sm:pb-32">

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
            <div className="flex flex-wrap gap-3">
              <EvidenceMaturityRibbon label={semanticTopics.maturity} />
              {[semanticTopics.researchStyle, ...semanticTopics.effects.slice(0, 2), ...semanticTopics.mechanisms.slice(0, 2)].filter(isClean).map(item => (
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

          {showQuickVerdict ? (
            <div className="surface-depth card-spacing text-sm leading-7 text-[#46574d]">
              <strong className="text-ink">Quick verdict:</strong>{' '}
              {quickVerdict}
            </div>
          ) : null}

          {meaningfulTimeline.length > 0 ? (
            <SectionBlock title="Expected Timeline">
              <TimelineCard phases={meaningfulTimeline} />
            </SectionBlock>
          ) : null}

          {mechanisms.length > 0 && (
            <SectionBlock title="Mechanisms">
              <div className="mb-5 pull-quote-science">
                Current evidence suggests these pathways are best treated as a research map, not a promise of effect.
              </div>
              <MechanismGrid mechanisms={mechanisms} />
            </SectionBlock>
          )}

          <SemanticBrowseModule
            eyebrow="Semantic recommendations"
            title="Continue researching by relationship"
            description="Move laterally through effect clusters, pathway families, evidence maturity, and comparison candidates."
            groups={[
              { title: semanticTopics.effects[0] || 'Outcome pathways', description: 'Explore profiles with similar outcome language and practical intent.', href: '/goals', meta: 'Outcome' },
              { title: semanticTopics.mechanisms[0] || 'Mechanism families', description: 'Follow pathway context without treating mechanisms as clinical proof.', href: '/explore', meta: 'Mechanism' },
              { title: semanticTopics.maturity, description: 'Compare stronger, mixed, and early-stage evidence profiles.', href: '/a-tier', meta: 'Evidence' },
            ].filter(group => isClean(group.title) && isSafeInternalHref(group.href))}
          />

          <div id="effects">
            {effects.length > 0 ? (
              <SectionBlock title="Primary Effects">
                <ul className="space-y-3 text-sm leading-7 text-[#46574d]">
                  {effects.map((effect:any,index:number)=>(
                    <li key={index}>• {effect}</li>
                  ))}
                </ul>
              </SectionBlock>
            ) : null}
          </div>

          {stackCandidates.length > 0 ? (
            <SectionBlock title="Potential Stack Pairings">
              <div className="grid gap-4 md:grid-cols-2">
                {stackCandidates.map((candidate:any)=>(
                  <div
                    key={candidate.slug}
                    className="surface-subtle rounded-2xl p-5"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-ink">
                        {candidate.name}
                      </h3>

                      <span className="chip-readable text-[10px] uppercase tracking-wide">
                        {cleanLabel(candidate.confidence || 'Exploratory')}
                      </span>
                    </div>

                    <p className="mt-3 text-sm leading-7 text-[#46574d]">
                      {candidate.reason}
                    </p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          ) : null}

          {comparisonCandidates.length > 0 ? (
            <SectionBlock title="Compare Alternatives">
              <div className="flex flex-wrap gap-3">
                {comparisonCandidates.map((candidate:any)=>(
                  <Link
                    key={candidate.slug}
                    href={candidate.href}
                    className="chip-readable transition hover:text-brand-800"
                  >
                    {cleanLabel(candidate.label)}
                  </Link>
                ))}
              </div>
            </SectionBlock>
          ) : null}

          {related.length > 0 ? (
            <SectionBlock title="Recommended Related Compounds">
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {related.map((item:any)=>(
                  <SemanticRecommendationCard
                    key={item.slug}
                    item={item}
                  />
                ))}
              </div>
            </SectionBlock>
          ) : null}

          <div id="safety">
            <SectionBlock title="Safety">
              <p className="text-sm leading-7 text-[#46574d]">
                {isClean(compound.safety) ? cleanLabel(compound.safety) : 'No major cautions surfaced in the current profile.'}
              </p>
            </SectionBlock>
          </div>

          {sources.length>0&&(
            <SectionBlock title="Research Highlights">
              <ResearchHighlights sources={sources} />
            </SectionBlock>
          )}

          {sources.length>0&&(
            <SectionBlock title="Sources">
              <ul className="space-y-2 text-sm leading-7 text-[#46574d]">
                {sources.slice(0,10).map((source:any,index:number)=>(
                  <li key={index}>• {typeof source==='string'?source:JSON.stringify(source)}</li>
                ))}
              </ul>
            </SectionBlock>
          )}

          <div id="faq">
            {faq.length > 0 ? (
              <SectionBlock title="FAQ">
                <div className="space-y-5">
                  {faq.map((item,index)=>(
                    <div key={index} className="space-y-2 border-b border-brand-900/10 pb-4 last:border-none">
                      <p className="font-semibold text-sm text-ink">{item.q}</p>
                      <p className="text-sm leading-7 text-[#46574d]">{item.a}</p>
                    </div>
                  ))}
                </div>
              </SectionBlock>
            ) : null}
          </div>

        </div>

        <ScrollCTA />
        <CompareBar items={related} />

      </main>
    </>
  )
}

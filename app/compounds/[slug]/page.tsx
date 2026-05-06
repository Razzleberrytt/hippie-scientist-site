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

export async function generateStaticParams() {
  return (data as any[]).map((c)=>({ slug:c.slug }))
}

export function generateMetadata({ params }: any) {
  const compound = (data as any[]).find(c => c.slug === params.slug)
  if (!compound) return {}

  return {
    title: `${compound.name} Benefits, Effects & Safety | Hippie Scientist`,
    description: compound.summary || 'Detailed breakdown of effects, safety, and usage.'
  }
}

export default function Page({ params }: any) {
  const compounds = data as any[]
  const compound = compounds.find(c => c.slug === params.slug)
  if (!compound) return null

  const effects = getEffects(compound)
  const sources = getSources(compound)

  const related = getRelatedCompounds(compound).map((item:any)=>({
    ...item,
    archetype: classifyArchetype(item),
  }))

  const stackCandidates = getStackCandidates(compound)
  const comparisonCandidates = getComparisonCandidates(compound)
  const snapshot = getEvidenceSnapshot(compound)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier)
  const safetyLevel = normalizeSafetyLevel(compound.safety)

  const mechanisms = compound.mechanisms || []

  const faq = [
    {
      q:`What is ${compound.name} used for?`,
      a:compound.summary || 'Used for a variety of wellness and performance-related goals.'
    },
    {
      q:`Is ${compound.name} safe?`,
      a:compound.safety || 'Generally well tolerated, though individual response varies.'
    }
  ]

  return (
    <>
      <ReadingProgress />

      <main className="max-w-7xl mx-auto px-4 flex gap-10 pb-28">

        <TableOfContents />

        <div className="flex-1 space-y-10">

          <Breadcrumbs items={[
            { label:'Home', href:'/' },
            { label:'Compounds', href:'/compounds' },
            { label:compound.name }
          ]}/>

          <TrustBar />

          <CompoundHero
            compound={compound}
            evidenceLevel={evidenceLevel}
            safetyLevel={safetyLevel}
          />

          <EvidenceSnapshotCard snapshot={snapshot} />

          <div className="space-y-5">

            <EvidenceMeter level={evidenceLevel} />

            <ConfidencePanel level={evidenceLevel} />

            <CompoundStats compound={{
              ...compound,
              effects,
              sources
            }} />

            <UseCases effects={effects} />

          </div>

          <DecisionCard
            bestFor={effects}
            avoid={compound.avoid||[]}
            time="Varies"
            evidence={compound.evidence_tier || 'Human data available'}
          />

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 text-sm leading-7 shadow-2xl text-neutral-200">
            <strong className="text-white">Quick Verdict:</strong>{' '}
            {compound.summary || 'Likely useful depending on context and goals.'}
          </div>

          <SectionBlock title="Expected Timeline">
            <TimelineCard />
          </SectionBlock>

          {mechanisms.length > 0 && (
            <SectionBlock title="Mechanisms">
              <MechanismGrid mechanisms={mechanisms} />
            </SectionBlock>
          )}

          <div id="effects">
            <SectionBlock title="Primary Effects">
              <ul className="space-y-3 text-sm leading-7">
                {effects.map((e:any,i:number)=>(
                  <li key={i}>• {e}</li>
                ))}
              </ul>
            </SectionBlock>
          </div>

          <SectionBlock title="Potential Stack Pairings">
            <div className="grid md:grid-cols-2 gap-4">
              {stackCandidates.map((candidate:any)=>(
                <div
                  key={candidate.slug}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-white">
                      {candidate.name}
                    </h3>

                    <span className="text-[10px] uppercase tracking-wide text-emerald-300">
                      {candidate.confidence}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-neutral-400 leading-6">
                    {candidate.reason}
                  </p>
                </div>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Compare Alternatives">
            <div className="flex flex-wrap gap-3">
              {comparisonCandidates.map((candidate:any)=>(
                <Link
                  key={candidate.slug}
                  href={candidate.href}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-neutral-200 hover:bg-white/10 transition"
                >
                  {candidate.label}
                </Link>
              ))}
            </div>
          </SectionBlock>

          <SectionBlock title="Recommended Related Compounds">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {related.map((item:any)=>(
                <SemanticRecommendationCard
                  key={item.slug}
                  item={item}
                />
              ))}
            </div>
          </SectionBlock>

          <div id="safety">
            <SectionBlock title="Safety">
              <p className="text-sm leading-7">
                {compound.safety || 'Generally well tolerated for most users. Use caution with medications or pre-existing conditions.'}
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
              <ul className="space-y-2 text-xs leading-6 text-neutral-600">
                {sources.slice(0,10).map((s:any,i:number)=>(
                  <li key={i}>• {typeof s==='string'?s:JSON.stringify(s)}</li>
                ))}
              </ul>
            </SectionBlock>
          )}

          <div id="faq">
            <SectionBlock title="FAQ">
              <div className="space-y-5">
                {faq.map((f,i)=>(
                  <div key={i} className="space-y-2 border-b pb-4 last:border-none">
                    <p className="font-semibold text-sm">{f.q}</p>
                    <p className="text-sm text-neutral-600 leading-7">{f.a}</p>
                  </div>
                ))}
              </div>
            </SectionBlock>
          </div>

        </div>

        <ScrollCTA />
        <CompareBar items={related} />

      </main>
    </>
  )
}

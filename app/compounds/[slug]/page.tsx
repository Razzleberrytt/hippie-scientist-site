import DecisionCard from '@/components/ui/DecisionCard'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import SafetyBadge from '@/components/ui/SafetyBadge'
import SectionBlock from '@/components/ui/SectionBlock'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import TableOfContents from '@/components/ui/TableOfContents'
import ScrollCTA from '@/components/ui/ScrollCTA'
import CompareBar from '@/components/ui/CompareBar'
import TrustBar from '@/components/ui/TrustBar'
import EvidenceMeter from '@/components/ui/EvidenceMeter'
import CompoundStats from '@/components/ui/CompoundStats'
import data from '../../../public/data/compounds.json'
import {
  normalizeEvidenceLevel,
  normalizeSafetyLevel,
  getEffects,
  getSources
} from '@/lib/evidence-utils'
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

  const related = compounds
    .filter(c => c.slug !== compound.slug)
    .slice(0,5)

  const evidenceLevel = normalizeEvidenceLevel(compound.evidence_tier)
  const safetyLevel = normalizeSafetyLevel(compound.safety)

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
    <main className="max-w-6xl mx-auto px-4 flex gap-10 pb-28">

      <TableOfContents />

      <div className="flex-1 space-y-10">

        <Breadcrumbs items={[
          { label:'Home', href:'/' },
          { label:'Compounds', href:'/compounds' },
          { label:compound.name }
        ]}/>

        <TrustBar />

        <div className="space-y-5">

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight leading-tight">
              {compound.name}
            </h1>

            <p className="text-sm leading-7 text-neutral-600 max-w-3xl">
              {compound.summary || 'Evidence-informed compound profile.'}
            </p>

            <div className="flex flex-wrap gap-2">
              <EvidenceBadge level={evidenceLevel} />
              <SafetyBadge level={safetyLevel} />
            </div>
          </div>

          <EvidenceMeter level={evidenceLevel} />

          <CompoundStats compound={{
            ...compound,
            effects,
            sources
          }} />

        </div>

        <DecisionCard
          bestFor={effects}
          avoid={compound.avoid||[]}
          time="Varies"
          evidence={compound.evidence_tier || 'Human data available'}
        />

        <div className="bg-neutral-100 rounded-2xl p-5 text-sm leading-7 border">
          <strong>Quick Verdict:</strong>{' '}
          {compound.summary || 'Likely useful depending on context and goals.'}
        </div>

        <div id="effects">
          <SectionBlock title="Primary Effects">
            <ul className="space-y-3 text-sm leading-6">
              {effects.map((e:any,i:number)=>(
                <li key={i}>• {e}</li>
              ))}
            </ul>
          </SectionBlock>
        </div>

        <div id="safety">
          <SectionBlock title="Safety">
            <p className="text-sm leading-7">
              {compound.safety || 'Generally well tolerated for most users. Use caution with medications or pre-existing conditions.'}
            </p>
          </SectionBlock>
        </div>

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

        <div id="related">
          <SectionBlock title="Related Compounds">
            <div className="flex flex-wrap gap-2">
              {related.map((r:any)=>(
                <Link
                  key={r.slug}
                  href={`/compounds/${r.slug}`}
                  className="text-xs bg-neutral-100 hover:bg-neutral-200 transition px-3 py-2 rounded-full border"
                >
                  {r.name}
                </Link>
              ))}
            </div>
          </SectionBlock>
        </div>

      </div>

      <ScrollCTA />
      <CompareBar items={related} />

    </main>
  )
}

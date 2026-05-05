import data from '../../../public/data/compounds.json'

export async function generateStaticParams() {
  return (data as any[]).map((c) => ({ slug: c.slug }))
}

import DecisionCard from '@/components/ui/DecisionCard'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import SectionBlock from '@/components/ui/SectionBlock'
import compounds from '../../../public/data/compounds.json'

export default function Page({ params }: any) {
  const compound = (compounds as any[]).find(c => c.slug === params.slug)
  if (!compound) return null

  return (
    <main className="max-w-3xl mx-auto px-4 space-y-10 pb-24">

      <div className="space-y-2">
        <h1 className="text-3xl font-bold">{compound.name}</h1>
        <p className="text-sm text-neutral-600">{compound.summary}</p>
        <EvidenceBadge level="moderate" />
      </div>

      <DecisionCard
        bestFor={compound.effects || []}
        avoid={[]}
        time="Varies"
        evidence="Moderate human evidence"
      />

      <SectionBlock title="Primary Effects">
        <ul>
          {(compound.effects || []).map((e:any,i:number)=>(
            <li key={i}>• {e}</li>
          ))}
        </ul>
      </SectionBlock>

      <SectionBlock title="Mechanisms">
        <p className="text-neutral-500">Expand for details</p>
      </SectionBlock>

      <SectionBlock title="Safety">
        <p>{compound.safety || 'Generally safe for most users'}</p>
      </SectionBlock>

    </main>
  )
}

import DecisionCard from '@/components/ui/DecisionCard'
import EvidenceBadge from '@/components/ui/EvidenceBadge'
import data from '../../../public/data/compounds.json'

export default function Page({ params }: any) {
  const compound = (data as any[]).find(c => c.slug === params.slug)
  if (!compound) return null

  return (
    <main className="max-w-3xl mx-auto px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{compound.name}</h1>
        <p className="text-sm text-muted">{compound.summary}</p>
        <div className="mt-2"><EvidenceBadge level="moderate" /></div>
      </div>

      <DecisionCard
        bestFor={compound.effects || []}
        avoid={[]}
        time="Varies"
        evidence="Moderate human evidence"
      />

      <div>
        <h2 className="font-semibold">Effects</h2>
        <ul className="text-sm">{(compound.effects||[]).map((e:any,i:number)=><li key={i}>• {e}</li>)}</ul>
      </div>

      <div>
        <h2 className="font-semibold">Safety</h2>
        <p className="text-sm">{compound.safety || 'Generally safe'}</p>
      </div>
    </main>
  )
}

import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pill } from 'lucide-react'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import { DetailCard, EvidenceBadge, RoleBadge } from '@/components/ui/Card'

type Params = { params: Promise<{ slug: string }> }

type CompoundDetail = Record<string, any>

const text = (v: any) => (Array.isArray(v) ? v.join(', ') : String(v || '').trim())
const list = (v: any) => (Array.isArray(v) ? v : String(v || '').split(/\n|;|\|/).map((x:string)=>x.trim()).filter(Boolean))

export async function generateStaticParams() {
  const compounds = await getCompounds()
  return compounds.map((c: any) => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) return { title: 'Compound Not Found' }
  return { title: `${compound.name || slug} | Compound` }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const data: CompoundDetail = await getCompoundBySlug(slug)
  if (!data) return notFound()

  const name = data.displayName || data.name || slug
  const bestFor = list(data.effects)
  const mechanisms = list(data.mechanisms)
  const safety = list(data.safety_flags)
  const evidence = data.evidence_tier || data.evidenceTier
  const pmids = list(data.pmid_list)

  return (
    <div className="space-y-8">

      <DetailCard>
        <div className="flex items-center gap-3">
          <Pill className="text-teal-600" />
          <h1 className="text-3xl font-bold text-ink">{name}</h1>
          <RoleBadge role={data.role || 'support'} />
        </div>
        <p className="mt-2 text-sm text-muted">{data.formula || ''}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {bestFor.map((b:string)=>(<span key={b} className="px-3 py-1 text-xs rounded-full bg-neutral-100">{b}</span>))}
        </div>

        <div className="mt-4">
          <EvidenceBadge value={evidence} />
          <p className="text-sm text-muted mt-2">Classified as {evidence || 'limited'} evidence based on available studies.</p>
        </div>
      </DetailCard>

      <DetailCard title="Safety & Side Effects">
        <ul className="text-sm text-neutral-700 space-y-2">
          {safety.map((s:string)=>(<li key={s}>• {s}</li>))}
        </ul>
      </DetailCard>

      <DetailCard title="Mechanisms of Action">
        <details>
          <summary className="cursor-pointer font-semibold">View mechanisms</summary>
          <ul className="mt-3 space-y-2 text-sm">
            {mechanisms.map((m:string)=>(<li key={m}>• {m}</li>))}
          </ul>
        </details>
      </DetailCard>

      {pmids.length > 0 && (
        <DetailCard title="References">
          <ul className="text-sm space-y-2">
            {pmids.map((id:string)=>(
              <li key={id}>
                <a href={`https://pubmed.ncbi.nlm.nih.gov/${id}`} target="_blank" className="text-teal-700 underline">PMID {id}</a>
              </li>
            ))}
          </ul>
        </DetailCard>
      )}

    </div>
  )
}

import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCtaGatePayload, getCompounds } from '@/lib/runtime-data'

export async function generateStaticParams() {
  const payload = await getCompoundDetailPayload()
  const base = await getCompounds()

  if (payload.length > 0) {
    return payload.map((p: any) => ({ slug: p.slug }))
  }

  // fallback if payload missing
  return base.map((c: any) => ({ slug: c.slug }))
}

export default async function Page({ params }: any) {
  const { slug } = params

  const payload = await getCompoundDetailPayload()
  const base = await getCompounds()
  const cta = await getCtaGatePayload()

  let data = payload.find((p: any) => p.slug === slug)

  // fallback to base compound
  if (!data) {
    const compound = base.find((c: any) => c.slug === slug)
    if (!compound) return notFound()

    data = {
      headline: compound.name,
      decision_summary: compound.mechanism,
      evidence_summary: compound.evidence,
      safety_summary: compound.safety,
      dose_summary: compound.dosage,
      time_to_effect: '',
    }
  }

  const gate = cta.find((g: any) => g.slug === slug)

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">{data.headline}</h1>

      <p>{data.decision_summary}</p>
      <p>{data.evidence_summary}</p>
      <p>{data.safety_summary}</p>
      <p>{data.dose_summary}</p>
      {data.time_to_effect && (
        <p><strong>Onset:</strong> {data.time_to_effect}</p>
      )}

      {gate?.show_cta === 'yes' && (
        <div className="p-4 border rounded">
          <p>Recommended product</p>
        </div>
      )}
    </div>
  )
}

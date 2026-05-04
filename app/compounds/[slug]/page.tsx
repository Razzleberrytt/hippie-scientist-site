import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCtaGatePayload } from '@/lib/runtime-data'

export async function generateStaticParams() {
  const payload = await getCompoundDetailPayload()
  return payload.map((p: any) => ({ slug: p.slug }))
}

export default async function Page({ params }: any) {
  const { slug } = params

  const payload = await getCompoundDetailPayload()
  const cta = await getCtaGatePayload()

  const data = payload.find((p: any) => p.slug === slug)
  if (!data) return notFound()

  const gate = cta.find((g: any) => g.slug === slug)

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <h1 className="text-3xl font-bold">{data.headline}</h1>

      <p>{data.decision_summary}</p>
      <p>{data.evidence_summary}</p>
      <p>{data.safety_summary}</p>
      <p>{data.dose_summary}</p>
      <p><strong>Onset:</strong> {data.time_to_effect}</p>

      {gate?.show_cta === 'yes' && (
        <div className="p-4 border rounded">
          <p>Recommended product</p>
        </div>
      )}
    </div>
  )
}

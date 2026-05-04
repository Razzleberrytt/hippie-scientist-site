import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCtaGatePayload, getCompounds, getSeoPagePayload } from '@/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'

const siteUrl = 'https://thehippiescientist.net'

type Params = { params: Promise<{ slug: string }> }

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const isYes = (value: unknown) => ['yes', 'true', '1', 'y'].includes(clean(value).toLowerCase())

const first = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = clean(value)
    if (normalized) return normalized
  }
  return ''
}

async function getCompoundPageData(slug: string) {
  const [payload, base] = await Promise.all([getCompoundDetailPayload(), getCompounds()])
  const detail = payload.find((p: any) => p.slug === slug)
  if (detail) return detail

  const compound = base.find((c: any) => c.slug === slug)
  if (!compound) return null

  return {
    slug: compound.slug,
    headline: compound.name,
    decision_summary: compound.mechanism,
    evidence_summary: compound.evidence,
    safety_summary: compound.safety,
    dose_summary: compound.dosage,
    time_to_effect: '',
  }
}

export async function generateStaticParams() {
  const payload = await getCompoundDetailPayload()
  const base = await getCompounds()

  const source = payload.length > 0 ? payload : base
  return source
    .map((record: any) => clean(record.slug))
    .filter(Boolean)
    .map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [seoRows, data] = await Promise.all([getSeoPagePayload(), getCompoundPageData(slug)])
  const seo = seoRows.find((row: any) => row.slug === slug || row.route === `/compounds/${slug}`)

  const title = clean(seo?.title || seo?.meta_title || data?.seo_title || data?.headline)
  const description = clean(seo?.description || seo?.meta_description || data?.seo_description || data?.decision_summary || data?.evidence_summary)

  return {
    title: title ? `${title} | The Hippie Scientist` : 'Compound Profile | The Hippie Scientist',
    description: description || 'Evidence-aware compound profile with safety, dose, and decision context.',
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const data: any = await getCompoundPageData(slug)
  if (!data) return notFound()

  const cta = await getCtaGatePayload()
  const gate = cta.find((g: any) => g.slug === slug)
  const showCta = isYes(gate?.show_cta)

  const bestFor = first(data.primaryEffect, data.best_for, data.primary_effects?.[0], data.effects?.[0], 'General support')
  const timeToEffect = first(data.time_to_effect, data.timeToEffect, 'Varies')
  const evidence = first(data.evidenceScore ? `${data.evidenceScore}/10` : '', data.evidenceTier, 'Limited')
  const safety = first(data.safety?.confidence, data.safety, 'Review')
  const avoidIf = first(data.avoid_if, data.safety?.cautionSignals?.join(', '))

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="stat"><div>Best For</div><div>{bestFor}</div></div>
        <div className="stat"><div>Works In</div><div>{timeToEffect}</div></div>
        <div className="stat"><div>Evidence</div><div>{evidence}</div></div>
        <div className="stat"><div>Safety</div><div>{safety}</div></div>
      </div>

      <section>
        <h1 className="text-4xl font-black">{clean(data.headline)}</h1>
        <p className="text-slate-600">{clean(data.decision_summary)}</p>
      </section>

      {avoidIf && (
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="text-sm font-medium text-red-400 mb-1">Avoid If</div>
          <p className="text-sm text-slate-600">{avoidIf}</p>
        </section>
      )}

      <div className="flex gap-3">
        <Link href="/compare" className="btn-primary">Compare Alternatives →</Link>
        <Link href="/compounds" className="btn-secondary">View Best Options</Link>
      </div>

      {showCta && <ConversionAffiliateCard name={clean(data.headline)} slug={slug} />}

    </main>
  )
}

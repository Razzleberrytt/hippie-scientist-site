import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCtaGatePayload, getCompounds, getSeoPagePayload } from '@/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'

const siteUrl = 'https://thehippiescientist.net'

type Params = { params: { slug: string } }

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const isYes = (value: unknown) => ['yes', 'true', '1', 'y'].includes(clean(value).toLowerCase())

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
  const slug = params.slug
  const [seoRows, data] = await Promise.all([getSeoPagePayload(), getCompoundPageData(slug)])
  const seo = seoRows.find((row: any) => row.slug === slug || row.route === `/compounds/${slug}`)

  const title = clean(seo?.title || seo?.meta_title || data?.seo_title || data?.headline)
  const description = clean(seo?.description || seo?.meta_description || data?.seo_description || data?.decision_summary || data?.evidence_summary)

  return {
    title: title ? `${title} | The Hippie Scientist` : 'Compound Profile | The Hippie Scientist',
    description: description || 'Evidence-aware compound profile with safety, dose, and decision context.',
    alternates: {
      canonical: `/compounds/${slug}`,
    },
    openGraph: {
      title: title || 'Compound Profile',
      description: description || 'Evidence-aware compound profile with safety, dose, and decision context.',
      url: `${siteUrl}/compounds/${slug}`,
      type: 'article',
    },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = params
  const data = await getCompoundPageData(slug)
  if (!data) return notFound()

  const cta = await getCtaGatePayload()
  const gate = cta.find((g: any) => g.slug === slug)
  const showCta = isYes(gate?.show_cta)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: clean(data.headline),
    description: clean(data.decision_summary || data.evidence_summary || data.safety_summary),
    url: `${siteUrl}/compounds/${slug}`,
    isAccessibleForFree: true,
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: siteUrl,
    },
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/20">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">Compound profile</p>
        <h1 className="mt-3 text-4xl font-black leading-tight sm:text-6xl">{clean(data.headline)}</h1>
        {clean(data.decision_summary) ? <p className="mt-4 text-lg leading-8 text-white/72">{clean(data.decision_summary)}</p> : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {clean(data.evidence_summary) ? (
          <article className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/70">Evidence</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">{clean(data.evidence_summary)}</p>
          </article>
        ) : null}

        {clean(data.safety_summary) ? (
          <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-800/80">Safety</p>
            <p className="mt-2 text-sm leading-6 text-slate-800">{clean(data.safety_summary)}</p>
          </article>
        ) : null}
      </section>

      {(clean(data.dose_summary) || clean(data.time_to_effect)) ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black text-slate-950">Practical context</h2>
          {clean(data.dose_summary) ? <p className="mt-3 text-sm leading-6 text-slate-700"><strong>Dose:</strong> {clean(data.dose_summary)}</p> : null}
          {clean(data.time_to_effect) ? <p className="mt-2 text-sm leading-6 text-slate-700"><strong>Onset:</strong> {clean(data.time_to_effect)}</p> : null}
        </section>
      ) : null}

      {showCta && (
        <ConversionAffiliateCard
          name={clean(data.headline)}
          slug={slug}
        />
      )}
    </main>
  )
}

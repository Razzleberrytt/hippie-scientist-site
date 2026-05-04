import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCompounds, getSeoPagePayload } from '@/lib/runtime-data'
import CompoundDetailPremium from './compound-detail-premium'

type Params = { params: Promise<{ slug: string }> }

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const first = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = clean(value)
    if (normalized) return normalized
  }
  return ''
}

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)
  if (typeof value === 'string') return value.split(/\n|;|\|/).map(item => item.trim()).filter(Boolean)
  return []
}

async function getCompoundPageData(slug: string) {
  const [payload, base] = await Promise.all([getCompoundDetailPayload(), getCompounds()])
  const detail = payload.find((p: any) => p.slug === slug)
  if (detail) return detail
  const compound = base.find((c: any) => c.slug === slug)
  if (!compound) return null
  return { slug: compound.slug, headline: compound.name, decision_summary: compound.mechanism, evidence_summary: compound.evidence, safety_summary: compound.safety, dose_summary: compound.dosage, time_to_effect: '', tags: [] }
}

export async function generateStaticParams() {
  const payload = await getCompoundDetailPayload()
  const base = await getCompounds()
  const source = payload.length > 0 ? payload : base
  return source.map((record: any) => clean(record.slug)).filter(Boolean).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [seoRows, data] = await Promise.all([getSeoPagePayload(), getCompoundPageData(slug)])
  const seo = seoRows.find((row: any) => row.slug === slug || row.route === `/compounds/${slug}`)
  const title = clean(seo?.title || seo?.meta_title || data?.seo_title || data?.headline)
  const description = clean(seo?.description || seo?.meta_description || data?.seo_description || data?.decision_summary || data?.evidence_summary)
  return { title: title ? `${title} | The Hippie Scientist` : 'Compound Profile | The Hippie Scientist', description: description || 'Evidence-aware compound profile with safety, dose, and decision context.' }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const data: any = await getCompoundPageData(slug)
  if (!data) return notFound()

  const bestFor = list(data.primary_effects).slice(0, 3)
  const payload = {
    slug,
    headline: clean(data.headline) || 'Compound profile',
    category: first(data.category, data.type, 'Scientific compound') || 'Scientific compound',
    oneLiner: first(data.decision_summary, data.summary, 'Evidence-oriented profile to evaluate efficacy, speed, and safety.'),
    verdict: first(data.verdict, data.evidence_summary, 'Promising option when matched to the right goal and risk profile.'),
    bestFor: bestFor.length ? bestFor : [first(data.best_for, 'General support'), first(data.goal_fit, 'Decision support'), first(data.primary_domain, 'Daily protocols')],
    tags: list(data.tags).slice(0, 8).length ? list(data.tags).slice(0, 8) : ['evidence-led', 'mechanism-aware', 'risk-screened'],
    stats: [
      { label: 'Best for', value: first(data.primaryEffect, data.best_for, data.primary_effects?.[0], 'General support') },
      { label: 'Works in', value: first(data.time_to_effect, data.timeToEffect, 'Varies') },
      { label: 'Evidence', value: first(data.evidenceScore ? `${data.evidenceScore}/10` : '', data.evidenceTier, 'Limited') },
      { label: 'Safety', value: first(data.safety?.confidence, data.safety, 'Review') },
    ],
    comparisons: [
      { metric: 'Onset speed', thisCompound: first(data.time_to_effect, 'Moderate'), alternative: 'Melatonin / magnesium vary by profile', note: 'Depends on dose and formulation' },
      { metric: 'Evidence confidence', thisCompound: first(data.evidenceTier, 'Developing'), alternative: 'Alternatives may have stronger RCT depth', note: clean(data.evidence_summary) || 'Review source quality before use' },
      { metric: 'Safety profile', thisCompound: first(data.safety_summary, data.safety, 'Review interactions'), alternative: 'Alternatives may be gentler for sensitive users', note: first(data.avoid_if, 'Screen contraindications first') },
    ],
    science: [
      { title: 'Mechanism snapshot', body: first(data.mechanism_summary, data.decision_summary, 'Mechanistic pathway is still evolving and should be interpreted with context.') },
      { title: 'Evidence interpretation', body: first(data.evidence_summary, 'Current evidence includes mixed quality studies and population-specific outcomes.') },
      { title: 'Dosing and timing', body: first(data.dose_summary, data.dosage, 'Use a conservative dose and monitor effects over multiple days.') },
    ],
    safety: first(data.safety_summary, data.safety, 'Requires context-aware screening'),
    ctaHref: '/compare',
  }

  return <CompoundDetailPremium data={payload} />
}

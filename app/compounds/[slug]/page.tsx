import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCompounds, getSeoPagePayload } from '@/lib/runtime-data'
import { PremiumDetailV2 } from '@/components/detail/PremiumDetailV2'

const siteUrl = 'https://thehippiescientist.net'

type Params = { params: Promise<{ slug: string }> }

type AnyRecord = Record<string, any>

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const asList = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)
  return clean(value).split(/\n|;|\|/).map(item => item.trim()).filter(Boolean)
}

const first = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = clean(value)
    if (normalized) return normalized
  }
  return ''
}

const titleCase = (value: string) =>
  clean(value).split(/[-_\s]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

function mergeCompoundData(detail: AnyRecord | undefined, compound: AnyRecord | undefined, slug: string) {
  const merged = { ...(compound ?? {}), ...(detail ?? {}) }
  return {
    raw: merged,
    slug,
    headline: first(merged.headline, merged.title, merged.name, titleCase(slug)),
    summary: first(merged.decision_summary, merged.recommendation, merged.one_liner, merged.summary, merged.description, merged.mechanism),
    evidenceSummary: first(merged.evidence_summary, merged.evidence, merged.evidence_notes),
    contextSummary: first(merged.safety_summary, merged.safety_notes, merged.context, merged.safety),
    useRange: first(merged.dose_summary, merged.dosage, merged.dosage_range),
    timeToEffect: first(merged.time_to_effect, merged.timeToEffect, merged.onset),
    duration: first(merged.duration),
    bestFor: first(merged.best_for, merged.primary_use_case, asList(merged.primary_effects)[0], asList(merged.effects)[0]),
    avoidIf: first(merged.avoid_if, merged.contraindications, merged.caution_signals),
    evidenceScore: first(merged.evidence_score, merged.evidenceScore),
    evidenceTier: first(merged.evidence_tier, merged.evidenceTier, merged.evidence_badge),
    confidence: first(merged.confidence, merged.confidence_label),
    mechanisms: asList(merged.mechanisms || merged.mechanism),
    effects: asList(merged.primary_effects || merged.effects),
    sources: asList(merged.sources || merged.source_urls || merged.pmids || merged.references),
  }
}

async function getCompoundPageData(slug: string) {
  const [payload, base] = await Promise.all([getCompoundDetailPayload(), getCompounds()])
  const detail = payload.find((p: AnyRecord) => p.slug === slug)
  const compound = base.find((c: AnyRecord) => c.slug === slug)
  if (!detail && !compound) return null
  return mergeCompoundData(detail, compound, slug)
}

export async function generateStaticParams() {
  const base = await getCompounds()
  return base.map((record: AnyRecord) => clean(record.slug)).filter(Boolean).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [seoRows, data] = await Promise.all([getSeoPagePayload(), getCompoundPageData(slug)])
  const seo = seoRows.find((row: AnyRecord) => row.slug === slug || row.route === `/compounds/${slug}` || row.route === `compounds/${slug}`)
  const title = clean(seo?.title || seo?.meta_title || data?.headline)
  const description = clean(seo?.description || seo?.meta_description || data?.summary || data?.evidenceSummary)

  return {
    title: title ? `${title} | The Hippie Scientist` : 'Compound Profile | The Hippie Scientist',
    description: description || 'Compound profile with research notes and practical context.',
    alternates: { canonical: `/compounds/${slug}` },
    openGraph: { title: title || 'Compound Profile', description: description || 'Compound profile.', url: `${siteUrl}/compounds/${slug}`, type: 'article' },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const data = await getCompoundPageData(slug)
  if (!data) return notFound()

  return (
    <PremiumDetailV2
      title={data.headline}
      category='Compound profile'
      oneLiner={data.summary || 'Evidence-informed compound profile.'}
      verdict={data.contextSummary || 'Review profile context before use.'}
      stats={[
        { label: 'Best for', value: data.bestFor || 'General support' },
        { label: 'Onset', value: data.timeToEffect || 'Varies' },
        { label: 'Evidence', value: data.evidenceScore || data.evidenceTier || 'Moderate' },
        { label: 'Confidence', value: data.confidence || 'Context-dependent' },
      ]}
      bestFor={(data.effects.length ? data.effects : ['Sleep quality', 'Stress response', 'Cognitive support']).slice(0, 3)}
      tags={[data.evidenceTier, data.avoidIf, data.useRange].filter(Boolean)}
      comparisons={[
        { factor: 'Primary use', value: data.bestFor || 'General supportive role' },
        { factor: 'Risk context', value: data.avoidIf || 'Case-dependent' },
        { factor: 'Duration', value: data.duration || 'Varies by dose and protocol' },
      ]}
      science={[
        { title: 'Evidence summary', body: data.evidenceSummary || 'Evidence is mixed; quality and replication vary by indication.' },
        { title: 'Mechanisms', body: data.mechanisms.join(' • ') || 'Multiple biological pathways are proposed in preclinical and translational models.' },
        { title: 'Safety notes', body: data.contextSummary || 'Assess medication interactions and personal sensitivity before use.' },
      ]}
      sidebarCta={<a href='/compounds' className='block rounded-xl border border-white/15 px-3 py-2 text-center text-sm'>Browse all compounds</a>}
    />
  )
}

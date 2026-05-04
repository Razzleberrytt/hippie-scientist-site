import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds, getCompoundCardPayload } from '@/lib/runtime-data'
import { compoundDetailRoute } from '@/lib/public-routes'

export const metadata: Metadata = {
  title: 'Compounds',
  description: 'Browse compound profiles and decision-ready summaries.',
}

const asList = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean)
  return String(value)
    .split(/\n|;|\|/)
    .map(item => item.trim())
    .filter(Boolean)
}

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

export default async function CompoundsPage() {
  const compounds = await getCompounds()
  const payload = await getCompoundCardPayload()

  const payloadMap = new Map(payload.map((p: any) => [p.slug, p]))

  const items = compounds.map((compound: any) => {
    const p: any = payloadMap.get(compound.slug)
    const primaryEffects = asList(p?.primary_effects || compound.primary_effects || compound.effects)
    const bestFor = first(
      p?.best_for,
      p?.primary_use_case,
      compound.best_for,
      compound.primaryEffect,
      primaryEffects[0],
      compound.effects?.[0]
    )
    const evidenceTier = first(p?.evidenceTier, p?.evidence_tier, p?.evidence_badge, compound.evidenceTier, compound.evidence_grade)
    const evidenceScore = Number(p?.evidenceScore || p?.evidence_score || compound.evidenceScore || compound.evidence_score || 0)
    const safety = first(p?.safety_confidence, p?.safety?.confidence, compound.safety?.confidence, compound.safety, 'Review')

    return {
      slug: compound.slug,
      title: first(p?.headline, compound.name, compound.slug),
      summary: first(p?.recommendation, p?.one_liner, compound.summary, compound.description),
      href: compoundDetailRoute(compound.slug),
      typeLabel: evidenceTier || 'Compound',
      domain: first(p?.primary_use_case, primaryEffects.slice(0, 2).join(', ')),
      isATier: clean(p?.confidence_label).toLowerCase() === 'high',
      bestFor: bestFor || 'General support',
      evidence: evidenceScore ? `${evidenceScore}/10` : evidenceTier || 'Limited',
      safety,
      timeToEffect: first(p?.time_to_effect, p?.timeToEffect, compound.time_to_effect, compound.timeToEffect),
      profile_status: clean(p?.profile_status || compound.profile_status),
      summary_quality: clean(p?.summary_quality || compound.summary_quality),
      evidenceScore,
      evidenceTier,
      primary_effects: primaryEffects,
      effects: asList(compound.effects),
      tags: asList(p?.tags || compound.tags || bestFor),
    }
  })

  return (
    <LibraryBrowser
      title='Compounds'
      description='Decision-ready compounds prioritized by evidence and use-case.'
      items={items}
    />
  )
}

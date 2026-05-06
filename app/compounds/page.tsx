import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds } from '@/lib/runtime-data'

const clean = (value: unknown) => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const asList = (value: unknown): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map(v => clean(v)).filter(Boolean)

  return clean(value)
    .split(/\n|;|\|/)
    .map(v => v.trim())
    .filter(Boolean)
}

export const metadata: Metadata = {
  title: 'Compounds',
  description: 'Browse compounds with evidence tiers, safety context, and practical decision support.',
}

export default async function CompoundsPage() {
  const compounds = await getCompounds()

  const items = compounds.map((c: any) => ({
    slug: c.slug,
    title: clean(c.name || c.slug),
    summary: clean(c.summary || c.description || c.coreInsight),
    href: `/compounds/${c.slug}`,
    typeLabel: 'Compound',
    bestFor: clean(c.best_for || c.primaryDomain || c.effects?.[0]),
    evidence: clean(c.evidence_tier || c.evidenceTier || 'Limited'),
    evidenceTier: clean(c.evidence_tier || c.evidenceTier || 'Limited'),
    safety: clean(c.safety_summary || c.safety || c.safetyNotes || 'Review safety context before use.'),
    primary_effects: asList(c.primary_effects || c.effects),
    tags: asList(c.effects || c.primary_effects),
  }))

  return (
    <LibraryBrowser
      eyebrow='Evidence-aware compound library'
      title='Compounds'
      description='Explore compounds through evidence tiers, mechanisms, practical use context, and structured safety framing.'
      items={items}
    />
  )
}

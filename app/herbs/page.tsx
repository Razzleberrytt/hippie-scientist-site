import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'

export const metadata: Metadata = {
  title: 'Herbs',
  description: 'Browse herbs with clear effects, mechanisms, evidence tiers, and safety context.',
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

export default async function HerbsPage() {
  const herbs = await getHerbs()

  const items = herbs.map((herb: any) => {
    const effects = asList(herb.primary_effects)

    return {
      slug: herb.slug,
      title: first(herb.displayName, herb.name, herb.slug),
      summary: first(herb.summary, herb.description, herb.coreInsight),
      href: `/herbs/${herb.slug}`,
      typeLabel: 'Herb',
      bestFor: first(herb.best_for, herb.primaryDomain, effects[0]),
      evidence: first(herb.evidence_grade, herb.evidenceLevel) || 'Limited',
      evidenceTier: first(herb.evidence_grade, herb.evidenceLevel) || 'Limited',
      safety: first(herb.safety_summary, herb.safetyNotes, herb.contraindications) || 'Review interactions and contraindications before use.',
      profile_status: clean(herb.profile_status),
      summary_quality: clean(herb.summary_quality),
      primary_effects: effects,
      effects,
      tags: effects,
    }
  })

  return (
    <LibraryBrowser
      eyebrow='Evidence-aware herb library'
      title='Herbs'
      description='Browse structured herb profiles with transparent evidence tiers, practical context, and visible safety framing.'
      items={items}
    />
  )
}

import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'

export const metadata: Metadata = {
  title: 'Herbs',
  description: 'Browse herbs with clear effects, mechanisms, and safety context.',
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
    const bestFor = first(herb.best_for, effects[0])

    return {
      slug: herb.slug,
      title: first(herb.displayName, herb.name, herb.slug),
      summary: first(herb.summary, herb.description),
      href: `/herbs/${herb.slug}`,
      typeLabel: 'Herb',
      domain: effects.slice(0, 2).join(', '),
      bestFor: bestFor || 'General support',
      evidence: first(herb.evidence_grade, herb.evidenceLevel) || 'Limited',
      safety: first(herb.safetyNotes, herb.contraindications) || 'Review',
      timeToEffect: first(herb.time_to_effect),
      profile_status: clean(herb.profile_status),
      summary_quality: clean(herb.summary_quality),
      evidenceTier: clean(herb.evidence_grade),
      primary_effects: effects,
      effects,
      tags: effects,
    }
  })

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Herbs'
      description='Clear, evidence-aware herb profiles without clutter.'
      items={items}
    />
  )
}

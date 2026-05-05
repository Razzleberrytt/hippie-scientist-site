import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds } from '@/lib/runtime-data'

export const metadata: Metadata = {
  title: 'Compounds',
  description: 'Browse compounds with evidence, roles, and decision context.',
}

export default async function CompoundsPage() {
  const compounds = await getCompounds()

  const items = compounds.map((c: any) => ({
    slug: c.slug,
    title: c.name || c.slug,
    summary: c.summary || c.description,
    href: `/compounds/${c.slug}`,
    typeLabel: 'Compound',
    bestFor: c.best_for,
    evidence: c.evidence_tier || c.evidenceTier,
    evidenceTier: c.evidence_tier || c.evidenceTier,
    role: c.role,
    primary_effects: c.primary_effects || c.effects,
    tags: c.effects,
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Compounds'
      description='Evidence-aware compound browsing with fast filtering.'
      items={items}
    />
  )
}

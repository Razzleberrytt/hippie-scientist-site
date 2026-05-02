import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'

export const metadata: Metadata = {
  title: 'Herbs',
  description: 'Browse herbs with clear effects, mechanisms, and safety context.',
}

export default async function HerbsPage() {
  const herbs = await getHerbs()

  const items = herbs.map((herb: any) => ({
    slug: herb.slug,
    title: herb.displayName || herb.name || herb.slug,
    summary: herb.summary || herb.description || '',
    href: `/herbs/${herb.slug}`,
    typeLabel: 'Herb',
    domain: (herb.primary_effects || []).slice(0, 2).join(', '),
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Herbs'
      description='Clear, evidence-aware herb profiles without clutter.'
      items={items}
    />
  )
}

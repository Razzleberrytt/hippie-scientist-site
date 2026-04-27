import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds } from '@/lib/runtime-data'

type CompoundListItem = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
}

type BrowserItem = {
  slug: string
  title: string
  summary: string
  href: string
  typeLabel: string
}

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getCompoundTitle = (compound: CompoundListItem): string =>
  compound.displayName?.trim() ||
  compound.name?.trim() ||
  formatSlugLabel(compound.slug)

const getCompoundSummary = (compound: CompoundListItem): string =>
  compound.summary?.trim() ||
  compound.description?.trim() ||
  'Profile coming soon.'

export const metadata: Metadata = {
  title: 'Compounds',
  description: 'Browse compound profiles and plain-English summaries.',
}

export default async function CompoundsPage() {
  const compounds = (await getCompounds()) as CompoundListItem[]

  const items: BrowserItem[] = compounds.map(compound => ({
    slug: compound.slug,
    title: getCompoundTitle(compound),
    summary: getCompoundSummary(compound),
    href: `/compounds/${compound.slug}`,
    typeLabel: 'Compound profile',
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Compounds'
      description='Browse active constituents, simple explanations, quick research notes, and letter-based navigation.'
      searchPlaceholder='Search compounds by name, slug, or summary'
      emptyLabel='Try a different compound name, letter, or clear your filters.'
      items={items}
    />
  )
}

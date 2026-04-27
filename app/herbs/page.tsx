import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'

type HerbListItem = {
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

const getHerbTitle = (herb: HerbListItem): string =>
  herb.displayName?.trim() ||
  herb.name?.trim() ||
  formatSlugLabel(herb.slug)

const getHerbSummary = (herb: HerbListItem): string =>
  herb.summary?.trim() ||
  herb.description?.trim() ||
  'Profile coming soon.'

export const metadata: Metadata = {
  title: 'Herbs',
  description: 'Browse herb profiles and plain-English summaries.',
}

export default async function HerbsPage() {
  const herbs = (await getHerbs()) as HerbListItem[]

  const items: BrowserItem[] = herbs.map(herb => ({
    slug: herb.slug,
    title: getHerbTitle(herb),
    summary: getHerbSummary(herb),
    href: `/herbs/${herb.slug}`,
    typeLabel: 'Herb profile',
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Herbs'
      description='Browse plant profiles with short summaries, quick reference notes, and simple letter-based navigation.'
      searchPlaceholder='Search herbs by name, slug, or summary'
      emptyLabel='Try a different herb name, letter, or clear your filters.'
      items={items}
    />
  )
}

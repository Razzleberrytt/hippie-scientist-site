import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { herbDetailRoute } from '@/lib/public-routes'

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
  domain?: string
  isATier?: boolean
}
type ATierItem = { slug: string }

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
  herb.summary?.trim() || herb.description?.trim() || ''

const readATierSlugs = async (): Promise<Set<string>> => {
  const filePath = path.join(process.cwd(), 'public/data/a-tier-index.json')
  try {
    const parsed = JSON.parse(await fs.readFile(filePath, 'utf8')) as ATierItem[]
    return new Set((Array.isArray(parsed) ? parsed : []).map(item => item.slug))
  } catch {
    return new Set()
  }
}

export const metadata: Metadata = {
  title: 'Herbs',
  description: 'Browse herb profiles and plain-English summaries.',
}

export default async function HerbsPage() {
  const herbs = (await getHerbs()) as HerbListItem[]
  const aTierSlugs = await readATierSlugs()

  const items: BrowserItem[] = herbs.map(herb => ({
    slug: herb.slug,
    title: getHerbTitle(herb),
    summary: getHerbSummary(herb),
    href: herbDetailRoute(herb.slug),
    typeLabel: 'Herb',
    isATier: aTierSlugs.has(herb.slug),
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Herbs'
      description='Browse herbs with clean summaries and evidence-aware profiles.'
      searchPlaceholder='Search herbs'
      emptyLabel='Try a different herb or clear filters.'
      items={items}
    />
  )
}

import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds } from '@/lib/runtime-data'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { compoundDetailRoute } from '@/lib/public-routes'

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

const getCompoundTitle = (compound: CompoundListItem): string =>
  compound.displayName?.trim() ||
  compound.name?.trim() ||
  formatSlugLabel(compound.slug)

const getCompoundSummary = (compound: CompoundListItem): string =>
  compound.summary?.trim() || compound.description?.trim() || ''

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
  title: 'Compounds',
  description: 'Browse compound profiles and plain-English summaries.',
}

export default async function CompoundsPage() {
  const compounds = (await getCompounds()) as CompoundListItem[]
  const aTierSlugs = await readATierSlugs()

  const items: BrowserItem[] = compounds.map(compound => ({
    slug: compound.slug,
    title: getCompoundTitle(compound),
    summary: getCompoundSummary(compound),
    href: compoundDetailRoute(compound.slug),
    typeLabel: 'Compound',
    isATier: aTierSlugs.has(compound.slug),
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Compounds'
      description='Browse compounds, evidence-backed summaries, and research-ready profiles.'
      searchPlaceholder='Search compounds'
      emptyLabel='Try a different compound or clear filters.'
      items={items}
    />
  )
}

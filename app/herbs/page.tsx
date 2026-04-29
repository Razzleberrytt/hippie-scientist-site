import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getHerbs } from '@/lib/runtime-data'
import { promises as fs } from 'node:fs'
import path from 'node:path'

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
const DOMAIN_RULES: Array<{ domain: string; keywords: string[] }> = [
  { domain: 'cognition', keywords: ['memory', 'focus', 'cognitive', 'neuro', 'brain'] },
  { domain: 'sleep', keywords: ['sleep', 'insomnia', 'sedative', 'calm', 'rest'] },
  { domain: 'metabolic', keywords: ['glucose', 'insulin', 'metabolic', 'lipid', 'weight'] },
  { domain: 'inflammation', keywords: ['inflamm', 'cytokine', 'pain', 'immune'] },
  { domain: 'performance', keywords: ['exercise', 'endurance', 'strength', 'performance', 'recovery'] },
]

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

const inferDomain = (herb: HerbListItem & { mechanisms?: string[] }): string | undefined => {
  const text = [herb.summary, herb.description, ...(herb.mechanisms || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return DOMAIN_RULES.find(rule => rule.keywords.some(keyword => text.includes(keyword)))?.domain
}

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
    href: `/herbs/${herb.slug}`,
    typeLabel: 'Herb profile',
    domain: inferDomain(herb),
    isATier: aTierSlugs.has(herb.slug),
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

import type { Metadata } from 'next'
import LibraryBrowser from '@/components/library-browser'
import { getCompounds } from '@/lib/runtime-data'
import { promises as fs } from 'node:fs'
import path from 'node:path'

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

const getCompoundTitle = (compound: CompoundListItem): string =>
  compound.displayName?.trim() ||
  compound.name?.trim() ||
  formatSlugLabel(compound.slug)

const getCompoundSummary = (compound: CompoundListItem): string =>
  compound.summary?.trim() ||
  compound.description?.trim() ||
  'Profile coming soon.'

const inferDomain = (compound: CompoundListItem & { mechanisms?: string[] }): string | undefined => {
  const text = [compound.summary, compound.description, ...(compound.mechanisms || [])]
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
    href: `/compounds/${compound.slug}`,
    typeLabel: 'Compound profile',
    domain: inferDomain(compound),
    isATier: aTierSlugs.has(compound.slug),
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

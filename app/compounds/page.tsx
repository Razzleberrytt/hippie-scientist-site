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
  evidence_summary?: string | null
  mechanism_summary?: string | null
  safety_summary?: string | null
  safety_notes?: string | null
  evidence_grade?: string | null
  evidenceTier?: string | number | null
  tier_level?: string | number | null
  summary_quality?: string | null
  primary_effects?: string[] | string | null
  best_for?: string | null
  time_to_effect?: string | null
  duration?: string | null
  avoid_if?: string | null
  dosage_range?: string | null
  oral_form?: string | null
  fact_score_v2?: number | string | null
  net_score?: number | string | null
}

type BrowserItem = {
  slug: string
  title: string
  summary: string
  href: string
  typeLabel: string
  domain?: string
  isATier?: boolean
  meta?: string[]
}

type ATierItem = { slug: string }

const PLACEHOLDER_PATTERNS = [
  /profile summary coming soon/i,
  /coming soon/i,
  /lean monograph row/i,
  /bulk mode/i,
  /placeholder/i,
  /^n\/?a$/i,
  /^unknown$/i,
  /^tbd$/i,
]

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const usable = (value: unknown): string => {
  const text = clean(value)
  if (!text) return ''
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text)) ? '' : text
}

const list = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(usable).filter(Boolean)
  const text = usable(value)
  if (!text) return []
  return text.split(/[,;|]/).map(part => part.trim()).filter(Boolean)
}

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getCompoundTitle = (compound: CompoundListItem): string =>
  usable(compound.displayName) ||
  usable(compound.name) ||
  formatSlugLabel(compound.slug)

const getEvidence = (compound: CompoundListItem): string =>
  usable(compound.evidence_grade) || usable(compound.evidenceTier) || usable(compound.tier_level) || usable(compound.summary_quality)

const getScore = (compound: CompoundListItem): string =>
  usable(compound.fact_score_v2) || usable(compound.net_score)

const getCompoundSummary = (compound: CompoundListItem): string =>
  usable(compound.summary) ||
  usable(compound.description) ||
  usable(compound.evidence_summary) ||
  usable(compound.mechanism_summary) ||
  usable(compound.safety_summary) ||
  usable(compound.safety_notes) ||
  ''

const getDomain = (compound: CompoundListItem): string =>
  list(compound.primary_effects).slice(0, 2).join(', ')

const getMeta = (compound: CompoundListItem): string[] => {
  const meta = [
    getEvidence(compound) ? `Evidence: ${getEvidence(compound)}` : '',
    usable(compound.best_for) ? `Best for: ${usable(compound.best_for)}` : '',
    usable(compound.time_to_effect) ? `Onset: ${usable(compound.time_to_effect)}` : '',
    usable(compound.duration) ? `Duration: ${usable(compound.duration)}` : '',
    usable(compound.dosage_range) ? `Dose: ${usable(compound.dosage_range)}` : '',
    getScore(compound) ? `Score: ${getScore(compound)}` : '',
  ]
  return meta.filter(Boolean).slice(0, 4)
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
    href: compoundDetailRoute(compound.slug),
    typeLabel: 'Compound',
    domain: getDomain(compound),
    isATier: aTierSlugs.has(compound.slug),
    meta: getMeta(compound),
  }))

  return (
    <LibraryBrowser
      eyebrow='Library'
      title='Compounds'
      description='Browse compounds by effect, evidence, timing, safety, and practical use.'
      searchPlaceholder='Search compounds, effects, timing, evidence, or use case'
      emptyLabel='Try a different compound or clear filters.'
      items={items}
    />
  )
}

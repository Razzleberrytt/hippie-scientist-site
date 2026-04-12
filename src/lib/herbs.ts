import type { Herb } from '../types'
import type { HerbRecord } from '@/types/herb'
import { loadPublicJsonArray } from '@/lib/data'

const CLASS_MAP: Record<string, string> = {
  phenethylamine: 'Phenethylamine',
  tryptamine: 'Tryptamine',
  tropane: 'Tropane',
  benzodiazepine: 'Benzodiazepine',
  alkaloid: 'Alkaloid',
  terpenoid: 'Terpenoid',
  saponin: 'Saponin',
}

const PHARM_MAP = [
  'anxiolytic',
  'stimulant',
  'sedative',
  'antidepressant',
  'adaptogen',
  'nootropic',
  'analgesic',
  'psychedelic',
  'dissociative',
  'empathogen',
] as const

type ListLike = string | string[] | null | undefined

function normalizeSlug(slug: unknown): string {
  return typeof slug === 'string' ? slug.trim().toLowerCase() : ''
}

function isNonEmptyValue(value: unknown): boolean {
  if (value == null) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

function mergeHerbRecord(legacy: HerbRecord, workbook: HerbRecord): HerbRecord {
  const merged: HerbRecord = { ...legacy }
  for (const [key, value] of Object.entries(workbook)) {
    if (isNonEmptyValue(value)) {
      merged[key] = value
    }
  }
  return merged
}

async function loadWorkbookHerbData(): Promise<HerbRecord[]> {
  if (typeof window === 'undefined') return []
  return loadPublicJsonArray<HerbRecord>('/data/workbook-herbs.json')
}

async function loadLegacyHerbData(): Promise<HerbRecord[]> {
  const legacyModule = await import('@/data/herbs_enriched.json')
  const payload = (legacyModule.default ?? legacyModule) as unknown
  return Array.isArray(payload) ? (payload as HerbRecord[]) : []
}

const workbookHerbsPromise = loadWorkbookHerbData().catch(() => [])
const allHerbsPromise = Promise.all([workbookHerbsPromise, loadLegacyHerbData()]).then(
  ([workbook, legacy]) => {
    const legacyBySlug = new Map<string, HerbRecord>()
    legacy.forEach(herb => {
      const slug = normalizeSlug(herb.slug)
      if (!slug) return
      legacyBySlug.set(slug, herb)
    })

    const mergedBySlug = new Map<string, HerbRecord>(legacyBySlug)

    workbook.forEach(workbookHerb => {
      const slug = normalizeSlug(workbookHerb.slug)
      if (!slug) return

      const legacyHerb = legacyBySlug.get(slug)
      mergedBySlug.set(slug, legacyHerb ? mergeHerbRecord(legacyHerb, workbookHerb) : workbookHerb)
    })

    return Array.from(mergedBySlug.values())
  },
)

export const workbookHerbs: Promise<HerbRecord[]> = workbookHerbsPromise
export const allHerbs: Promise<HerbRecord[]> = allHerbsPromise

export async function getHerbBySlug(slug: string): Promise<HerbRecord | undefined> {
  const slugKey = normalizeSlug(slug)
  if (!slugKey) return undefined
  const herbs = await allHerbsPromise
  return herbs.find(herb => normalizeSlug(herb.slug) === slugKey)
}

function normList(value?: ListLike): string[] {
  const source = Array.isArray(value) ? value.join(',') : (value ?? '')
  return source
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9,; /+-]/g, ' ')
    .split(/[;,]/)
    .map(entry => entry.trim())
    .filter(Boolean)
}

export function deriveCompoundClasses(herb: Herb): string[] {
  const haystack = [
    ...normList(herb.active_compounds ?? herb.compounds),
    ...normList(herb.tags),
    herb.description?.toLowerCase() ?? '',
  ].join(' ')

  const matches = new Set<string>()
  Object.entries(CLASS_MAP).forEach(([needle, label]) => {
    if (needle && haystack.includes(needle)) {
      matches.add(label)
    }
  })

  return Array.from(matches)
}

export function derivePharmCategories(herb: Herb): string[] {
  const haystack = [
    (Array.isArray(herb.effects) ? herb.effects.join(' ') : (herb.effects ?? '')).toLowerCase(),
    ...(herb.tags ?? []).map(tag => tag.toLowerCase()),
    herb.description?.toLowerCase() ?? '',
  ].join(' ')

  const matches = new Set<string>()
  PHARM_MAP.forEach(needle => {
    if (haystack.includes(needle)) {
      matches.add(needle.charAt(0).toUpperCase() + needle.slice(1))
    }
  })

  return Array.from(matches)
}

export function decorateHerbs<T extends Herb>(herbs: T[]): T[] {
  return herbs.map(herb => ({
    ...herb,
    compoundClasses:
      Array.isArray(herb.compoundClasses) && herb.compoundClasses.length > 0
        ? herb.compoundClasses
        : deriveCompoundClasses(herb),
    pharmCategories:
      Array.isArray(herb.pharmCategories) && herb.pharmCategories.length > 0
        ? herb.pharmCategories
        : derivePharmCategories(herb),
  }))
}

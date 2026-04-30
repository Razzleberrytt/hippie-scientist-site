import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

type RuntimeHerb = {
  slug: string
  displayName?: string
  name?: string
  summary?: string
  description?: string
  evidence_grade?: string
  net_score?: string | number
  primary_effects?: string[] | string
  mechanism_summary?: string
  dosage_range?: string
  oral_form?: string
  mechanisms?: string[]
  safetyNotes?: string
  contraindications_interactions?: string[] | string
}


type RuntimeHerbCompoundMapEntry = {
  herb_slug?: string
  herbSlug: string
  herbName?: string
  compound_slug?: string
  canonicalCompoundId: string
  canonicalCompoundName?: string
}

type RuntimeClaim = {
  target_slug?: string
  targetSlug?: string
  claim?: string
  text?: string
  title?: string
  evidence?: string
}

type RuntimeCompound = {
  slug: string
  displayName?: string
  name?: string
  summary?: string
  description?: string
  mechanisms?: string[]
  compoundClass?: string
  safetyNotes?: string
}

const dataDir = path.join(process.cwd(), 'public', 'data')

async function readJsonFile<T>(fileName: string): Promise<T> {
  const filePath = path.join(dataDir, fileName)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

export const getHerbs = cache(async (): Promise<RuntimeHerb[]> => {
  const herbs = await readJsonFile<RuntimeHerb[]>('herbs.json')
  return Array.isArray(herbs) ? herbs : []
})

export const getCompounds = cache(async (): Promise<RuntimeCompound[]> => {
  const compounds = await readJsonFile<RuntimeCompound[]>('compounds.json')
  return Array.isArray(compounds) ? compounds : []
})


export const getHerbCompoundMap = cache(async (): Promise<RuntimeHerbCompoundMapEntry[]> => {
  try {
    const rows = await readJsonFile<RuntimeHerbCompoundMapEntry[]>('herb-compound-map.json')
    return Array.isArray(rows) ? rows : []
  } catch {
    try {
      const rows = await readJsonFile<RuntimeHerbCompoundMapEntry[]>('workbook-herb-compound-map.json')
      return Array.isArray(rows) ? rows : []
    } catch {
      return []
    }
  }
})

export const getClaims = cache(async (): Promise<RuntimeClaim[]> => {
  try {
    const rows = await readJsonFile<RuntimeClaim[]>('claims.json')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
})

export async function getHerbBySlug(slug: string) {
  const herbs = await getHerbs()
  return herbs.find(herb => herb.slug === slug)
}

export async function getCompoundBySlug(slug: string) {
  const compounds = await getCompounds()
  return compounds.find(compound => compound.slug === slug)
}

export type { RuntimeClaim, RuntimeHerb, RuntimeCompound, RuntimeHerbCompoundMapEntry }

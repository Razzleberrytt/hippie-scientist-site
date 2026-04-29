import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

type RuntimeHerb = {
  slug: string
  displayName?: string
  name?: string
  summary?: string
  description?: string
  mechanisms?: string[]
  safetyNotes?: string
}


type RuntimeHerbCompoundMapEntry = {
  herbSlug: string
  herbName?: string
  canonicalCompoundId: string
  canonicalCompoundName?: string
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
    const rows = await readJsonFile<RuntimeHerbCompoundMapEntry[]>('workbook-herb-compound-map.json')
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

export type { RuntimeHerb, RuntimeCompound, RuntimeHerbCompoundMapEntry }

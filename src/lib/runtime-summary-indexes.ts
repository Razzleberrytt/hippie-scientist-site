import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

const summaryDir = path.join(process.cwd(), 'public', 'data', 'summary-indexes')

type SummaryRecord = Record<string, any>
type AlphabeticalShards = Record<string, SummaryRecord[]>

async function readJsonFile<T>(fileName: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(path.join(summaryDir, fileName), 'utf8')
    const parsed = JSON.parse(raw)
    return parsed ?? fallback
  } catch {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[summary-indexes] could not read: ${fileName}`)
    }
    return fallback
  }
}

export const getHerbSummaryIndex = cache(async (): Promise<SummaryRecord[]> => {
  const rows = await readJsonFile<unknown>('herbs-summary.json', [])
  return Array.isArray(rows) ? rows : []
})

export const getCompoundSummaryIndex = cache(async (): Promise<SummaryRecord[]> => {
  const rows = await readJsonFile<unknown>('compounds-summary.json', [])
  return Array.isArray(rows) ? rows : []
})

export const getSearchSummaryIndex = cache(async (): Promise<SummaryRecord[]> => {
  const rows = await readJsonFile<unknown>('search-index.json', [])
  return Array.isArray(rows) ? rows : []
})

export const getAlphabeticalSummaryShards = cache(async (): Promise<AlphabeticalShards> => {
  const shards = await readJsonFile<unknown>('alphabetical-shards.json', {})
  return shards && typeof shards === 'object' && !Array.isArray(shards)
    ? shards as AlphabeticalShards
    : {}
})

export async function getSummaryShard(letter: string): Promise<SummaryRecord[]> {
  const normalized = String(letter || '#').charAt(0).toLowerCase()
  const shards = await getAlphabeticalSummaryShards()
  const rows = shards[normalized]
  return Array.isArray(rows) ? rows : []
}

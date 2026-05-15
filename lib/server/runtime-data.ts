import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'

type RuntimeRecord = Record<string, any>

const dataRoot = path.join(process.cwd(), 'public', 'data')

let herbsCache: RuntimeRecord[] | null = null
let compoundsCache: RuntimeRecord[] | null = null

async function readRuntimeJson<T>(fileName: string): Promise<T> {
  const filePath = path.join(dataRoot, fileName)
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

export async function getAllHerbs(): Promise<RuntimeRecord[]> {
  if (!herbsCache) {
    herbsCache = await readRuntimeJson<RuntimeRecord[]>('herbs.json')
  }

  return herbsCache
}

export async function getAllCompounds(): Promise<RuntimeRecord[]> {
  if (!compoundsCache) {
    compoundsCache = await readRuntimeJson<RuntimeRecord[]>('compounds.json')
  }

  return compoundsCache
}

export async function getHerbBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const herbs = await getAllHerbs()
  return herbs.find((herb) => String(herb?.slug || '') === slug)
}

export async function getCompoundBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const compounds = await getAllCompounds()
  return compounds.find((compound) => String(compound?.slug || '') === slug)
}

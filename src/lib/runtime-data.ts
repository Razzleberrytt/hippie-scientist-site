import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

const dataDir = path.join(process.cwd(), 'public', 'data')

type RuntimeRecord = Record<string, any>

async function readJsonFile(fileName: string): Promise<unknown> {
  const filePath = path.join(dataDir, fileName)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

export const getHerbs = cache(async (): Promise<RuntimeRecord[]> => {
  const herbs = await readJsonFile('herbs.json')
  return Array.isArray(herbs) ? herbs : []
})

export const getCompounds = cache(async (): Promise<RuntimeRecord[]> => {
  const compounds = await readJsonFile('compounds.json')
  return Array.isArray(compounds) ? compounds : []
})

export const getHerbCompoundMap = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('herb-compound-map.json')
  return Array.isArray(rows) ? rows : []
})

export const getStacks = cache(async (): Promise<RuntimeRecord[]> => {
  const stacks = await readJsonFile('stacks.json')
  return Array.isArray(stacks) ? stacks : []
})

export const getClaims = cache(async (): Promise<RuntimeRecord[]> => {
  const claims = await readJsonFile('claims.json')
  return Array.isArray(claims) ? claims : []
})

export const getCompoundCardPayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('compound-card-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getCompoundDetailPayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('compound-detail-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getSeoPagePayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('seo-page-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getCtaGatePayload = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('cta-gate-payload.json')
  return Array.isArray(rows) ? rows : []
})

export const getRouteBuildManifest = cache(async (): Promise<RuntimeRecord[]> => {
  const rows = await readJsonFile('route-build-manifest.json')
  return Array.isArray(rows) ? rows : []
})

export async function getHerbBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const herbs = await getHerbs()
  return herbs.find(herb => herb.slug === slug)
}

export async function getCompoundBySlug(slug: string): Promise<RuntimeRecord | undefined> {
  const compounds = await getCompounds()
  return compounds.find(compound => compound.slug === slug)
}

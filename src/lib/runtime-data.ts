import { promises as fs } from 'node:fs'
import path from 'node:path'
import { cache } from 'react'

const dataDir = path.join(process.cwd(), 'public', 'data')

async function readJsonFile(fileName) {
  const filePath = path.join(dataDir, fileName)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export const getHerbs = cache(async () => {
  const herbs = await readJsonFile('herbs.json')
  return Array.isArray(herbs) ? herbs : []
})

export const getCompounds = cache(async () => {
  const compounds = await readJsonFile('compounds.json')
  return Array.isArray(compounds) ? compounds : []
})

export const getHerbCompoundMap = cache(async () => {
  const rows = await readJsonFile('herb-compound-map.json')
  return Array.isArray(rows) ? rows : []
})

export const getStacks = cache(async () => {
  const stacks = await readJsonFile('stacks.json')
  return Array.isArray(stacks) ? stacks : []
})

export const getClaims = cache(async () => {
  try {
    const rows = await readJsonFile('claims.json')
    return Array.isArray(rows) ? rows : []
  } catch {
    return []
  }
})

export async function getHerbBySlug(slug) {
  const herbs = await getHerbs()
  return herbs.find(herb => herb.slug === slug)
}

export async function getCompoundBySlug(slug) {
  const compounds = await getCompounds()
  return compounds.find(compound => compound.slug === slug)
}

export async function getStackBySlug(slug) {
  const stacks = await getStacks()
  return stacks.find(stack => stack.slug === slug)
}

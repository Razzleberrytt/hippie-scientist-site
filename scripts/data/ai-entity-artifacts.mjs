import fs from 'node:fs/promises'
import path from 'node:path'
import { buildAiEntityArtifacts as buildBaseAiEntityArtifacts } from './ai-entity-enrichment-lib.mjs'

function normalizeSchemaTypes(value) {
  if (Array.isArray(value)) return value.map(normalizeSchemaTypes)
  if (!value || typeof value !== 'object') return value

  const normalized = {}
  for (const [key, entry] of Object.entries(value)) {
    if (key === '@type') {
      if (entry === 'MedicalSubstance') {
        normalized[key] = 'Substance'
        continue
      }
      if (Array.isArray(entry)) {
        normalized[key] = entry.map((type) => type === 'MedicalSubstance' ? 'Substance' : type)
        continue
      }
    }
    normalized[key] = normalizeSchemaTypes(entry)
  }
  return normalized
}

async function normalizeArtifactDirectory(directory) {
  let names = []
  try {
    names = await fs.readdir(directory)
  } catch {
    return
  }

  await Promise.all(names
    .filter((name) => name.endsWith('.json'))
    .map(async (name) => {
      const filePath = path.join(directory, name)
      const raw = await fs.readFile(filePath, 'utf8')
      if (!raw.includes('MedicalSubstance')) return
      const parsed = JSON.parse(raw)
      const normalized = normalizeSchemaTypes(parsed)
      await fs.writeFile(filePath, `${JSON.stringify(normalized)}\n`, 'utf8')
    }))
}

export async function normalizeAiEntitySchemaTypes(dataDir = 'public/data') {
  const root = path.resolve(process.cwd(), dataDir, 'ai-entities')
  await Promise.all([
    normalizeArtifactDirectory(path.join(root, 'herb')),
    normalizeArtifactDirectory(path.join(root, 'compound')),
  ])
}

export async function buildAiEntityArtifacts(args = {}) {
  const report = await buildBaseAiEntityArtifacts(args)
  await normalizeAiEntitySchemaTypes(args.dataDir || 'public/data')
  return report
}

import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'research-enrichment.schema.json')
const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const DETAIL_DIRECTORIES = [
  path.join(ROOT, 'public', 'data', 'herbs-detail'),
  path.join(ROOT, 'public', 'data', 'compounds-detail'),
]

const CLAIM_ARRAY_FIELDS = [
  'supportedUses',
  'unsupportedOrUnclearUses',
  'mechanisms',
  'constituents',
  'interactions',
  'contraindications',
  'adverseEffects',
  'dosageContextNotes',
  'populationSpecificNotes',
  'conflictNotes',
  'researchGaps',
]

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function getDetailFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter(name => name.endsWith('.json'))
    .map(name => path.join(dir, name))
}

const schema = readJson(SCHEMA_PATH)
const sourceRegistry = readJson(SOURCE_REGISTRY_PATH)
const globalSourceIdSet = new Set(sourceRegistry.map(item => item.sourceId))
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const files = DETAIL_DIRECTORIES.flatMap(getDetailFiles)
const errors = []
let checked = 0

for (const file of files) {
  const payload = readJson(file)
  const enrichment = payload?.researchEnrichment
  if (!enrichment) continue
  checked += 1

  if (!validate(enrichment)) {
    errors.push(
      `[schema] ${path.relative(ROOT, file)}\n${JSON.stringify(validate.errors ?? [], null, 2)}`,
    )
    continue
  }

  const localSourceRefs = Array.isArray(enrichment.sourceRefs) ? enrichment.sourceRefs : []
  const localSourceIdSet = new Set(localSourceRefs.map(item => item.sourceId))
  const registryIdSet = new Set(enrichment.sourceRegistryIds)

  for (const sourceId of registryIdSet) {
    if (!globalSourceIdSet.has(sourceId)) {
      errors.push(
        `[registry] ${path.relative(ROOT, file)} sourceRegistryIds includes unknown sourceId=${sourceId}`,
      )
    }
  }

  for (const sourceId of localSourceIdSet) {
    if (!registryIdSet.has(sourceId)) {
      errors.push(
        `[registry] ${path.relative(ROOT, file)} sourceRefs.sourceId=${sourceId} must also appear in sourceRegistryIds`,
      )
    }
  }

  const availableSourceIds = new Set([...registryIdSet, ...localSourceIdSet])
  for (const field of CLAIM_ARRAY_FIELDS) {
    const items = Array.isArray(enrichment[field]) ? enrichment[field] : []
    for (const item of items) {
      for (const sourceRefId of item.sourceRefIds) {
        if (!availableSourceIds.has(sourceRefId)) {
          errors.push(
            `[provenance] ${path.relative(ROOT, file)} field=${field} missing sourceRefId=${sourceRefId}`,
          )
        }
      }
    }
  }
}

if (errors.length > 0) {
  console.error(`[validate-research-enrichment] FAIL (${errors.length} issues)`)
  for (const issue of errors.slice(0, 50)) {
    console.error(`- ${issue}`)
  }
  if (errors.length > 50) {
    console.error(`- ...and ${errors.length - 50} more`)
  }
  process.exit(1)
}

console.log(
  `[validate-research-enrichment] PASS checked=${checked} files_with_research_enrichment registry_sources=${globalSourceIdSet.size}`,
)

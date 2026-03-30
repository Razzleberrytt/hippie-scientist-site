import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'research-enrichment.schema.json')
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

  const sourceIdSet = new Set(enrichment.sourceRefs.map(item => item.sourceId))

  for (const field of CLAIM_ARRAY_FIELDS) {
    const items = Array.isArray(enrichment[field]) ? enrichment[field] : []
    for (const item of items) {
      for (const sourceRefId of item.sourceRefIds) {
        if (!sourceIdSet.has(sourceRefId)) {
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

console.log(`[validate-research-enrichment] PASS checked=${checked} files_with_research_enrichment`)

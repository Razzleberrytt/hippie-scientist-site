#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'source-registry.schema.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')

const CLASS_RULES = {
  'randomized-human-trial': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['journal-article', 'clinical-trial-registry']),
    pmidApplicable: true,
  },
  'non-randomized-human-study': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['journal-article']),
    pmidApplicable: true,
  },
  'observational-human-evidence': {
    evidenceClass: 'human-observational',
    allowedTypes: new Set(['journal-article', 'systematic-review']),
    pmidApplicable: true,
  },
  'systematic-review-meta-analysis': {
    evidenceClass: 'human-clinical',
    allowedTypes: new Set(['systematic-review', 'meta-analysis', 'journal-article']),
    pmidApplicable: true,
  },
  'preclinical-mechanistic-study': {
    evidenceClass: 'preclinical-mechanistic',
    allowedTypes: new Set(['journal-article']),
    pmidApplicable: true,
  },
  'traditional-use-monograph': {
    evidenceClass: 'traditional-use',
    allowedTypes: new Set(['monograph', 'book']),
    pmidApplicable: false,
  },
  'regulatory-agency-monograph-guidance': {
    evidenceClass: 'regulatory-monograph',
    allowedTypes: new Set(['regulatory-guidance', 'monograph']),
    pmidApplicable: false,
  },
  'reference-database-authority': {
    evidenceClass: 'regulatory-monograph',
    allowedTypes: new Set(['reference-database']),
    pmidApplicable: false,
  },
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

const schema = readJson(SCHEMA_PATH)
const registry = readJson(REGISTRY_PATH)
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const issues = []
if (!validate(registry)) {
  issues.push(`[schema] ${JSON.stringify(validate.errors ?? [], null, 2)}`)
}

const seenSourceIds = new Set()
for (const [index, source] of registry.entries()) {
  const prefix = `[record:${index}:${source?.sourceId ?? 'missing-id'}]`
  const sourceId = source?.sourceId
  if (seenSourceIds.has(sourceId)) issues.push(`${prefix} duplicate sourceId.`)
  seenSourceIds.add(sourceId)

  const classRule = CLASS_RULES[source.sourceClass]
  if (!classRule) {
    issues.push(`${prefix} unknown sourceClass rule.`)
    continue
  }

  if (!classRule.allowedTypes.has(source.sourceType)) {
    issues.push(`${prefix} sourceType=${source.sourceType} is not allowed for sourceClass=${source.sourceClass}.`)
  }

  if (source.evidenceClass !== classRule.evidenceClass) {
    issues.push(
      `${prefix} evidenceClass=${source.evidenceClass} contradicts sourceClass=${source.sourceClass}; expected ${classRule.evidenceClass}.`,
    )
  }

  if (classRule.pmidApplicable === false && isNonEmptyString(source.pmid)) {
    issues.push(`${prefix} pmid must be omitted for sourceClass=${source.sourceClass}.`)
  }

  const hasCitationAnchor = isNonEmptyString(source.canonicalUrl) || isNonEmptyString(source.doi) || isNonEmptyString(source.pmid)
  if (!hasCitationAnchor) {
    issues.push(`${prefix} requires at least one of canonicalUrl|doi|pmid.`)
  }

  const monographLike =
    source.sourceClass === 'traditional-use-monograph' || source.sourceClass === 'regulatory-agency-monograph-guidance'
  if (monographLike) {
    if (!isNonEmptyString(source.organization)) {
      issues.push(`${prefix} organization is required for monograph/regulatory source classes.`)
    }

    const hasMonographId = isNonEmptyString(source.monographId) || isNonEmptyString(source.isbn)
    if (!hasMonographId) {
      issues.push(`${prefix} monograph/regulatory source requires monographId or isbn.`)
    }

    if (!Number.isInteger(source.publicationYear)) {
      issues.push(`${prefix} publicationYear is required for monograph/regulatory source classes.`)
    }
  }
}

if (issues.length > 0) {
  console.error(`[validate-source-registry] FAIL (${issues.length} issues)`)
  for (const issue of issues.slice(0, 50)) console.error(`- ${issue}`)
  if (issues.length > 50) console.error(`- ...and ${issues.length - 50} more`)
  process.exit(1)
}

console.log(`[validate-source-registry] PASS records=${registry.length}`)

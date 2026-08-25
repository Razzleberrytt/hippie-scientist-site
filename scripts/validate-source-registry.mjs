#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = process.cwd()
const SCHEMA_PATH = path.join(ROOT, 'schemas', 'source-registry.schema.json')
const GOVERNANCE_PATH = path.join(ROOT, 'schemas', 'source-class-governance.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const UNIQUE_IDENTITY_FIELDS = ['pmid', 'doi', 'canonicalUrl', 'monographId']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeIdentityValue(field, value) {
  if (!isNonEmptyString(value)) return null
  const trimmed = value.trim()
  if (field === 'pmid') return trimmed
  if (field === 'doi') return trimmed.toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '').replace(/^doi:\s*/u, '')
  if (field === 'canonicalUrl') {
    try {
      const url = new URL(trimmed)
      url.hash = ''
      if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/u, '')
      return url.toString()
    } catch {
      return trimmed
    }
  }
  return trimmed.toLowerCase()
}

const schema = readJson(SCHEMA_PATH)
const classGovernance = readJson(GOVERNANCE_PATH)
const registry = readJson(REGISTRY_PATH)
const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
addFormats(ajv)
const validate = ajv.compile(schema)

const issues = []
if (!validate(registry)) {
  issues.push(`[schema] ${JSON.stringify(validate.errors ?? [], null, 2)}`)
}

const schemaSourceClasses = [...(schema?.items?.properties?.sourceClass?.enum ?? [])].sort()
const governedSourceClasses = Object.keys(classGovernance).sort()
if (JSON.stringify(schemaSourceClasses) !== JSON.stringify(governedSourceClasses)) {
  issues.push(
    `[governance] source-class-governance.json keys must exactly match source-registry.schema.json sourceClass enum. ` +
      `schema=${schemaSourceClasses.join(',')} governance=${governedSourceClasses.join(',')}`,
  )
}

const seenSourceIds = new Set()
const identityOwners = new Map()
for (const [index, source] of registry.entries()) {
  const prefix = `[record:${index}:${source?.sourceId ?? 'missing-id'}]`
  const sourceId = source?.sourceId
  if (seenSourceIds.has(sourceId)) issues.push(`${prefix} duplicate sourceId.`)
  seenSourceIds.add(sourceId)

  for (const field of UNIQUE_IDENTITY_FIELDS) {
    const value = normalizeIdentityValue(field, source?.[field])
    if (!value) continue
    const key = `${field}:${value}`
    const prior = identityOwners.get(key)
    if (prior && prior.sourceId !== sourceId) {
      issues.push(`${prefix} ${field} duplicates source identity owned by ${prior.sourceId}.`)
    } else if (!prior) {
      identityOwners.set(key, { sourceId, index })
    }
  }

  const classRule = classGovernance[source.sourceClass]
  if (!classRule) {
    issues.push(`${prefix} unknown sourceClass rule.`)
    continue
  }

  if (!classRule.allowedSourceTypes.includes(source.sourceType)) {
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

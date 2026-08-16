#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { buildAiEntityArtifacts } from '../data/ai-entity-artifacts.mjs'

const ROOT = process.cwd()
const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG ? DATA_DIR_ARG.split('=')[1] : 'public/data'
const FAIL_BELOW_ARG = process.argv.find((arg) => arg.startsWith('--fail-average-below='))
const FAIL_BELOW = FAIL_BELOW_ARG ? Number(FAIL_BELOW_ARG.split('=')[1]) : null

const SITE_URL = 'https://thehippiescientist.net'
const SITE_NAME = 'The Hippie Scientist'
const ORGANIZATION_ID = `${SITE_URL}/#organization`
const AUTHOR_NAME = 'Willie B. Randolph III'
const AUTHOR_URL = `${SITE_URL}/info/author/`
const AUTHOR_ID = `${AUTHOR_URL}#person`

async function readJson(fileName) {
  const filePath = path.resolve(ROOT, DATA_DIR, fileName)
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function schemaTypes(node) {
  const raw = node?.['@type']
  return Array.isArray(raw) ? raw.map(String) : raw ? [String(raw)] : []
}

function walkNodes(value, output = []) {
  if (!value || typeof value !== 'object') return output
  if (Array.isArray(value)) {
    value.forEach((entry) => walkNodes(entry, output))
    return output
  }
  output.push(value)
  Object.values(value).forEach((entry) => walkNodes(entry, output))
  return output
}

function validateArtifactIdentity(payload, label) {
  const errors = []
  for (const node of walkNodes(payload)) {
    const types = schemaTypes(node)

    if (types.includes('Organization') && node.name === SITE_NAME) {
      if (node['@id'] !== ORGANIZATION_ID) errors.push(`${label}: first-party Organization missing canonical @id`)
      if (node.url !== SITE_URL) errors.push(`${label}: first-party Organization missing canonical url`)
    }

    if (types.includes('Person') && node.name === AUTHOR_NAME) {
      if (node['@id'] !== AUTHOR_ID) errors.push(`${label}: first-party author missing canonical @id`)
      if (node.url !== AUTHOR_URL) errors.push(`${label}: first-party author missing canonical url`)
    }

    if (types.includes('Article')) {
      if (node.author?.name === SITE_NAME || node.author?.['@id'] === ORGANIZATION_ID) {
        errors.push(`${label}: first-party evidence Article still uses Organization as author`)
      }
      if (node.author?.['@id'] === AUTHOR_ID && node.author?.['@type'] !== 'Person') {
        errors.push(`${label}: canonical author id is not typed as Person`)
      }
      if (node.publisher?.['@id'] === ORGANIZATION_ID && node.publisher?.['@type'] !== 'Organization') {
        errors.push(`${label}: canonical publisher id is not typed as Organization`)
      }
    }
  }
  return [...new Set(errors)]
}

async function auditGeneratedIdentityArtifacts() {
  const root = path.resolve(ROOT, DATA_DIR, 'ai-entities')
  const errors = []

  for (const kind of ['herb', 'compound']) {
    const directory = path.join(root, kind)
    let names = []
    try {
      names = await fs.readdir(directory)
    } catch {
      continue
    }

    for (const name of names.filter((entry) => entry.endsWith('.json'))) {
      const payload = JSON.parse(await fs.readFile(path.join(directory, name), 'utf8'))
      errors.push(...validateArtifactIdentity(payload, `${kind}/${name}`))
    }
  }

  return [...new Set(errors)]
}

async function main() {
  const [herbs, compounds] = await Promise.all([
    readJson('herbs.json'),
    readJson('compounds.json'),
  ])

  const report = await buildAiEntityArtifacts({
    dataDir: DATA_DIR,
    herbs,
    compounds,
  })

  const identityErrors = await auditGeneratedIdentityArtifacts()
  const { summary, priorities } = report
  console.log('AI entity completeness audit')
  console.log(`Entities: ${summary.entities}`)
  console.log(`Average score: ${summary.averageScore}/100`)
  console.log(`Profiles scoring 80+: ${summary.strongProfiles}`)
  console.log(`Profiles below 50: ${summary.weakProfiles}`)
  console.log(`Identity-role errors: ${identityErrors.length}`)
  console.log('')
  console.log('Top 20 enrichment priorities:')

  for (const row of priorities.slice(0, 20)) {
    console.log(`- ${row.score}/100 ${row.kind}:${row.slug} — ${row.missing.slice(0, 5).join(', ')}`)
  }

  console.log('')
  console.log('Reports:')
  console.log('- ops/reports/ai-entity-completeness.json')
  console.log('- ops/reports/ai-entity-completeness.md')
  console.log('- public/data/ai-entities/manifest.json')

  if (identityErrors.length) {
    console.error('\nGenerated AI entity identity/role violations:')
    identityErrors.slice(0, 100).forEach((error) => console.error(`- ${error}`))
    process.exit(1)
  }

  if (Number.isFinite(FAIL_BELOW) && summary.averageScore < FAIL_BELOW) {
    console.error(`Average completeness ${summary.averageScore} is below required threshold ${FAIL_BELOW}.`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
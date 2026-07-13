#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'
import { buildAiEntityArtifacts } from '../data/ai-entity-enrichment-lib.mjs'

const ROOT = process.cwd()
const DATA_DIR_ARG = process.argv.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = DATA_DIR_ARG ? DATA_DIR_ARG.split('=')[1] : 'public/data'
const FAIL_BELOW_ARG = process.argv.find((arg) => arg.startsWith('--fail-average-below='))
const FAIL_BELOW = FAIL_BELOW_ARG ? Number(FAIL_BELOW_ARG.split('=')[1]) : null

async function readJson(fileName) {
  const filePath = path.resolve(ROOT, DATA_DIR, fileName)
  const raw = await fs.readFile(filePath, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
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

  const { summary, priorities } = report
  console.log('AI entity completeness audit')
  console.log(`Entities: ${summary.entities}`)
  console.log(`Average score: ${summary.averageScore}/100`)
  console.log(`Profiles scoring 80+: ${summary.strongProfiles}`)
  console.log(`Profiles below 50: ${summary.weakProfiles}`)
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

  if (Number.isFinite(FAIL_BELOW) && summary.averageScore < FAIL_BELOW) {
    console.error(`Average completeness ${summary.averageScore} is below required threshold ${FAIL_BELOW}.`)
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

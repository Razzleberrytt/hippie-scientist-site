#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateEvidenceEnginePayload } from './evidence-engine-validation.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const dataDir = process.argv.includes('--data-dir')
  ? process.argv[process.argv.indexOf('--data-dir') + 1]
  : (process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data')

const payloadPath = path.resolve(repoRoot, dataDir, 'evidence-engine', 'sleep.json')

const SLEEP_PROBLEMS = new Set([
  'sleep_onset',
  'sleep_quality',
  'night_waking',
  'racing_mind',
  'relaxation',
])

function main() {
  if (!fs.existsSync(payloadPath)) {
    throw new Error(`[sleep-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPath)}`)
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  const errors = validateEvidenceEnginePayload(payload, {
    goal: 'sleep',
    problemField: 'sleep_problem',
    validProblems: SLEEP_PROBLEMS,
  })

  if (errors.length > 0) {
    console.error('[sleep-evidence-engine] validation failed')
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`[sleep-evidence-engine] validation OK: ${payload.claims.length} claims, ${payload.safetyNotes.length} safety notes`)
}

main()

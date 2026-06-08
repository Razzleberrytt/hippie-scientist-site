#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateEvidenceEnginePayload } from './evidence-engine-validation.mjs'
import { getEvidenceEngineGoalConfigs } from './evidence-engine-goals.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const dataDir = process.argv.includes('--data-dir')
  ? process.argv[process.argv.indexOf('--data-dir') + 1]
  : (process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data')

function main() {
  for (const config of getEvidenceEngineGoalConfigs()) {
    const payloadPath = path.resolve(repoRoot, dataDir, 'evidence-engine', `${config.goal}.json`)
    if (!fs.existsSync(payloadPath)) {
      throw new Error(`[${config.goal}-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPath)}`)
    }

    const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
    const validProblems = new Set(
      Object.keys(payload?.problemLabels || {}).filter(Boolean)
    )
    const errors = validateEvidenceEnginePayload(payload, {
      goal: config.goal,
      problemField: config.problemField,
      validProblems: validProblems.size > 0 ? validProblems : config.validProblems,
    })

    if (errors.length > 0) {
      console.error(`[${config.goal}-evidence-engine] validation failed`)
      for (const error of errors) console.error(`- ${error}`)
      process.exit(1)
    }

    console.log(`[${config.goal}-evidence-engine] validation OK: ${payload.claims.length} claims, ${payload.safetyNotes.length} safety notes`)
  }
}

main()

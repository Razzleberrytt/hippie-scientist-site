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

const payloadPaths = {
  sleep: path.resolve(repoRoot, dataDir, 'evidence-engine', 'sleep.json'),
  stress: path.resolve(repoRoot, dataDir, 'evidence-engine', 'stress.json'),
  anxiety: path.resolve(repoRoot, dataDir, 'evidence-engine', 'anxiety.json'),
}

const SLEEP_PROBLEMS = new Set([
  'sleep_onset',
  'sleep_quality',
  'night_waking',
  'racing_mind',
  'relaxation',
])

function main() {
  if (!fs.existsSync(payloadPaths.sleep)) {
    throw new Error(`[sleep-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPaths.sleep)}`)
  }

  const sleepPayload = JSON.parse(fs.readFileSync(payloadPaths.sleep, 'utf8'))
  const sleepErrors = validateEvidenceEnginePayload(sleepPayload, {
    goal: 'sleep',
    problemField: 'sleep_problem',
    validProblems: SLEEP_PROBLEMS,
  })

  if (sleepErrors.length > 0) {
    console.error('[sleep-evidence-engine] validation failed')
    for (const error of sleepErrors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`[sleep-evidence-engine] validation OK: ${sleepPayload.claims.length} claims, ${sleepPayload.safetyNotes.length} safety notes`)

  if (!fs.existsSync(payloadPaths.stress)) {
    throw new Error(`[stress-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPaths.stress)}`)
  }

  const stressPayload = JSON.parse(fs.readFileSync(payloadPaths.stress, 'utf8'))
  const stressProblems = new Set(
    Object.keys(stressPayload?.problemLabels || {}).filter(Boolean)
  )
  const stressErrors = validateEvidenceEnginePayload(stressPayload, {
    goal: 'stress',
    problemField: 'stress_problem',
    validProblems: stressProblems,
  })

  if (stressErrors.length > 0) {
    console.error('[stress-evidence-engine] validation failed')
    for (const error of stressErrors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`[stress-evidence-engine] validation OK: ${stressPayload.claims.length} claims, ${stressPayload.safetyNotes.length} safety notes`)

  if (!fs.existsSync(payloadPaths.anxiety)) {
    throw new Error(`[anxiety-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPaths.anxiety)}`)
  }

  const anxietyPayload = JSON.parse(fs.readFileSync(payloadPaths.anxiety, 'utf8'))
  const anxietyProblems = new Set(
    Object.keys(anxietyPayload?.problemLabels || {}).filter(Boolean)
  )
  const anxietyErrors = validateEvidenceEnginePayload(anxietyPayload, {
    goal: 'anxiety',
    problemField: 'anxiety_problem',
    validProblems: anxietyProblems,
  })

  if (anxietyErrors.length > 0) {
    console.error('[anxiety-evidence-engine] validation failed')
    for (const error of anxietyErrors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`[anxiety-evidence-engine] validation OK: ${anxietyPayload.claims.length} claims, ${anxietyPayload.safetyNotes.length} safety notes`)
}

main()

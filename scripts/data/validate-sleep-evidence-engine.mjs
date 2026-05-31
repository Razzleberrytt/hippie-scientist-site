#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const dataDir = process.argv.includes('--data-dir')
  ? process.argv[process.argv.indexOf('--data-dir') + 1]
  : (process.argv.find((arg) => arg.startsWith('--data-dir='))?.slice(11) || 'public/data')

const payloadPath = path.resolve(repoRoot, dataDir, 'evidence-engine', 'sleep.json')

const CONFIDENCE_TIERS = new Set([
  'strong_human',
  'moderate_human',
  'limited_human',
  'mixed',
  'mechanistic_only',
  'insufficient',
])

const SLEEP_PROBLEMS = new Set([
  'sleep_onset',
  'sleep_quality',
  'night_waking',
  'racing_mind',
  'relaxation',
])

const SEVERITIES = new Set(['low', 'moderate', 'high'])

const RISK_TYPES = new Set([
  'pregnancy_breastfeeding',
  'sedative_stacking',
  'medication_interaction',
  'next_day_grogginess',
  'kidney_disease',
  'autoimmune',
  'liver',
  'blood_pressure',
  'pediatric',
  'complex_condition',
])

const BLOCKED_TERMS = [
  /\bcure\b/i,
  /\btreats\b/i,
  /\btreatment\b/i,
  /\bprevents\b/i,
  /\bguaranteed\b/i,
  /\bclinically proven\b/i,
  /\bmiracle\b/i,
  /\brisk-free\b/i,
  /\bdoctor recommended\b/i,
  /\bFDA approved\b/i,
  /\bbest supplement\b/i,
  /\bno side effects\b/i,
]

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function requireFields(record, fields, label, errors) {
  for (const field of fields) {
    if (!clean(record?.[field])) errors.push(`${label} missing required field: ${field}`)
  }
}

function checkBlockedTerms(record, fields, label, errors) {
  for (const field of fields) {
    const value = clean(record?.[field])
    if (!value) continue
    for (const pattern of BLOCKED_TERMS) {
      if (pattern.test(value)) errors.push(`${label} contains blocked term in ${field}`)
    }
  }
}

function main() {
  if (!fs.existsSync(payloadPath)) {
    throw new Error(`[sleep-evidence-engine] missing generated payload: ${path.relative(repoRoot, payloadPath)}`)
  }

  const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'))
  const errors = []

  if (payload?.goal !== 'sleep') errors.push('payload goal must be sleep')
  if (!Array.isArray(payload?.claims)) errors.push('payload claims must be an array')
  if (!Array.isArray(payload?.safetyNotes)) errors.push('payload safetyNotes must be an array')
  if (!payload?.sourcesByClaim || typeof payload.sourcesByClaim !== 'object' || Array.isArray(payload.sourcesByClaim)) {
    errors.push('payload sourcesByClaim must be an object')
  }

  const claims = Array.isArray(payload?.claims) ? payload.claims : []
  const safetyNotes = Array.isArray(payload?.safetyNotes) ? payload.safetyNotes : []
  const sourcesByClaim = payload?.sourcesByClaim && typeof payload.sourcesByClaim === 'object' ? payload.sourcesByClaim : {}

  for (const claim of claims) {
    const label = `claim ${clean(claim?.claim_id) || '(unknown)'}`
    requireFields(claim, [
      'claim_id',
      'ingredient_slug',
      'ingredient_name',
      'sleep_problem',
      'claim_statement',
      'confidence_tier',
      'evidence_summary',
      'limitations',
      'best_fit',
      'not_best_fit',
      'decision_group',
    ], label, errors)

    if (claim?.sleep_problem && !SLEEP_PROBLEMS.has(claim.sleep_problem)) {
      errors.push(`${label} has invalid sleep_problem: ${claim.sleep_problem}`)
    }

    if (claim?.confidence_tier && !CONFIDENCE_TIERS.has(claim.confidence_tier)) {
      errors.push(`${label} has invalid confidence_tier: ${claim.confidence_tier}`)
    }

    const sources = sourcesByClaim[claim?.claim_id]
    if (!Array.isArray(sources) || sources.length === 0) {
      errors.push(`${label} must have at least one source`)
    }

    checkBlockedTerms(claim, [
      'claim_statement',
      'evidence_summary',
      'limitations',
      'best_fit',
      'not_best_fit',
      'decision_group',
    ], label, errors)
  }

  for (const [claimId, sources] of Object.entries(sourcesByClaim)) {
    if (!Array.isArray(sources)) {
      errors.push(`sourcesByClaim.${claimId} must be an array`)
      continue
    }

    for (const source of sources) {
      const label = `source ${clean(source?.source_id) || '(unknown)'}`
      requireFields(source, [
        'source_id',
        'claim_id',
        'citation_label',
        'source_type',
        'title',
        'year',
        'url',
      ], label, errors)
    }
  }

  for (const note of safetyNotes) {
    const label = `safety note ${clean(note?.safety_id) || '(unknown)'}`
    requireFields(note, [
      'safety_id',
      'ingredient_slug',
      'risk_type',
      'severity',
      'warning',
      'decision_effect',
    ], label, errors)

    if (note?.risk_type && !RISK_TYPES.has(note.risk_type)) {
      errors.push(`${label} has invalid risk_type: ${note.risk_type}`)
    }

    if (note?.severity && !SEVERITIES.has(note.severity)) {
      errors.push(`${label} has invalid severity: ${note.severity}`)
    }

    checkBlockedTerms(note, ['warning', 'decision_effect'], label, errors)
  }

  if (errors.length > 0) {
    console.error('[sleep-evidence-engine] validation failed')
    for (const error of errors) console.error(`- ${error}`)
    process.exit(1)
  }

  console.log(`[sleep-evidence-engine] validation OK: ${claims.length} claims, ${safetyNotes.length} safety notes`)
}

main()

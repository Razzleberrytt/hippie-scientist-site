import fs from 'node:fs'
import { pathToFileURL } from 'node:url'
import crypto from 'node:crypto'

export const RESULTS = new Set(['positive','negative','null','underpowered','invalid','Unknown'])
const REQUIRED = ['experiment_id','surface','hypothesis','intervention_family','primary_metric','owning_issue','baseline_window','intervention','guardrails','minimum_evidence_requirement','observation_window','result','sample_exposure','attribution_confounds','confidence','decision','rollback_stop_status','meaningful_lesson','retest_after','retest_conditions','observation_sources','revision','supersedes_revision','recorded_at']

export function normalizePart(value) {
  return String(value ?? '').trim().toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9._:-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'')
}

export function experimentIdentity({surface,hypothesis,intervention_family,primary_metric}) {
  const parts = [surface,hypothesis,intervention_family,primary_metric].map(normalizePart)
  if (parts.some((part) => !part)) throw new Error('experiment identity requires surface, hypothesis, intervention_family, and primary_metric')
  const digest = crypto.createHash('sha256').update(parts.join('|')).digest('hex').slice(0,16)
  return `exp:v1:${parts[0]}|${parts[2]}|${parts[3]}|${digest}`
}

export function semanticKey(entry) {
  return [entry.surface, entry.hypothesis, entry.intervention_family, entry.primary_metric].map(normalizePart).join('|')
}

export function validateEntry(entry) {
  const errors = []
  for (const field of REQUIRED) if (!(field in entry)) errors.push(`missing ${field}`)
  if (entry.result && !RESULTS.has(entry.result)) errors.push(`invalid result ${entry.result}`)
  if (!Number.isInteger(entry.revision) || entry.revision < 1) errors.push('revision must be a positive integer')
  if (entry.result === 'Unknown' && entry.decision === 'scale') errors.push('Unknown result cannot scale')
  if ((entry.result === 'null' || entry.result === 'negative') && !entry.observation_window?.end) errors.push(`${entry.result} requires a completed observation window`)
  if (entry.result === 'underpowered' && entry.sample_exposure == null) errors.push('underpowered requires sample_exposure')
  if (entry.result !== 'Unknown' && (!Array.isArray(entry.observation_sources) || entry.observation_sources.length === 0)) errors.push(`${entry.result} requires authoritative observation_sources`)
  if (!Array.isArray(entry.guardrails) || entry.guardrails.length === 0) errors.push('guardrails must be non-empty')
  if (!Array.isArray(entry.attribution_confounds)) errors.push('attribution_confounds must be an array')
  if (!Array.isArray(entry.retest_conditions)) errors.push('retest_conditions must be an array')
  return errors
}

export function parseLedger(text) {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, i) => {
    try { return JSON.parse(line) } catch (error) { throw new Error(`ledger line ${i + 1}: ${error.message}`) }
  })
}

export function validateLedger(entries) {
  const errors = []
  const revisions = new Map()
  entries.forEach((entry, index) => {
    for (const error of validateEntry(entry)) errors.push(`line ${index + 1}: ${error}`)
    const key = entry.experiment_id
    const seen = revisions.get(key) || new Set()
    if (seen.has(entry.revision)) errors.push(`line ${index + 1}: duplicate revision ${key}@${entry.revision}`)
    seen.add(entry.revision)
    revisions.set(key, seen)
  })
  return errors
}

export function priorTestDecision(candidate, entries, { now = new Date() } = {}) {
  const key = semanticKey(candidate)
  const matches = entries.filter((entry) => semanticKey(entry) === key).sort((a,b) => b.revision - a.revision)
  if (!matches.length) return { status:'new', promotable:true, prior:null }
  const prior = matches[0]
  const changed = Array.isArray(candidate.changed_assumptions) && candidate.changed_assumptions.filter(Boolean)
  const freshBaseline = Boolean(candidate.baseline_window?.start && candidate.baseline_window?.end)
  if (changed.length && freshBaseline) return { status:'retest-allowed', promotable:true, prior, reason:`changed assumption: ${changed.join('; ')}` }
  if (prior.retest_after && new Date(prior.retest_after) <= now && freshBaseline && changed.length) return { status:'retest-allowed', promotable:true, prior, reason:'retest_after satisfied with changed assumption and fresh baseline' }
  return { status:'duplicate-blocked', promotable:false, prior, reason:'same or near-equivalent experiment requires a named changed assumption and fresh baseline' }
}

export function assertAppendOnly(previousEntries, nextEntries) {
  if (nextEntries.length < previousEntries.length) throw new Error('learning ledger is append-only: entries were removed')
  for (let i = 0; i < previousEntries.length; i += 1) {
    if (JSON.stringify(previousEntries[i]) !== JSON.stringify(nextEntries[i])) throw new Error(`learning ledger is append-only: historical line ${i + 1} changed`)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const ledgerPath = process.argv[2] || 'ops/experiments/learning-ledger.jsonl'
  const entries = parseLedger(fs.readFileSync(ledgerPath,'utf8'))
  const errors = validateLedger(entries)
  if (errors.length) {
    console.error(errors.join('\n'))
    process.exit(1)
  }
  console.log(`experiment learning ledger valid: ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}`)
}

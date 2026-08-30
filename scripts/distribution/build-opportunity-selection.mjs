#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { selectDistributionOpportunity } from './opportunity-engine.mjs'
import { DEMAND_SIGNAL_KEYS, validateOpportunitySignals } from './opportunity-signal-contract.mjs'

const root = process.cwd()
const objectsPath = path.resolve(process.argv[2] || 'data/distribution/research-objects.json')
const signalsPath = path.resolve(process.env.DISTRIBUTION_OPPORTUNITY_SIGNALS || 'data/distribution/opportunity-signals.json')
const outDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

function hasFiniteSignal(record, key) {
  const value = record?.[key]
  return value !== null && value !== '' && Number.isFinite(Number(value))
}

const objects = readJson(objectsPath, [])
const signals = readJson(signalsPath, {})
if (!Array.isArray(objects)) throw new Error('research objects input must be an array')
const signalValidation = validateOpportunitySignals(signals)
if (!signalValidation.valid) throw new Error(`opportunity signal provenance invalid:\n- ${signalValidation.errors.join('\n- ')}`)

const signalFilePresent = fs.existsSync(signalsPath)
const signalIds = Object.keys(signals).sort()
const governedIds = [...new Set(objects.map((object) => String(object?.id || '')).filter(Boolean))].sort()
const demandFieldCoverageByGovernedId = Object.fromEntries(governedIds.map((id) => {
  const observedFields = DEMAND_SIGNAL_KEYS.filter((key) => hasFiniteSignal(signals[id], key))
  return [id, {
    observedFields,
    observedFieldCount: observedFields.length,
    expectedFieldCount: DEMAND_SIGNAL_KEYS.length,
    coverageRatio: Number((observedFields.length / DEMAND_SIGNAL_KEYS.length).toFixed(4)),
    provenance: observedFields.length ? signals[id].provenance : null,
  }]
}))
const fullyCoveredGovernedIds = governedIds.filter((id) => demandFieldCoverageByGovernedId[id].observedFieldCount === DEMAND_SIGNAL_KEYS.length)
const partiallyCoveredGovernedIds = governedIds.filter((id) => {
  const count = demandFieldCoverageByGovernedId[id].observedFieldCount
  return count > 0 && count < DEMAND_SIGNAL_KEYS.length
})
const observedDemandFieldCount = governedIds.reduce((total, id) => total + demandFieldCoverageByGovernedId[id].observedFieldCount, 0)
const expectedDemandFieldCount = governedIds.length * DEMAND_SIGNAL_KEYS.length
const demandFieldCoverageRatio = expectedDemandFieldCount ? observedDemandFieldCount / expectedDemandFieldCount : 0
const signalMode = observedDemandFieldCount === 0
  ? 'fallback-defaults'
  : observedDemandFieldCount === expectedDemandFieldCount
    ? 'observed-signals'
    : 'partial-observed-signals'
const signalEvidence = {
  mode: signalMode,
  source: signalFilePresent ? path.relative(root, signalsPath) : null,
  signalFilePresent,
  governedCandidateCount: governedIds.length,
  signalRecordCount: signalIds.length,
  demandSignalFields: DEMAND_SIGNAL_KEYS,
  expectedDemandFieldCount,
  observedDemandFieldCount,
  demandFieldCoverageRatio: Number(demandFieldCoverageRatio.toFixed(4)),
  coveredGovernedCandidateCount: fullyCoveredGovernedIds.length,
  partiallyCoveredGovernedCandidateCount: partiallyCoveredGovernedIds.length,
  coverageRatio: governedIds.length ? Number((fullyCoveredGovernedIds.length / governedIds.length).toFixed(4)) : 0,
  coveredGovernedIds: fullyCoveredGovernedIds,
  partiallyCoveredGovernedIds,
  demandFieldCoverageByGovernedId,
  warning: demandFieldCoverageRatio < 1
    ? 'Opportunity ranking is partially or wholly fallback-driven; do not describe fallback scores as observed search, AI-search, or social demand.'
    : null,
}

const result = selectDistributionOpportunity(objects, signals)
const output = {
  authority: path.relative(root, objectsPath),
  signals: signalEvidence.source,
  signalEvidence,
  rule: 'Growth signals may rank eligible governed research objects but cannot make an ineligible scientific claim distributable.',
  ...result,
}
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'opportunity-selection.json'), `${JSON.stringify(output, null, 2)}\n`)
console.log(`[distribution] opportunity selection: ${result.status}${result.selected ? ` -> ${result.selected.id} (${result.selected.platform}, score ${result.selected.score})` : ''}`)
console.log(`[distribution] opportunity signal coverage: ${observedDemandFieldCount}/${expectedDemandFieldCount} demand fields (${signalEvidence.mode})`)

#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { selectDistributionOpportunity } from './opportunity-engine.mjs'

const root = process.cwd()
const objectsPath = path.resolve(process.argv[2] || 'data/distribution/research-objects.json')
const signalsPath = path.resolve(process.env.DISTRIBUTION_OPPORTUNITY_SIGNALS || 'data/distribution/opportunity-signals.json')
const outDir = path.resolve(process.env.DISTRIBUTION_OUTPUT || 'artifacts/distribution')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

const objects = readJson(objectsPath, [])
const signals = readJson(signalsPath, {})
if (!Array.isArray(objects)) throw new Error('research objects input must be an array')
if (!signals || Array.isArray(signals) || typeof signals !== 'object') throw new Error('opportunity signals must be an object keyed by governed research-object id')

const result = selectDistributionOpportunity(objects, signals)
const output = {
  generatedAt: new Date().toISOString(),
  authority: path.relative(root, objectsPath),
  signals: fs.existsSync(signalsPath) ? path.relative(root, signalsPath) : null,
  rule: 'Growth signals may rank eligible governed research objects but cannot make an ineligible scientific claim distributable.',
  ...result,
}
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'opportunity-selection.json'), `${JSON.stringify(output, null, 2)}\n`)
console.log(`[distribution] opportunity selection: ${result.status}${result.selected ? ` -> ${result.selected.id} (${result.selected.platform}, score ${result.selected.score})` : ''}`)

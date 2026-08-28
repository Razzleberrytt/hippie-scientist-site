#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const DEFAULT_MANIFEST = 'experiments/crawl-request-indexing/manifest.json'

function parseArgs(argv) {
  const args = {}
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) continue
    const [key, inlineValue] = token.slice(2).split('=', 2)
    args[key] = inlineValue ?? argv[index + 1]
    if (inlineValue === undefined) index += 1
  }
  return args
}

const args = parseArgs(process.argv.slice(2))
const manifestPath = path.resolve(args.manifest || DEFAULT_MANIFEST)
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.schema_version !== 2) throw new Error('Completion requires schema_version 2')
if (manifest.status !== 'active') throw new Error(`Experiment is not active; status=${manifest.status}`)

const completedAtMs = args.at ? Date.parse(args.at) : Date.now()
if (!Number.isFinite(completedAtMs)) throw new Error(`Invalid completion timestamp: ${args.at}`)
const freezeEndMs = Date.parse(manifest.freeze?.ends_at ?? '')
if (!Number.isFinite(freezeEndMs)) throw new Error('Active manifest has no valid freeze.ends_at')
if (completedAtMs < freezeEndMs) {
  throw new Error(`Cannot complete before freeze ends at ${manifest.freeze.ends_at}`)
}

manifest.status = 'completed'
manifest.completed_at = new Date(completedAtMs).toISOString()
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Completed ${manifest.experiment_id} at ${manifest.completed_at}; experiment assignments retained, freeze released.`)

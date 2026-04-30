#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const GENERATED_OUTPUT_FILES = [
  'public/data/herbs.json',
  'public/data/compounds.json',
  'public/data/claims.json',
  'public/data/herb-compound-map.json',
  'public/data/build-report.json',
]

function run(cmd, args, cwd) {
  const result = spawnSync(cmd, args, { cwd, stdio: 'inherit', env: process.env })
  if (result.status !== 0) throw new Error(`[data:verify] Command failed: ${cmd} ${args.join(' ')}`)
}

function normalizeForComparison(value) {
  if (Array.isArray(value)) return value.map(normalizeForComparison)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [key, v] of Object.entries(value)) {
      if (key === 'generatedAt' || key === 'generated_at') continue
      out[key] = normalizeForComparison(v)
    }
    return out
  }
  return value
}

function readComparable(file) {
  const text = fs.readFileSync(file, 'utf8')
  if (!file.endsWith('.json')) return text
  return `${JSON.stringify(normalizeForComparison(JSON.parse(text)), null, 2)}\n`
}

function main() {
  const tracked = GENERATED_OUTPUT_FILES.filter(rel => fs.existsSync(path.join(repoRoot, rel)))
  if (tracked.length === 0) {
    console.log('[data:verify] No approved generated output files are committed; skipping.')
    return
  }

  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'hippie-scientist-data-verify-'))
  const tmpRepo = path.join(tmpRoot, 'repo')
  fs.cpSync(repoRoot, tmpRepo, {
    recursive: true,
    filter: src => !src.includes(`${path.sep}.git${path.sep}`) && !src.endsWith(`${path.sep}.git`),
  })

  fs.rmSync(path.join(tmpRepo, 'public/data'), { recursive: true, force: true })

  console.log('[data:verify] Regenerating approved public/data artifacts from workbook in temp copy...')
  run('npm', ['run', 'data:build'], tmpRepo)

  const drift = []
  for (const rel of tracked) {
    const expected = path.join(repoRoot, rel)
    const actual = path.join(tmpRepo, rel)
    if (!fs.existsSync(actual)) {
      drift.push(`${rel}: missing from regenerated output`)
      continue
    }
    if (readComparable(expected) !== readComparable(actual)) {
      drift.push(`${rel}: content differs`)
    }
  }

  if (drift.length) {
    console.error('[data:verify] Drift detected:')
    for (const item of drift) console.error(`- ${item}`)
    process.exit(1)
  }

  console.log(`[data:verify] PASS: ${tracked.length} approved generated files match regenerated output.`)
}

main()

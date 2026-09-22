#!/usr/bin/env node

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const DATA_BUILD_STEPS = [
  ['scripts/data/build-runtime-from-workbook.mjs', '--out', 'public/data'],
  ['scripts/data/postprocess-workbook-payloads.mjs'],
  ['scripts/data/build-related-runtime-maps.mjs', '--data-dir=public/data'],
  ['scripts/data/build-runtime-summary-indexes.mjs', '--data-dir=public/data'],
  ['scripts/data/build-route-manifest.mjs', '--data-dir=public/data'],
  ['scripts/data/build-sitemap-manifest.mjs', '--data-dir=public/data'],
  ['scripts/data/build-export-batches.mjs', '--data-dir=public/data'],
  ['scripts/data/build-semantic-snapshots.mjs', '--data-dir=public/data'],
]

const GENERATED_OUTPUT_FILES = [
  'public/data/herbs.json',
  'public/data/compounds.json',
  'public/data/claims.json',
  'public/data/herb-compound-map.json',
  'public/data/build-report.json',
]

// These files live under public/data for runtime consumption but are canonical
// source inputs, not generated artifacts. A clean generated-data verification
// must preserve them while rebuilding the generated outputs around them.
const CANONICAL_PUBLIC_DATA_INPUTS = [
  'source-registry.json',
]

const COPY_EXCLUDED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.vercel',
  'node_modules',
  'out',
  'coverage',
])

function shouldCopy(src) {
  const relative = path.relative(repoRoot, src)
  if (!relative) return true
  const parts = relative.split(path.sep)
  return !parts.some(part => COPY_EXCLUDED_DIRS.has(part))
}

function linkInstalledDependencies(tmpRepo) {
  const sourceNodeModules = path.join(repoRoot, 'node_modules')
  const targetNodeModules = path.join(tmpRepo, 'node_modules')

  if (!fs.existsSync(sourceNodeModules)) {
    throw new Error('[data:verify] Cannot link dependencies because node_modules is missing. Run npm ci first.')
  }

  const symlinkType = process.platform === 'win32' ? 'junction' : 'dir'
  fs.symlinkSync(sourceNodeModules, targetNodeModules, symlinkType)
}

function runNodeScript(script, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [script, ...args], {
      cwd,
      stdio: 'inherit',
      env: process.env,
    })
    child.once('error', (error) => {
      reject(new Error(`[data:verify] Spawn error for node ${script}: ${error.message}`))
    })
    child.once('exit', (code, signal) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(
        `[data:verify] Command failed: node ${script} ${args.join(' ')}` +
        ` (exit ${code ?? 'null'}${signal ? `, signal ${signal}` : ''})`,
      ))
    })
  })
}

async function runDataBuild(cwd) {
  for (const [script, ...args] of DATA_BUILD_STEPS) {
    await runNodeScript(script, args, cwd)
  }
}

function normalizeForComparison(value) {
  if (Array.isArray(value)) return value.map(normalizeForComparison)
  if (value && typeof value === 'object') {
    const out = {}
    for (const key of Object.keys(value).sort()) {
      if (key === 'generatedAt' || key === 'generated_at') continue
      out[key] = normalizeForComparison(value[key])
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

function resetGeneratedData(tmpRepo) {
  const dataDir = path.join(tmpRepo, 'public/data')
  const preserved = new Map()

  for (const relativePath of CANONICAL_PUBLIC_DATA_INPUTS) {
    const sourcePath = path.join(dataDir, relativePath)
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`[data:verify] Canonical public data input is missing: public/data/${relativePath}`)
    }
    preserved.set(relativePath, fs.readFileSync(sourcePath))
  }

  fs.rmSync(dataDir, { recursive: true, force: true })
  fs.mkdirSync(dataDir, { recursive: true })

  for (const [relativePath, contents] of preserved.entries()) {
    const targetPath = path.join(dataDir, relativePath)
    fs.mkdirSync(path.dirname(targetPath), { recursive: true })
    fs.writeFileSync(targetPath, contents)
  }
}

function createTempRepo(label) {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), `hippie-scientist-data-verify-${label}-`))
  const tmpRepo = path.join(tmpRoot, 'repo')
  fs.cpSync(repoRoot, tmpRepo, {
    recursive: true,
    filter: shouldCopy,
  })
  linkInstalledDependencies(tmpRepo)
  resetGeneratedData(tmpRepo)
  return tmpRepo
}

async function main() {
  console.log('[data:verify] Regenerating public/data twice from workbook in clean temp copies...')

  const firstRepo = createTempRepo('a')
  const secondRepo = createTempRepo('b')

  // The two clean replicas are independent. Keep each replica's build steps
  // sequential, but run the replicas concurrently so determinism verification
  // uses the available CI cores instead of doubling the critical path.
  await Promise.all([
    runDataBuild(firstRepo),
    runDataBuild(secondRepo),
  ])

  const drift = []
  for (const rel of GENERATED_OUTPUT_FILES) {
    const first = path.join(firstRepo, rel)
    const second = path.join(secondRepo, rel)

    if (!fs.existsSync(first) || !fs.existsSync(second)) {
      drift.push(`${rel}: missing from one generated output`)
      continue
    }

    if (readComparable(first) !== readComparable(second)) {
      drift.push(`${rel}: generation is nondeterministic`)
    }
  }

  if (drift.length) {
    console.error('[data:verify] Nondeterministic generated data detected:')
    for (const item of drift) console.error(`- ${item}`)
    process.exit(1)
  }

  console.log(`[data:verify] PASS: ${GENERATED_OUTPUT_FILES.length} generated files are deterministic across clean builds.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})

#!/usr/bin/env node

import fs from 'node:fs'
import { spawnSync } from 'node:child_process'

const REQUIRE_BUILT = process.argv.includes('--require-built')
const HAS_BUILD = fs.existsSync('out')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

const checks = [
  {
    id: '601-602,604',
    name: 'titles, descriptions, canonicals',
    command: process.execPath,
    args: ['scripts/ci/audit-metadata-duplicates.mjs'],
  },
  {
    id: '605',
    name: 'index/noindex logic',
    command: process.execPath,
    args: ['scripts/ci/validate-indexability-metadata.mjs'],
  },
  {
    id: '604',
    name: 'route SEO/canonical contract',
    command: process.execPath,
    args: ['scripts/ci/validate-route-seo.mjs'],
  },
  {
    id: '600',
    name: 'production language leaks',
    command: process.execPath,
    args: ['scripts/audit/find-leaked-pipeline-text.mjs'],
  },
  {
    id: '610',
    name: 'component accessibility basics',
    command: npm,
    args: ['run', '-s', 'test:a11y'],
  },
]

if (HAS_BUILD) {
  checks.push(
    {
      id: '601-604,609-610',
      name: 'built HTML semantics and H1 uniqueness',
      command: process.execPath,
      args: ['scripts/ci/audit-built-page-semantics.mjs', '--strict', '--require-built'],
    },
    {
      id: '606',
      name: 'internal links',
      command: process.execPath,
      args: ['scripts/ci/audit-internal-links.mjs'],
    },
    {
      id: '607',
      name: 'sitemap',
      command: process.execPath,
      args: ['scripts/ci/validate-sitemap.mjs', '--require-built'],
    },
    {
      id: '608',
      name: 'redirects',
      command: process.execPath,
      args: ['scripts/verify-redirects.mjs'],
    },
    {
      id: '609',
      name: 'structured data',
      command: process.execPath,
      args: ['scripts/ci/audit-structured-data.mjs'],
    },
    {
      id: '605,607',
      name: 'built robots directives',
      command: process.execPath,
      args: ['scripts/ci/validate-robots.mjs', '--require-built'],
    },
  )
} else if (REQUIRE_BUILT) {
  console.error('[production-content-lint] out/ is required but missing. Run the production build first.')
  process.exit(1)
}

const results = []
let failures = 0

console.log('\nProduction content lint')
console.log('='.repeat(72))
console.log(`Mode: ${HAS_BUILD ? 'built-output + source/data checks' : 'source/data checks only'}`)
console.log('')

for (const check of checks) {
  const started = Date.now()
  const result = spawnSync(check.command, check.args, {
    cwd: process.cwd(),
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 20 * 1024 * 1024,
  })
  const elapsedMs = Date.now() - started
  const passed = result.status === 0
  if (!passed) failures += 1

  results.push({
    id: check.id,
    name: check.name,
    passed,
    status: result.status,
    elapsedMs,
  })

  const mark = passed ? 'PASS' : 'FAIL'
  console.log(`${mark.padEnd(5)} [${check.id}] ${check.name} (${elapsedMs}ms)`)

  if (!passed) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    if (output) {
      console.log(output.split(/\r?\n/).slice(-40).map((line) => `       ${line}`).join('\n'))
    }
  }
}

console.log('\n' + '-'.repeat(72))
console.log(`Checks: ${results.length} · Passed: ${results.length - failures} · Failed: ${failures}`)
if (!HAS_BUILD) {
  console.log('Built-output checks were skipped because out/ is absent.')
  console.log('For the merge-grade gate run: node scripts/ci/production-content-lint.mjs --require-built')
}

if (failures) {
  console.error('\nProduction content lint failed. Fix the failing invariant(s) before merging.')
  process.exit(1)
}

console.log('\nProduction content lint passed.')

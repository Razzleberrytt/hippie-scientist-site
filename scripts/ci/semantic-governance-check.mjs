#!/usr/bin/env node

import { spawn } from 'node:child_process'

const checks = [
  ['route manifest budget', process.execPath, ['scripts/ci/validate-route-manifest-budget.mjs']],
  ['runtime payload budgets', process.execPath, ['scripts/ci/validate-runtime-payload-budgets.mjs']],
  ['deterministic JSON order', process.execPath, ['scripts/ci/validate-deterministic-json-order.mjs']],
  ['semantic graph health', process.execPath, ['scripts/ci/validate-semantic-graph-health.mjs']],
]

function runCheck([name, command, args]) {
  return new Promise((resolve) => {
    const startedAt = Date.now()
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
    })

    child.on('close', (code) => {
      resolve({
        name,
        code,
        durationMs: Date.now() - startedAt,
      })
    })
  })
}

async function main() {
  console.log('Running semantic governance checks...\n')

  const results = []

  for (const check of checks) {
    console.log(`\n--- ${check[0]} ---`)
    results.push(await runCheck(check))
  }

  const failed = results.filter((result) => result.code !== 0)

  console.log('\n=== Semantic Governance Summary ===')

  for (const result of results) {
    const status = result.code === 0 ? 'PASS' : 'FAIL'
    console.log(
      `${status} ${result.name} (${(result.durationMs / 1000).toFixed(2)}s)`,
    )
  }

  if (failed.length > 0) {
    console.error('\nSemantic governance checks failed.')
    process.exit(1)
  }

  console.log('\nSemantic governance checks passed.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

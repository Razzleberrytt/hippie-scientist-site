#!/usr/bin/env node
/**
 * Cheap shared regressions before opening a PR, not a substitute for CI.
 * Stop after the first failure; never skip security, safety or publishing review.
 */
import { spawnSync } from 'node:child_process'
import process from 'node:process'
import console from 'node:console'
const steps = [
  ['admission policy regressions', 'node', ['--test', '.agents/skills/pr-admission-preflight.test.mjs']],
  ['preflight script lint', 'node', ['node_modules/eslint/bin/eslint.js', '--max-warnings=0',
    '.agents/skills/pr-admission-preflight.mjs',
    '.agents/skills/pr-admission-preflight.test.mjs',
    '.agents/skills/pre-pr-fast-check.mjs']],
  ['conflict markers', 'node', ['scripts/ci/validate-no-conflict-markers.mjs']],
  ['TOML security-floor contract', 'node', ['scripts/ci/validate-toml-security-floor.mjs']],
  ['changed-source shared regressions', 'npm', ['exec', '--no', '--', 'vitest', 'run',
    'scripts/ci/validate-toml-security-floor.test.mjs',
    'app/guides/other/__tests__/topic-guide-hub.test.ts']],
  ['high-severity security audit', 'npm', ['run', '--silent', 'audit:high']],
]
for (const [name, binary, args] of steps) {
  console.log('[pre-pr-fast] RUN ' + name)
  const result = spawnSync(binary, args, {
    stdio: 'inherit', timeout: 180_000, env: process.env,
  })
  if (result.error || result.status !== 0) {
    console.error('[pre-pr-fast] FAIL ' + name + ': ' +
      (result.error?.message || 'exit ' + String(result.status)))
    process.exitCode = 1
    break
  }
  console.log('[pre-pr-fast] PASS ' + name)
}
if (!process.exitCode) console.log('[pre-pr-fast] PASS focused preflight only; full exact-head CI and protected merge still required')

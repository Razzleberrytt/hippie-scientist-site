import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

test('node:test research suites never enter Vitest while npm test:node still discovers them', () => {
  const config = readFileSync(resolve('vitest.config.ts'), 'utf8')
  const collector = readFileSync(resolve('scripts/run-node-tests.mjs'), 'utf8')
  assert.match(config, /'research\/evidencemotion-director\/\*\.test\.mjs'/)
  assert.match(config, /exclude:\s*\[\.\.\.TEST_EXCLUDES,\s*'scripts\/\*\*'\]/)
  assert.match(collector, /NODE_TEST_IMPORT/)
  assert.match(collector, /spawnSync\(process\.execPath, \['--test', \.\.\.suites\]/)
})

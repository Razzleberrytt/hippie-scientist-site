#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)

function run(script) {
  const result = spawnSync(process.execPath, [path.join(HERE, script), ...args], {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
  })

  if (result.error) throw result.error
  if (result.signal) {
    console.error(`[ai-citation-cycle] ${script} terminated by ${result.signal}`)
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status ?? 1)
}

run('ai-citation-tracker-core.mjs')
run('refresh-ai-citation-protected-assets.mjs')

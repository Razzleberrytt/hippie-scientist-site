#!/usr/bin/env node
const { spawnSync } = require('node:child_process')

const result = spawnSync('node', ['scripts/sync-updated-datasets.mjs'], {
  stdio: 'inherit',
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log('[update-data] Dataset refresh complete.')

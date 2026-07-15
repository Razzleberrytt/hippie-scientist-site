import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..', '..')
const requiredOrder = [
  'build-runtime-from-workbook.mjs',
  'build-related-runtime-maps.mjs',
  'build-runtime-summary-indexes.mjs',
  'build-route-manifest.mjs',
  'build-internal-link-engine.mjs',
  'build-sitemap-manifest.mjs',
  'build-export-batches.mjs',
  'build-semantic-snapshots.mjs',
  'build-search-index.mjs',
]

function expectOrdered(source) {
  let previous = -1
  for (const command of requiredOrder) {
    const position = source.indexOf(command)
    expect(position, `${command} must exist in the pipeline`).toBeGreaterThan(previous)
    previous = position
  }
}

describe('runtime search build pipeline parity', () => {
  it.each([
    ['data:build', JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).scripts['data:build']],
    ['build:full', fs.readFileSync(path.join(root, 'scripts', 'orchestrate-build.mjs'), 'utf8')],
    ['build:deploy', fs.readFileSync(path.join(root, 'scripts', 'build-deploy.mjs'), 'utf8')],
  ])('%s builds search from the final runtime layers', (_name, source) => {
    expectOrdered(source)
  })
})

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { cleanProductionBuildArtifacts } from '../lib/clean-next-build-artifacts.mjs'

const workflows = [
  {
    path: '.github/workflows/production-content-invariants.yml',
    buildCommand: 'node scripts/build-production.mjs',
  },
  {
    path: '.github/workflows/production-content-lint.yml',
    buildCommand: 'npm run build:deploy',
  },
]

const cacheAction = 'uses: actions/cache@v6'
const cachePath = 'path: .next/cache'
const packageLockKey = "hashFiles('package-lock.json')"
const fallbackKey = '${{ runner.os }}-nextjs-${{ hashFiles(\'package-lock.json\') }}-'

describe('heavy production workflows restore usable Next.js build cache', () => {
  it.each(workflows)('$path restores cache before the full governed build', ({ path: workflowPath, buildCommand }) => {
    const yaml = fs.readFileSync(path.join(process.cwd(), workflowPath), 'utf8')
    const cacheIndex = yaml.indexOf(cacheAction)
    const buildIndex = yaml.indexOf(buildCommand)

    expect(cacheIndex).toBeGreaterThan(-1)
    expect(yaml).toContain(cachePath)
    expect(yaml).toContain(packageLockKey)
    expect(yaml).toContain(fallbackKey)
    expect(buildIndex).toBeGreaterThan(cacheIndex)
  })

  it('production cleanup preserves .next/cache while deleting stale build/export output', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ths-next-cache-contract-'))
    try {
      const cacheSentinel = path.join(root, '.next', 'cache', 'sentinel')
      const staleNextFile = path.join(root, '.next', 'server', 'stale.html')
      const staleOutFile = path.join(root, 'out', 'index.html')
      fs.mkdirSync(path.dirname(cacheSentinel), { recursive: true })
      fs.mkdirSync(path.dirname(staleNextFile), { recursive: true })
      fs.mkdirSync(path.dirname(staleOutFile), { recursive: true })
      fs.writeFileSync(cacheSentinel, 'cache')
      fs.writeFileSync(staleNextFile, 'stale')
      fs.writeFileSync(staleOutFile, 'stale')

      cleanProductionBuildArtifacts(root)

      expect(fs.existsSync(cacheSentinel)).toBe(true)
      expect(fs.existsSync(staleNextFile)).toBe(false)
      expect(fs.existsSync(staleOutFile)).toBe(false)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})

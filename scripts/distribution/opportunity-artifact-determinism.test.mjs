import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { afterEach, describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '../..')
const tempDirs = []

afterEach(() => {
  for (const dir of tempDirs.splice(0)) fs.rmSync(dir, { recursive: true, force: true })
})

describe('opportunity-selection artifact determinism', () => {
  it('emits byte-identical output for identical governed inputs', () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'distribution-opportunity-'))
    tempDirs.push(outDir)
    const env = { ...process.env, DISTRIBUTION_OUTPUT: outDir }
    const script = path.join(repoRoot, 'scripts/distribution/build-opportunity-selection.mjs')
    const objects = path.join(repoRoot, 'data/distribution/research-objects.json')

    execFileSync(process.execPath, [script, objects], { cwd: repoRoot, env })
    const first = fs.readFileSync(path.join(outDir, 'opportunity-selection.json'))

    execFileSync(process.execPath, [script, objects], { cwd: repoRoot, env })
    const second = fs.readFileSync(path.join(outDir, 'opportunity-selection.json'))

    expect(second.equals(first)).toBe(true)
    expect(JSON.parse(second.toString('utf8'))).not.toHaveProperty('generatedAt')
  })
})

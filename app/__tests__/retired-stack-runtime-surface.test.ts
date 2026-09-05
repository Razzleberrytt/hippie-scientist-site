import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ROOT = process.cwd()

describe('retired supplement-stack runtime surface', () => {
  it('does not publish the orphan public stack payload while the stack route is retired', () => {
    expect(fs.existsSync(path.join(ROOT, 'public/data/stacks.json'))).toBe(false)
    expect(fs.existsSync(path.join(ROOT, 'app/stacks'))).toBe(false)
  })

  it('keeps the current workbook runtime builder from regenerating the retired payload', () => {
    const builder = fs.readFileSync(
      path.join(ROOT, 'scripts/data/build-runtime-from-workbook.mjs'),
      'utf8',
    )

    expect(builder).not.toMatch(/writeJson\([^\n]*['"]stacks\.json['"]/) 
    expect(builder).toContain("writeJson(path.join(outDir, 'stack-synergy.json'), graph.stacks || [])")
  })
})

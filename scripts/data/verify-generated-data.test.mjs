import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const source = fs.readFileSync(
  path.join(process.cwd(), 'scripts/data/verify-generated-data.mjs'),
  'utf8',
)

describe('generated-data determinism verifier scheduling', () => {
  it('runs the two clean replicas concurrently', () => {
    expect(source).toContain('await Promise.all([')
    expect(source).toContain("runDataBuild(firstRepo, 'a')")
    expect(source).toContain("runDataBuild(secondRepo, 'b')")
  })

  it('keeps every build step sequential within each replica', () => {
    expect(source).toContain('for (const [script, ...args] of DATA_BUILD_STEPS)')
    expect(source).toContain('await runNodeScript(script, args, cwd, label)')
    expect(source).not.toContain('Promise.all(DATA_BUILD_STEPS')
  })

  it('still creates two isolated clean repositories and compares the same outputs', () => {
    expect(source).toContain("createTempRepo('a')")
    expect(source).toContain("createTempRepo('b')")
    expect(source).toContain('GENERATED_OUTPUT_FILES')
    expect(source).toContain("key === 'generatedAt' || key === 'generated_at'")
  })
})

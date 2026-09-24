import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('article reference content schema', () => {
  it('preserves DOI provenance for normalized article references', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'content-collections.ts'), 'utf8')
    const schema = source.match(/const articleReferenceSchema = z\.object\(\{([\s\S]*?)\n\}\)/)?.[1]

    expect(schema, 'articleReferenceSchema should remain discoverable').toBeTruthy()
    expect(schema).toContain("pmid: z.string().default('')")
    expect(schema).toContain("doi: z.string().default('')")
    expect(schema).toContain("url: z.string().default('')")
  })
})

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
const read = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8')
const draft = read('content/articles/creatine-safety-myths-evidence.mdx')
describe('creatine safety flagship boundary', () => {
  it('retains distinct slug and 48 unique question-formatted H2s', () => {
    expect(draft).toContain('slug: "creatine-safety-myths-evidence"')
    const qs = draft.split('\n').filter(line => line.startsWith('## ') && line.endsWith('?'))
    expect(qs).toHaveLength(48)
    expect(new Set(qs).size).toBe(48)
    const metadata = draft.split('citationQuestions:')[1]?.split('canonicalConcepts:')[0] ?? ''
    expect(metadata.split('\n').filter(line => line.startsWith('  - "'))).toHaveLength(48)
  })
  it('distinguishes measured filtration from cystatin C', () => {
    expect(draft).toContain('Gualano 2008 used cystatin C')
    expect(draft).toContain('26 studies / 1,036 participants')
  })
})
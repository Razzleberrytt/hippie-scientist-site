import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'

const source = fs.readFileSync(path.join(process.cwd(), 'app/guides/[slug]/page.tsx'), 'utf8')

describe('legacy guide atlas comparisons', () => {
  it('links ashwagandha to evidence-sorted calming botanicals', () => {
    expect(source).toContain('/tools/botanical-activity-atlas/calming-botanicals/?effect=Calming&sort=evidence')
  })

  it('links Lion\'s Mane to evidence-sorted cognition botanicals', () => {
    expect(source).toContain('/tools/botanical-activity-atlas/?effect=Cognition+%2F+focus&sort=evidence')
  })

  it('keeps the complete atlas in guide support navigation', () => {
    expect(source).toContain('href="/tools/botanical-activity-atlas/"')
  })
})

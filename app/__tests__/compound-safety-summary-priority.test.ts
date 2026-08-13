import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/compounds/[slug]/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8')
}

describe('compound safety summary priority', () => {
  it('prefers a substantive safety note before the avoid-if fallback', () => {
    const text = source()
    const helper = text.match(/function getSafetySummary[\s\S]*?\n}\n\nfunction getMechanismHints/)?.[0] || ''

    expect(helper).toContain("const note = cleanText(compound.safetyNotes || compound.safety_notes || compound.safety)")
    expect(helper.indexOf('if (note)')).toBeGreaterThan(-1)
    expect(helper.indexOf('if (avoidIf.length)')).toBeGreaterThan(-1)
    expect(helper.indexOf('if (note)')).toBeLessThan(helper.indexOf('if (avoidIf.length)'))
  })

  it('keeps avoid-if cautions visible as their own quick-stat surface', () => {
    const text = source()

    expect(text).toContain('Avoid / review if')
    expect(text).toContain("{avoidIf.slice(0, 3).join(', ')}")
    expect(text).toContain('Review before use if any apply:')
  })
})

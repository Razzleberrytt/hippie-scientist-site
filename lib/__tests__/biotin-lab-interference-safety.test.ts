import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

type BiotinProfile = {
  safetyNotes: string
  safety: string
  contraindications: string[]
}

const profile: BiotinProfile = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'public/data/compounds-detail/biotin.json'), 'utf8'),
)

describe('biotin laboratory-interference safety copy', () => {
  it('does not prescribe a universal withholding interval', () => {
    const caution = [profile.safetyNotes, profile.safety, ...profile.contraindications].join(' ')
    expect(caution).not.toMatch(/(?:discontinue|stop|hold|pause|wait)\s+(?:biotin\s+)?(?:at least\s+)?\d+\s*(?:hours?|days?)\b/i)
    expect(caution).not.toMatch(/\b48\s*hours?\b/i)
  })

  it('preserves assay-specific warnings and clinician/laboratory coordination', () => {
    const caution = [profile.safetyNotes, profile.safety, ...profile.contraindications].join(' ').toLowerCase()
    expect(caution).toContain('troponin')
    expect(caution).toContain('thyroid')
    expect(caution).toContain('assay')
    expect(caution).toContain('laboratory')
    expect(caution).toContain('biotin')
    expect(caution).toContain('clinical urgency')
  })
})

import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const PAGE = path.join(process.cwd(), 'app/guides/anxiety/best-adaptogens-for-stress/page.tsx')

function source() {
  return fs.readFileSync(PAGE, 'utf8').replace(/\s+/g, ' ')
}

describe('adaptogens for stress evidence calibration', () => {
  it('anchors the comparison to auditable current human evidence', () => {
    const text = source()

    for (const pmid of ['41906501', '39348746', '19016404', '36185698', '23740477']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/Nine RCTs \/ 558 participants/i)
    expect(text).toMatch(/60 adults ages 20[–-]55.*stress-related fatigue/i)
    expect(text).toMatch(/100 adults.*stress/i)
    expect(text).toMatch(/144 participants/i)
    expect(text).toContain('dateModified="2026-08-22"')
  })

  it('does not restore mechanism-first rankings, fixed dosing, or prescriptive rotation language', () => {
    const text = source()

    expect(text).not.toMatch(/Fastest useful choice/i)
    expect(text).not.toMatch(/If you only try one thing/i)
    expect(text).not.toMatch(/HPA dysregulation/i)
    expect(text).not.toMatch(/Use an adaptogen rotation/i)
    expect(text).not.toMatch(/adaptogen rotation protocol/i)
    expect(text).not.toMatch(/stacking adaptogens: principles/i)
    expect(text).toMatch(/separate evidence|separate trials|combination/i)
  })

  it('keeps holy basil preliminary and preserves industry context', () => {
    const text = source()

    expect(text).toContain('36185698')
    expect(text).toMatch(/specific.*extract|branded extract/i)
    expect(text).toMatch(/industry funded|industry-funded/i)
    expect(text).toMatch(/preliminary|replication/i)
  })

  it('surfaces negative eleuthero evidence instead of promoting a universal adaptogen winner', () => {
    const text = source()

    expect(text).toContain('23740477')
    expect(text).toMatch(/not superior|no.*superior/i)
    expect(text).not.toMatch(/500[–-]2000 mg dried fruit extract/i)
  })

  it('states the combination-evidence boundary instead of prescribing adaptogen stacks', () => {
    const text = source()

    expect(text).toMatch(/does not prove|do not prove/i)
    expect(text).toMatch(/combination|multi-ingredient|stack/i)
    expect(text).not.toMatch(/recommended adaptogen stack/i)
  })

  it('preserves source-backed ingredient-specific safety boundaries', () => {
    const text = source()

    for (const pmid of ['25413939', '8880292', '30000865', '12580002']) {
      expect(text).toContain(pmid)
    }
    expect(text).toMatch(/paroxetine/i)
    expect(text).toMatch(/glucose/i)
    expect(text).toMatch(/digoxin/i)
  })

  it('keeps broad-page monetization neutral and routes readers to evidence', () => {
    const text = source()

    expect(text).not.toContain('RecommendationSection')
    expect(text).not.toContain('getRevenueProductSet')
    expect(text).toContain('/guides/herbs/ashwagandha/')
    expect(text).toContain('/herbs/rhodiola/')
    expect(text).toContain('<EmailCapture')
  })
})

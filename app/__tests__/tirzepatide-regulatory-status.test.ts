import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const readGuide = () => fs
  .readFileSync(path.join(process.cwd(), 'app/guides/other/tirzepatide/page.tsx'), 'utf8')
  .replace(/\s+/g, ' ')

describe('tirzepatide evidence and regulatory status', () => {
  it('does not describe SURPASS-CVOT as an ongoing evidence gap', () => {
    const page = readGuide()

    expect(page).toContain('SURPASS-CVOT is no longer an ongoing evidence gap')
    expect(page).toMatch(/noninferior to dulaglutide/i)
    expect(page).toMatch(/superiority over dulaglutide was not established/i)
    expect(page).not.toMatch(/cardiovascular outcomes data .*ongoing trials/i)
  })

  it('keeps 503A and 503B rules distinct and the 2026 bulks action provisional', () => {
    const page = readGuide()

    expect(page).toContain('Section 503A pharmacies and physicians')
    expect(page).toContain('Section 503B outsourcing facilities')
    expect(page).toContain('FDA proposed on April 30, 2026 to exclude tirzepatide')
    expect(page).not.toMatch(/generally requires individualized physician documentation of clinical necessity/i)
  })

  it('uses direct obesity head-to-head evidence rather than vague comparative claims', () => {
    const page = readGuide()

    expect(page).toContain('SURMOUNT-5, published in 2025')
    expect(page).toMatch(/greater mean weight reduction with maximum tolerated tirzepatide/i)
    expect(page).toContain('about −20.9% with the 15 mg dose')
  })
})

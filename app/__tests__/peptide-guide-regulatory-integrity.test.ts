import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const ARTICLE = path.join(process.cwd(), 'content/articles/peptides-research-guide.md')

function source() {
  return fs.readFileSync(ARTICLE, 'utf8').replace(/\s+/g, ' ')
}

describe('peptide research guide regulatory integrity', () => {
  it('separates collagen, approved drugs, compounded drugs, and experimental peptides', () => {
    const text = source()

    expect(text).toContain('Food-derived collagen peptides')
    expect(text).toContain('FDA-approved peptide drugs')
    expect(text).toContain('Compounded peptide-containing drugs')
    expect(text).toContain('Experimental or unapproved peptides')
    expect(text).toContain('compounded drugs are not FDA-approved')
  })

  it('does not use misleading off-label or research-chemical legal-status shortcuts', () => {
    const text = source()

    expect(text).not.toMatch(/not FDA-approved for off-label use/i)
    expect(text).not.toMatch(/sold legally only as research chemicals/i)
    expect(text).not.toMatch(/regulatory status as a research chemical only/i)
    expect(text).not.toMatch(/established clinical records for specific conditions/i)
    expect(text).not.toMatch(/legitimate clinical applications in medically diagnosed GH deficiency/i)
  })

  it('keeps current FDA safety uncertainty visible for high-risk peptide claims', () => {
    const text = source()

    expect(text).toMatch(/BPC-157.*no or only limited safety information/i)
    expect(text).toMatch(/TB-500.*not identified human exposure data/i)
    expect(text).toMatch(/ipamorelin.*serious adverse events/i)
    expect(text).toMatch(/CJC-1295.*limited clinical data/i)
    expect(text).toMatch(/Compounded drugs are not FDA-approved/i)
  })

  it('prevents protocolization of experimental peptides', () => {
    const text = source()

    expect(text).toContain('does not provide injection instructions, reconstitution instructions, cycle schedules, stacks, or personal dosing protocols')
    expect(text).not.toMatch(/ipamorelin \+ CJC-1295.*protocol/i)
    expect(text).not.toMatch(/BPC-157.*therapeutic range/i)
  })

  it('keeps collagen trial doses as study context rather than universal dosing advice', () => {
    const text = source()

    expect(text).toContain('Trial doses are **study context, not universal personal dosing instructions**')
    expect(text).not.toMatch(/For any individual interested in connective tissue health.*5[–-]15 g\/day/i)
    expect(text).not.toMatch(/Adding vitamin C \(500[–-]1000 mg\).*enhances/i)
  })
})

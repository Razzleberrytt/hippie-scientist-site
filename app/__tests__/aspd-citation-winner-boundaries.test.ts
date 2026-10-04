import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const aspd = fs.readFileSync(
  path.join(process.cwd(), 'app/guides/mental-health/antisocial-personality-disorder/page.tsx'),
  'utf8',
)

describe('ASPD citation-winner diagnostic boundaries', () => {
  it('protects canonical identity, diagnostic intent, and early direct answer', () => {
    expect(aspd).toMatch(/export const metadata: Metadata = \{\s*title: 'ASPD Diagnosis: Criteria, Conduct Disorder & Assessment'/)
    expect(aspd).toContain("alternates: { canonical: '/guides/mental-health/antisocial-personality-disorder/' }")
    expect(aspd).toContain('How is ASPD diagnosed?')
    expect(aspd.indexOf('id="quick-answer"')).toBeGreaterThan(-1)
    expect(aspd.indexOf('id="quick-answer"')).toBeLessThan(aspd.indexOf('id="criteria"'))
  })

  it('keeps the adult-only and pre-15 conduct-disorder requirements explicit', () => {
    expect(aspd).toContain('DSM-5-TR diagnosis is adult-only:')
    expect(aspd).toContain('there must be evidence of conduct disorder with onset before age 15')
    expect(aspd).toContain('Adult harmful or criminal behavior alone is not sufficient')
  })

  it('keeps the page out of self-test territory and preserves differential diagnosis', () => {
    expect(aspd).toContain('<strong>This is not a self-test.</strong>')
    expect(aspd).toContain('Retrospective developmental history, context, impairment, comorbidity, collateral information and diagnostic alternatives materially affect the assessment')
    expect(aspd).toContain('Differential diagnosis: similar behavior can come from different causes')
    expect(aspd).toContain('An online “sociopath test”')
  })

  it('protects the ASPD, psychopathy, and sociopathy distinction', () => {
    expect(aspd).toContain('ASPD, psychopathy and sociopathy are not synonyms')
    expect(aspd).toContain('ASPD ≠ psychopathy ≠ “bad person.”')
    expect(aspd).toContain('Sociopathy</strong> is not a current formal DSM-5-TR or ICD-11 diagnosis')
  })

  it('protects non-deterministic violence framing and behavior-first immediate safety', () => {
    expect(aspd).toContain('ASPD is associated with higher average violence risk, but diagnosis is not a prediction')
    expect(aspd).toContain('They cannot tell you whether one specific person will be violent')
    expect(aspd).toContain('<strong>Behavior outranks diagnosis for immediate safety.</strong>')
  })
})

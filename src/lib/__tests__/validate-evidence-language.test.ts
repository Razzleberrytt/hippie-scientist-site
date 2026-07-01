import { describe, it, expect } from 'vitest'
import { auditRecord } from '../../../scripts/ci/validate-evidence-language.mjs'

interface AuditFinding {
  type: 'critical' | 'warning'
  dataset: string
  slug: string
  field?: string
  value?: string
  reason: string
}

function runAuditRecord(record: any): AuditFinding[] {
  return auditRecord(record) as AuditFinding[]
}

describe('validate-evidence-language auditRecord', () => {
  it('should flag empty summary and description as critical error', () => {
    const record = {
      slug: 'test-empty',
      summary: '',
      description: '',
      evidence_tier: 'Strong Human Evidence',
      indexability_status: 'PUBLISH',
    }
    const findings = runAuditRecord(record)
    expect(findings).toHaveLength(1)
    expect(findings[0].type).toBe('critical')
    expect(findings[0].reason).toContain('empty')
  })

  it('should flag placeholder keywords as critical errors', () => {
    const record = {
      slug: 'test-placeholder',
      summary: 'This has a todo item here.',
      description: 'And some tbd details.',
      evidence_tier: 'Strong Human Evidence'
    }
    const findings = runAuditRecord(record)
    expect(findings.some(f => f.type === 'critical' && f.value === 'todo')).toBe(true)
    expect(findings.some(f => f.type === 'critical' && f.value === 'tbd')).toBe(true)
  })

  it('should not flag substrings of placeholders like nan in chemical names', () => {
    const record = {
      slug: 'anandamide',
      summary: 'Anandamide is a cannabinoid receptor agonist that may support mood.',
      description: 'It does not contain the prohibited word.',
      evidence_tier: 'Limited Human Evidence'
    }
    const findings = runAuditRecord(record)
    const criticals = findings.filter(f => f.type === 'critical')
    expect(criticals).toHaveLength(0)
  })

  it('should flag direct prohibited medical/disease claims as critical', () => {
    const record = {
      slug: 'test-medical',
      summary: 'This herb cures cancer and prevents diabetes.',
      description: 'And is a treatment of depression.',
      evidence_tier: 'Strong Human Evidence'
    }
    const findings = runAuditRecord(record)
    const criticalReasons = findings.filter(f => f.type === 'critical').map(f => f.reason)
    expect(criticalReasons.some(r => r.includes('direct cure claim'))).toBe(true)
    expect(criticalReasons.some(r => r.includes('disease prevention claim'))).toBe(true)
    expect(criticalReasons.some(r => r.includes('disease treatment claim'))).toBe(true)
  })

  it('should not flag cure-all as a direct cure claim', () => {
    const record = {
      slug: 'test-cure-all',
      summary: 'Moringa is a general adaptogen rather than a superfood cure-all.',
      description: 'No other prohibited claims.',
      evidence_tier: 'Strong Human Evidence'
    }
    const findings = runAuditRecord(record)
    const criticals = findings.filter(f => f.type === 'critical')
    expect(criticals).toHaveLength(0)
  })

  it('should flag definitive claims used with weak evidence as warning', () => {
    const record = {
      slug: 'test-definitive-weak',
      summary: 'This compound is proven to reduce stress.',
      description: 'No other claims.',
      evidence_tier: 'Mechanistic Evidence'
    }
    const findings = runAuditRecord(record)
    expect(findings.some(f => f.type === 'warning' && f.reason.includes('Definitive claim term'))).toBe(true)
  })

  it('should flag lack of speculative qualifiers with weak evidence as warning', () => {
    const record = {
      slug: 'test-speculative-missing',
      summary: 'This herb influences receptor pathways directly.',
      description: 'No speculative words used.',
      evidence_tier: 'Mechanistic Evidence'
    }
    const findings = runAuditRecord(record)
    expect(findings.some(f => f.type === 'warning' && f.reason.includes('Lacks speculative framing'))).toBe(true)
  })

  it('should flag human clinical references used with preclinical-only evidence as warning', () => {
    const record = {
      slug: 'test-preclinical-clinical',
      summary: 'Preclinical study showing receptor binding. However, human clinical trials show improvement.',
      description: 'Testing bounds.',
      evidence_tier: 'Mechanistic Evidence'
    }
    const findings = runAuditRecord(record)
    expect(findings.some(f => f.type === 'warning' && f.reason.includes('Clinical/human reference'))).toBe(true)
  })
})

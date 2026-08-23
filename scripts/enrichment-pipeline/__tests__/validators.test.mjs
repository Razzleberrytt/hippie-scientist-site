import { describe, expect, it } from 'vitest'
import { normalizeCandidate } from '../lib/normalize.mjs'
import {
  SEVERITY,
  decideOverwrites,
  validateAgainstContract,
  validateAgainstProduction,
  validateCandidate,
  validateCitations,
  validateScientificIntegrity,
  verdictFor,
} from '../lib/validators.mjs'
import { validateCandidateShape } from '../lib/candidates.mjs'
import { contract, makeCanonical, makeCandidate, makeJob, publishedHerb } from './fixtures.mjs'

const canonical = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: '', keywords: '' })])

function run(candidate) {
  return validateCandidate(normalizeCandidate(candidate, contract), { contract, canonical })
}

function rules(findings) {
  return findings.map((f) => f.rule)
}

describe('candidate scope', () => {
  it('rejects a change to a field the job did not request', () => {
    const candidate = makeCandidate({
      changes: [
        makeCandidate().changes[0],
        {
          field: 'keywords',
          operation: 'set',
          current_value: '',
          proposed_value: 'ashwagandha',
          confidence: 'high',
          source_ids: ['powo-1'],
          rationale: 'synonym',
        },
      ],
    })
    expect(() => validateCandidateShape(candidate, { job: makeJob() })).toThrow(
      /only answer the fields they were asked for/,
    )
  })

  it('accepts a no-op answer with no proposed value', () => {
    const candidate = makeCandidate({
      changes: [{ field: 'latin_name', operation: 'no-op', current_value: '', rationale: 'nothing found' }],
      sources: [],
    })
    expect(validateCandidateShape(candidate, { job: makeJob() })).toBe(true)
  })

  it('requires every change to reference a declared source', () => {
    const candidate = makeCandidate()
    candidate.changes[0].source_ids = ['ghost']
    expect(() => validateCandidateShape(candidate)).toThrow(/unknown source "ghost"/)
  })
})

describe('contract validation', () => {
  it('accepts a well-formed candidate', () => {
    expect(run(makeCandidate()).verdict.errors).toHaveLength(0)
  })

  it('refuses to write a governance column', () => {
    const candidate = makeCandidate({
      requested_fields: ['runtime_export_decision'],
      changes: [
        {
          field: 'runtime_export_decision',
          operation: 'set',
          current_value: 'full_public_runtime',
          proposed_value: 'primary_runtime_priority',
          confidence: 'high',
          source_ids: ['powo-1'],
          rationale: 'promote',
        },
      ],
    })
    expect(rules(run(candidate).verdict.errors)).toContain('locked-field')
  })

  it('refuses to write a derived column', () => {
    const candidate = makeCandidate({
      changes: [
        {
          field: 'source_count',
          operation: 'set',
          current_value: '',
          proposed_value: '7',
          confidence: 'high',
          source_ids: ['powo-1'],
          rationale: 'counted',
        },
      ],
    })
    expect(rules(run(candidate).verdict.errors)).toContain('locked-field')
  })

  it('rejects an unknown field', () => {
    const candidate = makeCandidate({
      changes: [
        {
          field: 'invented_column',
          operation: 'set',
          current_value: '',
          proposed_value: 'x',
          confidence: 'high',
          source_ids: ['powo-1'],
          rationale: 'r',
        },
      ],
    })
    expect(rules(run(candidate).verdict.errors)).toContain('unknown-field')
  })

  it('rejects a source class the field does not accept', () => {
    const candidate = makeCandidate()
    candidate.sources[0].class = 'traditional-use-monograph'
    expect(rules(run(candidate).verdict.errors)).toContain('source-class-not-accepted')
  })

  it('rejects a value that exceeds the field length limit', () => {
    const candidate = makeCandidate()
    candidate.changes[0].proposed_value = 'A'.repeat(400)
    expect(rules(run(candidate).verdict.errors)).toContain('max-length')
  })

  it('rejects an unnormalized value', () => {
    const raw = makeCandidate()
    raw.changes[0].proposed_value = '  withania   SOMNIFERA '
    const findings = validateAgainstContract(raw, contract)
    expect(rules(findings)).toContain('not-normalized')
  })

  it('rejects a field that does not apply to the entity type', () => {
    const compoundCanonical = makeCanonical([
      publishedHerb({ slug: 'fixture-herb', entity_type: 'compound', latin_name: '' }),
    ])
    const candidate = normalizeCandidate(makeCandidate({ entity: { type: 'compound', slug: 'fixture-herb', sheet: 'Entity_Master' } }), contract)
    const result = validateCandidate(candidate, { contract, canonical: compoundCanonical })
    expect(rules(result.verdict.errors)).toContain('entity-type-mismatch')
  })
})

describe('scientific integrity', () => {
  function effectsCandidate(value, sourceOverrides = {}) {
    return normalizeCandidate(
      makeCandidate({
        requested_fields: ['secondary_effects'],
        changes: [
          {
            field: 'secondary_effects',
            operation: 'set',
            current_value: '',
            proposed_value: value,
            confidence: 'high',
            source_ids: ['s1'],
            rationale: 'from the cited trial',
          },
        ],
        sources: [
          {
            id: 's1',
            class: 'randomized-human-trial',
            doi: '10.1234/abcd',
            title: 'A trial',
            year: 2020,
            study_type: 'RCT',
            ...sourceOverrides,
          },
        ],
      }),
      contract,
    )
  }

  it('blocks absolute certainty language', () => {
    const findings = validateScientificIntegrity(effectsCandidate('always improves sleep'), contract)
    expect(rules(findings)).toContain('certainty-language')
  })

  it('blocks a clinical claim supported only by mechanistic work', () => {
    const candidate = effectsCandidate('treats anxiety', {
      class: 'preclinical-mechanistic-study',
      study_type: 'in vitro',
    })
    expect(rules(validateScientificIntegrity(candidate, contract))).toContain(
      'clinical-claim-without-human-evidence',
    )
  })

  it('requires preclinical-only support to be labelled as preclinical', () => {
    const candidate = effectsCandidate('treats inflammation', {
      class: 'preclinical-mechanistic-study',
      study_type: 'in vivo animal',
    })
    expect(rules(validateScientificIntegrity(candidate, contract))).toContain('unlabelled-preclinical')
  })

  it('allows a plainly described effect backed by a human trial', () => {
    const findings = validateScientificIntegrity(effectsCandidate('sleep quality; sleep latency'), contract)
    expect(findings.filter((f) => f.severity === SEVERITY.ERROR)).toHaveLength(0)
  })

  it('routes contradictory evidence to review and retains negative findings', () => {
    const candidate = effectsCandidate('sleep quality')
    candidate.changes[0].contradicts_existing_evidence = true
    candidate.changes[0].negative_or_null_finding = true
    const findings = validateScientificIntegrity(candidate, contract)
    expect(rules(findings)).toContain('contradictory-evidence')
    expect(rules(findings)).toContain('negative-finding-retained')
    expect(findings.find((f) => f.rule === 'contradictory-evidence').severity).toBe(SEVERITY.REVIEW)
  })
})

describe('citation integrity', () => {
  it('rejects a source with no resolvable identity', () => {
    const candidate = makeCandidate()
    candidate.sources[0] = { id: 'powo-1', class: 'reference-database-authority', title: 'Untraceable' }
    expect(rules(validateCitations(normalizeCandidate(candidate, contract), contract))).toContain(
      'unidentified-source',
    )
  })

  it('rejects two entries for the same source', () => {
    const candidate = makeCandidate()
    candidate.sources.push({ ...candidate.sources[0], id: 'powo-2' })
    expect(rules(validateCitations(normalizeCandidate(candidate, contract), contract))).toContain(
      'duplicate-source',
    )
  })

  it('requires a DOI or PMID for classes that mandate an identifier', () => {
    const candidate = normalizeCandidate(
      makeCandidate({
        sources: [
          { id: 's1', class: 'randomized-human-trial', url: 'https://example.com/paper', title: 'T', year: 2020 },
        ],
        changes: [{ ...makeCandidate().changes[0], source_ids: ['s1'] }],
      }),
      contract,
    )
    expect(rules(validateCitations(candidate, contract))).toContain('identifier-required')
  })

  it('rejects an authority citation on a host that is not an authority', () => {
    const candidate = makeCandidate()
    candidate.sources[0].url = 'https://random-blog.example/plants'
    expect(rules(validateCitations(normalizeCandidate(candidate, contract), contract))).toContain(
      'non-authority-host',
    )
  })

  it('accepts a nomenclatural authority URL', () => {
    const findings = validateCitations(normalizeCandidate(makeCandidate(), contract), contract)
    expect(findings.filter((f) => f.severity === SEVERITY.ERROR)).toHaveLength(0)
  })
})

describe('production integrity', () => {
  it('rejects a candidate for an entity that does not exist', () => {
    const candidate = normalizeCandidate(
      makeCandidate({ entity: { type: 'herb', slug: 'not-there', sheet: 'Entity_Master' } }),
      contract,
    )
    expect(rules(validateAgainstProduction(candidate, contract, canonical))).toContain('unknown-entity')
  })

  it('rejects a candidate whose observed value no longer matches the workbook', () => {
    const moved = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Already set' })])
    const candidate = normalizeCandidate(makeCandidate(), contract)
    expect(rules(validateAgainstProduction(candidate, contract, moved))).toContain('stale-candidate')
  })

  it('routes a value already held by another entity to review, not to import', () => {
    // lions-mane and hericium-erinaceus are the same organism under two slugs.
    const shared = makeCanonical([
      publishedHerb({ slug: 'fixture-herb', latin_name: '' }),
      publishedHerb({ slug: 'other-herb', latin_name: 'Withania somnifera' }),
    ])
    const result = validateCandidate(normalizeCandidate(makeCandidate(), contract), {
      contract,
      canonical: shared,
    })
    const shares = result.findings.filter((f) => f.rule === 'shared-value')
    expect(shares).toHaveLength(1)
    expect(shares[0].severity).toBe(SEVERITY.REVIEW)
    expect(shares[0].message).toMatch(/other-herb/)
    expect(result.verdict.importable).toBe(false)
    expect(result.verdict.status).toBe('needs_review')
  })

  it('does not flag a shared value when no other entity holds it', () => {
    const result = validateCandidate(normalizeCandidate(makeCandidate(), contract), { contract, canonical })
    expect(result.findings.filter((f) => f.rule === 'shared-value')).toHaveLength(0)
  })

  it('rejects any import against a duplicated slug', () => {
    const dupes = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: '' })], {
      duplicateSlugs: [{ slug: 'fixture-herb', rows: [2, 9] }],
    })
    expect(rules(validateAgainstProduction(normalizeCandidate(makeCandidate(), contract), contract, dupes))).toContain(
      'duplicate-slug',
    )
  })
})

describe('overwrite protection', () => {
  it('fills an empty cell', () => {
    const [decision] = decideOverwrites(normalizeCandidate(makeCandidate(), contract), contract, canonical)
    expect(decision.decision).toBe('apply')
  })

  it('treats an equivalent existing value as a no-op', () => {
    const filled = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Withania somnifera' })])
    const candidate = normalizeCandidate(makeCandidate(), contract)
    candidate.changes[0].current_value = 'Withania somnifera'
    const [decision] = decideOverwrites(candidate, contract, filled)
    expect(decision.decision).toBe('no-op')
  })

  it('routes a replacement of a populated fill-only cell to review', () => {
    const filled = makeCanonical([publishedHerb({ slug: 'fixture-herb', latin_name: 'Something else' })])
    const [decision] = decideOverwrites(normalizeCandidate(makeCandidate(), contract), contract, filled)
    expect(decision.decision).toBe('review')
    expect(decision.reason).toMatch(/already populated/)
  })

  it('always routes a manual-review field to review, even when the cell is empty', () => {
    const empty = makeCanonical([publishedHerb({ slug: 'fixture-herb', contraindications_or_flags: '' })])
    const candidate = normalizeCandidate(
      makeCandidate({
        requested_fields: ['contraindications_or_flags'],
        changes: [
          {
            field: 'contraindications_or_flags',
            operation: 'set',
            current_value: '',
            proposed_value: 'Pregnancy',
            confidence: 'high',
            source_ids: ['powo-1'],
            rationale: 'monograph',
          },
        ],
      }),
      contract,
    )
    const [decision] = decideOverwrites(candidate, contract, empty)
    expect(decision.decision).toBe('review')
  })

  it('routes an automatic field flagged requires_human_review to review', () => {
    const candidate = normalizeCandidate(
      makeCandidate({
        requested_fields: ['description'],
        changes: [
          {
            field: 'description',
            operation: 'set',
            current_value: '',
            proposed_value: 'A description of the herb.',
            confidence: 'high',
            source_ids: ['powo-1'],
            rationale: 'r',
          },
        ],
      }),
      contract,
    )
    const [decision] = decideOverwrites(candidate, contract, canonical)
    expect(decision.decision).toBe('review')
  })
})

describe('verdict', () => {
  it('is importable only with zero errors and no review', () => {
    const verdict = verdictFor({
      findings: [],
      decisions: [{ field: 'latin_name', decision: 'apply' }],
    })
    expect(verdict.status).toBe('validated')
    expect(verdict.importable).toBe(true)
  })

  it('is never importable when any error is present', () => {
    const verdict = verdictFor({
      findings: [{ severity: SEVERITY.ERROR, rule: 'x', message: 'm' }],
      decisions: [{ field: 'latin_name', decision: 'apply' }],
    })
    expect(verdict.importable).toBe(false)
    expect(verdict.status).toBe('rejected')
  })

  it('is never importable when a change routes to review', () => {
    const verdict = verdictFor({
      findings: [],
      decisions: [
        { field: 'latin_name', decision: 'apply' },
        { field: 'description', decision: 'review' },
      ],
    })
    expect(verdict.importable).toBe(false)
    expect(verdict.status).toBe('needs_review')
  })

  it('reports a candidate with nothing to apply as a no-op', () => {
    const verdict = verdictFor({ findings: [], decisions: [{ field: 'latin_name', decision: 'no-op' }] })
    expect(verdict.status).toBe('no_op')
    expect(verdict.importable).toBe(false)
  })
})

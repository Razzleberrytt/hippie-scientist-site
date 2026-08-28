import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const candidates = JSON.parse(fs.readFileSync(path.join(root, 'ops/source-candidates.json'), 'utf8'))
const registry = JSON.parse(fs.readFileSync(path.join(root, 'public/data/source-registry.json'), 'utf8'))
const reconciliations = JSON.parse(
  fs.readFileSync(path.join(root, 'ops/source-candidate-promotion-reconciliations.json'), 'utf8'),
)

const reconciliationByCandidate = new Map(reconciliations.map(row => [row.candidateSourceId, row]))

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}

function hasRegistryIdentity(candidate) {
  const doi = normalize(candidate.doi)
  const pmid = normalize(candidate.pmid)
  const url = normalize(candidate.canonicalUrl).replace(/\/+$/, '')
  return registry.some(source => {
    if (!source.active) return false
    if (doi && normalize(source.doi) === doi) return true
    if (pmid && normalize(source.pmid) === pmid) return true
    if (url && normalize(source.canonicalUrl).replace(/\/+$/, '') === url) return true
    return false
  })
}

function claimsCompletedPromotion(candidate) {
  return /promoted to source registry/i.test(candidate.approvalNotes || '')
}

function effectivePromotionState(candidate) {
  if (!claimsCompletedPromotion(candidate)) return 'not_claimed'
  if (hasRegistryIdentity(candidate)) return 'promoted'
  const reconciliation = reconciliationByCandidate.get(candidate.candidateSourceId)
  if (reconciliation?.correctedPromotionState === 'approved_not_promoted') return 'approved_not_promoted'
  return 'invalid_stale_promotion_claim'
}

describe('source-candidate promotion provenance fidelity', () => {
  it('fails closed when a completed-promotion claim lacks registry identity or an explicit reconciliation', () => {
    const invalid = candidates
      .filter(claimsCompletedPromotion)
      .filter(candidate => effectivePromotionState(candidate) === 'invalid_stale_promotion_claim')
      .map(candidate => candidate.candidateSourceId)

    expect(invalid, `Stale promotion claims without canonical registry identity: ${invalid.join(', ')}`).toEqual([])
  })

  it('keeps reconciliations anchor-bound and prevents invented registry authority', () => {
    for (const reconciliation of reconciliations) {
      const candidate = candidates.find(row => row.candidateSourceId === reconciliation.candidateSourceId)
      expect(candidate, reconciliation.candidateSourceId).toBeTruthy()
      expect(normalize(reconciliation.doi)).toBe(normalize(candidate.doi))
      expect(normalize(reconciliation.pmid)).toBe(normalize(candidate.pmid))
      expect(reconciliation.correctedPromotionState).toBe('approved_not_promoted')
      expect(hasRegistryIdentity(candidate)).toBe(false)
      expect(reconciliation.effectiveApprovalNote).toMatch(/no canonical source-registry entry is present/i)
    }
  })

  it('preserves the Pedicularis paper as preclinical-only evidence', () => {
    const candidate = candidates.find(row => row.candidateSourceId === 'cand_pedicularis-chemotaxonomic-2021')
    const reconciliation = reconciliationByCandidate.get('cand_pedicularis-chemotaxonomic-2021')

    expect(candidate?.doi).toBe('10.1002/jemt.23847')
    expect(candidate?.pmid).toBe('34077585')
    expect(candidate?.evidenceClass).toBe('preclinical-mechanistic')
    expect(candidate?.studyDesign).toBe('in-vitro')
    expect(candidate?.publicationStatus).toBe('published')
    expect(reconciliation?.evidenceBoundary).toMatch(/not human efficacy evidence/i)
    expect(reconciliation?.evidenceBoundary).toMatch(/not consumer dosing authority/i)
  })
})

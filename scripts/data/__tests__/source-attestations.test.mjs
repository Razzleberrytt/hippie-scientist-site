import { execFileSync } from 'node:child_process'
import { describe, expect, it } from 'vitest'

/**
 * These tests guard the two properties that make the pre-fill safe to use:
 * a draft can never become a registration on its own, and no field is ever
 * invented. Counts are expected to move as the queue is worked through, so
 * nothing here pins one.
 */
function runPrepare() {
  const stdout = execFileSync(process.execPath, ['scripts/data/prepare-source-attestations.mjs', '--json'], {
    cwd: process.cwd(),
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  })
  return JSON.parse(stdout)
}

const result = runPrepare()

describe('source attestation drafts', () => {
  it('actually has drafts to assert on', () => {
    // Every other test in this file is a loop over result.drafts. If the
    // prepare step ever emitted nothing — a moved cache path, an empty queue —
    // all of them would pass vacuously and the guard would be gone without a
    // single red test. This is the tripwire for that.
    expect(result.drafts.length).toBeGreaterThan(0)
    expect(result.summary.drafts).toBe(result.drafts.length)
  })

  it('leaves every attestation field blank, so no draft is schema-valid', () => {
    // reviewer, reviewedAt and reliabilityTier are required by
    // source-registry.schema.json. Leaving them null is what stops a generated
    // draft from being droppable into the registry as-is: the act of
    // attesting is a person's, and the schema refuses anything less.
    for (const { draft } of result.drafts) {
      expect(draft.reviewer).toBeNull()
      expect(draft.reviewedAt).toBeNull()
      expect(draft.reliabilityTier).toBeNull()
      expect(draft.active).toBe(false)
    }
  })

  it('never promotes a PubMed "Review" to a systematic review', () => {
    // The registry treats systematic and narrative evidence differently, and
    // PubMed's Review type covers both. Guessing here would upgrade a
    // narrative review into systematic evidence behind a health claim.
    for (const entry of result.drafts) {
      const types = entry.publicationTypes
      if (types.includes('Review') && !types.includes('Systematic Review') && !types.includes('Meta-Analysis')) {
        expect(entry.draft.studyDesign).not.toBe('systematic-review')
        expect(entry.draft.studyDesign).not.toBe('meta-analysis')
      }
    }
  })

  it('assigns a study design only when PubMed named one', () => {
    for (const entry of result.drafts) {
      if (entry.draft.studyDesign) {
        expect(entry.designBasis).toBeTruthy()
        expect(entry.publicationTypes).toContain(entry.designBasis)
      }
    }
  })

  it('flags non-research items instead of classifying them', () => {
    // A News item or Editorial cited as evidence is a data-quality problem to
    // surface, not a source to type as a journal article and move on from.
    for (const entry of result.drafts) {
      if (entry.nonResearchTypes.length) {
        expect(entry.draft.studyDesign).toBeNull()
        expect(entry.draft.sourceClass).toBeNull()
        expect(entry.draft.evidenceClass).toBeNull()
      }
    }
  })

  it('derives sourceId and canonicalUrl from the PMID it claims', () => {
    // A draft whose URL points at a different paper than its PMID would attach
    // the wrong study to a claim, which is the exact error the transcription
    // step was risking in the first place.
    for (const { draft } of result.drafts) {
      expect(draft.sourceId).toBe(`src_pmid-${draft.pmid}`)
      expect(draft.canonicalUrl).toBe(`https://pubmed.ncbi.nlm.nih.gov/${draft.pmid}/`)
      expect(draft.pmid).toMatch(/^[1-9][0-9]{4,8}$/)
    }
  })

  it('records where a derived identifier came from', () => {
    // A PMID recovered from a cited PMC id was never written on the profile.
    // A reviewer checking the draft against the source needs to know that, or
    // the identifier looks like it came from somewhere it did not.
    for (const entry of result.drafts) {
      if (entry.resolvedFromPmcId) {
        expect(entry.resolvedFromPmcId).toMatch(/^PMC\d+$/)
      }
    }
    expect(result.summary.recoveredFromPmcId).toBe(
      result.drafts.filter((entry) => entry.resolvedFromPmcId).length,
    )
  })

  it('does not touch the network unless asked', () => {
    // The default run is what CI and these tests execute. If it could fetch,
    // results would depend on NCBI being reachable and on whatever the queue
    // happened to cite that day.
    expect(result.summary.networkResolution).toBe(false)
  })

  it('emits no draft for a source that is already registered', () => {
    const drafted = new Set(result.drafts.map((entry) => entry.draft.pmid))
    for (const entry of result.alreadyClaimed) {
      expect(drafted.has(entry.pmid)).toBe(false)
    }
  })

  it('reports unresolvable candidates rather than dropping them', () => {
    // A profile citing "Garlic trials." has no identifier to draft from. That
    // is a finding — the citation cannot be verified by anyone — so it has to
    // stay visible instead of vanishing from the queue.
    expect(Array.isArray(result.candidatesWithoutIdentifier)).toBe(true)
    for (const entry of result.candidatesWithoutIdentifier) {
      expect(typeof entry.slug).toBe('string')
      expect(entry.slug.length).toBeGreaterThan(0)
    }
  })

  it('records a citation only when every part of it was retrieved', () => {
    for (const { draft } of result.drafts) {
      if (draft.citationText) {
        expect(draft.authors.length).toBeGreaterThan(0)
        expect(draft.publicationYear).toBeTruthy()
        expect(draft.citationText).toContain(String(draft.publicationYear))
      }
    }
  })
})

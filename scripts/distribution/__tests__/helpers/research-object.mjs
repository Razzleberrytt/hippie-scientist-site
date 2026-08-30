/**
 * Fixtures for canonical research objects and the packs projected from them.
 *
 * Why this exists
 * ---------------
 * The same defect happened three times in two days. A change added a field that
 * every research object must carry, updated the fixtures it could see, and
 * missed one — so an unrelated branch went red on a contract it had not touched:
 *
 *   #4606 required publicationStatus     -> broke research-distribution-claim-safety
 *   #4622 required pack/canonical parity -> broke distribution-pack-contract
 *
 * Each was repaired by hand, in the file that happened to fail. That fixes the
 * symptom: the next required field lands on the same rake, because the required
 * shape lives in three hand-maintained literals rather than in one place.
 *
 * A fixture here is not a shortcut for writing less. It is where "what a valid
 * research object must contain" is stated once, so adding a required field is a
 * single edit and no test can silently fall behind the contract.
 *
 * Using it
 * --------
 * Pass only what the test is actually asserting on. Everything else comes from
 * the defaults, and a test that does not care about publication provenance
 * should not have to name it:
 *
 *   const object = canonicalResearchObject({ evidenceType: 'preclinical' })
 *   const pack = packSourceFrom(object)
 *
 * To exercise a *missing* field, delete it explicitly. That reads as deliberate
 * where an omission would read as an oversight:
 *
 *   const invalid = canonicalResearchObject()
 *   delete invalid.publicationStatus
 */

/** A complete, valid canonical research object. */
export function canonicalResearchObject(overrides = {}) {
  return {
    id: 'fixture-research-object',
    title: 'Fixture human evidence',
    finding: 'The recorded human trial reported a mixed outcome versus control.',
    evidenceType: 'RCT',
    evidenceGrade: 'B',
    limitation: 'This fixture does not establish a universal effect.',
    sourceUrl: 'https://thehippiescientist.net/herbs/ashwagandha/',
    findingClaimId: 'clm_78af0b376bf1',
    primarySourceId: 'src_45e522e1601f',
    primarySourceUrl: 'https://doi.org/10.1002/ptr.7598',
    // Optional context fields (doseContext, populationContext, lastVerified,
    // trialCount, participants) are deliberately absent. Adding a canonical
    // field obliges the pack to carry a matching provenance receipt, so a
    // default that nobody asked for silently changes what the contract demands
    // of every test using it. Pass them where the test is about them.

    // Publication provenance. Required of every canonical research object, and
    // the pack projected from one has to repeat it exactly — see packSourceFrom.
    publicationStatus: 'published',
    publicationStatusCheckedAt: '2026-08-29',
    publicationStatusAuthorityUrl: 'https://onlinelibrary.wiley.com/doi/abs/10.1002/ptr.7598',

    ...overrides,
  }
}

/**
 * The `source` block of a distribution pack, derived from its canonical object.
 *
 * Provenance is mirrored rather than restated, because that mirroring is the
 * invariant under test: a pack may not assert a different publication state
 * than the object it projects. Writing these values out again by hand is how a
 * fixture drifts from the contract without anyone noticing.
 */
export function packSourceFrom(object, overrides = {}) {
  const sourceUrl = object.sourceUrl.endsWith('/') ? object.sourceUrl : `${object.sourceUrl}/`
  return {
    url: sourceUrl,
    title: object.title,
    findingClaimId: object.findingClaimId,
    primarySourceId: object.primarySourceId,
    primarySourceUrl: object.primarySourceUrl,
    publicationStatus: object.publicationStatus,
    publicationStatusCheckedAt: object.publicationStatusCheckedAt,
    publicationStatusAuthorityUrl: object.publicationStatusAuthorityUrl,
    ...overrides,
  }
}

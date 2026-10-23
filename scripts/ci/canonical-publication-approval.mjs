/**
 * Publication release classification for the protected merge controller.
 *
 * Owner decision (2026-10-23): there is no separate mandatory human-positive
 * approval gate. Public content still goes through the existing exact-head
 * CI, evidence, science, security, safety and controller checks. No source,
 * testimonial, comment, review, bot or signed Git tag can waive those checks.
 */

const STAGING_ONLY = [
  /^docs\/research\//u,
  /^ops\/editorial-runtime\/publication-pilots\//u,
  /^ops\/research-intake\//u,
];

const PUBLICATION_SURFACES = [
  /^content\/(?:articles|blog|learn)\//u,
  /^public\/data\//u,
  /^app\/(?:guides|herbs|compounds|learn|articles)\//u,
  /^data-sources\/herb_monograph_master\.xlsx$/u,
];

export function classifyPublicationChange(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0 ||
      changedFiles.some(file => typeof file !== 'string' || file.length === 0)) {
    return {kind: 'HOLD', reason: 'changed file list unavailable/invalid'};
  }
  const publicFiles = changedFiles.filter(file => PUBLICATION_SURFACES.some(re => re.test(file)));
  if (publicFiles.length) {
    return {
      kind: 'AUTOMATED_PUBLICATION',
      reason: 'public-content release requires existing exact-head CI, evidence, safety and controller validation, not a separate human signoff',
      publicFiles,
    };
  }
  if (changedFiles.every(file => STAGING_ONLY.some(re => re.test(file)))) {
    return {kind: 'AUTO_STAGING', reason: 'research/editorial staging; no public publication credited'};
  }
  return {kind: 'EXISTING_GATES', reason: 'existing release governance applies'};
}

/**
 * Admission to the EXISTING release gates is not approval of any claim.
 * The controller independently rejects held/draft/fork/stale/conflicted PRs
 * and requires all applicable exact-head checks to succeed before merging.
 */
export function assessPublicationApproval({changedFiles}) {
  const classification = classifyPublicationChange(changedFiles);
  if (classification.kind === 'HOLD') return {allowed: false, ...classification};
  return {allowed: true, ...classification};
}

/**
 * No human-positive approval evidence is required or accepted. Do not page
 * through comments/reviews/tags to infer authorization, and do not create an
 * unreviewable mandatory dependency on API provenance.
 */
export async function loadPublicationApprovalEvidence() {
  return {comments: [], reviews: [], signedTagProof: null};
}

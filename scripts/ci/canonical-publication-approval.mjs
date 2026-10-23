/**
 * Publication admission policy — automated validation, no mandatory human sign-off.
 *
 * The serialized protected merge controller is authoritative for exact-head CI,
 * dependency/security audits, scientific/content checks, branch freshness,
 * merge conflicts, explicit hold labels, and final deployment handoff.
 * This classifier does not itself authorize a merge or scientific claim.
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
    return { kind: 'HOLD', reason: 'changed file list unavailable/invalid' };
  }
  const publicFiles = changedFiles.filter(path => PUBLICATION_SURFACES.some(re => re.test(path)));
  if (publicFiles.length) {
    return {
      kind: 'AUTOMATED_PUBLICATION',
      reason: 'public evidence/content change: must pass existing exact-head scientific, security and release gates',
      publicFiles,
    };
  }
  if (changedFiles.every(path => STAGING_ONLY.some(re => re.test(path)))) {
    return { kind: 'AUTO_STAGING', reason: 'only inert research/editorial staging files changed' };
  }
  return { kind: 'EXISTING_GATES', reason: 'existing controller and workflow checks apply' };
}

/**
 * No mandatory owner/human positive approval exists. No comment, REST review,
 * signed tag, label, or bot-generated message can substitute for green CI or
 * waive the existing controller's scientific and security safeguards.
 *
 * Explicit hold-merge/do-not-merge/manual-merge labels, drafts, current-base
 * checks, branch protection and failed workflows are handled by the controller.
 */
export function assessPublicationApproval({ changedFiles }) {
  const classification = classifyPublicationChange(changedFiles);
  return { allowed: classification.kind !== 'HOLD', ...classification };
}

/** Human-approval evidence is no longer read; avoids extra API calls per PR. */
export async function loadPublicationApprovalEvidence() {
  return { comments: [], reviews: [], signedTagProof: null };
}

/**
 * Canonical, conservative PUBLICATION approval classification.
 *
 * This is not a new biomedical authority.  Only review-only intake can be
 * automatically cleared by this policy; public clinical surfaces require an
 * explicit trusted owner approval for the exact PR head.
 *
 * Used by the pre-merge monitor AND the serialized merge controller.  The
 * controller still owns scientific, workflow, source and exact-base checks.
 */

const STAGING_ONLY = [
  /^docs\/research\//u,
  /^ops\/editorial-runtime\/publication-pilots\//u,
  /^ops\/research-intake\//u,
];

// All direct clinical/publication channels, including generated medical data.
// Never auto-approve these solely because a source ID, CI, or AI attestation is green.
const PUBLICATION_SURFACES = [
  /^content\/(?:articles|blog|learn)\//u,
  /^public\/data\/(?:herbs-detail|compounds-detail|ai-entities|claims(?:\.|\/)|herbs\.json$|compounds\.json$|runtime-enrichment|publication-manifest)/u,
  /^app\/(?:guides|herbs|compounds|learn|articles)\//u,
  /^data-sources\/herb_monograph_master\.xlsx$/u,
];

// A staging-only PR can be auto-cleared as RESEARCH DOCUMENTATION.  It never
// grants runtime approval or permission to expose the draft as a public route.
export function classifyPublicationChange(changedFiles) {
  if (!Array.isArray(changedFiles) || changedFiles.length === 0 ||
    changedFiles.some(file => typeof file !== 'string' || file.length === 0)) {
    return { kind: 'HOLD', reason: 'changed file list unavailable/invalid' };
  }
  const publicFiles = changedFiles.filter(path => PUBLICATION_SURFACES.some(re => re.test(path)));
  if (publicFiles.length) {
    return { kind: 'HUMAN_PUBLICATION', reason: 'public clinical content or governed evidence changed', publicFiles };
  }
  if (changedFiles.every(path => STAGING_ONLY.some(re => re.test(path)))) {
    return { kind: 'AUTO_STAGING', reason: 'only inert research/editorial staging files changed' };
  }
  return { kind: 'EXISTING_GATES', reason: 'not eligible for new publication auto-approval; original governance unchanged' };
}

const APPROVE = /^THS-PUBLICATION-APPROVED PR=#(\d+) HEAD=([a-f0-9]{40})$/u;
const REVOKE = /^THS-PUBLICATION-REVOKED PR=#(\d+) HEAD=([a-f0-9]{40})$/u;

function ownerApprovalComments({ comments, owner, number, headSha }) {
  const events = [];
  for (const comment of comments || []) {
    if (String(comment?.user?.login || '').toLowerCase() !== owner.toLowerCase()) continue;
    if (String(comment?.user?.type || '').toLowerCase() === 'bot') continue;
    // The first line alone is the authorization. No free-form 'approve all'.
    const token = String(comment.body || '').trim().split(/\r?\n/u)[0];
    const approve = token.match(APPROVE);
    const revoke = token.match(REVOKE);
    const match = approve || revoke;
    if (!match || Number(match[1]) !== number || match[2] !== headSha) continue;
    events.push({ approved: Boolean(approve), at: Date.parse(comment.updated_at || comment.created_at || '') || 0, id: Number(comment.id || 0) });
  }
  events.sort((a,b) => a.at - b.at || a.id - b.id);
  return events.length ? events.at(-1).approved : false;
}

function ownerApprovedReview({ reviews, owner, headSha }) {
  const events = (reviews || [])
    .filter(review => String(review?.user?.login || '').toLowerCase() === owner.toLowerCase())
    .filter(review => String(review?.user?.type || '').toLowerCase() !== 'bot')
    .filter(review => review.commit_id === headSha)
    .filter(review => ['APPROVED','CHANGES_REQUESTED','DISMISSED'].includes(review.state))
    .sort((a,b) => (Date.parse(a.submitted_at || '') || 0) - (Date.parse(b.submitted_at || '') || 0) || Number(a.id || 0) - Number(b.id || 0));
  return events.length > 0 && events.at(-1).state === 'APPROVED';
}

/**
 * Pass REST-sourced PR, changedFiles, comments and reviews. Source verification
 * is NOT publication approval.  The base repository OWNER is the default
 * trusted publication editor; no trust can be conferred by PR body, labels,
 * workflow file, or a proposed PR-local JSON receipt.
 */
export function assessPublicationApproval({ pr, changedFiles, comments = [], reviews = [] }) {
  const classification = classifyPublicationChange(changedFiles);
  if (classification.kind === 'HOLD') return { allowed: false, ...classification };
  if (classification.kind !== 'HUMAN_PUBLICATION') {
    return { allowed: true, ...classification };
  }
  const owner = pr?.base?.repo?.owner?.login;
  const head = pr?.head?.sha;
  const number = Number(pr?.number);
  if (!owner || !/^[a-f0-9]{40}$/u.test(String(head || '')) || !Number.isSafeInteger(number) || number <= 0) {
    return { allowed: false, ...classification, reason: 'trusted repository owner or exact PR head identity unavailable' };
  }
  if (pr?.head?.repo?.full_name !== pr?.base?.repo?.full_name) {
    return { allowed: false, ...classification, reason: 'fork publication approval is not allowed' };
  }
  const approved = ownerApprovalComments({ comments, owner, number, headSha: head }) ||
    ownerApprovedReview({ reviews, owner, headSha: head });
  return {
    allowed: approved,
    ...classification,
    reason: approved
      ? 'exact-head approval from repository owner verified; existing science and release gates still apply'
      : `human publication approval missing for PR #${number} exact head ${head}: owner must post THS-PUBLICATION-APPROVED PR=#${number} HEAD=${head}`,
  };
}

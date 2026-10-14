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
  /^public\/data\//u,
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

function trustedApprovalEvents({ comments, reviews, owner, number, headSha }) {
  const events = [];
  for (const comment of comments || []) {
    if (String(comment?.user?.login || '').toLowerCase() !== owner.toLowerCase()) continue;
    if (String(comment?.user?.type || '').toLowerCase() === 'bot') continue;
    // A bare "approve all" or user-editable PR description is never a receipt.
    const token = String(comment.body || '').trim().split(/\r?\n/u)[0];
    const approve = token.match(APPROVE);
    const revoke = token.match(REVOKE);
    const match = approve || revoke;
    if (!match || Number(match[1]) !== number || match[2] !== headSha) continue;
    // Editable issue comments cannot be a trusted publication approval:
    // collaborators can modify an owner-authored comment while retaining
    // its apparent author and edit within GitHub's one-second timestamp
    // resolution. No positive comment token is accepted until an immutable
    // server-authenticated creation-event receipt exists. Negative
    // revocation signals remain active as conservative holds.
    if (approve) continue;
    events.push({
      approved: false,
      at: Date.parse(comment.updated_at || comment.created_at || '') || 0,
      id: Number(comment.id || 0),
    });
  }
  for (const review of reviews || []) {
    if (String(review?.user?.login || '').toLowerCase() !== owner.toLowerCase()) continue;
    if (String(review?.user?.type || '').toLowerCase() === 'bot') continue;
    if (review.commit_id !== headSha) continue;
    if (!['APPROVED','CHANGES_REQUESTED','DISMISSED'].includes(review.state)) continue;
    // GitHub REST PR review objects currently do not reliably report
    // performed_via_github_app. An owner's account can also act via apps.
    // Thus only explicit non-app provenance may GRANT; negative review states
    // continue to invalidate earlier approvals as a safety precaution.
    if (review.state === 'APPROVED' && review.performed_via_github_app !== null) continue;
    events.push({
      approved: review.state === 'APPROVED',
      at: Date.parse(review.submitted_at || '') || 0,
      id: Number(review.id || 0),
    });
  }
  // REST timestamps have only second resolution and issue-comment IDs are
  // unrelated to PR-review IDs. If a revocation and an approval occur at the
  // same timestamp, their real ordering cannot be established: fail closed.
  // Do NOT use numeric IDs across API object families as a chronology.
  if (!events.length) return false;
  const latest = Math.max(...events.map(event => event.at));
  const lastGroup = events.filter(event => event.at === latest);
  return lastGroup.every(event => event.approved);
}

/**
 * Pass REST-sourced PR, changedFiles, comments and reviews. Source verification
 * is NOT publication approval.  The base repository OWNER is the default
 * trusted publication editor; no trust can be conferred by PR body, labels,
 * workflow file, or a proposed PR-local JSON receipt. User.login alone does
 * not prove direct manual intent when delegated GitHub apps can act as owner.
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
  const approved = trustedApprovalEvents({ comments, reviews, owner, number, headSha: head });
  return {
    allowed: approved,
    ...classification,
    reason: approved
      ? 'exact-head approval from repository owner verified; existing science and release gates still apply'
      : `publication review hold for PR #${number} exact head ${head}: positive PR-comment approval tokens are disabled; only a server-verifiable non-app human-origin exact-head APPROVED review is eligible (if GitHub exposes trusted provenance). Otherwise hold until an immutable human approval mechanism exists; do not request an unusable comment token`,
  };
}

/**
 * Read trusted GitHub server-owned conversation/review evidence. This is only
 * needed for public-clinical diffs; inert staging and ordinary control changes
 * do not incur API work. Missing/partial pages must fail closed.
 */
export async function loadPublicationApprovalEvidence(request, repo, number, changedFiles) {
  if (classifyPublicationChange(changedFiles).kind !== 'HUMAN_PUBLICATION') {
    return { comments: [], reviews: [] };
  }
  const loadAll = async endpoint => {
    const records=[];
    for (let page=1; page<=10; page++) {
      const batch=await request(`/repos/${repo}/${endpoint}?per_page=100&page=${page}`);
      if (!Array.isArray(batch)) throw new Error(`Invalid approval API response for ${endpoint}`);
      records.push(...batch);
      if(batch.length<100) return records;
    }
    throw new Error(`Approval evidence pagination limit exceeded for ${endpoint}; manual review required`);
  };
  const [comments,reviews]=await Promise.all([
    loadAll(`issues/${number}/comments`),
    loadAll(`pulls/${number}/reviews`),
  ]);
  return {comments,reviews};
}

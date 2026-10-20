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


// Immutable owner release authorization: GitHub verifies an annotated GPG-signed
// tag. The GitHub API cannot manufacture the signing key; editable comments,
// unsigned/lightweight tags and GitHub-App delegated owner activity cannot grant.
export function ownerSignedTagName(prNumber, headSha) {
  if (!Number.isSafeInteger(prNumber) || prNumber <= 0 || !/^[a-f0-9]{40}$/u.test(String(headSha || ''))) return null;
  return 'ths-publication-approved-pr-' + prNumber + '-' + headSha;
}

export function verifyOwnerSignedTag({ pr, tagRef, tag }) {
  const name = ownerSignedTagName(Number(pr?.number), pr?.head?.sha);
  const owner = pr?.base?.repo?.owner;
  if (!name || !owner?.login || !Number.isSafeInteger(owner?.id) || owner.id <= 0) return null;
  if (pr?.head?.repo?.full_name !== pr?.base?.repo?.full_name) return null;
  if (tagRef?.ref !== 'refs/tags/' + name || tagRef?.object?.type !== 'tag') return null;
  if (!/^[a-f0-9]{40}$/u.test(tagRef?.object?.sha || '') || tagRef.object.sha !== tag?.sha) return null;
  if (tag?.tag !== name || tag?.object?.type !== 'commit' || tag.object.sha !== pr.head.sha) return null;
  if (tag?.verification?.verified !== true || tag.verification.reason !== 'valid') return null;
  if (!String(tag.verification.signature || '').includes('-----BEGIN PGP SIGNATURE-----')) return null;

  // GitHub's "valid" verdict verifies the signed payload and requires the
  // tagger email to be among the signing key's verified identity emails.
  // Pin that email to the numeric owner ID; merely spelling the owner's
  // username in a tag message is NOT sufficient.
  const email = owner.id + '+' + owner.login + '@users.noreply.github.com';
  if (String(tag.tagger?.email || '').toLowerCase() !== email.toLowerCase()) return null;
  const message = 'THS-PUBLICATION-APPROVED PR=#' + pr.number + ' HEAD=' + pr.head.sha;
  if (String(tag.message || '').trim() !== message) return null;

  const payload = tag.verification.payload;
  if (typeof payload !== 'string' || !payload.endsWith('\n\n' + message + '\n')) return null;
  const header = payload.slice(0, payload.indexOf('\n\n')).split('\n');
  if (header.length !== 4 || header[0] !== 'object ' + pr.head.sha ||
      header[1] !== 'type commit' || header[2] !== 'tag ' + name) return null;
  const tagger = /^tagger (.+) <([^<>]+)> (\d+) ([+-]\d{4})$/u.exec(header[3]);
  if (!tagger || tagger[2].toLowerCase() !== email.toLowerCase()) return null;
  const seconds = Number(tagger[3]);
  const signedAt = Date.parse(tag.tagger?.date || '');
  if (!Number.isSafeInteger(seconds) || !Number.isFinite(signedAt) ||
      Math.abs(seconds * 1000 - signedAt) > 1000) return null;
  // A signed tag is scoped to an exact PR/head; the grant is never transferable
  // to another PR or revised head. Negative owner revocations remain effective.
  return { approved: true, at: signedAt };
}

const APPROVE = /^THS-PUBLICATION-APPROVED PR=#(\d+) HEAD=([a-f0-9]{40})$/u;
const REVOKE = /^THS-PUBLICATION-REVOKED PR=#(\d+) HEAD=([a-f0-9]{40})$/u;

function trustedApprovalEvents({ comments, reviews, owner, number, headSha, signedTagEvent = null }) {
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
  if (signedTagEvent) events.push(signedTagEvent);
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
export function assessPublicationApproval({ pr, changedFiles, comments = [], reviews = [], signedTagProof = null }) {
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
  const signedTagEvent = signedTagProof ? verifyOwnerSignedTag({ pr, ...signedTagProof }) : null;
  const approved = trustedApprovalEvents({ comments, reviews, owner, number, headSha: head, signedTagEvent });
  return {
    allowed: approved,
    ...classification,
    reason: approved
      ? 'exact-head approval from repository owner verified; existing science and release gates still apply'
      : `publication review hold for PR #${number} exact head ${head}: positive PR-comment approval tokens are disabled; require a GitHub-verified owner GPG-signed exact-head tag or a server-verifiable non-app human-origin exact-head APPROVED review. Do not accept app-generated approvals or editable comments`,
  };
}

/**
 * Read trusted GitHub server-owned conversation/review evidence. This is only
 * needed for public-clinical diffs; inert staging and ordinary control changes
 * do not incur API work. Missing/partial pages must fail closed.
 */
export async function loadPublicationApprovalEvidence(request, repo, number, changedFiles, pr = null) {
  if (classifyPublicationChange(changedFiles).kind !== 'HUMAN_PUBLICATION') {
    return { comments: [], reviews: [], signedTagProof: null };
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
  let signedTagProof = null;
  const tagName = ownerSignedTagName(number, pr?.head?.sha);
  if (tagName) {
    try {
      const tagRef = await request('/repos/' + repo + '/git/ref/tags/' + tagName);
      // A lightweight tag cannot authenticate a release, even if the commit
      // to which it points has a valid signature.
      if (tagRef?.object?.type === 'tag' && /^[a-f0-9]{40}$/u.test(tagRef.object.sha || '')) {
        const tag = await request('/repos/' + repo + '/git/tags/' + tagRef.object.sha);
        signedTagProof = { tagRef, tag };
      }
    } catch (error) {
      // A missing tag is a normal safe hold. Auth, network, rate limit and
      // signature service errors MUST NOT silently turn into approval.
      if (error?.status !== 404) throw error;
    }
  }
  return {comments,reviews,signedTagProof};
}

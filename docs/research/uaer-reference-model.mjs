/**
 * Unified Approval & Evidence Router — RESEARCH-ONLY reference classifier.
 * Not imported by production, CI, merge controller, social publisher or billing.
 * Every returned decision is advisory. Do not treat these values as permissions.
 * Trusted authenticated evidence MUST be established outside this pure function.
 */
export const UAER_POLICY_VERSION = "research-v0.1";
export const UAER_DECISIONS = Object.freeze([
  "AUTO_APPROVE", "AUTO_APPROVE_WITH_PROOF", "REVIEW_REQUIRED",
  "REPAIR_REQUIRED", "BLOCKED", "COMPLETE"
]);

const SAFE_OPERATIONS = new Set(["read", "stage", "preview", "reuse-stage"]);
const PROTECTED_OPERATIONS = new Set([
  "merge", "deploy", "publish", "social-post", "pay", "delete",
  "security-change", "secrets-change", "scope-change",
  "clinical-claim", "canonical-source-promote", "scheduler-write"
]);
const NONPUBLIC_TARGET = /^(?:docs\/research\/|ops\/research-intake\/|ops\/editorial-runtime\/publication-pilots\/|research\/|ops\/evidencemotion\/)(?!.*(?:\.\.\/|\/{2}))/u;

export function assessResearchApproval(input) {
  const base = {
    schemaVersion: 1,
    policyVersion: UAER_POLICY_VERSION,
    actionId: typeof input?.actionId === "string" ? input.actionId : null,
    decision: "BLOCKED", reasonCode: "invalid_action",
    missingProof: [], advisoryOnly: true, canExecute: false, complete: false
  };
  const result = (decision, reasonCode, missingProof = []) =>
    Object.freeze({ ...base, decision, reasonCode, missingProof });

  if (!input || typeof input !== "object" || Array.isArray(input)) return result("BLOCKED", "invalid_action");
  const { actionId, operation, target, risk, fingerprint, evidence = {} } = input;
  if (typeof actionId !== "string" || !/^[a-z0-9][a-z0-9:_.-]{2,127}$/u.test(actionId) ||
    typeof target !== "string" || !/^[a-zA-Z0-9._/-]{1,256}$/u.test(target) ||
    target.includes("..") || target.includes("//") ||
    typeof fingerprint !== "string" || !/^sha256:[0-9a-f]{64}$/u.test(fingerprint) ||
    !["low","high","unknown"].includes(risk) || typeof operation !== "string" ||
    !evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    return result("BLOCKED", "invalid_or_unverified_action_identity");
  }
  if (!SAFE_OPERATIONS.has(operation) && !PROTECTED_OPERATIONS.has(operation)) {
    return result("BLOCKED", "unknown_operation");
  }
  if (evidence.revoked === true || evidence.sourceStatus === "withdrawn" ||
      evidence.sourceStatus === "superseded" || evidence.identityMismatch === true ||
      evidence.duplicateExternalEffect === true) {
    return result("BLOCKED", "revoked_stale_or_duplicate_identity");
  }
  if (evidence.sourceStatus !== "current" ||
      !["unchanged","changed","unknown"].includes(evidence.claimDelta)) {
    return result("BLOCKED", "missing_current_source_and_claim_baseline");
  }
  if (evidence.claimDelta !== "unchanged" || risk !== "low" ||
      PROTECTED_OPERATIONS.has(operation) || evidence.requiresIndependentReview === true) {
    return result("REVIEW_REQUIRED", "genuine_domain_authority_required",
      ["domain_scientific_security_owner_or_provider_review"]);
  }
  if (evidence.checks === "failed") {
    const retry = Number.isInteger(evidence.repairAttempts) && evidence.repairAttempts >= 0 &&
      evidence.repairAttempts < 2 && evidence.repairable === true;
    return retry
      ? result("REPAIR_REQUIRED", "bounded_repair_allowed")
      : result("BLOCKED", "failed_checks_or_retry_budget_exhausted");
  }
  if (evidence.checks !== "passed") {
    return result("REVIEW_REQUIRED", "required_checks_pending_or_unavailable", ["exact_revision_checks"]);
  }
  if (operation === "read") return result("AUTO_APPROVE", "read_only_safe");
  if (!NONPUBLIC_TARGET.test(target)) {
    return result("REVIEW_REQUIRED", "not_proven_nonpublic", ["approved_target_scope"]);
  }
  if (operation === "preview" && !target.startsWith("ops/evidencemotion/")) {
    return result("REVIEW_REQUIRED", "media_preview_scope_required", ["exact_media_preview_scope"]);
  }
  if (operation === "reuse-stage") {
    return evidence.priorFingerprint === fingerprint && evidence.priorScope === target &&
      evidence.priorRevoked === false
      ? result("AUTO_APPROVE_WITH_PROOF", "unchanged_nonpublic_staging_identity")
      : result("BLOCKED", "prior_scope_or_fingerprint_not_proven");
  }
  return result("AUTO_APPROVE", "verified_low_risk_nonpublic_staging");
}

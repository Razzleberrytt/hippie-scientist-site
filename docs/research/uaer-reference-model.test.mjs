import test from "node:test";
import assert from "node:assert/strict";
import { assessResearchApproval as decide, UAER_POLICY_VERSION } from "./uaer-reference-model.mjs";

const h = "sha256:" + "a".repeat(64);
const valid = {
  actionId: "stage:one", operation: "stage", target: "ops/editorial-runtime/publication-pilots/copy.md",
  fingerprint: h, risk: "low",
  evidence: { sourceStatus: "current", claimDelta: "unchanged", checks: "passed" }
};
const withChange = (delta) => ({...valid, ...delta, evidence: {...valid.evidence, ...delta.evidence}});
const check = (name, input, expected) => test(name, () => {
  const r = decide(input);
  assert.equal(r.decision, expected);
  assert.equal(r.canExecute, false);
  assert.equal(r.advisoryOnly, true);
  assert.equal(r.complete, false);
  assert.equal(r.policyVersion, UAER_POLICY_VERSION);
});
check("safe inert editorial staging", valid, "AUTO_APPROVE");
check("safe research staging", withChange({target:"docs/research/report.md"}), "AUTO_APPROVE");
check("safe source staging", withChange({target:"ops/research-intake/items.json"}), "AUTO_APPROVE");
check("read-only action", withChange({operation:"read",target:"reports/metrics.json"}), "AUTO_APPROVE");
check("safe isolated media preview", withChange({operation:"preview",target:"ops/evidencemotion/draft/frame.png"}), "AUTO_APPROVE");
check("preview in public folder", withChange({operation:"preview",target:"public/videos/clip.mp4"}), "REVIEW_REQUIRED");
check("public article staging cannot auto-approve", withChange({target:"content/articles/liver-safety.md"}), "REVIEW_REQUIRED");
check("publication always requires real authority", withChange({operation:"publish",target:"content/articles/a.md"}), "REVIEW_REQUIRED");
check("video live publishing not inferred from preview", withChange({operation:"social-post",target:"social/channel"}), "REVIEW_REQUIRED");
check("secrets access change is protected", withChange({operation:"secrets-change",target:"config/secrets"}), "REVIEW_REQUIRED");
check("billing cannot auto approve", withChange({operation:"pay",target:"billing/invoice"}), "REVIEW_REQUIRED");
check("destructive delete cannot auto approve", withChange({operation:"delete",target:"records/r01"}), "REVIEW_REQUIRED");
check("canonical source promotion cannot auto approve", withChange({operation:"canonical-source-promote"}), "REVIEW_REQUIRED");
check("clinical claim never auto approved", withChange({operation:"clinical-claim"}), "REVIEW_REQUIRED");
check("policy permission change never auto approved", withChange({operation:"scope-change"}), "REVIEW_REQUIRED");
check("new evidence or claim direction requires review", withChange({evidence:{claimDelta:"changed"}}), "REVIEW_REQUIRED");
check("unknown risk requires review", withChange({risk:"unknown"}), "REVIEW_REQUIRED");
check("high risk requires review", withChange({risk:"high"}), "REVIEW_REQUIRED");
check("missing current source blocks", withChange({evidence:{sourceStatus:"unknown"}}), "BLOCKED");
check("withdrawn study blocks", withChange({evidence:{sourceStatus:"withdrawn"}}), "BLOCKED");
check("revoked proof blocks", withChange({evidence:{revoked:true}}), "BLOCKED");
check("mismatched identity blocks", withChange({evidence:{identityMismatch:true}}), "BLOCKED");
check("repeated external effect blocks", withChange({evidence:{duplicateExternalEffect:true}}), "BLOCKED");
check("missing checks do not pass", withChange({evidence:{checks:"pending"}}), "REVIEW_REQUIRED");
check("repairable check limited", withChange({evidence:{checks:"failed",repairable:true,repairAttempts:1}}), "REPAIR_REQUIRED");
check("retry exhaustion blocks", withChange({evidence:{checks:"failed",repairable:true,repairAttempts:2}}), "BLOCKED");
check("invalid sha fingerprint blocks", withChange({fingerprint:"sha256:fake"}), "BLOCKED");
check("path traversal blocks", withChange({target:"docs/research/../public/a.md"}), "BLOCKED");
check("unrecognized operation blocks", withChange({operation:"automagic"}), "BLOCKED");
check("exact prior stage proof reuse", withChange({operation:"reuse-stage",evidence:{priorFingerprint:h,priorScope:valid.target,priorRevoked:false}}), "AUTO_APPROVE_WITH_PROOF");
check("stale prior proof cannot be reused", withChange({operation:"reuse-stage",evidence:{priorFingerprint:"sha256:"+"b".repeat(64),priorScope:valid.target,priorRevoked:false}}), "BLOCKED");
check("cross-target proof cannot be reused", withChange({operation:"reuse-stage",evidence:{priorFingerprint:h,priorScope:"docs/research/other.md",priorRevoked:false}}), "BLOCKED");
check("revoked prior proof cannot be reused", withChange({operation:"reuse-stage",evidence:{priorFingerprint:h,priorScope:valid.target,priorRevoked:true}}), "BLOCKED");
test("cannot claim completion from proposed check results", () => {
  const r=decide(withChange({evidence:{executionComplete:true,externalReceipt:"self-claimed"}}));
  assert.equal(r.decision, "AUTO_APPROVE");
  assert.equal(r.complete, false);
  assert.equal(r.canExecute, false);
});

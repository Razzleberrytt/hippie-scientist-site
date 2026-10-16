#!/usr/bin/env python3
"""EM-007.08 research-only science-gate attestation.

An SHA-256 process attestation establishes deterministic artifact identity.
It is NOT a human signature, certified scientific review, or publication key.
All unresolved independent-review, human-outcome, craft and release gates HOLD.
"""
import argparse
import hashlib
import json
from pathlib import Path

from scientific_uncertainty_ledger import classify as classify_uncertainty
from claim_strength_source_limits import evaluate as evaluate_strength

SCHEMA = "ths-em00708-process-science-gate-v1"
DOMAIN = b"THS/EM00708/RESEARCH_HOLD/v1\x00"
GATE = "HOLD_AWAITING_QUALIFIED_INDEPENDENT_SCIENTIFIC_REVIEW"
EXPECTED = tuple(f"spoken-{n:03d}" for n in range(1, 9))
ATTESTATION_METHOD = "SHA256_CANONICAL_PROCESS_ATTESTATION_NOT_HUMAN_SIGNATURE"

def hold(reason):
    raise ValueError("EM00708_GATE_HOLD:" + reason)

def canonical(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True,
                      separators=(",", ":"), allow_nan=False).encode("utf-8")

def strict_json(raw):
    def no_repeated_keys(pairs):
        output = {}
        for key, value in pairs:
            if key in output:
                hold("DUPLICATED_JSON_KEY:" + key)
            output[key] = value
        return output
    try:
        return json.loads(raw, object_pairs_hook=no_repeated_keys,
                          parse_constant=lambda value: hold("NONFINITE_JSON_VALUE"))
    except (UnicodeError, json.JSONDecodeError) as exc:
        hold("INVALID_JSON:" + str(exc))

def read_record(path):
    p = Path(path)
    if not p.is_file() or p.is_symlink():
        hold("REGULAR_EXACT_INPUT_REQUIRED")
    data = p.read_bytes()
    return strict_json(data), hashlib.sha256(data).hexdigest()

def attest(inputs, digests):
    if (not isinstance(inputs, dict) or set(inputs) !=
        {"source", "uncertainty", "strength"} or
        not isinstance(digests, dict) or set(digests) != set(inputs) or
        any(not isinstance(v, str) or len(v) != 64 or
            any(ch not in "0123456789abcdef" for ch in v)
            for v in digests.values())):
        hold("EXACT_THREE_PARENT_REPORTS_REQUIRED")
    source, uncertainty, strength = (
        inputs["source"], inputs["uncertainty"], inputs["strength"])
    fresh_uncertainty = classify_uncertainty(source, source_sha=digests["source"])
    if uncertainty != fresh_uncertainty:
        hold("UNCERTAINTY_IS_NOT_RECOMPUTED_FROM_SOURCE")
    fresh_strength = evaluate_strength(
        source, uncertainty,
        source_join_sha=digests["source"],
        uncertainty_sha=digests["uncertainty"])
    if strength != fresh_strength:
        hold("STRENGTH_IS_NOT_RECOMPUTED_FROM_SOURCES")
    if (strength.get("sourceJoinSha256") != digests["source"]
        or strength.get("uncertaintyLedgerSha256") != digests["uncertainty"]
        or source.get("sourceWavSha256") != uncertainty.get("sourceWavSha256")
        or source.get("filmSha256") != strength.get("filmSha256")
        or strength.get("mayPublish") is not False
        or uncertainty.get("mayPublish") is not False
        or source.get("mayPublish") is not False):
        hold("CROSS_REPORT_IDENTITY_OR_PERMISSION_DRIFT")
    if ([row["claimId"] for row in strength["claims"]] != list(EXPECTED)
        or [row["claimId"] for row in uncertainty["claims"]] != list(EXPECTED)
        or [row["claimId"] for row in source["claims"]] != list(EXPECTED)):
        hold("EVERY_FROZEN_CLAIM_MUST_BE_RECONCILED")

    per_claim = []
    for i, cid in enumerate(EXPECTED):
        material = bool(source["claims"][i]["material"])
        if material is not (1 <= i <= 6):
            hold("MATERIAL_CLAIM_CLASSIFICATION_CHANGED:" + cid)
        blockers = ["NO_INDEPENDENT_QUALIFIED_SCIENTIFIC_REVIEW_FOR_EXACT_ASSET"]
        if material:
            blockers.extend([
                "HUMAN_POPULATION_OUTCOME_DOSE_TIMING_NOT_IN_SOURCE_PACK",
                "NO_EXTERNAL_CLINICAL_LITERATURE_ASSESSMENT",
                "BIOLOGICAL_MECHANISM_NOT_PROVEN_BY_COMPUTED_MEDIA",
            ])
        per_claim.append({
            "claimId": cid, "material": material,
            "sourceIds": list(source["claims"][i]["sourceIds"]),
            "sourceScope": source["claims"][i]["supportedMeaningScope"],
            "machineProvenanceReconciled": True,
            "qualifiedIndependentScienceVerdict": "NOT_RECEIVED",
            "scientificAcceptance": GATE,
            "unresolvedHoldReasons": blockers,
            "clinicalOrAudienceValidityApproved": False,
        })
    data = {
        "schema": SCHEMA, "task": "EM-007.08",
        "sourceJoinSha256": digests["source"],
        "uncertaintyReportSha256": digests["uncertainty"],
        "claimStrengthReportSha256": digests["strength"],
        "filmSha256": source["filmSha256"],
        "sourceWavSha256": source["sourceWavSha256"],
        "claims": per_claim, "claimsReconciled": len(per_claim),
        "materialClaimsReconciled": sum(row["material"] for row in per_claim),
        "independentReviewerReceiptPresent": False,
        "independentScientificReviewPassed": False,
        "nullAndConflictingHumanEvidenceExternallyAssessed": False,
        "voiceArtHandsetAndAudienceGatesPassed": False,
        "scienceGate": GATE,
        "mayPublish": False,
        "approvalToMerge": False,
        "status": "RESEARCH_ONLY_PROCESS_ATTESTED_OPEN_HOLDS",
    }
    signature = hashlib.sha256(DOMAIN + canonical(data)).hexdigest()
    data["processAttestation"] = {
        "method": ATTESTATION_METHOD,
        "canonicalPayloadSha256": hashlib.sha256(canonical(data)).hexdigest(),
        "domainSeparatedDigest": signature,
        "notHumanSigned": True, "notCryptographicIdentitySignature": True,
        "publishingAuthorityGranted": False,
    }
    return data

def verify_attestation(report):
    if not isinstance(report, dict):
        hold("REPORT_REQUIRED")
    record = report.get("processAttestation")
    if (not isinstance(record, dict) or
        set(record) != {"method","canonicalPayloadSha256",
                        "domainSeparatedDigest","notHumanSigned",
                        "notCryptographicIdentitySignature",
                        "publishingAuthorityGranted"}):
        hold("ATTESTATION_SHAPE_OR_MISSING_SIGNATURE")
    if (record["method"] != ATTESTATION_METHOD or
        record["notHumanSigned"] is not True or
        record["notCryptographicIdentitySignature"] is not True or
        record["publishingAuthorityGranted"] is not False):
        hold("MISLEADING_ATTESTATION_OR_RELEASE_CLAIM")
    payload = {k:v for k,v in report.items() if k != "processAttestation"}
    if (record["canonicalPayloadSha256"] != hashlib.sha256(canonical(payload)).hexdigest()
        or record["domainSeparatedDigest"] != hashlib.sha256(
            DOMAIN + canonical(payload)).hexdigest()):
        hold("SOURCE_OR_HOLD_RESULT_TAMPERED")
    if (payload.get("scienceGate") != GATE or
        payload.get("mayPublish") is not False or
        payload.get("approvalToMerge") is not False or
        payload.get("independentScientificReviewPassed") is not False or
        len(payload.get("claims", [])) != 8 or
        any(c.get("scientificAcceptance") != GATE or
            c.get("qualifiedIndependentScienceVerdict") != "NOT_RECEIVED"
            or not c.get("unresolvedHoldReasons") for c in payload["claims"])):
        hold("SCIENCE_GATE_CANNOT_SELF_AUTHORIZE_RELEASE")
    return True

def main():
    parser = argparse.ArgumentParser()
    for name in ("source", "uncertainty", "strength", "out"):
        parser.add_argument("--" + name, required=True)
    args = parser.parse_args()
    paths = [Path(getattr(args, k)).resolve() for k in ("source","uncertainty","strength","out")]
    if len(set(paths)) != 4:
        hold("INPUT_OUTPUT_PATH_ALIAS_NOT_ALLOWED")
    records, digests = {}, {}
    for key in ("source", "uncertainty", "strength"):
        records[key], digests[key] = read_record(getattr(args, key))
    receipt = attest(records, digests)
    verify_attestation(receipt)
    Path(args.out).write_text(json.dumps(receipt, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": receipt["status"], "claims": 8,
                      "holdsOpen": True, "mayPublish": False}))

if __name__ == "__main__":
    main()

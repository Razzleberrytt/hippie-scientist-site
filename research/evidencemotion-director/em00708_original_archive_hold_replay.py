#!/usr/bin/env python3
"""EM-007.08 real-original-film replay of a science-gate HOLD process receipt.

Operates on a previously successful SHA-pinned archived MP4 and its original
machine source/uncertainty reports. No present-head native-render, qualified
reviewer, full literature survey, voice, handset or publication approval.
"""
import argparse
import hashlib
import json
from pathlib import Path

from em00705_original_archive_replay import (
    replay as replay_strength, EXPECTED, SOURCE, UNCERTAINTY,
    SOURCE_RUN, SOURCE_ARTIFACT, FILM, sha as digest,
)
from claim_strength_source_limits import evaluate as evaluate_strength
from science_gate_process_attestation import (
    attest, verify_attestation, canonical, strict_json, GATE,
)

SCHEMA = "ths-em00708-real-original-source-process-hold-v1"

def hold(reason):
    raise ValueError("EM00708_ARCHIVE_HOLD:" + reason)

def replay(blobs):
    # This proof *cannot* use a freshly constructed pretend film: every
    # original movie/JSON blob must rehash to the exact prior successful run.
    strength_receipt = replay_strength(blobs)
    source, uncertainty = strict_json(blobs[SOURCE]), strict_json(blobs[UNCERTAINTY])
    source_sha, uncertainty_sha = digest(blobs[SOURCE]), digest(blobs[UNCERTAINTY])
    strength = evaluate_strength(source, uncertainty,
                                 source_join_sha=source_sha,
                                 uncertainty_sha=uncertainty_sha)
    # Canonical bytes are created locally and never misrepresented as an
    # already uploaded earlier-run artifact.
    strength_sha = digest(canonical(strength))
    signed = attest(
        {"source":source,"uncertainty":uncertainty,"strength":strength},
        {"source":source_sha,"uncertainty":uncertainty_sha,
         "strength":strength_sha})
    if verify_attestation(signed) is not True:
        hold("ATTESTATION_VERIFIER_DID_NOT_APPROVE_INTEGRITY")
    if (signed["claimsReconciled"] != 8 or
        signed["materialClaimsReconciled"] != 6 or
        signed["filmSha256"] != digest(blobs[FILM]) or
        signed["scienceGate"] != GATE or
        signed["independentReviewerReceiptPresent"] is not False or
        signed["mayPublish"] is not False or
        signed["approvalToMerge"] is not False or
        len(signed["claims"]) != 8 or
        any(x["qualifiedIndependentScienceVerdict"] != "NOT_RECEIVED"
            or not x["unresolvedHoldReasons"]
            or x["clinicalOrAudienceValidityApproved"] is not False
            for x in signed["claims"])):
        hold("SOURCE_HOLD_OR_CLAIM_SCOPE_PROMOTED")

    return {
        "schema": SCHEMA, "task":"EM-007.08",
        "originalNativeWorkflowRunId":SOURCE_RUN,
        "originalNativeArtifactId":SOURCE_ARTIFACT,
        "originalArchivedFilmSha256":digest(blobs[FILM]),
        "sourceJoinSha256":source_sha,
        "uncertaintySha256":uncertainty_sha,
        "recomputedStrengthCanonicalSha256":strength_sha,
        "scienceProcessReportCanonicalSha256":digest(canonical(signed)),
        "scienceProcessDomainSeparatedDigest":
            signed["processAttestation"]["domainSeparatedDigest"],
        "frozenClaimCount":signed["claimsReconciled"],
        "materialClaimCount":signed["materialClaimsReconciled"],
        "materialHumanStudyAxesUnreported":
            strength_receipt["materialStudyAxesRecordedAbsent"],
        "actualArchivedFilmRehashed":True,
        "nativeCurrentHeadExecutionOrReleaseCertified":False,
        "independentQualifiedReviewerApproved":False,
        "externalClinicalLiteratureReviewed":False,
        "scienceGate":GATE,
        "status":"ORIGINAL_ARCHIVED_FILM_MACHINE_HOLD_REPLAY_ONLY",
        "mayPublish":False,
    }

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--root",required=True)
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    root=Path(args.root).resolve()
    data={}
    for filename in EXPECTED:
        source=root/filename
        if (not source.is_file() or source.is_symlink()
            or not source.resolve().is_relative_to(root)):
            hold("MISSING_OR_UNSAFE_ORIGINAL_SOURCE:"+filename)
        data[filename]=source.read_bytes()
    receipt=replay(data)
    out=Path(args.out)
    if out.resolve() in {(root/p).resolve() for p in EXPECTED}:
        hold("OUTPUT_CANNOT_OVERWRITE_ARCHIVED_SOURCE")
    out.write_text(json.dumps(receipt,indent=2,sort_keys=True)+"\n",encoding="utf8")
    print(json.dumps({"status":receipt["status"],"claims":8,"material":6,
                      "qualifiedReviewerApproved":False,"mayPublish":False}))

if __name__=="__main__":
    main()

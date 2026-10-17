#!/usr/bin/env python3
"""Bounded EM-007.05 source-strength replay on real archived original-WAV film.

CPU-only, no FFmpeg, network access, clinical-study inference or approval.
The runner downloads a previously passed real original-WAV native archive.
This deliberately does not assert that the current H264 pipeline is green.
"""
import argparse
import hashlib
import json
from pathlib import Path

from claim_strength_source_limits import evaluate
from research_receipt_io import prepare_research_output, emit_research_output

SOURCE_RUN = 38914069118
SOURCE_ARTIFACT = 12052645131
FILM = "specimen-timed-native/specimen_NEW_RESEARCH_CANDIDATE.mp4"
SOURCE = "specimen-timed-native/claim-source-context-join.json"
UNCERTAINTY = "specimen-timed-native/scientific-uncertainty-RESEARCH.json"
EXPECTED = {
    FILM: "4a36305c08e422d85a006332c4e83d39dac4a8f12c87502ad842cb99b8f874e3",
    SOURCE: "96c2c7c940b729dcc42264a24861b98edf2e45f4a5d0ac8b332500b4adac2aca",
    UNCERTAINTY: "a806a2d71027f3facec74f4a02f8b3f88afb949d64219f18d1073aeda0c9dbb6",
}
AXES = ("population", "outcome", "dose", "exposureDuration", "followUp")
NO_STUDY = "NOT_REPORTED_IN_THIS_NONCLINICAL_SOURCE_PACK"

def sha(value):
    return hashlib.sha256(value).hexdigest()

def hold(reason):
    raise ValueError("EM00705_REAL_ARCHIVE_HOLD:" + reason)

def replay(blobs):
    if set(blobs) != set(EXPECTED):
        hold("THREE_ORIGINAL_ARCHIVED_FILES_REQUIRED")
    for filename, expected in EXPECTED.items():
        if not isinstance(blobs[filename], bytes) or sha(blobs[filename]) != expected:
            hold("PINNED_ARCHIVE_BYTES_MISMATCH:" + filename)
    source = json.loads(blobs[SOURCE])
    uncertainty = json.loads(blobs[UNCERTAINTY])
    filmhash = sha(blobs[FILM])
    if (source.get("filmSha256") != filmhash
        or uncertainty.get("filmSha256") != filmhash
        or uncertainty.get("sourceJoinSha256") != sha(blobs[SOURCE])
        or source.get("mayPublish") is not False
        or uncertainty.get("mayPublish") is not False):
        hold("SOURCE_UNCERTAINTY_OR_FILM_LINEAGE_MISMATCH")
    report = evaluate(source, uncertainty,
                      source_join_sha=sha(blobs[SOURCE]),
                      uncertainty_sha=sha(blobs[UNCERTAINTY]))
    rows = report.get("claims")
    if not isinstance(rows, list) or len(rows) != 8:
        hold("ORIGINAL_EIGHT_CLAIMS_REQUIRED")
    material = [x for x in rows if x["sourceType"] == "CHEMISTRY_OR_COMPUTED_FILM_ONLY"]
    if len(material) != 6 or [x["claimId"] for x in material] != [
            "spoken-002", "spoken-003", "spoken-004", "spoken-005",
            "spoken-006", "spoken-007"]:
        hold("MATERIAL_CLAIMS_WRONG")
    if any(set(x["populationOutcomeDoseTimingFollowUp"]) != set(AXES)
           or any(value != NO_STUDY
                  for value in x["populationOutcomeDoseTimingFollowUp"].values())
           or x["sourceSupportsEffectsOrAbsence"] is not False
           for x in material):
        hold("HUMAN_STUDY_SOURCE_INFLATION")
    if (report.get("humanStudyComparisonPossible") is not False
        or report.get("mayPublish") is not False
        or report.get("clinicalStrengthClaimsApproved") is not False):
        hold("CLINICAL_OR_PUBLICATION_AUTHORITY_MISMATCH")
    return {
        "schema": "ths-em00705-real-original-wav-archive-proof-v1",
        "originalWorkflowRunId": SOURCE_RUN,
        "originalArtifactId": SOURCE_ARTIFACT,
        "pinnedRealFilmSha256": filmhash,
        "pinnedExactJoinSha256": sha(blobs[SOURCE]),
        "pinnedUncertaintySha256": sha(blobs[UNCERTAINTY]),
        "sourceWavSha256": source["sourceWavSha256"],
        "claimStrengthReceiptSha256": sha(
            (json.dumps(report, sort_keys=True, separators=(",",":"))+"\n").encode()),
        "frozenClaimCount": 8,
        "materialClaims": 6,
        "materialStudyAxesRecordedAbsent": 30,
        "externalClinicalLiteratureReviewed": False,
        "researchScopeOnly": True,
        "currentHeadNativeRenderCertified": False,
        "qualifiedHumanScientistApproval": False,
        "mayPublish": False,
    }

def validate_receipt_target(out, archive_root):
    """Fail closed before an archive proof receipt can overwrite a source input.

    Resolves directory traversal and symlink aliases, and checks same-inode
    hard links when the destination already exists.
    """
    target = Path(out)
    root = Path(archive_root).resolve()
    for filename in EXPECTED:
        source = root / filename
        if target.resolve() == source.resolve() or (
                target.exists() and source.exists() and target.samefile(source)):
            hold("RECEIPT_OUTPUT_ALIASES_PINNED_ARCHIVE_INPUT:" + filename)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    root = Path(args.root).resolve()
    validate_receipt_target(args.out, root)
    target = prepare_research_output(args.out, [root/name for name in EXPECTED])
    data = {}
    for filename in EXPECTED:
        p = root / filename
        if not p.is_file() or p.is_symlink() or not p.resolve().is_relative_to(root):
            hold("MISSING_OR_UNSAFE_ARCHIVE_PATH:" + filename)
        data[filename] = p.read_bytes()
    receipt = replay(data)
    emit_research_output(target, receipt)
    print(json.dumps({"status":"PINNED_ORIGINAL_FILM_SOURCE_SCOPE_REPLAY_PASS",
                      "claims":receipt["frozenClaimCount"],
                      "axes":receipt["materialStudyAxesRecordedAbsent"],
                      "mayPublish":False}))

if __name__ == "__main__":
    main()

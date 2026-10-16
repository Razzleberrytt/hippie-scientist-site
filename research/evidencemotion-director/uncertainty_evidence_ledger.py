#!/usr/bin/env python3
"""EM-007.04: distinguish missing, null, conflicting, and unreviewed evidence.

This is an exact source-context accounting artifact, NOT a literature review.
A missing human-outcome study in the current asset cannot be generalized into
absence of studies or proof of no clinical effects. No positive/negative
human findings are inferred from chemical structures or animation metadata.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA
from claim_source_context_join import (
    SCHEMA as SOURCE_SCHEMA, SUPPORT, SCOPE_CONTEXT_ORACLE, MATERIAL_IDS,
)

SCHEMA = "ths-em00704-uncertainty-separation-v1"
CLAIM_IDS = tuple(f"spoken-{n:03}" for n in range(1, 9))
SOURCE_KINDS = {
    "pubchem:3034396": ("PRIMARY_CHEMICAL_RECORD", 3034396),
    "pubchem:44301524": ("PRIMARY_CHEMICAL_RECORD", 44301524),
    "media:render": ("SOURCE_FILM_ATTESTATION", None),
    "media:story": ("SOURCE_SHOT_STORY_MAP", None),
}
CLAIM_FIELDS = {
    "claimId", "claimType", "verbatimFrozenTokens", "wordIndices",
    "material", "shotIds", "sourceIds", "supportedMeaningScope",
    "studyContextStatus", "humanStudyId",
    "sourceLinksSupportClinicalEffect", "clinicalEffectAbsenceProven",
    "qualifiedIndependentScientificReview", "sourceContextMachineJoined",
}
AXES = ("positiveHumanFinding", "nullHumanFinding", "conflictingHumanFinding")
# These are evidence availability statuses, NOT findings for or against effects.
NOT_ASSESSED = "NOT_ASSESSED_FROM_HUMAN_STUDIES"
ABSENT_FROM_THIS_ASSET = "HUMAN_OUTCOME_STUDY_ABSENT_FROM_SELECTED_ASSET"
NO_HUMAN_CONCLUSION = "HUMAN_OUTCOME_OR_EFFECT_ABSENCE_NOT_INFERRED"


def hold(reason):
    raise ValueError("EM00704_UNCERTAINTY_HOLD:" + reason)


def digest(path):
    path = Path(path)
    if not path.is_file() or path.is_symlink():
        hold("REGULAR_EXACT_PARENT_REPORT_REQUIRED")
    return hashlib.sha256(path.read_bytes()).hexdigest()


def is_sha(value):
    return isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value) is not None


def separate(parent, *, parent_sha):
    if not isinstance(parent, dict) or not is_sha(parent_sha):
        hold("EXACT_SOURCE_JOIN_SHA_REQUIRED")
    if (parent.get("schema") != SOURCE_SCHEMA
        or parent.get("task") != "EM-007.03"
        or parent.get("sourceWavSha256") != WAV_SHA
        or any(not is_sha(parent.get(k)) for k in
               ("spokenLedgerSha256", "visualInventorySha256", "filmSha256"))
        or parent.get("materialClaimCount") != len(MATERIAL_IDS)
        or parent.get("materialClaimsWithTypedSourceContext") != len(MATERIAL_IDS)
        or parent.get("fabricatedPubmedIds") != []
        or parent.get("clinicalSourceClaimsApproved") is not False
        or parent.get("needsIndependentScientificReview") is not True
        or parent.get("mayPublish") is not False
        or parent.get("humanStudyContextsMissingForOutcomeInference") !=
           ["spoken-007"]):
        hold("SOURCE_CONTEXT_CANNOT_BE_CLINICALLY_PROMOTED")
    sources = parent.get("sources")
    if not isinstance(sources, dict) or set(sources) != set(SOURCE_KINDS):
        hold("CANONICAL_NONSTUDY_SOURCE_KINDS_REQUIRED")
    for key, (kind, cid) in SOURCE_KINDS.items():
        source = sources[key]
        if (not isinstance(source, dict)
            or source.get("kind") != kind
            or source.get("studyPopulation") is not None
            or source.get("measuredHumanOutcome") is not None
            or (cid is not None and source.get("cid") != cid)
            or (cid is None and "cid" in source)):
            hold("NONSTUDY_RECORD_FALSIFIED_AS_HUMAN_EVIDENCE:" + key)
    claims = parent.get("claims")
    if (not isinstance(claims, list) or len(claims) != 8
        or any(not isinstance(c, dict) for c in claims)
        or tuple(c.get("claimId") for c in claims) != CLAIM_IDS):
        hold("EXACT_EIGHT_CLAIMS_REQUIRED")
    rows = []
    for c in claims:
        cid = c["claimId"]
        ids, scope, context = SUPPORT[cid]
        if ((scope, context) != SCOPE_CONTEXT_ORACLE[cid]
            or set(c) != CLAIM_FIELDS
            or c.get("sourceIds") != list(ids)
            or c.get("supportedMeaningScope") != scope
            or c.get("studyContextStatus") != context
            or c.get("material") is not (cid in MATERIAL_IDS)
            or c.get("humanStudyId") is not None
            or c.get("sourceLinksSupportClinicalEffect") is not False
            or c.get("clinicalEffectAbsenceProven") is not False
            or c.get("qualifiedIndependentScientificReview") is not False
            or c.get("sourceContextMachineJoined") is not True
            or not isinstance(c.get("verbatimFrozenTokens"), str)
            or not c["verbatimFrozenTokens"].strip()):
            hold("CLAIM_OR_EVIDENCE_CEILING_DRIFT:" + cid)
        if cid in MATERIAL_IDS and not ids:
            hold("MATERIAL_CLAIM_UNSOURCED:" + cid)
        is_outcome_limit = cid == "spoken-007"
        # Every claim's clinical findings remain unknown. The one narrated
        # outcome-inference limitation explicitly lacks a *human study in
        # this selected asset*, not in the entire scientific literature.
        rows.append({
            "claimId": cid,
            "sourceIds": list(ids),
            "sourceMeaningScope": scope,
            "humanEvidenceAttachedToSelectedSources": False,
            "humanOutcomeEvidenceInSelectedAsset":
                ABSENT_FROM_THIS_ASSET if is_outcome_limit else
                "NOT_A_HUMAN_OUTCOME_STUDY_ASSERTION",
            "clinicalEvidenceAxes": {axis: NOT_ASSESSED for axis in AXES},
            "mechanismOrComputedStructureIsHumanOutcomeEvidence": False,
            "uncertaintyDisposition":
                "DEPICTION_CANNOT_ESTABLISH_SUBJECTIVE_OUTCOME"
                if is_outcome_limit else "NON_OUTCOME_STRUCTURE_OR_MEDIA_SCOPE",
            "conflictResolutionAttempted": False,
            "humanLiteratureReviewComplete": False,
            "effectPresenceOrAbsenceConclusion": NO_HUMAN_CONCLUSION,
            "independentReviewStatus": "HOLD",
        })
    return {
        "schema": SCHEMA, "task": "EM-007.04",
        "sourceContextJoinSha256": parent_sha,
        "sourceWavSha256": WAV_SHA,
        "filmSha256": parent["filmSha256"],
        "claimCount": len(rows),
        "outcomeInferenceGapClaimIds": ["spoken-007"],
        "absenceScope": "SELECTED_AUDIO_VIDEO_AND_ATTACHED_CHEMISTRY_ONLY",
        "nullStudyFindingsReported": False,
        "negativeStudyFindingsReported": False,
        "conflictingStudiesReviewed": False,
        "clinicalLiteratureCompletenessEstablished": False,
        "noHumanEffectsProven": False,
        "scienceApproved": False,
        "mayPublish": False,
        "needsIndependentHumanStudyReview": True,
        "claims": rows,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source-join", required=True)
    ap.add_argument("--out", required=True)
    args = ap.parse_args()
    output = Path(args.out)
    output.unlink(missing_ok=True)
    source = Path(args.source_join)
    source_hash = digest(source)
    report = separate(json.loads(source.read_text(encoding="utf-8")),
                      parent_sha=source_hash)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n",
                      encoding="utf-8")
    print(json.dumps({
        "status": "UNCERTAINTY_DISAGGREGATED_RESEARCH_ONLY",
        "claims": report["claimCount"],
        "missingHumanOutcomeInAsset": report["outcomeInferenceGapClaimIds"],
        "humanEffectVerdict": "HOLD",
        "mayPublish": False
    }))


if __name__ == "__main__":
    main()

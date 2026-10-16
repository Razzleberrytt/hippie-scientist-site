#!/usr/bin/env python3
"""EM-007.04 research-only uncertainty inventory over an exact source-join receipt.

No search of external human-outcome studies is performed. In particular,
"not supplied in this film's source pack" is NOT "null trial", "conflicting
trial", "no evidence exists", or "mechanism proven".
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA, LINES, tokens

SCHEMA = "ths-em00704-frozen-claim-uncertainty-v1"
FROZEN_SPOKEN_LEDGER = Path(__file__).with_name("EM00701-FROZEN-SPOKEN-LEDGER-20261016.json")
CLAIM_SPAN_LENGTHS = (8,12,13,7,11,6,6,10)
SOURCE_SCHEMA = "ths-em00703-source-context-join-v1"
KINDS = (
    "QUESTION", "STRUCTURAL_ASSERTION", "SOURCE_PROVENANCE_ASSERTION",
    "COMPUTED_POSE_LIMIT", "NOT_OBSERVED_BINDING",
    "STRUCTURE_EXPLANATION", "NO_EXPERIENCED_EFFECT_INFERENCE",
    "EDITORIAL_INVITATION",
)
# Independently declared acceptance oracle, not copied from data at runtime.
SOURCE_CONTEXT = (
    "NOT_A_STUDY_QUESTION", "NOT_A_HUMAN_STUDY",
    "NOT_A_HUMAN_STUDY", "NOT_A_RECEPTOR_STUDY",
    "NOT_A_RECEPTOR_STUDY", "NOT_A_HUMAN_STUDY",
    "HUMAN_OUTCOME_STUDY_NOT_IN_THIS_ASSET", "NOT_A_STUDY_CLAIM",
)
SOURCE_SCOPES = (
    "CHEMICAL_IDENTITY_ONLY", "CHEMICAL_GRAPH_ONLY",
    "CHEMICAL_GRAPH_AND_RENDER_PROVENANCE",
    "COMPUTED_ARTIFACT_PROVENANCE_ONLY", "FILM_FOOTAGE_SCOPE_ONLY",
    "CHEMICAL_DEPICTION_ONLY", "LIMIT_OF_DEPICTION_NOT_ABSENCE_OF_EFFECT",
    "NONFACTUAL_EDITORIAL_INVITATION",
)
CLAIM_FIELDS = frozenset({
    "claimId", "claimType", "verbatimFrozenTokens", "wordIndices",
    "material", "shotIds", "sourceIds", "supportedMeaningScope",
    "studyContextStatus", "humanStudyId",
    "sourceLinksSupportClinicalEffect", "clinicalEffectAbsenceProven",
    "qualifiedIndependentScientificReview", "sourceContextMachineJoined",
})
SOURCE_IDS = (
    ("pubchem:3034396", "pubchem:44301524"),
    ("pubchem:3034396", "pubchem:44301524"),
    ("pubchem:44301524", "media:render"),
    ("media:render", "media:story"),
    ("media:render", "media:story"),
    ("pubchem:3034396", "pubchem:44301524", "media:render"),
    ("pubchem:44301524", "media:render"),
    (),
)
ALLOWED_SHA_FIELDS = ("sourceWavSha256", "spokenLedgerSha256",
                      "visualInventorySha256", "filmSha256")
NULL_STATUS = "UNASSESSED_NO_NULL_TRIAL_RECEIPT"
CONFLICT_STATUS = "UNASSESSED_NO_SYSTEMATIC_CONFLICT_ASSESSMENT"
HUMAN_STATUS = "HUMAN_OUTCOME_DATA_NOT_SUPPLIED_IN_THIS_SOURCE_PACK"
MECHANISM_STATUS = "CHEMICAL_AND_COMPUTED_MEDIA_DO_NOT_PROVE_BIOLOGICAL_MECHANISM"

def hold(code):
    raise ValueError("EM00704_UNCERTAINTY_HOLD:" + code)

def is_hash(value):
    return isinstance(value, str) and re.fullmatch("[a-f0-9]{64}", value) is not None

def frozen_claim_spans():
    words = tokens(" ".join(LINES))
    if len(words) != 73 or sum(CLAIM_SPAN_LENGTHS) != 73:
        hold("FROZEN_SOURCE_WORD_COUNT_CHANGED")
    start = 0
    spans = []
    for size in CLAIM_SPAN_LENGTHS:
        indices = list(range(start, start + size))
        spans.append((indices, " ".join(words[start:start + size])))
        start += size
    return spans

def classify(join, *, source_sha):
    if (not isinstance(join, dict) or join.get("schema") != SOURCE_SCHEMA
        or join.get("task") != "EM-007.03"
        or not is_hash(source_sha)
        or any(not is_hash(join.get(k)) for k in ALLOWED_SHA_FIELDS)
        or join["sourceWavSha256"] != WAV_SHA
        or not FROZEN_SPOKEN_LEDGER.is_file()
        or FROZEN_SPOKEN_LEDGER.is_symlink()
        or join.get("spokenLedgerSha256") != hashlib.sha256(FROZEN_SPOKEN_LEDGER.read_bytes()).hexdigest()
        or join.get("materialClaimCount") != 6
        or join.get("materialClaimsWithTypedSourceContext") != 6
        or join.get("humanStudyContextsMissingForOutcomeInference") != ["spoken-007"]
        or join.get("fabricatedPubmedIds") != []
        or join.get("clinicalSourceClaimsApproved") is not False
        or join.get("needsIndependentScientificReview") is not True
        or join.get("mayPublish") is not False):
        hold("SOURCE_JOIN_IDENTITY_OR_APPROVAL_DRIFT")
    sources = join.get("sources")
    if not isinstance(sources, dict) or set(sources) != {
        "pubchem:3034396", "pubchem:44301524", "media:render", "media:story"
    }:
        hold("EXACT_SOURCE_PACK_REQUIRED")
    for ident, cid in (("pubchem:3034396", 3034396),
                       ("pubchem:44301524", 44301524)):
        record = sources[ident]
        if (not isinstance(record, dict)
            or record.get("kind") != "PRIMARY_CHEMICAL_RECORD"
            or record.get("cid") != cid
            or record.get("recordType") != "COMPUTED_STRUCTURE_DESCRIPTOR"
            or record.get("url") != f"https://pubchem.ncbi.nlm.nih.gov/compound/{cid}"
            or not isinstance(record.get("inchiKey"), str)
            or not record["inchiKey"]
            or record.get("studyPopulation") is not None
            or record.get("measuredHumanOutcome") is not None):
            hold("CHEMICAL_RECORD_CANNOT_BECOME_HUMAN_STUDY")
    for ident, kind, digest_key, digest_value in (
        ("media:render", "SOURCE_FILM_ATTESTATION", "artifactSha256", join["filmSha256"]),
        ("media:story", "SOURCE_SHOT_STORY_MAP", "storyMapSha256", join["visualInventorySha256"])):
        record = sources[ident]
        # Story map's digest is a separate source SHA, not visual-inventory SHA.
        if ident == "media:story":
            digest_value = join.get("sources",{}).get(ident,{}).get("storyMapSha256")
        if (not isinstance(record, dict) or record.get("kind") != kind
            or not is_hash(record.get(digest_key))
            or record[digest_key] != digest_value
            or record.get("studyPopulation") is not None
            or record.get("measuredHumanOutcome") is not None):
            hold("COMPUTED_MEDIA_NOT_A_CLINICAL_STUDY")
    claims = join.get("claims")
    if (not isinstance(claims, list) or len(claims) != 8
        or any(not isinstance(x, dict) for x in claims)):
        hold("EIGHT_EXACT_FROZEN_CLAIMS_REQUIRED")
    rows = []
    expected_spans = frozen_claim_spans()
    for i, claim in enumerate(claims):
        ident = f"spoken-{i+1:03d}"
        material = 1 <= i <= 6
        if (set(claim) != CLAIM_FIELDS
            or claim.get("claimId") != ident or claim.get("claimType") != KINDS[i]
            or claim.get("supportedMeaningScope") != SOURCE_SCOPES[i]
            or claim.get("studyContextStatus") != SOURCE_CONTEXT[i]
            or claim.get("material") is not material
            or tuple(claim.get("sourceIds", ())) != SOURCE_IDS[i]
            or claim.get("wordIndices") != expected_spans[i][0]
            or claim.get("verbatimFrozenTokens") != expected_spans[i][1]
            or claim.get("humanStudyId") is not None
            or claim.get("sourceLinksSupportClinicalEffect") is not False
            or claim.get("clinicalEffectAbsenceProven") is not False
            or claim.get("qualifiedIndependentScientificReview") is not False
            or claim.get("sourceContextMachineJoined") is not True):
            hold("CLAIM_SCOPE_OR_CLINICAL_EVIDENCE_CONFLATION:" + ident)
        rows.append({
            "claimId": ident,
            "sourceIds": list(SOURCE_IDS[i]),
            "sourceStudyContext": SOURCE_CONTEXT[i],
            "material": material,
            "nullFinding": NULL_STATUS,
            "conflictingFindings": CONFLICT_STATUS,
            "humanOutcomeEvidence": HUMAN_STATUS if material else "NOT_AN_OUTCOME_ASSERTION",
            "biologicalMechanismEvidence": MECHANISM_STATUS if material else "NOT_AN_OUTCOME_ASSERTION",
            "missingStudyDoesNotImplyNullEffect": True,
            "clinicalEffectOrAbsenceProven": False,
            "externalLiteratureReviewed": False,
            "qualifiedScienceReviewerApproved": False,
        })
    if len(rows) != 8 or sum(x["material"] for x in rows) != 6:
        hold("UNCERTAINTY_ROWS_INCOMPLETE")
    return {
        "schema": SCHEMA, "task": "EM-007.04",
        "sourceJoinSha256": source_sha,
        "sourceWavSha256": join["sourceWavSha256"],
        "filmSha256": join["filmSha256"],
        "totalClaims": 8, "materialClaims": 6,
        "nullFindingsEvaluated": False,
        "conflictingStudiesEvaluated": False,
        "externalHumanOutcomeSearchPerformed": False,
        "noHumanStudiesExistProven": False,
        "mechanismClinicallyValidated": False,
        "claims": rows,
        "status": "SOURCE_PACK_LIMITS_CLASSIFIED_RESEARCH_ONLY",
        "independentScientificReviewApproved": False,
        "mayPublish": False,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-join", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    input_file = Path(args.source_join)
    if not input_file.is_file() or input_file.is_symlink():
        hold("EXACT_REGULAR_SOURCE_JOIN_REQUIRED")
    data = input_file.read_bytes()
    output = classify(json.loads(data), source_sha=hashlib.sha256(data).hexdigest())
    Path(args.out).write_text(json.dumps(output, indent=2)+"\n", encoding="utf-8")
    print(json.dumps({"status": output["status"], "claims": 8, "material": 6,
                      "externalHumanOutcomeSearchPerformed": False,
                      "mayPublish": False}))

if __name__ == "__main__":
    main()

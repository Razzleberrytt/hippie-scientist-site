#!/usr/bin/env python3
"""EM-007.05: scope-bound claim-strength comparisons for the actual 7-OH film.

This is an exact-asset *ceiling* audit. Chemical-identity records and a
computed film contain NO measured human P/O/D/T results, so a clinical
strength/pass claim must HOLD. It does not imply such studies do not exist.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path
from research_receipt_io import (
    prepare_research_output, emit_research_output, strict_research_json,
)

from scientific_uncertainty_ledger import (
    classify as classify_uncertainty, SOURCE_IDS, SOURCE_SCOPES,
    HUMAN_STATUS, NULL_STATUS, CONFLICT_STATUS,
)

SCHEMA = "ths-em00705-claim-strength-ceiling-v1"
HUMAN_AXES = ("population", "outcome", "dose", "exposureDuration", "followUp")
UNREPORTED = "NOT_REPORTED_IN_THIS_NONCLINICAL_SOURCE_PACK"
NOT_APPLICABLE = "NOT_A_MATERIAL_HUMAN_EFFECT_ASSERTION"
SOURCE_KINDS = {
    "pubchem:3034396": "PRIMARY_CHEMICAL_RECORD",
    "pubchem:44301524": "PRIMARY_CHEMICAL_RECORD",
    "media:render": "SOURCE_FILM_ATTESTATION",
    "media:story": "SOURCE_SHOT_STORY_MAP",
}
# Exact schema is necessary: unknown names such as "effectiveDoseMg"
# could insinuate human efficacy without matching a keyword denylist.
EXACT_SOURCE_FIELDS = {
    "pubchem:3034396": frozenset((
        "cid", "formula", "inchiKey", "kind", "measuredHumanOutcome",
        "permittedMeaning", "recordType", "studyPopulation", "url")),
    "pubchem:44301524": frozenset((
        "cid", "formula", "inchiKey", "kind", "measuredHumanOutcome",
        "permittedMeaning", "recordType", "studyPopulation", "url")),
    "media:render": frozenset((
        "artifactSha256", "kind", "measuredHumanOutcome", "permittedMeaning",
        "renderReceiptSha256", "studyPopulation", "url")),
    "media:story": frozenset((
        "kind", "measuredHumanOutcome", "permittedMeaning",
        "storyMapSha256", "studyPopulation", "url")),
}
# Metadata that would inject a clinical study context into the pinned chemical
# descriptors or local movie is not accepted even if a new JSON hash matches.
CLINICAL_FIELDS = frozenset({
    "population", "participants", "sampleSize", "clinicalTrial",
    "clinicalStudy", "humanDose", "doseMg", "dose", "doseSchedule",
    "followUp", "followUpDays", "studyDuration", "exposureDuration",
    "treatmentEffect", "effectEstimate", "confidenceInterval",
    "measuredClinicalOutcome", "humanOutcome", "outcomeMeasure",
})
# The envelope/schema alone is insufficient: a newly rehashed source join
# could retain every allowed field yet replace its meaning with "human trial
# proven". Keep the semantic source ceiling independent of the join producer.
PINNED_SOURCE_MEANING = {
    "pubchem:3034396":"mitragynine chemical identity/connectivity only",
    "pubchem:44301524":"7-hydroxymitragynine identity, O-H, connectivity only",
    "media:render":"film is computed structure artwork, not receptor footage",
    "media:story":"source-locked shot annotations and limits only",
}
AUDIT_RESULT = "WITHIN_NONCLINICAL_SOURCE_SCOPE_RESEARCH_ONLY"

def hold(reason):
    raise ValueError("EM00705_SCOPE_HOLD:" + reason)

def sha256(value):
    return isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value) is not None

def evaluate(source_join, uncertainty, *, source_join_sha, uncertainty_sha):
    if not sha256(source_join_sha) or not sha256(uncertainty_sha):
        hold("BOTH_EXACT_PARENT_DIGESTS_REQUIRED")
    # Exact equality with the result *recomputed* from the same claim-source
    # input, rather than trusting user-editable pass flags in a rehashed JSON.
    expected_uncertainty = classify_uncertainty(source_join, source_sha=source_join_sha)
    if uncertainty != expected_uncertainty or uncertainty.get("sourceJoinSha256") != source_join_sha:
        hold("UNCERTAINTY_REPORT_OR_SOURCE_JOIN_DRIFT")

    sources = source_join["sources"]
    if set(sources) != set(SOURCE_KINDS):
        hold("SOURCE_SET_CHANGED")
    for sid, expected_kind in SOURCE_KINDS.items():
        data = sources[sid]
        if not isinstance(data, dict) or data.get("kind") != expected_kind:
            hold("NONCLINICAL_SOURCE_KIND_CHANGED:" + sid)
        # The upstream exact source-join has explicit *null* non-study fields.
        # Preserve those as null proof, but reject extra clinical fields and
        # ANY non-null upgrade of their declared missing-human-data status.
        allowed_null_markers = {"studyPopulation", "measuredHumanOutcome"}
        if any(key not in allowed_null_markers and
               (key in CLINICAL_FIELDS or re.search(
                r"(clinical|trial|effectEstimate|humanOutcome)", key, re.I))
               for key in data):
            hold("INJECTED_HUMAN_STUDY_METADATA:" + sid)
        if data.get("studyPopulation") is not None or data.get("measuredHumanOutcome") is not None:
            hold("INJECTED_HUMAN_STUDY_RESULT:" + sid)
        if set(data) != EXACT_SOURCE_FIELDS[sid]:
            hold("NONCLINICAL_SOURCE_SCHEMA_DRIFT:" + sid)
        if data.get("permittedMeaning") != PINNED_SOURCE_MEANING[sid]:
            hold("SOURCE_MEANING_EXCEEDS_NONCLINICAL_SCOPE:" + sid)

    rows = []
    for idx, (claim, prior) in enumerate(zip(source_join["claims"], uncertainty["claims"])):
        cid = f"spoken-{idx+1:03d}"
        material = 1 <= idx <= 6
        if (claim["claimId"] != cid or prior["claimId"] != cid
            or claim["material"] is not material
            or tuple(claim["sourceIds"]) != SOURCE_IDS[idx]
            or claim["supportedMeaningScope"] != SOURCE_SCOPES[idx]
            or prior["nullFinding"] != NULL_STATUS
            or prior["conflictingFindings"] != CONFLICT_STATUS
            or prior["clinicalEffectOrAbsenceProven"] is not False
            or prior["externalLiteratureReviewed"] is not False
            or claim["sourceLinksSupportClinicalEffect"] is not False
            or claim["clinicalEffectAbsenceProven"] is not False):
            hold("CLAIM_EXCEEDS_EVIDENCE_STRENGTH:" + cid)
        if material and prior["humanOutcomeEvidence"] != HUMAN_STATUS:
            hold("HUMAN_OUTCOME_CONTEXT_MISCLASSIFIED:" + cid)
        axes = {axis:UNREPORTED if material else NOT_APPLICABLE for axis in HUMAN_AXES}
        rows.append({
            "claimId": cid,
            "sourceIds": list(SOURCE_IDS[idx]),
            "spokenStrengthScope": SOURCE_SCOPES[idx],
            "strongestAvailableSourceScope": SOURCE_SCOPES[idx],
            "populationOutcomeDoseTimingFollowUp": axes,
            "sourceType": "CHEMISTRY_OR_COMPUTED_FILM_ONLY" if material
                          else "NONOUTCOME_QUESTION_OR_EDITORIAL",
            "scopeComparison": AUDIT_RESULT,
            "clinicalEffectStrengthComparison": (
                "HOLD_NO_HUMAN_POPULATION_OUTCOME_DOSE_OR_TIME_STUDY_IN_ASSET"
                if material else NOT_APPLICABLE
            ),
            "sourceSupportsEffectsOrAbsence": False,
            "externalStudiesReviewed": False,
            "independentScienceApproval": False,
        })
    if len(rows) != 8 or sum(x["sourceType"] == "CHEMISTRY_OR_COMPUTED_FILM_ONLY"
                              for x in rows) != 6:
        hold("ALL_EIGHT_CLAIM_SCOPE_ROWS_REQUIRED")
    return {
        "schema":SCHEMA, "task":"EM-007.05",
        "sourceJoinSha256":source_join_sha, "uncertaintyLedgerSha256":uncertainty_sha,
        "sourceWavSha256":source_join["sourceWavSha256"],
        "filmSha256":source_join["filmSha256"],
        "materialClaimsWithSourceScopeComparison":6,
        "spokenClaimsAssessed":8, "humanStudyComparisonPossible":False,
        "externalPopulationOutcomeDoseTimingSearchPerformed":False,
        "clinicalStrengthClaimsApproved":False,
        "claims":rows,
        "status":"MACHINE_SCOPE_COMPARISON_ONLY_HUMAN_OUTCOME_HOLD",
        "needsIndependentScientificReview":True, "mayPublish":False,
    }

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-join", required=True)
    parser.add_argument("--uncertainty", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    output_path = prepare_research_output(args.out, (args.source_join, args.uncertainty))
    for name in ("source_join", "uncertainty"):
        path = Path(getattr(args, name))
        if not path.is_file() or path.is_symlink():
            hold("REGULAR_HASH_BOUND_INPUT_REQUIRED:" + name)
    join_file, uncertainty_file = Path(args.source_join), Path(args.uncertainty)
    join_bytes = join_file.read_bytes()
    uncertainty_bytes = uncertainty_file.read_bytes()
    output = evaluate(
        strict_research_json(join_bytes),
        strict_research_json(uncertainty_bytes),
        source_join_sha=hashlib.sha256(join_bytes).hexdigest(),
        uncertainty_sha=hashlib.sha256(uncertainty_bytes).hexdigest(),
    )
    emit_research_output(output_path, output)
    print(json.dumps({"status":output["status"],"claims":8,"material":6,
                      "humanStudyComparisonPossible":False,"mayPublish":False}))

if __name__ == "__main__":
    main()

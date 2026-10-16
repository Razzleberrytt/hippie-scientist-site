#!/usr/bin/env python3
"""EM-007.03: primary chemical/source-media joins for exact narrated claims.

Structural records can justify chemical *identities*, not effects. Internal
render artifacts can justify what the film shows, not receptor biology. A
typed no-study context is explicit evidence ABSENCE, never an invented PMID.
This is a research provenance inventory, not independent scientific approval.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

from autonomous_script_asr_research import WAV_SHA, LINES, tokens
from verified_molecular_comparison import (
    MITRAGYNINE, HYDROXYMITRAGYNINE, approved_comparison)
from visual_claim_inventory import EXACT_SHOTS, SOURCE_CARD_LABELS

SCHEMA="ths-em00703-source-context-join-v1"
EXPECTED_TYPES=(
    "QUESTION","STRUCTURAL_ASSERTION","SOURCE_PROVENANCE_ASSERTION",
    "COMPUTED_POSE_LIMIT","NOT_OBSERVED_BINDING",
    "STRUCTURE_EXPLANATION","NO_EXPERIENCED_EFFECT_INFERENCE",
    "EDITORIAL_INVITATION",
)
# Speech spans are pinned to independently enumerated 73-token frozen audio.
SPAN_SHOTS={
    "spoken-001":("sentence_1_part0","sentence_1_part1"),
    "spoken-002":("sentence_2",),
    "spoken-003":("sentence_3",),
    "spoken-004":("sentence_4",),
    "spoken-005":("sentence_4",),
    "spoken-006":("sentence_5_part0",),
    "spoken-007":("sentence_5_part1",),
    "spoken-008":("sentence_6",),
}
# Every material claim has source IDs, an exact source scope, and typed study
# context. Claims about this animation are NOT claims about receptor studies.
SUPPORT={
    "spoken-001":(("pubchem:3034396","pubchem:44301524"),
                  "CHEMICAL_IDENTITY_ONLY","NOT_A_STUDY_QUESTION"),
    "spoken-002":(("pubchem:3034396","pubchem:44301524"),
                  "CHEMICAL_GRAPH_ONLY","NOT_A_HUMAN_STUDY"),
    "spoken-003":(("pubchem:44301524","media:render"),
                  "CHEMICAL_GRAPH_AND_RENDER_PROVENANCE","NOT_A_HUMAN_STUDY"),
    "spoken-004":(("media:render","media:story"),
                  "COMPUTED_ARTIFACT_PROVENANCE_ONLY","NOT_A_RECEPTOR_STUDY"),
    "spoken-005":(("media:render","media:story"),
                  "FILM_FOOTAGE_SCOPE_ONLY","NOT_A_RECEPTOR_STUDY"),
    "spoken-006":(("pubchem:3034396","pubchem:44301524","media:render"),
                  "CHEMICAL_DEPICTION_ONLY","NOT_A_HUMAN_STUDY"),
    "spoken-007":(("pubchem:44301524","media:render"),
                  "LIMIT_OF_DEPICTION_NOT_ABSENCE_OF_EFFECT",
                  "HUMAN_OUTCOME_STUDY_NOT_IN_THIS_ASSET"),
    "spoken-008":((),"NONFACTUAL_EDITORIAL_INVITATION","NOT_A_STUDY_CLAIM"),
}
MATERIAL_IDS=tuple(f"spoken-{i:03}" for i in range(2,8))
BLOCKED_HUMAN_CONTEXT="HUMAN_OUTCOME_STUDY_NOT_IN_THIS_ASSET"

def hold(code):
    raise ValueError("EM00703_SOURCE_JOIN_HOLD:"+code)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as stream:
        for c in iter(lambda:stream.read(1<<20),b""):
            h.update(c)
    return h.hexdigest()

def loaded(path):
    f=Path(path)
    if not f.is_file() or f.is_symlink():
        hold("REGULAR_IMMUTABLE_INPUT_REQUIRED")
    return json.loads(f.read_text(encoding="utf8"))

def join(spoken,visual,*,spoken_sha,visual_sha):
    if (spoken.get("schema")!="ths-frozen-spoken-claim-ledger-v1"
        or spoken.get("task")!="EM-007.01"
        or spoken.get("wordCount")!=73
        or spoken.get("assertionCount")!=8
        or spoken.get("wordCoverageVerified") is not True
        or spoken.get("scienceApproved") is not False
        or spoken.get("mayPublish") is not False
        or spoken.get("sourceWavSha256")!=WAV_SHA
        or visual.get("schema")!="ths-em00702-exact-film-visual-claim-inventory-v1"
        or visual.get("task")!="EM-007.02"
        or visual.get("sourceWavSha256")!=WAV_SHA
        or visual.get("shotsInspected")!=9
        or visual.get("sourceCaptionCuesAssigned")!=71
        or visual.get("scienceClaimsApproved") is not False
        or visual.get("impliedEffectRisksHumanReviewed") is not False
        or visual.get("mayPublish") is not False
        or not re.fullmatch(r"[a-f0-9]{64}",str(visual.get("filmSha256","")))):
        hold("EXACT_RESEARCH_INPUT_CONTRACT_REQUIRED")
    assertions=spoken.get("assertions")
    words=spoken.get("words")
    if (not isinstance(assertions,list) or len(assertions)!=8
        or not isinstance(words,list) or len(words)!=73
        or [w.get("index") for w in words]!=list(range(73))
        or [w.get("word") for w in words]!=tokens(" ".join(LINES))
        or [a.get("id") for a in assertions]!=list(SPAN_SHOTS)
        or [a.get("kind") for a in assertions]!=list(EXPECTED_TYPES)):
        hold("EXACT_FROZEN_73_WORD_EIGHT_ASSERTION_COVERAGE")
    seen=[]
    for a in assertions:
        index=a["wordIndices"]
        if (not isinstance(index,list) or not index
            or index!=list(range(index[0],index[-1]+1))
            or any(not isinstance(j,int) or j<0 or j>=73 for j in index)
            or " ".join(words[j]["word"] for j in index)!=a.get("text")
            or any(words[j].get("assertionId")!=a["id"] for j in index)):
            hold("ASSERTION_SPANS_OR_WORD_SOURCE_DRIFT:"+a["id"])
        seen.extend(index)
    if seen!=list(range(73)):
        hold("WORD_SPANS_OVERLAP_OR_OMIT")
    shots=visual.get("rows")
    if (not isinstance(shots,list) or [s.get("shot") for s in shots]
        !=list(EXACT_SHOTS) or any(
            not isinstance(s.get("impliedEffectOrMisreadingToReview"),str)
            or not s["impliedEffectOrMisreadingToReview"].strip()
            or s.get("humanInterpretationReviewed") is not False
            or s.get("clinicalEffectSupportedByThisVisual") is not False
            for s in shots)):
        hold("ACTUAL_NINE_SHOT_VISUAL_SCOPE_OR_RISKS_REQUIRED")
    source_shot=shots[7]
    if tuple(source_shot.get("emittedSourceAnnotations",{}).get("source",[]))!=SOURCE_CARD_LABELS:
        hold("PINNED_COMPOUND_TO_CID_SOURCE_CARD_MISMATCH")
    # Verify exact chemical structure/identifier pairs with pre-existing
    # RDKit on the pinned source graph. Does not check pharmacology.
    pair=approved_comparison()
    mit=pair["mitragynine"]["source"]
    hydro=pair["7_hydroxymitragynine"]["source"]
    if (mit!=MITRAGYNINE or hydro!=HYDROXYMITRAGYNINE
        or pair["mitragynine"]["free_oh_indices"]!=[]
        or len(pair["7_hydroxymitragynine"]["free_oh_indices"])!=1
        or pair["scientific_effects_or_conversion_inferred"] is not False
        or pair["publication_approved"] is not False):
        hold("CHEMICAL_GRAPH_AND_NO_EFFECT_CONTRACT_CHANGED")
    sources={
        "pubchem:3034396":{
            "kind":"PRIMARY_CHEMICAL_RECORD","cid":mit.pubchem_cid,
            "url":mit.source_url,"inchiKey":mit.inchi_key,
            "formula":mit.formula,"recordType":"COMPUTED_STRUCTURE_DESCRIPTOR",
            "studyPopulation":None,"measuredHumanOutcome":None,
            "permittedMeaning":"mitragynine chemical identity/connectivity only"},
        "pubchem:44301524":{
            "kind":"PRIMARY_CHEMICAL_RECORD","cid":hydro.pubchem_cid,
            "url":hydro.source_url,"inchiKey":hydro.inchi_key,
            "formula":hydro.formula,"recordType":"COMPUTED_STRUCTURE_DESCRIPTOR",
            "studyPopulation":None,"measuredHumanOutcome":None,
            "permittedMeaning":"7-hydroxymitragynine identity, O-H, connectivity only"},
        "media:render":{
            "kind":"SOURCE_FILM_ATTESTATION",
            "artifactSha256":visual["filmSha256"],
            "renderReceiptSha256":visual["receiptSha256"],
            "url":None,"studyPopulation":None,"measuredHumanOutcome":None,
            "permittedMeaning":"film is computed structure artwork, not receptor footage"},
        "media:story":{
            "kind":"SOURCE_SHOT_STORY_MAP",
            "storyMapSha256":visual["storyMapSha256"],
            "url":None,"studyPopulation":None,"measuredHumanOutcome":None,
            "permittedMeaning":"source-locked shot annotations and limits only"},
    }
    # The source IDs are retrievable from pinned PubChem URLs or hash-bound
    # media artifact references. No fabricated trial/PMID is introduced.
    rows=[]
    for a in assertions:
        identity=a["id"]
        ids,scope,context=SUPPORT[identity]
        if identity in MATERIAL_IDS and not ids:
            hold("MATERIAL_CLAIM_NO_SOURCE:"+identity)
        if any(k not in sources for k in ids):
            hold("UNREGISTERED_SOURCE_ID:"+identity)
        for shot in SPAN_SHOTS[identity]:
            if shot not in [v["shot"] for v in shots]:
                hold("CLAIM_HAS_NO_VISUAL_SHOT:"+identity)
        rows.append({
            "claimId":identity,"claimType":a["kind"],
            "verbatimFrozenTokens":a["text"],"wordIndices":a["wordIndices"],
            "material":identity in MATERIAL_IDS,
            "shotIds":list(SPAN_SHOTS[identity]),
            "sourceIds":list(ids),"supportedMeaningScope":scope,
            "studyContextStatus":context,
            "humanStudyId":None, # Never imply no-study means negative outcomes.
            "sourceLinksSupportClinicalEffect":False,
            "clinicalEffectAbsenceProven":False,
            "qualifiedIndependentScientificReview":False,
            "sourceContextMachineJoined":True,
        })
    if len(rows)!=8 or [r["claimId"] for r in rows]!=list(SPAN_SHOTS):
        hold("EXHAUSTIVE_MATERIAL_CLAIM_MAPPING_REQUIRED")
    return {
        "schema":SCHEMA,"task":"EM-007.03",
        "sourceWavSha256":WAV_SHA,"spokenLedgerSha256":spoken_sha,
        "visualInventorySha256":visual_sha,"filmSha256":visual["filmSha256"],
        "sources":sources,"claims":rows,"materialClaimCount":len(MATERIAL_IDS),
        "materialClaimsWithTypedSourceContext":len(MATERIAL_IDS),
        "fabricatedPubmedIds":[],"clinicalSourceClaimsApproved":False,
        "humanStudyContextsMissingForOutcomeInference":[
            "spoken-007"],"mayPublish":False,
        "needsIndependentScientificReview":True,
    }

def main():
    p=argparse.ArgumentParser()
    for arg in ("spoken","visual","out"):
        p.add_argument("--"+arg,required=True)
    a=p.parse_args()
    s=loaded(a.spoken)
    v=loaded(a.visual)
    data=join(s,v,spoken_sha=digest(a.spoken),visual_sha=digest(a.visual))
    Path(a.out).write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(json.dumps({"status":"SOURCE_CONTEXT_JOIN_RESEARCH_ONLY",
                      "claims":len(data["claims"]),
                      "material":data["materialClaimsWithTypedSourceContext"],
                      "missingHumanOutcomeStudies":data["humanStudyContextsMissingForOutcomeInference"],
                      "mayPublish":False}))
if __name__=="__main__":main()

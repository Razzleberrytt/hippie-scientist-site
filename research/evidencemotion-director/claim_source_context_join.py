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
from research_receipt_io import (
    prepare_research_output, emit_research_output, strict_research_json,
)

from autonomous_script_asr_research import WAV_SHA, LINES, tokens
from verified_molecular_comparison import (
    MITRAGYNINE, HYDROXYMITRAGYNINE, approved_comparison)
from visual_claim_inventory import EXACT_SHOTS, SOURCE_CARD_LABELS, EFFECT_CLAIMS

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
# Independent fail-closed ceiling: metadata/animation never becomes a study.
# This semantic allowlist is deliberately separate from the source mapping.
SCOPE_CONTEXT_ORACLE={
    "spoken-001":("CHEMICAL_IDENTITY_ONLY","NOT_A_STUDY_QUESTION"),
    "spoken-002":("CHEMICAL_GRAPH_ONLY","NOT_A_HUMAN_STUDY"),
    "spoken-003":("CHEMICAL_GRAPH_AND_RENDER_PROVENANCE","NOT_A_HUMAN_STUDY"),
    "spoken-004":("COMPUTED_ARTIFACT_PROVENANCE_ONLY","NOT_A_RECEPTOR_STUDY"),
    "spoken-005":("FILM_FOOTAGE_SCOPE_ONLY","NOT_A_RECEPTOR_STUDY"),
    "spoken-006":("CHEMICAL_DEPICTION_ONLY","NOT_A_HUMAN_STUDY"),
    "spoken-007":("LIMIT_OF_DEPICTION_NOT_ABSENCE_OF_EFFECT",
                  "HUMAN_OUTCOME_STUDY_NOT_IN_THIS_ASSET"),
    "spoken-008":("NONFACTUAL_EDITORIAL_INVITATION","NOT_A_STUDY_CLAIM"),
}
MATERIAL_IDS=tuple(f"spoken-{i:03}" for i in range(2,8))
BLOCKED_HUMAN_CONTEXT="HUMAN_OUTCOME_STUDY_NOT_IN_THIS_ASSET"
# Require complete, independently digestible parent-artifact identities.
# File-level SHA joins do not authenticate clinical meaning, but a missing or
# malformed SHA must never be promoted into a source-backed assertion.
VISUAL_HASH_FIELDS=(
    "filmSha256","receiptSha256","phonePlanSha256",
    "encodedScienceOcrSha256","encodedCaptionOcrSha256","storyMapSha256",
)
FRAME_HASH_FIELDS=("actualDecodedFrameSha256","actualDecodedPixelOcrSha256")
ANNOTATION_ROLES=("hook","science","source","disclosure","caption")

# EM-008.02: guard measured-content claims when botanical imagery is discussed.
# A PubChem chemical structure cannot establish an assay result for a leaf,
# plant, kratom product, extract or powder. This checks claimed annotations
# (including split labels in the same scene), not the underlying video pixels.
BOTANICAL_CONTEXT = re.compile(
    r"\b(?:plant|plants|leaf|leaves|foliage|botanical|botanicals|kratom|"
    r"mitragyna\s+speciosa|herb|herbs|powder|extract|tea|"
    r"products?|capsules?|tinctures?|resins?|tablets?|gummies)\b", re.I)
SEVEN_OH_REFERENCE = re.compile(
    # Cover spoken "seven o h", Unicode dash and spaced chemical naming.
    r"(?<!\w)(?:7\s*[-–—‑]?\s*(?:OH|hydroxy\s*mitragynine)|"
    r"seven\s*[-–—‑]?\s*o\s*[-–—‑]?\s*h)(?!\w)", re.I)
BOTANICAL_CONTENT_ASSERTION = re.compile(
    r"\b(?:contains?|content|has|have|had|produces?|yields?|found|occurs?|"
    r"measur(?:ed|ement|able)|detect(?:ed|ion|able)|"
    r"quantif(?:ied|ication)|tested|test\s+result|confirmed|verified|"
    r"concentration|percent|present|absent|none|zero|rich|mg|µg|ppm)\b"
    r"|\d+(?:\.\d+)?\s*(?:%|mg|µg|ug|ppm)\b", re.I)
POSITIVE_CONTENT_LANGUAGE = re.compile(
    r"\b(?:contains?|has|have|had|produces?|yields?|found|occurs?|"
    r"detect(?:ed|ion|able)|measur(?:ed|ement|able)|"
    r"quantified|tested|test\s+result|confirmed|verified|rich|"
    r"concentration|percent|present|absent|none|zero|rich|mg|µg|ppm)\b"
    r"|\d+(?:\.\d+)?\s*(?:%|mg|µg|ug|ppm)\b", re.I)

# Negated quantity/presence is still an empirical content claim. A source
# structure cannot establish an absence of 7-OH from a plant or product.
# Keep the explicit illustration/no-proof exception ONLY for plain
# disclosures with no positive OR negative assertion of measured content.
BOTANICAL_ABSENCE_ASSERTION = re.compile(
    r"\b(?:without|lacks?|lacking|undetectable|undetected|devoid|"
    r"(?:not|never)\s+detected|free\s+of|free\s+from)\b"
    r"|\bno\s+(?:detectable\s+)?7\s*[-–—‑]?\s*"
    r"(?:OH|hydroxy\s*mitragynine)\b"
    r"|\b7\s*[-–—‑]?\s*(?:OH|hydroxy\s*mitragynine)"
    r"\s*[-–—‑]?\s*free\b", re.I)

def asserts_unverified_botanical_7oh_content(text):
    """Flag plant/product 7-OH quantity, presence, absence or assay assertions.

    An explicit 'illustration; not proof' disclosure is allowed only when
    no content assertion accompanies it. Does not certify actual pixel glyphs,
    plant chemistry, audience inference, or an absent-7-OH trial result.
    """
    if not (BOTANICAL_CONTEXT.search(text) and SEVEN_OH_REFERENCE.search(text)):
        return False
    if BOTANICAL_ABSENCE_ASSERTION.search(text):
        return True
    if ("illustration" in text.casefold() and "not proof" in text.casefold()
            and not POSITIVE_CONTENT_LANGUAGE.search(text)):
        return False
    return bool(BOTANICAL_CONTENT_ASSERTION.search(text))

def is_sha256(value):
    return isinstance(value,str) and re.fullmatch(r"[a-f0-9]{64}",value) is not None

def hold(code):
    raise ValueError("EM00703_SOURCE_JOIN_HOLD:"+code)

def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as stream:
        for c in iter(lambda:stream.read(1<<20),b""):
            h.update(c)
    return h.hexdigest()

def loaded_with_digest(path):
    """Parse and SHA-pin the *same* immutable byte snapshot.

    EM-007.03 previously reopened sources after parsing to compute separate
    hashes. If a source file changed between those reads, the emitted hash
    could attest bytes different from the claims actually inspected.
    """
    f=Path(path)
    if not f.is_file() or f.is_symlink():
        hold("REGULAR_IMMUTABLE_INPUT_REQUIRED")
    raw=f.read_bytes()
    return strict_research_json(raw),hashlib.sha256(raw).hexdigest()

def loaded(path):
    return loaded_with_digest(path)[0]

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
        or not is_sha256(spoken_sha) or not is_sha256(visual_sha)
        or any(not is_sha256(visual.get(field)) for field in VISUAL_HASH_FIELDS)):
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
    if (not isinstance(shots,list) or len(shots)!=9
        or any(not isinstance(s,dict) for s in shots)
        or [s.get("shot") for s in shots]!=list(EXACT_SHOTS) or any(
            not isinstance(s.get("impliedEffectOrMisreadingToReview"),str)
            or not s["impliedEffectOrMisreadingToReview"].strip()
            or s.get("humanInterpretationReviewed") is not False
            or s.get("clinicalEffectSupportedByThisVisual") is not False
            or any(not is_sha256(s.get(field)) for field in FRAME_HASH_FIELDS)
            for s in shots)):
        hold("ACTUAL_NINE_SHOT_VISUAL_SCOPE_OR_RISKS_REQUIRED")
    # Adjacent shot annotations may imply an unsupported botanical assay.
    # This is authored metadata, not actual encoded pixel classification.
    adjacent_ink=[]
    adjacent_role_ink=[]
    for shot in shots:
        roles=shot.get("emittedSourceAnnotations")
        if (not isinstance(roles,dict)
            or set(roles)!=set(ANNOTATION_ROLES)
            or any(not isinstance(roles.get(role),list)
                   or any(not isinstance(t,str) or not t.strip()
                          for t in roles[role]) for role in ANNOTATION_ROLES)):
            hold("EXACT_NINE_SHOT_VISIBLE_ANNOTATIONS_REQUIRED")
        if shot["shot"]!="source_hold" and roles["source"]:
            hold("SOURCE_IDENTITY_CARD_OUTSIDE_AUTHORIZED_SCENE")
        # A freshly rehashed, contaminated EM-007.02 JSON is not proof of a
        # science-safe film; inspect its actual inventory content again.
        written_ink = " ".join(t for role in ANNOTATION_ROLES
                               for t in roles[role])
        adjacent_ink.append((shot["shot"],written_ink))
        adjacent_role_ink.append((shot["shot"],{
            role:" ".join(roles[role]) for role in ANNOTATION_ROLES}))
        if EFFECT_CLAIMS.search(written_ink):
            hold("UNSUPPORTED_TREATMENT_OR_EFFECT_TEXT:"+shot["shot"])
        # Even separately split annotation labels must not present imagined
        # botanical 7-OH concentrations, positive assays or absent content.
        if asserts_unverified_botanical_7oh_content(written_ink):
            hold("UNVERIFIED_BOTANICAL_7OH_CONTENT:"+shot["shot"])
    # EM-007.06: an unsupported human-effect or receptor-assay assertion can
    # also be assembled across cuts ("reduces" / "withdrawal cravings", or
    # "activates mu" / "opioid receptors"). Do not trust individually harmless
    # labels to establish clinical evidence when concatenated. This checks
    # authored source-linked annotations, NOT decoded pixels or perception.
    for width in (2, 3, 4):
        for offset in range(len(adjacent_ink)-width+1):
            window=adjacent_ink[offset:offset+width]
            joined=" ".join(ink for _,ink in window)
            # Intervening caption/source labels can break a sentence that is
            # deliberately split across consecutive SCIENCE overlays. Scan
            # corresponding role streams in addition to all-role shot text.
            role_window=adjacent_role_ink[offset:offset+width]
            role_texts=(" ".join(role_map[role] for _,role_map in role_window)
                        for role in ANNOTATION_ROLES)
            if EFFECT_CLAIMS.search(joined) or any(
                    EFFECT_CLAIMS.search(t) for t in role_texts):
                hold("UNSUPPORTED_TREATMENT_OR_EFFECT_CROSS_SHOT:"
                     +":".join(name for name,_ in window))
    # A sequence of three or four neighboring shots can complete a botanical
    # assay assertion even when shorter adjacent spans cannot detect it.
    # Preserve pairwise and three-shot detectors and inspect contiguous
    # four-shot windows as well. This is metadata text validation, not
    # decoded-pixel OCR or audience comprehension certification.
    for width in (2, 3, 4):
        for offset in range(len(adjacent_ink)-width+1):
            window=adjacent_ink[offset:offset+width]
            role_window=adjacent_role_ink[offset:offset+width]
            role_texts=(" ".join(role_map[role] for _,role_map in role_window)
                        for role in ANNOTATION_ROLES)
            if (asserts_unverified_botanical_7oh_content(
                    " ".join(ink for _,ink in window)) or any(
                    asserts_unverified_botanical_7oh_content(t)
                    for t in role_texts)):
                label=("UNVERIFIED_BOTANICAL_7OH_CROSS_SHOT:"
                       if width==2 else
                       "UNVERIFIED_BOTANICAL_7OH_THREE_SHOT:" if width==3 else
                       "UNVERIFIED_BOTANICAL_7OH_FOUR_SHOT:")
                hold(label+":".join(name for name,_ in window))
    # EM-007.06: the source-verified 2D comparison in scene two is NOT a
    # computed 3D model or a chemical reaction. Require BOTH molecule labels,
    # its free-hydroxyl explanation, and the explicit no-reaction disclosure.
    # This checks authored text, not encoded-pixel readability or clinical truth.
    comparison=shots[2]["emittedSourceAnnotations"]
    comparison_science={value.casefold() for value in comparison["science"]}
    if not {"mitragynine","7-oh","7-oh has one free hydroxyl"}.issubset(comparison_science):
        hold("VISIBLE_SOURCE_COMPARISON_LABELS_REQUIRED")
    if tuple(comparison["disclosure"])!=("Not a chemical reaction",):
        hold("VISIBLE_NO_REACTION_COMPARISON_DISCLOSURE_REQUIRED")
    # The later 3D scene still requires both its computed and not-filmed caveats,
    # even if all artifact hashes and exact source IDs are re-generated.
    computed_disclosure=" ".join(shots[4]["emittedSourceAnnotations"]["disclosure"]).casefold()
    contrast=" ".join(shots[6]["emittedSourceAnnotations"]["science"]).casefold()
    if not ("computed" in computed_disclosure and "not filmed" in computed_disclosure):
        hold("VISIBLE_NOT_FILMED_COMPUTED_POSE_QUALIFIER_REQUIRED")
    if "≠" not in contrast or "human experience" not in contrast:
        hold("VISIBLE_NO_HUMAN_EXPERIENCE_INFERENCE_REQUIRED")
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
        if (scope,context)!=SCOPE_CONTEXT_ORACLE[identity]:
            hold("SOURCE_SCOPE_EXCEEDS_CHEMISTRY_OR_MEDIA:"+identity)
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
    output_path=prepare_research_output(a.out,(a.spoken,a.visual))
    s,spoken_sha=loaded_with_digest(a.spoken)
    v,visual_sha=loaded_with_digest(a.visual)
    data=join(s,v,spoken_sha=spoken_sha,visual_sha=visual_sha)
    emit_research_output(output_path,data)
    print(json.dumps({"status":"SOURCE_CONTEXT_JOIN_RESEARCH_ONLY",
                      "claims":len(data["claims"]),
                      "material":data["materialClaimsWithTypedSourceContext"],
                      "missingHumanOutcomeStudies":data["humanStudyContextsMissingForOutcomeInference"],
                      "mayPublish":False}))
if __name__=="__main__":main()

#!/usr/bin/env python3
"""Exact native silent-visual reading budget: source and first-use identity safe.

This separately counts BOTH actually rendered narration captions and
non-caption scientific overlays. The legacy five-word/s overlay threshold is
NOT a full muted comprehension verdict; combined load is exposed as a strict
release HOLD when captions add more concurrent visible text than the ceiling.
No participant comprehension or calibrated eye-tracking is claimed.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

SCHEMA="ths-evidencemotion-native-rapid-cut-reading-budget-v2"
MAX_OPENING_VISUAL_WORDS_PER_SEC=5.0
OPENINGS=("sentence_1_part0","sentence_1_part1")
SOURCE_NAME="source_hold"


def _units(text):
    return re.findall(r"[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*",
                      text.replace("\n"," "))


def assess(plan):
    shots=plan.get("shots")
    if not isinstance(shots,list) or len(shots)!=9:
        raise ValueError("OPENING_READING_HOLD:NINE_EXACT_REAL_SHOTS_REQUIRED")
    byid={s.get("id"):s for s in shots}
    if len(byid)!=9 or any(x not in byid for x in (*OPENINGS,SOURCE_NAME)):
        raise ValueError("OPENING_READING_HOLD:SHOTS_OR_SOURCE_REQUIRED")
    source=[a["text"] for a in byid[SOURCE_NAME]["annotations"]
            if a.get("role")=="source"]
    required=("PubChem", "Mitragynine • CID 3034396", "7-OH • CID 44301524",
              "CID = compound record number", "pubchem.ncbi.nlm.nih.gov")
    if not all(x in source for x in required):
        raise ValueError("OPENING_READING_HOLD:BOTH_CID_SOURCES_AND_FIRST_USE_GLOSSARY_REQUIRED")
    outcomes=[]
    for scene,identity in zip(OPENINGS,("MITRAGYNINE","7-OH")):
        shot=byid[scene]
        secs=float(shot["endSec"]-shot["startSec"])
        visible=[a["text"] for a in shot["annotations"]
                 if a.get("role")!="caption"]
        units=sum(len(_units(text)) for text in visible)
        captions=[a["text"] for a in shot["annotations"]
                  if a.get("role")=="caption"]
        caption_units=sum(len(_units(text)) for text in captions)
        combined=units+caption_units
        wps=units/secs if secs>0 else float("inf")
        combined_wps=combined/secs if secs>0 else float("inf")
        identity_ok=(identity in visible and (
                     ("7-OH vs\nmitragynine" in visible and
                      "Separate structures • no reaction" in visible)
                     or visible==[identity,"No reaction"]))
        no_early_cid=all("CID" not in text for text in visible)
        pass_this=bool(secs>=1.50 and wps<=MAX_OPENING_VISUAL_WORDS_PER_SEC
                       and identity_ok and no_early_cid)
        outcomes.append({
            "scene":scene,"seconds":round(secs,3),"visualWords":units,
            "visualWordsPerSecond":round(wps,3),
            "captionWords":caption_units,"combinedVisibleWords":combined,
            "combinedVisibleWordsPerSecond":round(combined_wps,3),
            "passesCombinedVisibleTextBudget":bool(
                secs>=1.50 and combined_wps<=MAX_OPENING_VISUAL_WORDS_PER_SEC),
            "hasCorrectComparisonAndNoReactionDisclosure":identity_ok,
            "hasNoPrematureCitationJargon":no_early_cid,
            "passesOpeningReadingBudget":pass_this,
        })
    all_spans=[]
    for shot in shots:
        secs=float(shot["endSec"]-shot["startSec"])
        texts=[str(a["text"]) for a in shot["annotations"]
               if a.get("role")!="caption"]
        words=sum(len(_units(text)) for text in texts)
        caption_words=sum(len(_units(str(a["text"])))
                          for a in shot["annotations"] if a.get("role")=="caption")
        rate=words/secs if secs>0 else float("inf")
        combined_rate=(words+caption_words)/secs if secs>0 else float("inf")
        # Count the words that must NOT all appear in one sampled frame at
        # this scene duration. Defer them to genuine speech-timed caption
        # windows in a future edit; never silently delete spoken science,
        # citations or safety qualifiers. This is a planning diagnostic,
        # NOT evidence that such a revised film was rendered or understood.
        allowance=max(0,int(secs*MAX_OPENING_VISUAL_WORDS_PER_SEC+1e-9))
        remaining=max(0,allowance-words)
        defer=max(0,caption_words-remaining)
        if secs<1.50:
            fix="RESCHEDULE_OR_REEDIT_TOO_SHORT_SCENE"
        elif words>allowance:
            fix="REDESIGN_NONCAPTION_OVERLAYS_PRESERVE_SCIENCE"
        elif defer:
            fix="TIME_WINDOW_CAPTIONS_KEEP_COMPLETE_SPOKEN_TRANSCRIPT"
        else:
            fix="NO_MECHANICAL_READING_LOAD_REPAIR_NEEDED"
        all_spans.append({
            "scene":shot["id"],"seconds":round(secs,3),
            "visualWords":words,"visualWordsPerSecond":round(rate,3),
            "captionWords":caption_words,
            "combinedVisibleWords":words+caption_words,
            "combinedVisibleWordsPerSecond":round(combined_rate,3),
            "sampleFrameWordAllowance":allowance,
            "maxSampleFrameCaptionWordsAfterOverlays":remaining,
            "minimumSampleCaptionWordsToTimeWindow":defer,
            "readingLoadRepairAction":fix,
            "passesCombinedVisibleTextBudget":bool(
                secs>=1.50 and combined_rate<=MAX_OPENING_VISUAL_WORDS_PER_SEC),
            "passesFullFilmReadingBudget":bool(secs>=1.50 and
                                               rate<=MAX_OPENING_VISUAL_WORDS_PER_SEC)
        })
    full_film_pass=all(x["passesFullFilmReadingBudget"] for x in all_spans)
    combined_pass=all(x["passesCombinedVisibleTextBudget"] for x in all_spans)
    caption_count=sum(x["captionWords"] for x in all_spans)
    repairs=[{"scene":x["scene"],
              "minimumSampleCaptionWordsToTimeWindow":x["minimumSampleCaptionWordsToTimeWindow"],
              "recommendedAction":x["readingLoadRepairAction"]}
             for x in all_spans if not x["passesCombinedVisibleTextBudget"]]
    return {
        "schema":SCHEMA, "criterion":"Source-faithful overlay and caption load, separately checked",
        "allSceneSpans":all_spans,
        "readingLoadRepairCandidates":repairs,
        "readingLoadRepairCandidateCount":len(repairs),
        "readingLoadRepairPlanIsRenderedEvidence":False,
        "allScenesReadingBudgetPass":full_film_pass,
        "legacyOverlayOnlyGate":True,
        "allScenesCombinedVisibleTextBudgetPass":combined_pass,
        "captionWordsSampled":caption_count,
        "fullMutedComprehensionApproved":False,
        "combinedCaptionOverlayLoadRequiresReview":not combined_pass,
        "maxObservedSceneWordsPerSecond":max(x["visualWordsPerSecond"] for x in all_spans),
        "limits":{"maxVisibleWordsPerSecond":MAX_OPENING_VISUAL_WORDS_PER_SEC,
                  "minSceneSeconds":1.5},
        "openingSpans":outcomes,
        "allOpeningCutsPass":all(x["passesOpeningReadingBudget"] for x in outcomes),
        "sourceRecordIdentitiesStillOnSilentHold":True,
        "changedOriginalNarration":False,"humanReadabilityCalibrated":False,
        "audienceComprehensionVerified":False,"mayPublish":False,
        "basis":"Measured emitted overlays and captions separately in nine authored shots; overlay-only legacy pass cannot certify total visible reading load or comprehension",
    }


def check_file(plan_path,out_path):
    plan=Path(plan_path)
    data=json.loads(plan.read_text(encoding="utf-8"))
    result=assess(data)
    result["exactPhonePlanSha256"]=hashlib.sha256(plan.read_bytes()).hexdigest()
    output=Path(out_path)
    output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    if not result["allOpeningCutsPass"]:
        raise ValueError("OPENING_READING_HOLD:OVERLOADED_SHORT_SHOT")
    if not result["allScenesReadingBudgetPass"]:
        raise ValueError("OPENING_READING_HOLD:OTHER_SCENE_EXCEEDS_SILENT_READING_BUDGET")
    if not result["allScenesCombinedVisibleTextBudgetPass"]:
        raise ValueError("OPENING_READING_HOLD:COMBINED_CAPTION_OVERLAY_OVERLOAD")
    return result


if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--plan",required=True)
    p.add_argument("--out",required=True)
    a=p.parse_args()
    print(json.dumps(check_file(a.plan,a.out),indent=2))

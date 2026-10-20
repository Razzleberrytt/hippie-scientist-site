#!/usr/bin/env python3
"""Audit every pre-encode RGB frame's emitted scientific/caption annotations.

This confirms exact source timing and all-frame onscreen-text budgets against
raw RGB frame SHA receipts. It does NOT OCR decoded H.264, calibrate a viewer,
or replace the already required independent scientific/craft/release reviews.
"""
import argparse
import hashlib
import json
import math
import re
from pathlib import Path

from timed_caption_windows import schedule, shown_at
from narrated_claim_screen import EXPECTED_NON_CAPTION_ANNOTATIONS

SCHEMA = "ths-evidencemotion-temporal-caption-emission-v1"
ROLES = frozenset({"science","source","hook","disclosure","caption"})
MAX_WORDS_PER_SECOND = 5.0
EXTRA_ALLOWED = {
    "sentence_1": {("hook","7-OH")},
    # Source-bound native scene-2 structural comparison, not new clinical
    # evidence; only these exact verified IDs/labels may enter the film.
    "sentence_2": {
        ("science","MITRAGYNINE"), ("science","7-OH"),
        ("science","7-OH has one free hydroxyl"),
        ("disclosure","Not a chemical reaction"),
    },
    "sentence_5": {("science","≠"),("science","HUMAN EXPERIENCE")},
}


def words(s):
    return re.findall(r"[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*", s.replace("\n"," "))



def partitioned_caption_groups(scene):
    """Independently reconstruct frozen spoken comparison/negation cut timing.

    Treat each acoustic partition as a separate possible caption window, or
    an otherwise correct word sequence may show words belonging to a later
    shot before the narrator reaches the required semantic pivot.
    """
    cues=scene.get("captionWords",[])
    split_on={"sentence_1":"different","sentence_5":"not"}.get(scene["id"])
    if split_on is None:
        return [(math.inf,schedule(cues,max_words=3))]
    split=next((i for i,c in enumerate(cues) if
                c["text"].casefold().strip("?!.,")==split_on),None)
    if split is None:
        # Generic fixtures can still independently test the no-pivot path;
        # the actual frozen script identity is checked by the source reviewer.
        return [(math.inf,schedule(cues,max_words=3))]
    cut=cues[split]["startSec"]
    return [(cut,schedule(cues[:split],max_words=3)),
            (math.inf,schedule(cues[split:],max_words=3))]


def displayed_at(parts,second):
    for boundary,groups in parts:
        if second<boundary:
            return shown_at(groups,second)
    return []


def audit(ledger, receipt, *, max_words_per_second=MAX_WORDS_PER_SECOND):
    if (receipt.get("experimentCaptionMode") != "TIMED_RESEARCH"
        or receipt.get("candidateCaptionWindowsAppliedToFilm") is not True
        or receipt.get("mayPublish") is not False):
        raise ValueError("TEMPORAL_HOLD:TIMED_RESEARCH_ONLY")
    if (ledger.get("schema")!=SCHEMA
        or ledger.get("videoSha256")!=receipt.get("videoSha256")
        or ledger.get("sourceWavSha256")!=receipt.get("sourceWavSha256")
        or ledger.get("fps")!=30 or ledger.get("width")!=1080
        or ledger.get("height")!=1920):
        raise ValueError("TEMPORAL_HOLD:VIDEO_SOURCE_IDENTITY")
    scenes=receipt.get("scenes")
    frames=ledger.get("frames")
    if (not isinstance(scenes,list) or len(scenes)!=7
        or not isinstance(frames,list) or len(frames)!=receipt.get("frames")
        or len(frames)<1000):
        raise ValueError("TEMPORAL_HOLD:ALL_FRAMES_REQUIRED")
    by_scene={s["id"]:s for s in scenes}
    if len(by_scene)!=7 or "source_hold" not in by_scene:
        raise ValueError("TEMPORAL_HOLD:CANONICAL_SEVEN_SCENES")
    groups={name:partitioned_caption_groups(s) for name,s in by_scene.items()}
    scene_seen={name:0 for name in by_scene}
    max_words={name:0 for name in by_scene}
    covered={(name,i):False for name,s in by_scene.items()
             for i in range(len(s.get("captionWords",[])))}
    last_t=-1
    for idx,frame in enumerate(frames):
        t=idx/30
        if (not isinstance(frame,dict)
            or frame.get("index")!=idx
            or type(frame.get("second")) not in (int,float)
            or abs(frame["second"]-t)>1e-5
            or not isinstance(frame.get("rgbSha256"),str)
            or not re.fullmatch(r"[0-9a-f]{64}",frame["rgbSha256"])
            or not isinstance(frame.get("annotations"),list)):
            raise ValueError("TEMPORAL_HOLD:MISSING_OR_TAMPERED_FRAME")
        if t<=last_t:
            raise ValueError("TEMPORAL_HOLD:TIMELINE_NONMONOTONIC")
        last_t=t
        matches=[s for s in scenes if s["startSec"]<=t<s["endSec"]]
        if len(matches)!=1 or frame.get("scene")!=matches[0]["id"]:
            raise ValueError("TEMPORAL_HOLD:SCENE_TIMING_MISMATCH")
        name=matches[0]["id"]
        annotations=frame["annotations"]
        if any(not isinstance(a,list) or len(a)!=2 or a[0] not in ROLES
               or not isinstance(a[1],str) or not a[1] for a in annotations):
            raise ValueError("TEMPORAL_HOLD:UNVERIFIED_VISIBLE_TEXT")
        captions=[a[1] for a in annotations if a[0]=="caption"]
        expected=displayed_at(groups[name],t)
        if captions!=expected:
            raise ValueError("TEMPORAL_HOLD:SPOKEN_CAPTION_DRIFT:"+name+":"+str(idx))
        if name=="source_hold" and captions:
            raise ValueError("TEMPORAL_HOLD:CAPTIONS_DURING_SILENT_SOURCE")
        allowed=set(EXPECTED_NON_CAPTION_ANNOTATIONS[name])|EXTRA_ALLOWED.get(name,set())
        if any(tuple(a) not in allowed for a in annotations if a[0]!="caption"):
            raise ValueError("TEMPORAL_HOLD:NEW_OR_UNSOURCED_SCIENCE_TEXT:"+name)
        combined=sum(len(words(a[1])) for a in annotations)
        if combined/max(.001,matches[0]["endSec"]-matches[0]["startSec"])>max_words_per_second+1e-8:
            raise ValueError("TEMPORAL_HOLD:FRAME_TEXT_BUDGET:"+name+":"+str(idx))
        max_words[name]=max(max_words[name],combined)
        scene_seen[name]+=1
        for i,cue in enumerate(matches[0].get("captionWords",[])):
            if cue["startSec"]<=t<cue["endSec"] and cue["text"] in captions:
                covered[name,i]=True
    if any(n==0 for n in scene_seen.values()):
        raise ValueError("TEMPORAL_HOLD:UNSEEN_SCENE")
    missing=[name+":"+str(i) for (name,i),ok in covered.items() if not ok]
    if missing:
        raise ValueError("TEMPORAL_HOLD:UNSHOWN_SPOKEN_CUES:"+",".join(missing[:12]))
    return {
        "schema":SCHEMA,
        "result":"PASS_SOURCE_EMISSION_FRAMES_ONLY_VIEWER_REVIEW_REQUIRED",
        "preEncodedRgbFrameShaReceipts":len(frames),
        "allOriginalWordCuesVisibleAtLeastOnce":True,
        "sceneFrameCounts":scene_seen,
        "maximumCombinedWordsInSingleFrame":max_words,
        "frameBasedTextBudgetTested":True,
        "notActualEncodedFrameOCR":True,
        "actualViewerComprehensionVerified":False,
        "independentScienceCraftApproved":False,
        "mayPublish":False
    }


def main():
    p=argparse.ArgumentParser()
    p.add_argument("--ledger",required=True)
    p.add_argument("--receipt",required=True)
    p.add_argument("--out",required=True)
    args=p.parse_args()
    raw=Path(args.ledger).read_bytes()
    record=json.loads(raw)
    receipt=json.loads(Path(args.receipt).read_text())
    result=audit(record,receipt)
    result["exactLedgerSha256"]=hashlib.sha256(raw).hexdigest()
    result["actualVideoSha256"]=receipt["videoSha256"]
    Path(args.out).write_text(json.dumps(result,indent=2)+"\n")
    print(json.dumps(result,indent=2))


if __name__=="__main__":
    main()

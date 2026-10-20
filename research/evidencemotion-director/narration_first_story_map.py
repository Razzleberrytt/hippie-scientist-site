#!/usr/bin/env python3
"""EvidenceMotion's four-act story map bound to the actual original WAV and film.

Produces a source-linked *inspection map*, not an artistic-quality verdict or
claims that a participant understood the movie. Exactly 9 shots, not an
invented extra narration act. Neither annotations nor scene titles prove
audience comprehension.
"""
import argparse
import hashlib
import json
from pathlib import Path

from autonomous_script_asr_research import LINES,WAV_SHA
from phone_ui_audit import probe_movie

SCHEMA="ths-four-act-actual-video-story-map-v1"
# Each shot has a distinct, falsifiable teaching/visual function.
# The unchanging spoken source is LINES; these notes are *not* synthesized narration.
STORY=(
  ("sentence_1_part0","QUESTION","Name mitragynine before the comparison",
   "2D PubChem source hard cut","identity before contrast"),
  ("sentence_1_part1","QUESTION","Identify 7-OH and the structural locus",
   "sourced hydroxyl oxygen focus","highlight only after spoken different"),
  ("sentence_2","EVIDENCE","Locate the free hydroxyl in the two verified source structures",
   "two distinct PubChem-linked RDKit structures shown side by side",
   "verified structural difference, not a reaction or clinical effect"),
  ("sentence_3","EVIDENCE","Follow verified atom/bond connectivity",
   "source-backed sequential bond midpoint accents","only real RDKit bonds"),
  ("sentence_4","LIMITS","Distinguish computed pose from filmed receptor binding",
   "computed depth orbit with explicit limitation","not filmed and not binding footage"),
  ("sentence_5_part0","LIMITS","Separate molecular structure from inferred effects",
   "verified source graph still frame","show structure before negation"),
  ("sentence_5_part1","LIMITS","Give the spoken inference-limit payoff",
   "structure versus human-experience contrast","not cannot appear before speech"),
  ("source_hold","TAKEAWAY","Show both primary PubChem identities and CID meaning",
   "silent full-resolution source card","no imaginary narration"),
  ("sentence_6","TAKEAWAY","Invite closer examination of source-bound detail",
   "source-backed computed detail reframe","computed detail is not effect proof"),
)


def sha(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda:f.read(1<<20),b""):
            h.update(block)
    return h.hexdigest()


def fail(reason):
    raise ValueError("STORY_MAP_HOLD:"+reason)


def audit_story(movie,receipt_file,plan_file,out):
    movie,receipt_file,plan_file,out=map(Path,(movie,receipt_file,plan_file,out))
    if any(not p.is_file() or p.is_symlink() for p in (movie,receipt_file,plan_file)):
        fail("REAL_MEDIA_AND_RECEIPTS_REQUIRED")
    receipt=json.loads(receipt_file.read_text())
    plan=json.loads(plan_file.read_text())
    filmsha=sha(movie)
    # Never accept a collection of matching JSON hashes as proof of a real
    # decoded-native movie; use the same codec/frame-count inspector as the
    # rest of the research pipeline before examining its semantic storyboard.
    try:
        width,height,duration,count=probe_movie(movie)
    except Exception as e:
        fail("ACTUAL_ENCODED_VIDEO_NOT_DECODABLE")
    if (width,height)!=(1080,1920) or count!=1031 or not 34.3<=duration<=34.5:
        fail("ACTUAL_H264_GEOMETRY_AND_DURATION_MISMATCH")
    if (receipt.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("videoSha256")!=filmsha
        or plan.get("expectedVideoSha256")!=filmsha
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("fps")!=30 or receipt.get("frames")!=1031
        or receipt.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or receipt.get("candidateCaptionWindowsAppliedToFilm") is not True
        or receipt.get("sourceGraphConnectionTeachingResearch") is not True
        or receipt.get("sourceLockedOxygenSpotlightResearch") is not True
        or receipt.get("mayPublish") is not False
        or plan.get("status")!="RESEARCH_ONLY"
        or plan.get("releaseApproved") is not False):
        fail("SPOKEN_SOURCE_OR_EXACT_MP4_DRIFT")
    scenes=receipt.get("scenes")
    shots=plan.get("shots")
    if (not isinstance(scenes,list) or len(scenes)!=7
        or not isinstance(shots,list) or len(shots)!=len(STORY)
        or [s.get("id") for s in shots]!=[s[0] for s in STORY]):
        fail("CANONICAL_NINE_SCENES_OUT_OF_ORDER")
    expected=("sentence_1","sentence_2","sentence_3","sentence_4",
              "sentence_5","source_hold","sentence_6")
    if [s.get("id") for s in scenes]!=list(expected):
        fail("ORIGINAL_VOICE_SCENE_IDENTITY")
    for i,scene in enumerate(scenes):
        expected_line=LINES[i] if i<5 else ("" if i==5 else LINES[5])
        if scene.get("line")!=expected_line:
            fail("ORIGINAL_NARRATION_SCRIPT_CHANGED")
    # Source-locked original word boundaries, never semantic cuts at arbitrary times.
    first=next((w["startSec"] for w in scenes[0]["captionWords"]
                if w["text"].casefold().strip("?!.,")=="different"),None)
    limit=next((w["startSec"] for w in scenes[4]["captionWords"]
                if w["text"].casefold().strip("?!.,")=="not"),None)
    if first is None or limit is None:
        fail("SPOKEN_REVEAL_CUES_MISSING")
    boundaries={
        "sentence_1_part0":(scenes[0]["startSec"],first),
        "sentence_1_part1":(first,scenes[0]["endSec"]),
        "sentence_5_part0":(scenes[4]["startSec"],limit),
        "sentence_5_part1":(limit,scenes[4]["endSec"]),
    }
    story=[]
    last=0.
    for i,(shot,template) in enumerate(zip(shots,STORY)):
        sid,act,learning,composition,restriction=template
        s=next((s for s in scenes if s["id"]==sid.split("_part")[0]),None)
        # sentence_1_part0 and sentence_5_part0 are special only; the other
        # seven shot IDs exactly match one seven-scene source ID.
        if s is None:
            src="sentence_1" if sid.startswith("sentence_1_part") else (
                "sentence_5" if sid.startswith("sentence_5_part") else sid)
            s=next((x for x in scenes if x["id"]==src),None)
        if s is None:
            fail("SHOT_MISSING_ORIGINAL_SPOKEN_SOURCE")
        start,end=boundaries.get(sid,(s["startSec"],s["endSec"]))
        if (abs(shot["startSec"]-start)>1e-6
            or abs(shot["endSec"]-end)>1e-6
            or abs(start-last)>1e-6 or end<=start
            or not isinstance(shot.get("annotations"),list)):
            fail("NON_CONTIGUOUS_OR_UNJUSTIFIED_SHOT_CUT:"+sid)
        last=end
        if sid=="source_hold" and (s["line"] or s.get("captionWords")):
            fail("FAKE_NARRATION_DURING_PRIMARY_SOURCE_HOLD")
        story.append({"shot":sid,"act":act,"startSec":round(start,5),
                      "endSec":round(end,5),"spokenOriginalLine":s["line"],
                      "learningObjective":learning,
                      "directedComposition":composition,
                      "scientificMeaningRestriction":restriction,
                      "onscreenAnnotationRoles":sorted({a["role"] for a in shot["annotations"]}),
                      "qualityDecision":"NEEDS_ENCODED_VIEWER_AND_CRAFT_EVIDENCE"})
    if (abs(last-scenes[-1]["endSec"])>1e-6
        or [x["act"] for x in story]!=[
            "QUESTION","QUESTION","EVIDENCE","EVIDENCE",
            "LIMITS","LIMITS","LIMITS","TAKEAWAY","TAKEAWAY"]):
        fail("FOUR_ACT_SEMANTIC_SEQUENCE_MISSING")
    result={
        "schema":SCHEMA,"status":"FOUR_ACT_TIMED_MAP_BUILT_RESEARCH_ONLY",
        "encodedH264Sha256":filmsha,"renderReceiptSha256":sha(receipt_file),
        "phonePlanSha256":sha(plan_file),"sourceWavSha256":WAV_SHA,
        "nineShotsMapped":9,"fourActs":["QUESTION","EVIDENCE","LIMITS","TAKEAWAY"],
        "learningGoalsBoundToOriginalWav":True,
        "sourceWordCutBoundariesVerified":True,
        "allOriginalFramesMappedWithoutGaps":True,
        "actualHumanUnderstandingMeasured":False,
        "independentCraftCalibrationPassed":False,
        "realPhonePlaybackVerified":False,
        "mayPublish":False,
        "shots":story}
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    return result


def main():
    p=argparse.ArgumentParser()
    for k in ("movie","receipt","phone","out"):
        p.add_argument("--"+k,required=True)
    args=p.parse_args()
    report=audit_story(args.movie,args.receipt,args.phone,args.out)
    print(json.dumps({k:v for k,v in report.items() if k!="shots"},indent=2))


if __name__=="__main__":
    main()

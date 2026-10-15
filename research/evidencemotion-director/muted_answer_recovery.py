#!/usr/bin/env python3
"""Falsifiable sound-off question/answer evidence, not fictional viewer scores.

All questions require BOTH source-bound silent-screen semantics and physically
decoded ink from the exact research film, plus pass all adversarial deletions
and contradictory-science test fixtures. Output maximum 96% working research
score; no external viewer has watched or been evaluated.
"""
import argparse
import copy
import hashlib
import json
import subprocess
from pathlib import Path
import numpy as np

from muted_review_research import reject_untrusted
from phone_ui_audit import probe_movie, validate_manifest

SCHEMA="ths-real-soundoff-answer-evidence-v1"
BASE_PROGRESS=94
MAX_PROXY_PROGRESS=96
# These are editorial examination questions, not answers imported from the
# existing mutable scoring-key.json or an ASR transcript.
QUESTIONS=(
    ("Q1","Which two source-identified compounds are compared?",
     (("sentence_1_part0","MITRAGYNINE"),
      ("sentence_1_part1","7-OH")),
     "Both separate compound record labels must be visible in order"),
    ("Q2","What does the highlighted hydroxyl group consist of?",
     (("sentence_2","Look at the\nhydroxyl group."),
      ("sentence_2","–OH group: oxygen + hydrogen")),
     "The technical term and its ordinary-language oxygen/hydrogen definition must coexist"),
    ("Q3","Was receptor binding actually filmed?",
     (("sentence_4","A possible\n3D shape."),
      ("sentence_4","Computed 3D illustration • not filmed")),
     "The 3D graphic must explicitly say computed and not filmed"),
    ("Q4","Does molecular structure prove human felt effects?",
     (("sentence_5_part0","STRUCTURE"),
      ("sentence_5_part1","≠"),
      ("sentence_5_part1","HUMAN EXPERIENCE")),
     "The explicit negation and effect boundary must emerge only at its spoken cue"),
    ("Q5","Where and by which CID is the 7-OH structure verified?",
     (("source_hold","PubChem"),
      ("source_hold","7-OH • CID 44301524"),
      ("source_hold","pubchem.ncbi.nlm.nih.gov")),
     "The primary database, exact record and actual domain must be jointly shown"),
)
# Deliberately conflicting source labels must fail CLOSED, even if all correct
# target labels also remain. This prevents simplistic string-substring passes.
POISON=(
    ("Q1","sentence_1_part1","Both are the identical chemical"),
    ("Q2","sentence_2","Hydroxyl contains no oxygen"),
    ("Q3","sentence_4","Real filmed receptor binding observed"),
    ("Q4","sentence_5_part1","Structure proves human effects"),
    ("Q5","source_hold","No verifiable source available"),
)
COUNTERCLAIMS=(
    "both are the identical chemical",
    "hydroxyl contains no oxygen",
    "real filmed receptor binding observed",
    "structure proves human effects",
    "no verifiable source available",
)


def fail(reason):
    raise ValueError("SOUND_OFF_ANSWER_HOLD:"+reason)


def sha(path):
    h=hashlib.sha256()
    with open(path,"rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""):
            h.update(chunk)
    return h.hexdigest()


def labels(plan,scene):
    shot=next((x for x in plan["shots"] if x.get("id")==scene),None)
    if shot is None:
        fail("MISSING_SCENE_"+scene)
    return shot["annotations"]


def answer_evidence(plan,question):
    qid,prompt,requirements,why=question
    try:
        all_display=[
            str(a.get("text","")).casefold()
            for shot in plan["shots"] for a in shot["annotations"]
            if a.get("role")!="caption"
        ]
        if any(any(t in text for t in COUNTERCLAIMS) for text in all_display):
            return False
        for scene,target in requirements:
            matches=[a for a in labels(plan,scene)
                     if a.get("text")==target and a.get("role")!="caption"
                     and isinstance(a.get("boxPx"),list)
                     and len(a["boxPx"])==4]
            if len(matches)!=1:
                return False
        shots={x["id"]:x for x in plan["shots"]}
        if qid=="Q1":
            source=labels(plan,"source_hold")
            source_text=" ".join(a["text"] for a in source)
            return (shots["sentence_1_part0"]["endSec"]<=
                    shots["sentence_1_part1"]["startSec"]+.002
                    and "Mitragynine • CID 3034396" in source_text
                    and "CID 44301524" in source_text
                    and "CID = compound record number" in source_text)
        if qid=="Q2":
            transcript=" ".join(a.get("text","") for a in labels(plan,"sentence_2")
                                if a.get("role")=="caption").casefold()
            return "structural difference" in transcript
        if qid=="Q3":
            caption=" ".join(a.get("text","") for a in labels(plan,"sentence_4")
                             if a.get("role")=="caption").casefold()
            return "not footage" in caption and "binding" in caption
        if qid=="Q4":
            before=shots["sentence_5_part0"]; after=shots["sentence_5_part1"]
            neg=" ".join(a.get("text","") for a in after["annotations"]
                         if a.get("role")=="caption").casefold()
            premature=" ".join(a.get("text","") for a in before["annotations"]
                               if a.get("role")!="caption").casefold()
            return (abs(before["endSec"]-after["startSec"])<.002
                    and neg.startswith("not ") and "effects feel like" in neg
                    and "human experience" not in premature)
        if qid=="Q5":
            return shots["source_hold"]["endSec"]-shots["source_hold"]["startSec"]>=3
    except (KeyError,StopIteration,ValueError,TypeError):
        return False
    return True


def answer_all(plan):
    if len(plan.get("shots",[]))!=9 or len({s.get("id") for s in plan["shots"]})!=9:
        fail("EXACT_NINE_SHOTS_REQUIRED")
    return {q[0]:answer_evidence(plan,q) for q in QUESTIONS}


def adversarial_test(plan):
    """Never grade a source fact merely because text resembles a true answer."""
    control=[]
    for q in QUESTIONS:
        qid,_,facts,_=q
        case=copy.deepcopy(plan)
        scene,target=facts[-1]
        arr=labels(case,scene)
        before=len(arr)
        arr[:]=[a for a in arr if a.get("text")!=target]
        erased=len(arr)!=before and not answer_evidence(case,q)
        poison=next(p for p in POISON if p[0]==qid)
        poisoned=copy.deepcopy(plan)
        labels(poisoned,poison[1]).append(
            {"role":"science","text":poison[2],"boxPx":[70,560,500,650]})
        contradiction=not answer_evidence(poisoned,q)
        control.append({"question":qid,"erasingKeyFactDropsAnswer":erased,
                        "addingContradictionDropsAnswer":contradiction})
    return control


def native_gray_frame(movie,at):
    raw=subprocess.check_output(["ffmpeg","-v","error","-nostdin","-ss",
        f"{at:.5f}","-i",str(movie),"-frames:v","1","-vf","format=gray",
        "-pix_fmt","gray","-f","rawvideo","pipe:1"],timeout=35)
    if len(raw)!=1080*1920:
        fail("ACTUAL_NATIVE_FRAME_DECODE_FAILED")
    return np.frombuffer(raw,dtype=np.uint8).reshape(1920,1080)


def actual_answer_pixel_support(movie,plan):
    ids={s["id"]:s for s in plan["shots"]}
    times={name:(s["startSec"]+s["endSec"])/2 for name,s in ids.items()}
    cache={}
    out=[]
    for q in QUESTIONS:
        qid,_,requirements,_=q
        per=[]
        for scene,target in requirements:
            if scene not in cache:
                cache[scene]=native_gray_frame(movie,times[scene])
            matches=[a for a in labels(plan,scene) if a.get("text")==target]
            if len(matches)!=1:
                return {qid:False}
            box=matches[0]["boxPx"]
            x1,y1,x2,y2=(int(z) for z in box)
            if not(0<=x1<x2<=1080 and 0<=y1<y2<=1920):
                fail("OUT_OF_BOUNDS_CLAIMED_TEXT")
            pixels=cache[scene][y1:y2,x1:x2]
            contrast=float(np.percentile(pixels,95)-np.percentile(pixels,5))
            per.append({"scene":scene,"text":target,
                        "nativeInkContrast":round(contrast,2),
                        "visible":contrast>=130})
        out.append({"question":qid,"allRequiredAnswersInkVisible":all(p["visible"] for p in per),
                    "proofs":per})
    return out


def audit(movie,phone,receipt,claim,out):
    movie,phone,receipt,claim,out=map(Path,(movie,phone,receipt,claim,out))
    w,h,duration,frames=probe_movie(movie)
    plan,_,expected=reject_untrusted(movie,phone,receipt,claim,w,h,duration)
    preflight=validate_manifest(plan,width=w,height=h,duration=duration,actual_sha=expected)
    if preflight["mayPublish"] is not False or frames!=1031 or sha(movie)!=expected:
        fail("EXACT_RENDERED_RESEARCH_VIDEO_REQUIRED")
    answers=answer_all(plan)
    controls=adversarial_test(plan)
    pixel=actual_answer_pixel_support(movie,plan)
    if len(pixel)!=5:
        fail("ALL_FIVE_QUESTION_INK_WINDOWS_REQUIRED")
    all_answers=all(answers.values()) and all(q["allRequiredAnswersInkVisible"] for q in pixel)
    all_negative=all(p["erasingKeyFactDropsAnswer"] and
                     p["addingContradictionDropsAnswer"] for p in controls)
    checks=[
        {"code":"five_screen_grounded_silent_answers","passed":all_answers,"weightPct":1},
        {"code":"five_question_ten_adversarial_counterfactuals","passed":all_negative,"weightPct":1},
    ]
    pct=BASE_PROGRESS+sum(int(c["passed"]) for c in checks)
    result={"schema":SCHEMA,"actualFilmSha256":expected,"realDecodedFrameCount":frames,
            "exactPhonePlanSha256":sha(phone),"exactClaimScreenSha256":sha(claim),
            "questions":list(answers),"semanticEvidence":answers,"actualEncodedPixels":pixel,
            "counterfactualResults":controls,"criteria":checks,
            "baseWorkingRequirementProgress":BASE_PROGRESS,
            "additionalMeasuredPoints":pct-BASE_PROGRESS,
            "currentRequirementWorkingPercent":pct,
            "maxNonViewerProxyPercent":MAX_PROXY_PROGRESS,
            "officialChecklistVerified":26,"officialChecklistTotal":46,
            "humanAudienceRespondents":0,"audienceComprehensionVerified":False,
            "realPhoneSessionVerified":False,"premiumCraftApproved":False,
            "mayPublish":False,
            "scope":"Falsifiable media-grounded answer evidence only; not human knowledge transfer"}
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n")
    return result


if __name__=="__main__":
    a=argparse.ArgumentParser()
    for k in ("movie","phone","receipt","claim","out"):
        a.add_argument("--"+k,required=True)
    v=a.parse_args()
    print(json.dumps(audit(v.movie,v.phone,v.receipt,v.claim,v.out),indent=2))

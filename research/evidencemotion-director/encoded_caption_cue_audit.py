#!/usr/bin/env python3
"""Independent original-WAV critical caption OCR on the ACTUAL encoded MP4.

Extracts fresh decoded pixels, with no annotation/OCR answer supplied from
phone-plan JSON. Fail closed when a critical word cannot be recovered.
A handful of readable screenshots cannot establish all-frame OCR, audience
comprehension, source-science approval, audio quality or permission to publish.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
from pathlib import Path

from autonomous_script_asr_research import LINES, WAV_SHA
from timed_caption_windows import schedule
from temporal_caption_audit import partitioned_caption_groups, displayed_at
from actual_pixel_text_recovery import ocr_image

SCHEMA="ths-encoded-critical-caption-ocr-v1"
TARGETS=(("sentence_1","different"),("sentence_2","hydroxyl"),
         ("sentence_3","record"),("sentence_4","computed"),
         ("sentence_4","not"),("sentence_5","not"),
         ("sentence_5","effects"),("sentence_6","closer"))
REVEALS=(("sentence_1","different"),("sentence_4","not"),
         ("sentence_5","not"))


def hold(reason):
    raise ValueError("ENCODED_CAPTION_HOLD:"+reason)


def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for block in iter(lambda:f.read(1<<20),b""):
            h.update(block)
    return h.hexdigest()


def clean_token(word):
    return re.sub(r"^[^a-z0-9]+|[^a-z0-9]+$","",str(word).casefold())


def recognized(text,word):
    return clean_token(word) in re.findall(r"[a-z0-9]+",text.casefold())


def ensure_frozen_scenes(receipt):
    scenes=receipt.get("scenes")
    if (not isinstance(scenes,list) or len(scenes)!=7
        or [s.get("id") for s in scenes] !=
           ["sentence_1","sentence_2","sentence_3","sentence_4",
            "sentence_5","source_hold","sentence_6"]):
        hold("CANONICAL_SEVEN_SCENES_REQUIRED")
    for s,line in zip(scenes,(*LINES[:5],"",LINES[5])):
        if s.get("line")!=line:
            hold("FROZEN_SPOKEN_SOURCE_DRIFT")
        cues=s.get("captionWords")
        if not isinstance(cues,list) or [c.get("text") for c in cues]!=line.split():
            hold("ORIGINAL_WORD_CUE_DRIFT")
        # Validate the entire atomic acoustic timeline.
        schedule(cues,max_words=3)
    return {s["id"]:s for s in scenes}


def cue_lookup(scenes,scene,term):
    cues=scenes[scene]["captionWords"]
    matching=[c for c in cues if clean_token(c["text"])==term]
    if len(matching)!=1:
        hold("MISSING_OR_DUPLICATED_CRITICAL_CUE:"+scene+":"+term)
    cue=matching[0]
    return cue


def exact_frame_timestamp(cue,fps=30):
    # Pick an actual 30fps frame inside the exact original acoustic cue,
    # rather than mid-time that might seek to a frame before the word.
    first=math.ceil(cue["startSec"]*fps-1e-7)
    last=math.ceil(cue["endSec"]*fps-1e-7)-1
    if first>last:
        hold("NO_ENCODED_FRAME_DURING_CRITICAL_CUE")
    return ((first+last)//2)/fps


def decode_caption_crop(movie,when,path):
    # This native 1080x1920 renderer reserves 1310..1460 for captions; use
    # only decoded H.264 caption-region pixels, excluding science overlays.
    cmd=["ffmpeg","-v","error","-nostdin","-ss",f"{when:.6f}",
         "-i",str(movie),"-vf",
         "crop=900:320:0:1270,scale=1800:640:flags=lanczos",
         "-frames:v","1","-y",str(path)]
    try:
        subprocess.run(cmd,check=True,capture_output=True,timeout=45)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError):
        hold("ACTUAL_CAPTION_FRAME_DECODE_FAILED")
    if not path.exists() or path.stat().st_size<4000:
        hold("MISSING_ACTUAL_ENCODED_CROP")


def evaluate_ocr_rows(rows,expected,negative):
    if len(rows)!=len(expected)+len(negative):
        hold("CRITICAL_SAMPLE_COUNT")
    bykey={(r.get("scene"),r.get("term"),r.get("phase")):r for r in rows}
    if len(bykey)!=len(rows):
        hold("DUPLICATED_OCR_SAMPLE")
    for scene,term in expected:
        r=bykey.get((scene,term,"during"))
        if r is None or not recognized(r.get("ocrText",""),term):
            hold("CRITICAL_WORD_NOT_READABLE:"+scene+":"+term)
    for scene,term in negative:
        r=bykey.get((scene,term,"before"))
        if r is None or recognized(r.get("ocrText",""),term):
            hold("PREMATURE_PROTECTED_WORD:"+scene+":"+term)
    return True


def inspect(movie,receipt_file,out):
    movie,receipt_file,out=Path(movie),Path(receipt_file),Path(out)
    receipt=json.loads(receipt_file.read_text(encoding="utf-8"))
    if (receipt.get("experimentCaptionMode")!="TIMED_RESEARCH"
        or receipt.get("candidateCaptionWindowsAppliedToFilm") is not True
        or receipt.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("mayPublish") is not False
        or receipt.get("videoSha256")!=digest(movie)
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("frames")!=1031
        or receipt.get("fps")!=30):
        hold("EXACT_RESEARCH_FILM_AND_ORIGINAL_WAV_REQUIRED")
    scenes=ensure_frozen_scenes(receipt)
    rows=[]
    with tempfile.TemporaryDirectory(prefix="ths-encoded-caption-") as td:
        for scene,term in TARGETS:
            cue=cue_lookup(scenes,scene,term)
            t=exact_frame_timestamp(cue)
            frame=Path(td)/f"{scene}_{term}_during.png"
            decode_caption_crop(movie,t,frame)
            rows.append({"scene":scene,"term":term,"phase":"during",
                         "frameIndex":round(t*30),"t":round(t,5),
                         "croppedImageSha256":digest(frame),
                         "ocrText":ocr_image(frame)})
        for scene,term in REVEALS:
            cue=cue_lookup(scenes,scene,term)
            # Read the last full encoded frame before the spoken reveal.
            idx=math.ceil(cue["startSec"]*30-1e-7)-1
            if idx<0 or idx/30<scenes[scene]["startSec"]:
                hold("NO_PRE_REVEAL_TEST_FRAME")
            t=idx/30
            frame=Path(td)/f"{scene}_{term}_before.png"
            decode_caption_crop(movie,t,frame)
            rows.append({"scene":scene,"term":term,"phase":"before",
                         "frameIndex":idx,"t":round(t,5),
                         "croppedImageSha256":digest(frame),
                         "ocrText":ocr_image(frame)})
    evaluate_ocr_rows(rows,TARGETS,REVEALS)
    result={"schema":SCHEMA,"status":"CRITICAL_ENCODED_CAPTION_OCR_PASS_REVIEW_REQUIRED",
            "exactH264Sha256":digest(movie),"exactReceiptSha256":digest(receipt_file),
            "duringCueWordsRecovered":len(TARGETS),
            "preRevealWordAbsencesVerified":len(REVEALS),
            "sampledDecodedEncodedFrames":len(rows),
            "rows":rows,"allFrameEncodedOCR":False,
            "independentAudienceComprehensionVerified":False,
            "mayPublish":False}
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    return result


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--movie",required=True)
    parser.add_argument("--receipt",required=True)
    parser.add_argument("--out",required=True)
    a=parser.parse_args()
    report=inspect(a.movie,a.receipt,a.out)
    print(json.dumps({k:v for k,v in report.items() if k!="rows"},indent=2))


if __name__=="__main__":
    main()

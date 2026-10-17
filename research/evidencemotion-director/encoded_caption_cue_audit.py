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
from actual_pixel_text_recovery import ocr_image, extract_png, _both_source_record_mappings_visible, plain

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
        # The genuine silent PubChem source card intentionally omits
        # captionWords entirely. Spoken scenes must retain every original
        # acoustic cue; only this source-only pause may omit the field.
        cues=s.get("captionWords",[] if s["id"]=="source_hold" else None)
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
    # The native renderer starts captions at y1310. Exclude clipped science
    # disclosure glyphs above it; retain the complete five-line field to y1590.
    cmd=["ffmpeg","-v","error","-nostdin","-ss",f"{when:.6f}",
         "-i",str(movie),"-vf",
         "crop=900:280:0:1310,scale=1800:560:flags=lanczos",
         "-frames:v","1","-y",str(path)]
    try:
        subprocess.run(cmd,check=True,capture_output=True,timeout=45)
    except (subprocess.CalledProcessError,subprocess.TimeoutExpired,OSError):
        hold("ACTUAL_CAPTION_FRAME_DECODE_FAILED")
    if not path.exists() or path.stat().st_size<4000:
        hold("MISSING_ACTUAL_ENCODED_CROP")


def caption_pixel_layout(path):
    """Choose a caption layout from decoded pixels, never from expected words."""
    from PIL import Image
    with Image.open(path) as source:
        if source.size != (1800,560):
            hold('UNEXPECTED_DECODED_CAPTION_CROP_GEOMETRY')
        gray=source.convert('L')
        rows=[y for y in range(gray.height)
              if gray.crop((0,y,gray.width,y+1)).point(
                  lambda value: 255 if value>=130 else 0).histogram()[255]>=8]
    bands=[]
    for y in rows:
        if not bands or y-bands[-1][-1]>12:
            bands.append([y])
        else:
            bands[-1].append(y)
    # A one-line caption needs line segmentation; wrapped captions need a
    # text block. Sparse-page mode misread encoded glyphs as punctuation.
    return {'detectedInkLines':len(bands),
            'pageSegmentation':7 if len(bands)<=1 else 6,
            'lineBandsPx':[[band[0],band[-1]] for band in bands]}


def ocr_caption_crop(path):
    from PIL import Image
    layout=caption_pixel_layout(path)
    # Normalize the existing caption glyph contrast uniformly. No transcript,
    # expected token or per-word threshold enters the OCR.
    # Keep both raw crop identity and derived mask identity in the receipt.
    with tempfile.TemporaryDirectory(prefix='ths-caption-ocr-mask-') as td:
        mask=Path(td)/'caption.png'
        with Image.open(path) as source:
            source.convert('L').point(lambda value:0 if value>=130 else 255).save(mask)
        layout.update({'contrastMask':'LUMA_GE130_BLACK_ELSE_WHITE',
                       'contrastMaskSha256':digest(mask)})
        text=ocr_image(mask,psm=layout['pageSegmentation'])
    return text,layout


def verify_source_record_pixels(ocr_text):
    """Source identity is accepted only from decoded encoded pixels, not metadata.

    Both compound names and CIDs must occur together on their respective
    OCR lines. Source card legibility cannot establish therapeutic effects.
    """
    cleaned=plain(ocr_text)
    if ("pubchem" not in cleaned or "compound record number" not in cleaned
            or not _both_source_record_mappings_visible(ocr_text)):
        hold("ENCODED_SOURCE_IDENTITY_CID_JOIN_UNREADABLE_OR_SWAPPED")
    return True


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
        or receipt.get("treatment")!="specimen"
        or receipt.get("sourceWavSha256")!=WAV_SHA
        or receipt.get("mayPublish") is not False
        or receipt.get("videoSha256")!=digest(movie)
        or receipt.get("resolution")!=[1080,1920]
        or receipt.get("frames")!=1031
        or receipt.get("fps")!=30):
        hold("EXACT_RESEARCH_FILM_AND_ORIGINAL_WAV_REQUIRED")
    scenes=ensure_frozen_scenes(receipt)
    # OCR layout comes from actual caption ink. No dictionary, expected
    # word, source transcript or annotation is passed to the OCR engine.
    rows=[]
    with tempfile.TemporaryDirectory(prefix="ths-encoded-caption-") as td:
        for scene,term in TARGETS:
            cue=cue_lookup(scenes,scene,term)
            t=exact_frame_timestamp(cue)
            frame=Path(td)/f"{scene}_{term}_during.png"
            decode_caption_crop(movie,t,frame)
            text,layout=ocr_caption_crop(frame)
            rows.append({"scene":scene,"term":term,"phase":"during",
                         "frameIndex":round(t*30),"t":round(t,5),
                         "croppedImageSha256":digest(frame),
                         "ocrText":text,
                         "ocrPixelLayout":layout})
        for scene,term in REVEALS:
            cue=cue_lookup(scenes,scene,term)
            # Read the last full encoded frame before the spoken reveal.
            idx=math.ceil(cue["startSec"]*30-1e-7)-1
            if idx<0 or idx/30<scenes[scene]["startSec"]:
                hold("NO_PRE_REVEAL_TEST_FRAME")
            t=idx/30
            frame=Path(td)/f"{scene}_{term}_before.png"
            decode_caption_crop(movie,t,frame)
            text,layout=ocr_caption_crop(frame)
            rows.append({"scene":scene,"term":term,"phase":"before",
                         "frameIndex":idx,"t":round(t,5),
                         "croppedImageSha256":digest(frame),
                         "ocrText":text,
                         "ocrPixelLayout":layout})
    evaluate_ocr_rows(rows,TARGETS,REVEALS)
    # Independent source-card pixels, not a phone-plan annotation, must
    # demonstrate both exact compound->PubChem CID joins on this *new* MP4.
    with tempfile.TemporaryDirectory(prefix="ths-encoded-source-") as td:
        source_scene=scenes["source_hold"]
        midpoint=(source_scene["startSec"]+source_scene["endSec"])/2
        source_frame=Path(td)/"source_hold_encoded.png"
        extract_png(movie,midpoint,source_frame)
        source_ocr=ocr_image(source_frame)
        verify_source_record_pixels(source_ocr)
        source_row={"scene":"source_hold","term":"cid_pair","phase":"source",
                    "t":round(midpoint,5),
                    "frameIndex":round(midpoint*30),
                    "croppedImageSha256":digest(source_frame),
                    "ocrText":source_ocr}
        rows.append(source_row)
    result={"schema":SCHEMA,"status":"CRITICAL_ENCODED_CAPTION_OCR_PASS_REVIEW_REQUIRED",
            "exactH264Sha256":digest(movie),"exactReceiptSha256":digest(receipt_file),
            "duringCueWordsRecovered":len(TARGETS),
            "preRevealWordAbsencesVerified":len(REVEALS),
            "encodedSourceCardPairingRecovered":True,
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

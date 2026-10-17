#!/usr/bin/env python3
"""EM-008.04 bounded real H264 decoded phone-width OCR research.

Tesseract is a second instrument relative to author-drawn text and pixel masks,
NOT independent human visual comprehension, scientifically validated reading
predictor, actual phone playback, all-frame OCR, or publication approval.
Only first-party synthetic, NONFACTUAL botanical fixture accepted here.
"""
import hashlib
import json
import re
import subprocess
import unicodedata
from pathlib import Path
from PIL import Image, ImageDraw
from em00803_real_mobile_contrast import execute as create_fixture_movies
from em00805_botanical_video_probes import decode_frame, sha, encode, font

EXPECTED=("AI-ILLUSTRATED BOTANICAL","NOT A 7-OH PLANT ASSAY")
PSM=(6,11)
WIDTHS=(320,375,430)
TIMES=(0,30,59)
FAKE_TERMS=("MEASURED","7OH","PLANT")
# Conservative semantic veto. Seeing the two required disclosure lines is NOT
# sufficient when a different, equally legible banner asserts an invented
# chemical assay. These strings intentionally err toward HOLD on ambiguity.
CONTRADICTORY_PLANT_ASSAY_CLAIMS=(
    "MEASURED7OH", "7OHMEASURED", "DETECTED7OH", "7OHDETECTED",
    "PRESENT7OH", "7OHPRESENT", "IDENTIFIED7OH", "7OHIDENTIFIED",
    "CONTAINS7OH", "THISPLANTHAS7OH", "7OHFOUNDINTHISPLANT",
    "ASSAYCONFIRMS7OH", "LABCONFIRMED7OH", "7OHCONTENTCONFIRMED",
)
SCHEMA="ths-em00804-true-encoded-phone-width-ocr-research-v1"
EXPECTED_PICTOGRAM_SHA="4c1573cc3d3ea32fd6170323941b5d00296c7d44dd990cd4f11eda8fa111df7d"

def norm(s):
    return re.sub(r"[^A-Z0-9]","",unicodedata.normalize("NFKC",s).upper())

def has_contradictory_plant_assay_claim(raw):
    if not isinstance(raw,str):
        return False
    seen=norm(raw)
    return any(phrase in seen for phrase in CONTRADICTORY_PLANT_ASSAY_CLAIMS)

def check_recognition(raw, required=EXPECTED):
    if not isinstance(raw,str) or not raw.strip():
        return False
    seen=norm(raw)
    return (all(norm(line) in seen for line in required)
            and not has_contradictory_plant_assay_claim(raw))

def checksum(data):
    return hashlib.sha256(data).hexdigest()

def ocr_png(image,layout):
    if layout not in PSM:
        raise ValueError("UNSUPPORTED_OCR_LAYOUT")
    import io
    buffer=io.BytesIO()
    image.save(buffer,format="PNG")
    args=["tesseract","stdin","stdout","--oem","1","--psm",str(layout),
          "-l","eng"]
    run=subprocess.run(args,input=buffer.getvalue(),capture_output=True,timeout=20)
    if run.returncode:
        raise ValueError("OCR_EXECUTION_HOLD:"+str(run.returncode)+":"
                         +run.stderr.decode("utf8","replace")[-200:])
    return run.stdout.decode("utf8","replace")

def width_frame(movie,index,width,overlay=False):
    if width not in WIDTHS or index not in TIMES:
        raise ValueError("UNDECLARED_SAMPLE_WIDTH_OR_TIME")
    native=decode_frame(movie,index)
    assert native.size==(1080,1920)
    height=round(1920*width/1080)
    sized=native.resize((width,height),Image.Resampling.LANCZOS)
    if overlay:
        # Simulated phone app occlusion mask; no claim of a precise platform UI.
        from PIL import ImageDraw
        draw=ImageDraw.Draw(sized)
        draw.rectangle((0,0,width,round(height*.10)),fill="black")
        draw.rectangle((round(width*.80),0,width,height),fill="black")
        draw.rectangle((0,round(height*.82),width,height),fill="black")
    return sized

def run(out):
    out=Path(out)
    out.mkdir(parents=True,exist_ok=True)
    fixture=create_fixture_movies(out/"clips")
    if fixture["sourceSha256"]!=EXPECTED_PICTOGRAM_SHA:
        raise ValueError("ORIGINAL_ART_BINARY_CHANGED_HOLD")
    root=out/"clips"
    result={
        "schema":SCHEMA,
        "filmSource":"SELF_AUTHORED_NONFACTUAL_BOTANICAL_FIXTURE",
        "sourceArtSha256":fixture["sourceSha256"],
        "expectedText":list(EXPECTED),
        "tesseractVersion":"",
        "positiveReadings":[],
        "negativeCases":[],
        "allPhysicalPhoneAndScienceGatesPassed":False,
        "actualHandsetReadabilityVerified":False,
        "validatedAsHumanReadabilityPredictor":False,
        "independentScientificClaimsApproved":False,
        "allVideoFramesReadByIndependentOCR":False,
        "mayPublish":False,
    }
    ver=subprocess.run(["tesseract","--version"],capture_output=True,text=True,
                       timeout=10,check=True)
    result["tesseractVersion"]=(ver.stdout or ver.stderr).strip().splitlines()[0]
    positive=root/"legible.mp4"
    base=sha(positive)
    for frame in TIMES:
        for width in WIDTHS:
            sized=width_frame(positive,frame,width,overlay=True)
            rgb_hash=checksum(sized.tobytes())
            for layout in PSM:
                text=ocr_png(sized,layout)
                if not check_recognition(text):
                    raise ValueError(f"POSITIVE_ACTUAL_OCR_MISSING_HOLD:{frame}:{width}:{layout}:{text!r}")
                result["positiveReadings"].append({
                    "movieSha256":base,"frameIndex":frame,"width":width,
                    "height":sized.height,"simulatedPlatformOcclusion":True,
                    "tesseractPSM":layout,"ocrRawOutput":text.strip(),
                    "ocrOutputSha256":checksum(text.encode()),
                    "decodedResizedMaskedRgbSha256":rgb_hash,
                    "bothExpectedLinesRecovered":True,
                    "phonePhysicalPlaybackApproved":False,"mayPublish":False})
    if len(result["positiveReadings"])!=18:
        raise ValueError("INSUFFICIENT_ACTUAL_ENCODED_OCR_MEASUREMENTS_HOLD")
    missing=root/"missing.mp4"
    for frame in TIMES:
        sized=width_frame(missing,frame,375,overlay=True)
        for layout in PSM:
            txt=ocr_png(sized,layout)
            if check_recognition(txt):
                raise ValueError("MISSING_DISCLAIMER_FALSE_ACCEPTANCE_HOLD")
            result["negativeCases"].append({
                "mode":"disclosure_deleted","frame":frame,"width":375,
                "tesseractPSM":layout,"encodedH264Sha256":sha(missing),
                "ocrOutputSha256":checksum(txt.encode()),
                "ocrRawOutput":txt.strip(),"unsafeApprovalRejected":True})
    # A false assay claim may be large, bright, and legible. Recognition
    # alone must NEVER turn it into a proper science/disclosure receipt.
    # Reuse the *real H264* negative film from EM-008.05.
    from em00805_botanical_video_probes import run as build_bad_films
    red=build_bad_films(out/"false-claim-clips",root/"authored-leaf-fixture.png",
                       "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf")
    wrong=out/"false-claim-clips/fabricated_measurement.mp4"
    for layout in PSM:
        txt=ocr_png(width_frame(wrong,30,375,overlay=True),layout)
        seen=norm(txt)
        clearly_deceptive=all(t in seen for t in FAKE_TERMS)
        if not clearly_deceptive:
            raise ValueError("FALSE_ASSAY_NEGATIVE_NOT_ACTUALLY_RECOGNIZED_HOLD")
        if check_recognition(txt):
            raise ValueError("FAKE_MEASUREMENT_BORROWED_SAFE_DISCLOSURE_HOLD")
        result["negativeCases"].append({
            "mode":"false_measured_plant_7OH","frame":30,"width":375,
            "tesseractPSM":layout,"encodedH264Sha256":sha(wrong),
            "ocrRawOutput":txt.strip(),"ocrOutputSha256":checksum(txt.encode()),
            "unsafeApprovalRejected":True,"unsafeMeasuredAssayRecognized":True})
    # A contradictory, highly legible assay claim can coexist with both safe
    # disclaimer lines. Encode and decode that collision, rather than trusting
    # an authored string or testing only a movie where disclosure was replaced.
    # Two distinct real-H264 semantic collision variants. A visible
    # disclaimer does not authorize "measured" OR "present" botanical claims.
    # This is intentionally not a general-purpose science claim classifier.
    for mode,headline in (
        ("disclosed_but_fabricated_plant_measurement","MEASURED 7-OH"),
        ("disclosed_but_fabricated_plant_presence","7-OH PRESENT"),
    ):
        mixed_still=out/(mode+".png")
        with Image.open(root/"legible.png") as source:
            mixed=source.convert("RGB")
        artist=ImageDraw.Draw(mixed)
        artist.rounded_rectangle((90,620,856,862),radius=20,
                                 fill=(9,16,18),outline=(238,241,220),width=4)
        face=font("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",48)
        artist.text((108,672),headline,font=face,fill=(248,250,230))
        artist.text((108,757),"IN THIS PLANT",font=face,fill=(248,250,230))
        mixed.save(mixed_still)
        mixed_movie=out/(mode+".mp4")
        encode(mixed_still,mixed_movie)
        mixed_sha=sha(mixed_movie)
        for layout in PSM:
            actual=ocr_png(width_frame(mixed_movie,30,375,overlay=True),layout)
            seen=norm(actual)
            if not all(norm(line) in seen for line in EXPECTED):
                raise ValueError("MIXED_ACTUAL_OCR_SAFE_DISCLOSURES_NOT_BOTH_VISIBLE_HOLD")
            if not has_contradictory_plant_assay_claim(actual):
                raise ValueError("MIXED_ACTUAL_OCR_FALSE_BOTANICAL_CLAIM_NOT_VISIBLE_HOLD")
            if check_recognition(actual):
                raise ValueError("VISIBLE_SAFE_DISCLOSURE_LAUNDERED_FALSE_BOTANICAL_CLAIM_HOLD")
            result["negativeCases"].append({
                "mode":mode,
                "frame":30,"width":375,"tesseractPSM":layout,
                "encodedH264Sha256":mixed_sha,
                "ocrRawOutput":actual.strip(),
                "ocrOutputSha256":checksum(actual.encode()),
                "bothExpectedDisclosureLinesRecognized":True,
                "contradictoryAssayTextRecognized":True,
                "unsafeApprovalRejected":True
            })
    assert len(result["negativeCases"])==12
    path=out/"em00804-research-receipt.json"
    path.write_text(json.dumps(result,indent=2)+"\n")
    return result

if __name__=="__main__":
    import argparse
    parser=argparse.ArgumentParser()
    parser.add_argument("--out",required=True)
    args=parser.parse_args()
    report=run(args.out)
    print(json.dumps({"positive":len(report["positiveReadings"]),
       "negative":len(report["negativeCases"]),
       "source":report["sourceArtSha256"],"mayPublish":report["mayPublish"]}))

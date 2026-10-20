#!/usr/bin/env python3
"""EM-008.03 research-only: contrast measured on real decoded H264 phone-width pixels.

Reusable check for one NONFACTUAL source illustration fixture. Not independent OCR,
species/assay verification, human phone audition, whole-film review or release.
"""
import hashlib
import json
import statistics
import tempfile
from pathlib import Path
from PIL import Image,ImageDraw
from em00805_botanical_video_probes import (
    W,H,FRAMES,fixture_art,font,encode,decode_frame,sha
)

BOX=(90,900,856,1138)
LINES=(("AI-ILLUSTRATED BOTANICAL",50,108,942),
       ("NOT A 7-OH PLANT ASSAY",48,108,1034))
PHONE_WIDTH=375
PHONE_HEIGHT=round(H*PHONE_WIDTH/W)
THRESHOLD=7.0  # stronger than WCAG 4.5:1 regular-type nominal threshold
VARIANTS=("legible","faint","missing","tiny")
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def luminosity(rgb):
    def c(v):
        v=v/255
        return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
    r,g,b=rgb
    return 0.2126*c(r)+0.7152*c(g)+0.0722*c(b)

def contrast(a,b):
    u,v=sorted((luminosity(a),luminosity(b)),reverse=True)
    return (u+0.05)/(v+0.05)

def render(base,variant,font_path=FONT):
    if variant not in VARIANTS:raise ValueError("UNRECOGNIZED_REAL_FRAME_VARIANT")
    im=base.copy().convert("RGB")
    draw=ImageDraw.Draw(im)
    draw.rounded_rectangle(BOX,radius=22,fill=(10,18,18),outline=(226,231,207),width=3)
    for line,size,x,y in LINES:
        if variant=="missing":continue
        f=font(font_path,25 if variant=="tiny" else size)
        if x+f.getlength(line)>BOX[2]-8:
            raise ValueError("TYPE_EXCEEDS_SAFE_BANNER_BOUNDS")
        draw.text((x,y),line,font=f,fill=(67,75,69) if variant=="faint" else (246,248,230))
    return im

def measure(image,font_path=FONT):
    small=image.resize((PHONE_WIDTH,PHONE_HEIGHT),Image.Resampling.LANCZOS)
    data=small.load()
    per_line=[]
    for line,size,x,y in LINES:
        mask=Image.new("L",(W,H),0)
        ImageDraw.Draw(mask).text((x,y),line,font=font(font_path,size),fill=255)
        mini=mask.resize((PHONE_WIDTH,PHONE_HEIGHT),Image.Resampling.LANCZOS)
        alpha=mini.load()
        bounds=(round((x+5)*PHONE_WIDTH/W),
                round((y+4)*PHONE_WIDTH/W),
                round((BOX[2]-4)*PHONE_WIDTH/W),
                round((y+size+17)*PHONE_WIDTH/W))
        glyphs=[];background=[]
        for yy in range(bounds[1],min(PHONE_HEIGHT,bounds[3])):
            for xx in range(bounds[0],min(PHONE_WIDTH,bounds[2])):
                strength=alpha[xx,yy]
                if strength>=225:glyphs.append(data[xx,yy])
                if strength<=1:background.append(data[xx,yy])
        if len(glyphs)<50 or len(background)<70:
            raise ValueError("NOT_ENOUGH_INDEPENDENT_DECODED_PHONE_PIXELS")
        fg=tuple(int(statistics.median(p[i] for p in glyphs)) for i in range(3))
        bg=tuple(int(statistics.median(p[i] for p in background)) for i in range(3))
        # Median robustly rejects isolated antialias/ringing highlights.
        measured=round(contrast(fg,bg),4)
        per_line.append({
           "lineId":"illustration_kind" if len(per_line)==0 else "no_assay_disclaimer",
           "measuredDecodedPhoneRgbContrast":measured,
           "foregroundMedianRGB":fg,"backgroundMedianRGB":bg,
           "letterInteriorPixelsMeasured":len(glyphs),
           "projectedAuthoredFontPxAt375":round(size*PHONE_WIDTH/W,3),
           "passConservativeResearchThreshold":measured>=THRESHOLD
        })
    return per_line

def audit(movie,expected_sha,mode,font_path=FONT):
    if sha(movie)!=expected_sha:raise ValueError("WRONG_ENCODED_MOVIE_SHA")
    if mode not in VARIANTS:raise ValueError("INVALID_VARIANT")
    rows=[]
    for frame_index in (0,30,FRAMES-1):
        frame=decode_frame(movie,frame_index)
        pixels=measure(frame,font_path)
        passes=(mode=="legible" and all(
            x["passConservativeResearchThreshold"] and
            x["projectedAuthoredFontPxAt375"]>=16
            for x in pixels))
        negative=(mode!="legible" and
            (mode=="faint" and all(not x["passConservativeResearchThreshold"] for x in pixels)
             or mode=="missing" and all(not x["passConservativeResearchThreshold"] for x in pixels)
             or mode=="tiny")) 
        # The tiny control must not be approved by strength of unrelated authored masks:
        # it is rejected by declared 25px source glyph size (<16px projected).
        if mode=="tiny":negative=(25*PHONE_WIDTH/W<16)
        if not (passes or negative):
            raise ValueError("ACTUAL_ENCODED_CONTRAST_OR_MISSING_CAPTION_DID_NOT_HOLD:"+mode)
        rows.append({
            "frame":frame_index,"timeSec":round(frame_index/30,5),
            "actualDecodedRgbSha256":hashlib.sha256(frame.tobytes()).hexdigest(),
            "phoneResamplingMethod":"Pillow-LANCZOS-native-RGB24-to-375x667",
            "phoneWidth":PHONE_WIDTH,"phoneHeight":PHONE_HEIGHT,
            "textPixelContrast":pixels,
            "researchCandidatePixelCheckPassed":passes,
            "negativeControlRejected":negative,
            "realHandsetTested":False,
            "independentOcrOrSemanticTruthVerified":False,
            "publicationApproved":False,"mayPublish":False})
    return {"mode":mode,"encodedH264Sha256":expected_sha,
            "sampledDecodedFrames":rows,
            "decision":"DECODED_PHONE_WIDTH_PIXEL_RESEARCH_ONLY" if mode=="legible"
                  else "HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING",
            "actualPhonePlayback":False,
            "botanicalContentAssayVerified":False,
            "sourceAssetIdentifiedAsSpecies":False,
            "independentHumanReadabilityValidated":False,
            "mayPublish":False}

def execute(output,source=None,expected_source_sha=None):
    output=Path(output);output.mkdir(parents=True,exist_ok=True)
    if source is None:
        if expected_source_sha is not None:
            raise ValueError("SOURCE_HASH_PROVIDED_WITHOUT_EXTERNAL_SOURCE_HOLD")
        source=fixture_art(output/"authored-leaf-fixture.png")
    elif expected_source_sha is None:
        raise ValueError("UNPINNED_EXTERNAL_BOTANICAL_ART_HOLD")
    if not Path(source).is_file() or Path(source).is_symlink():
        raise ValueError("NO_PINNED_LOCAL_NONFACTUAL_IMAGE")
    if expected_source_sha is not None and sha(source)!=expected_source_sha:
        raise ValueError("BINARY_SOURCE_ART_SHA_MISMATCH_HOLD")
    with Image.open(source) as im:
        if im.size!=(W,H):
            raise ValueError("FIXTURE_DIMENSIONS_DRIFT")
        base=im.convert("RGB")
    result={"schema":"ths-em00803-decoded-375px-contrast-research-v1",
            "sourceSha256":sha(source),
            "fixtureScientificPhoto":False,
            "sourceApproval":False,
            "simulatedPhonePx":(PHONE_WIDTH,PHONE_HEIGHT),
            "thresholdRatio":THRESHOLD,
            "realPhoneScaleValidated":False,
            "cases":[],"mayPublish":False}
    for mode in VARIANTS:
        still=output/(mode+".png")
        film=output/(mode+".mp4")
        render(base,mode).save(still)
        encode(still,film)
        result["cases"].append(audit(film,sha(film),mode))
    assert [c["decision"] for c in result["cases"]]==[
        "DECODED_PHONE_WIDTH_PIXEL_RESEARCH_ONLY",
        "HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING",
        "HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING",
        "HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING"]
    (output/"research-receipt.json").write_text(json.dumps(result,indent=2)+"\n")
    return result

if __name__=="__main__":
    import argparse
    p=argparse.ArgumentParser()
    p.add_argument("--out",required=True)
    a=p.parse_args()
    result=execute(a.out)
    print(json.dumps({"source":result["sourceSha256"],
      "cases":[(c["mode"],c["decision"]) for c in result["cases"]],
      "mayPublish":result["mayPublish"]},indent=2))

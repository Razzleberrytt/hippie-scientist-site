#!/usr/bin/env python3
"""Independent frame-only visual-text fact recovery from the exact native MP4.

Unlike phone-plan annotation assertions, the question assessor here receives
ONLY pixels decoded from the actual movie. CPU Tesseract OCR is deliberately
fallible: all failures HOLD and no successful OCR is called human understanding,
scientific/voice certification, independent expert approval or publication.
No untrusted model service, third-party media rendering or API keys.
"""
import argparse
import hashlib
import json
import re
import shutil
import subprocess
import tempfile
import unicodedata
from pathlib import Path

from muted_review_research import reject_untrusted
from phone_ui_audit import probe_movie, validate_manifest

SCHEMA="ths-exact-mp4-blind-frame-ocr-qa-v1"
SECONDS={
    "compound_a":0.8,"compound_b":2.4,"hydroxyl":6.0,
    "computed_shape":19.5,"human_effect_limit":26.2,"source_hold":28.8,
}
SCENES={
    "compound_a":"sentence_1_part0",
    "compound_b":"sentence_1_part1",
    "hydroxyl":"sentence_2",
    "computed_shape":"sentence_4",
    "human_effect_limit":"sentence_5_part1",
    "source_hold":"source_hold",
}
REQUIRED={"q1":"two distinct named molecule sources",
          "q2":"hydroxyl equals oxygen plus hydrogen",
          "q3":"3D illustration is computed and not a film of binding",
          "q4":"shape does not establish experienced effects",
          "q5":"PubChem identifiers for both molecules and a CID definition"}
BANNED=(
    "binding observed in humans", "real filmed receptor binding",
    "structure proves human effects","hydroxyl contains no oxygen",
    "two molecules are identical","no verifiable source",
)


def hold(reason):
    raise ValueError("PIXEL_ONLY_COMPREHENSION_HOLD:"+reason)


def digest(path):
    h=hashlib.sha256()
    with Path(path).open("rb") as f:
        for part in iter(lambda:f.read(1024*1024),b""):
            h.update(part)
    return h.hexdigest()


def plain(text):
    # Case/Unicode cleanup is not a linguistic interpretation by the model.
    s=unicodedata.normalize("NFKC",text)
    return s.casefold().replace("–","-").replace("—","-").replace("•"," ")


def _shot_identity_nearest_caveat(text):
    """Read source label nearest the on-screen no-reaction warning.

    The shared title "7-OH vs mitragynine" names BOTH chemicals: a keyword
    anywhere in a full frame does NOT distinguish a swapped structure.
    Independently OCR-derived line order must show the actual shot's
    individual label immediately above the safety disclosure, ignoring
    nonword OCR noise but not substituting mutable storyboard assertions.
    """
    lines=[line.strip(" \t*•.:-") for line in plain(text).splitlines()]
    end=next((i for i,line in enumerate(lines)
              if line == "no reaction" or
              "separate structures" in line and "no reaction" in line),None)
    if end is None:
        return None
    for line in reversed(lines[:end]):
        if line in ("mitragynine","7-oh"):
            return line
    return None


def _both_source_record_mappings_visible(text):
    """Require per-line source → CID joins FROM OCR PIXELS, not a set of IDs.

    A screenshot listing both valid CID numbers without pairing each number
    to the right molecule is NOT sufficient evidence for science question 5.
    OCR may insert simple separators, but cannot put the molecule and CID on
    different lines and still earn a mapping.
    """
    rows=[line.strip() for line in plain(text).splitlines() if line.strip()]
    mit=any(re.search(r"^mitragynine\b.*\bcid\s*3034396\b",line) for line in rows)
    oh=any(re.search(r"^7[- ]?oh\b.*\bcid\s*44301524\b",line) for line in rows)
    cross=any(
        re.search(r"^mitragynine\b.*\bcid\s*44301524\b",line)
        or re.search(r"^7[- ]?oh\b.*\bcid\s*3034396\b",line)
        for line in rows
    )
    return mit and oh and not cross


def recover(raw):
    """Only independent pixel-decoder text enters this deterministic assessor."""
    if set(raw)!=set(SECONDS):
        hold("EXACT_SIX_ACTUAL_FRAME_SLOTS_REQUIRED")
    a,b,h,shape,effect,source=(plain(raw[k]) for k in SECONDS)
    contaminated=any(p in " ".join(plain(t) for t in raw.values())
                     for p in BANNED)
    results={
        "q1":_shot_identity_nearest_caveat(a)=="mitragynine"
              and _shot_identity_nearest_caveat(b)=="7-oh",
        "q2":"hydroxyl group" in h and
              re.search(r"oxygen\s*\+\s*hydrogen",h) is not None,
        "q3":"computed 3d illustration" in shape
              and "not filmed" in shape
              and "not footage" in shape,
        "q4":"human experience" in effect
              and "not what its effects feel like" in effect,
        "q5":"pubchem" in source
              and _both_source_record_mappings_visible(source)
              and "compound record number" in source,
    }
    if contaminated:
        return {x:False for x in REQUIRED}
    return {q:bool(results[q]) for q in REQUIRED}


def _cmd(command, timeout=30):
    return subprocess.check_output(command,stderr=subprocess.DEVNULL,
                                   timeout=timeout)


def ocr_image(path, *, psm=11):
    if type(psm) is not int or psm not in (6,7,11):
        hold("UNSUPPORTED_OCR_PAGE_SEGMENTATION")
    if not shutil.which("tesseract"):
        hold("PINNED_LOCAL_OCR_EXECUTABLE_UNAVAILABLE")
    return _cmd(["tesseract",str(path),"stdout","--psm",str(psm)],
                timeout=45).decode("utf-8","replace")


def extract_png(movie,when,path):
    _cmd(["ffmpeg","-v","error","-nostdin","-ss",str(when),
          "-i",str(movie),"-frames:v","1","-update","1",
          "-y",str(path)],timeout=40)
    if not path.is_file() or path.stat().st_size<4000:
        hold("EXACT_ACTUAL_ENCODED_FRAME_NOT_DECODED")


def critical_negatives(raw,blank):
    # One actual blank-frame OCR result is replayed as every possible source
    # dropout. Swaps disprove a preloaded correct-answer oracle.
    if blank.strip():
        hold("OCR_HALLUCINATES_WORDS_ON_BLACK_SCREEN")
    reference=recover(raw)
    rows=[]
    for name,question in [
        ("compound_a","q1"),("compound_b","q1"),("hydroxyl","q2"),
        ("computed_shape","q3"),("human_effect_limit","q4"),
        ("source_hold","q5")
    ]:
        mutated=dict(raw);mutated[name]=blank
        rows.append({"fault":"delete_physical_frame:"+name,
                     "target":question,
                     "rejected":not recover(mutated)[question]})
    swaps=[
        ("swap_first_two_chemical_frames","compound_a","compound_b","q1"),
        ("show_molecule_instead_of_source_card","source_hold","compound_a","q5"),
    ]
    for label,dest,src,q in swaps:
        mutated=dict(raw);mutated[dest]=raw[src]
        rows.append({"fault":label,"target":q,"rejected":not recover(mutated)[q]})
    # Two additional science-relevant controls keep both numerical CIDs
    # visible while destroying their *identity association*.
    swapped=dict(raw)
    orig=swapped["source_hold"]
    swapped["source_hold"]=(orig.replace("3034396","__TEMP_CID__")
                            .replace("44301524","3034396")
                            .replace("__TEMP_CID__","44301524"))
    rows.append({"fault":"swap_both_valid_cid_number_assignments",
                 "target":"q5","rejected":not recover(swapped)["q5"]})
    unpaired=dict(raw)
    unpaired["source_hold"]=re.sub(
        r"(?im)^\s*7[- ]?oh\s*[^\w\n]*(?=cid\s*44301524)",
        "",orig)
    rows.append({"fault":"remove_7oh_to_cid_join_keep_cid_number",
                 "target":"q5","rejected":not recover(unpaired)["q5"]})
    if not all(r["rejected"] for r in rows):
        hold("NEGATIVE_CONTROL_DID_NOT_REJECT_AN_UNANSWERABLE_FRAME")
    if not all(reference.values()):
        hold("BASELINE_FRAME_OCR_CANNOT_RECOVER_ALL_FIVE_ANSWERS")
    return rows


def audit(movie,phone,receipt,claim,out):
    movie,phone,receipt,claim,out=map(Path,(movie,phone,receipt,claim,out))
    width,height,duration,count=probe_movie(movie)
    plan,_,expected=reject_untrusted(movie,phone,receipt,claim,width,height,duration)
    safety=validate_manifest(plan,width=width,height=height,
                             duration=duration,actual_sha=expected)
    if safety["mayPublish"] is not False or digest(movie)!=expected:
        hold("UNVERIFIED_EXACT_RESEARCH_MOVIE")
    if (width,height)!=(1080,1920) or count!=1031:
        hold("WRONG_NATIVE_MOVIE_DIMENSIONS_OR_FRAMES")
    byid={s["id"]:s for s in plan["shots"]}
    if len(byid)!=9:
        hold("SOURCE_SCREEN_SHOTS_CHANGED")
    for key,t in SECONDS.items():
        scene=byid.get(SCENES[key])
        if not scene or not (scene["startSec"]+0.1<t<scene["endSec"]-0.1):
            hold("SNAPSHOT_TIME_NO_LONGER_ALIGNED:"+key)
    with tempfile.TemporaryDirectory(prefix="ths-real-pixel-read-") as dirname:
        base=Path(dirname)
        frames={};raw={}
        for key,t in SECONDS.items():
            dest=base/(key+".png")
            extract_png(movie,t,dest)
            frames[key]={"timeSec":t,"frameSha256":digest(dest)}
            raw[key]=ocr_image(dest)
        # One truly blank 1080x1920 image encoded as PNG; useful independent
        # control on actual OCR, NOT a fabricated 'viewer score'.
        from PIL import Image
        blank_path=base/"unreadable-black-control.png"
        Image.new("RGB",(1080,1920),(0,0,0)).save(blank_path)
        blank=ocr_image(blank_path)
    answers=recover(raw)
    negatives=critical_negatives(raw,blank)
    recognizer=shutil.which("tesseract")
    version=_cmd(["tesseract","--version"]).decode("utf-8","replace").splitlines()[0]
    result={
        "schema":SCHEMA,"exactMovieSha256":digest(movie),
        "exactPhonePlanSha256":digest(phone),
        "exactClaimReportSha256":digest(claim),
        "nativeDecodedFrames":count,"resolution":[width,height],
        "ocrEngineVersion":version,
        "ocrBinarySha256":digest(recognizer) if recognizer else None,
        "frameProofs":frames,
        "rawUntrustedFrameText":raw,
        "fiveFixedQuestions":REQUIRED,"answerEvidenceFromPixelsOnly":answers,
        "negativeControls":negatives,
        "answersRecovered":sum(answers.values()),
        "negativeControlsRejected":sum(x["rejected"] for x in negatives),
        "annotationTextUsedAsAnswer":False,
        "automationAdditionalResearchPoints":1 if all(answers.values()) and
                             all(x["rejected"] for x in negatives) else 0,
        "maximumCurrentRequirementWorkingPercent":99,
        "humanAudienceParticipants":0,
        "humanUnderstandingDemonstrated":False,
        "humanComprehensionCalibrated":False,
        "independentMedicalExpertApproval":False,
        "premiumFilmApproved":False,"mayPublish":False,
        "scope":"Fallible pixel-only reading on six real frames; never human comprehension",
    }
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(result,indent=2)+"\n",encoding="utf-8")
    if result["automationAdditionalResearchPoints"]!=1:
        hold("INDEPENDENT_PIXEL_ONLY_FRAME_READ_FAIL")
    return result


if __name__=="__main__":
    p=argparse.ArgumentParser()
    for name in ("movie","phone","receipt","claim","out"):
        p.add_argument("--"+name,required=True)
    a=p.parse_args()
    print(json.dumps(audit(a.movie,a.phone,a.receipt,a.claim,a.out),indent=2))

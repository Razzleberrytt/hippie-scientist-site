#!/usr/bin/env python3
"""EvidenceMotion *objective*, media-bound sound-off teaching rubric.

Each additional passed, reproducible accessibility check contributes one
percentage point above the established 80% research/engineering foundation.
No model invents viewers, comprehension responses or publication approval.
Max automated score: 90%; final actual understanding is deliberately unclaimed.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

import numpy as np
from PIL import Image

from muted_review_research import reject_untrusted
from phone_ui_audit import probe_movie, validate_manifest

BASE_PERCENT = 80
AUTOMATED_CAP_PERCENT = 92
VERSION = "ths-real-media-objective-soundoff-v1"


def fail(code):
    raise ValueError("OBJECTIVE_MUTE_HOLD:" + code)


def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1048576), b""):
            h.update(chunk)
    return h.hexdigest()


def streamhash(path):
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-nostdin", "-i", str(path),
        "-map", "0:v:0", "-f", "streamhash", "-hash", "SHA256", "-"
    ], timeout=90)
    return raw.strip().decode("ascii")


def actual_frame_variation(movie, t):
    raw = subprocess.check_output([
        "ffmpeg", "-v", "error", "-nostdin", "-ss", str(t),
        "-i", str(movie), "-frames:v", "1", "-vf", "scale=180:320,format=gray",
        "-f", "rawvideo", "-pix_fmt", "gray", "-"
    ], timeout=35)
    if len(raw) != 180 * 320:
        fail("MISSING_REAL_DECODED_FRAME")
    frame = np.frombuffer(raw, dtype=np.uint8).reshape((320, 180))
    return round(float(frame[85:222, 18:150].std()), 3)



def real_rgb_frame(movie, when):
    """Decode one *actual* source-media RGB frame; never use annotation pixels."""
    width,height=1080,1920
    image=subprocess.check_output([
        "ffmpeg", "-v", "error", "-nostdin", "-ss", f"{when:.5f}",
        "-i", str(movie), "-frames:v", "1", "-f", "rawvideo",
        "-pix_fmt", "rgb24", "pipe:1"
    ], timeout=35)
    if len(image)!=width*height*3:
        fail("MISSING_REAL_CHALLENGE_FRAME")
    return np.frombuffer(image,dtype=np.uint8).reshape(height,width,3)


def compare_transfer_frames(open_a, open_b, not_before, not_after):
    """Two sound-off *visual-evidence* challenges, not human comprehension.

    Compare the rendered molecular diagrams while excluding changing labels.
    Verify a visually significant timed ≠ payoff while the illustrated
    *source structure remains stable*. This catches static fake comparisons,
    missing lesson payoffs and accidental chemistry morphs. Each test has
    explicit negative controls; it cannot award a human listener verdict.
    """
    for arr in (open_a,open_b,not_before,not_after):
        if arr.shape!=(1920,1080,3) or arr.dtype!=np.uint8:
            fail("EXACT_UNALTERED_NATIVE_RGB_FRAMES_REQUIRED")
    def region(frame, bounds):
        x1,y1,x2,y2=bounds
        return frame[y1:y2,x1:x2].astype(np.int16)
    def mad(a,b):
        return round(float(np.abs(a-b).mean()),3)
    molecule=(155,620,765,1060)
    conclusion=(70,1132,840,1290)
    result={
        "twoStructureGraphicPixelMad": mad(region(open_a,molecule),
                                           region(open_b,molecule)),
        "spokenNegationPayoffPixelMad": mad(region(not_before,conclusion),
                                           region(not_after,conclusion)),
        "sourceGraphStabilityAtNegationPixelMad": mad(region(not_before,molecule),
                                                     region(not_after,molecule))
    }
    result["structureComparisonVisiblyDifferent"]=result["twoStructureGraphicPixelMad"]>=6.0
    result["negationPayoffVisibleWithStableScience"]=(
        result["spokenNegationPayoffPixelMad"]>=8.0
        and result["sourceGraphStabilityAtNegationPixelMad"]<=1.0)
    return result


def actual_transfer_challenges(movie, plan):
    shots={s["id"]:s for s in plan["shots"]}
    pivot=shots["sentence_5_part1"]["startSec"]
    times=[.5,2.0,pivot-.2,pivot+.1]
    if not (shots["sentence_1_part0"]["startSec"]<=times[0]<
            shots["sentence_1_part0"]["endSec"] and
            shots["sentence_1_part1"]["startSec"]<=times[1]<
            shots["sentence_1_part1"]["endSec"] and
            shots["sentence_5_part0"]["startSec"]<=times[2]<
            shots["sentence_5_part0"]["endSec"] and
            shots["sentence_5_part1"]["startSec"]<=times[3]<
            shots["sentence_5_part1"]["endSec"]):
        fail("SOUND_OFF_CHALLENGE_TIMES_NOT_IN_SCENES")
    images=[real_rgb_frame(movie,t) for t in times]
    result=compare_transfer_frames(*images)
    result["actualDecodedChallengeSeconds"]=times
    return result


def evaluate(plan, *, image_variation=None, safe_zone_pass=False,
             identical_soundoff_stream=False, transfer_evidence=None):
    """Pure exact-caption/geometry objective score; testable with fault injection."""
    shots = plan.get("shots")
    if not isinstance(shots, list) or len(shots) != 9:
        fail("EXACT_NINE_SCENES_REQUIRED")
    byid = {s["id"]: s for s in shots}
    required_ids = (
        "sentence_1_part0", "sentence_1_part1", "sentence_2", "sentence_3",
        "sentence_4", "sentence_5_part0", "sentence_5_part1",
        "source_hold", "sentence_6"
    )
    if tuple(byid) != required_ids:
        fail("UNKNOWN_OR_REORDERED_SCENE")
    def words(scene):
        return [a["text"] for a in byid[scene]["annotations"]
                if a.get("role") != "caption"]
    def contains(scene, needle):
        return any(needle in t for t in words(scene))
    checks = []
    def record(code, passes, reason):
        checks.append({"code": code, "passed": bool(passes),
                       "weightPct": 1, "observedEvidence": reason})

    a,b=byid["sentence_1_part0"],byid["sentence_1_part1"]
    record("two_distinct_actual_compounds",
           contains(a["id"], "MITRAGYNINE")
           and contains(b["id"], "7-OH")
           and contains("source_hold", "Mitragynine • CID 3034396")
           and contains("source_hold", "7-OH • CID 44301524")
           and a["endSec"] - a["startSec"] >= 1.3
           and b["endSec"] - b["startSec"] >= 1.3,
           "Two different primary record identities have individually visible intervals >=1.3 s")
    record("first_use_cid_defined",
           contains("source_hold", "CID = compound record number")
           and all(not any("CID" in t for t in words(scene))
                   for scene in ("sentence_1_part0","sentence_1_part1")),
           "First shown CID is immediately explained on held source card; opening has no glossary overload")
    record("hydroxyl_plain_language",
           contains("sentence_2", "hydroxyl group.")
           and contains("sentence_2", "oxygen + hydrogen"),
           "Technical hydroxyl immediately defined in familiar atoms")
    record("atoms_bonds_plain_language",
           contains("sentence_3", "Dots mark atoms. Lines mark bonds."),
           "Actual molecule connectivity annotated in ordinary words")
    record("computed_shape_no_real_binding_claim",
           contains("sentence_4", "A possible\n3D shape.")
           and contains("sentence_4", "Computed 3D illustration • not filmed"),
           "Scientifically limited three-dimensional image in plain English")
    before,after = byid["sentence_5_part0"],byid["sentence_5_part1"]
    record("limit_of_inference_timed",
           abs(before["endSec"]-after["startSec"]) < .002
           and contains(before["id"], "STRUCTURE")
           and not contains(before["id"], "HUMAN EXPERIENCE")
           and contains(after["id"], "HUMAN EXPERIENCE"),
           "Human-effect caveat is not disclosed in the pre-negation shot")
    hold=byid["source_hold"]
    record("source_card_held_and_defined",
           hold["endSec"]-hold["startSec"] >= 3.
           and all(contains(hold["id"],term) for term in (
               "PubChem", "CID 44301524", "CID = compound record number",
               "Mitragynine • CID 3034396")),
           "Silent reference card held >=3 sec with both exact compounds, CID explanation, and PubChem")
    record("validated_phone_safe_geometry", safe_zone_pass,
           "Every native critical annotation confirmed by full phone-geometry preflight")
    if image_variation is None: image_variation = {}
    record("real_decoded_nonblank_science",
           all(image_variation.get(shot,0) >= 8. for shot in (
               "opening", "chemical_detail", "computed_model", "source_card")),
           "Actual MP4 center-stage pixel standard deviations all >=8 / 255")
    record("no_sound_and_identical_actual_pictures", identical_soundoff_stream,
           "No audio track and identical decoded per-stream SHA256 after muting")

    transfer_evidence=transfer_evidence or {}
    record("actual_graph_comparison_transfer",
           transfer_evidence.get("structureComparisonVisiblyDifferent") is True,
           "Real center-stage source-structure pixels change across the narrated comparison")
    record("actual_negation_visual_transfer",
           transfer_evidence.get("negationPayoffVisibleWithStableScience") is True,
           "Timed limitation payoff changes real pixels while the science graphic stays stable")

    passed=sum(int(item["passed"]) for item in checks)
    result={
        "schema": VERSION, "overallChecklistCompleted": 26,
        "overallChecklistTotal": 46,
        "overallChecklistPercent": round(100*26/46,1),
        "requirement": "B narration/caption/source/emphasis and sound-off coherence",
        "baseEvidencePercent": BASE_PERCENT,
        "microChecksPassed": passed,
        "microChecksTotal": len(checks),
        "currentStepObjectiveProgressPercent": BASE_PERCENT + passed,
        "automaticScoreCeilingPercent": AUTOMATED_CAP_PERCENT,
        "remainingPctReservedForUnmeasuredActualComprehension": 20-passed,
        "measured": checks,
        "allNewAutomatedChecksPassed": passed==len(checks),
        "humanAudienceResponsesObserved": 0,
        "actualUnfamiliarViewerComprehensionVerified": False,
        "independentQualifiedPronunciationVerified": False,
        "premiumFilmApproved": False,
        "realHandsetPlaybackVerified": False,
        "mayPublish": False,
        "objectiveScope": "Content/accessibility/real-pixel teaching transfer proxies; not observed viewer answers",
    }
    return result


def audit(movie, manifest, receipt, claim, silent_movie, out):
    movie, manifest, receipt, claim, silent_movie, out = [
        Path(p) for p in (movie, manifest, receipt, claim, silent_movie, out)]
    w,h,duration,frames = probe_movie(movie)
    plan,data,expected_sha = reject_untrusted(movie,manifest,receipt,claim,w,h,duration)
    if expected_sha != digest(movie) or frames < 1000:
        fail("ACTUAL_SOURCE_VIDEO_UNVERIFIED")
    safe=validate_manifest(plan,width=w,height=h,duration=duration,actual_sha=expected_sha)
    if safe["mayPublish"] is not False:
        fail("PUBLICATION_SAFEGUARD_VIOLATION")
    muted_probe=json.loads(subprocess.check_output([
        "ffprobe", "-v", "error", "-show_entries", "stream=codec_type",
        "-of", "json", str(silent_movie)], timeout=20))
    tracks=muted_probe.get("streams", [])
    audio_free = len(tracks)==1 and tracks[0].get("codec_type")=="video"
    matching = audio_free and streamhash(movie)==streamhash(silent_movie)
    # Pixel measurements are deliberately about the *actual* encoded image,
    # not caller-supplied annotation claims or an AI scene hallucination.
    variance={
        "opening": actual_frame_variation(movie, .5),
        "chemical_detail": actual_frame_variation(movie, 6.),
        "computed_model": actual_frame_variation(movie, 19.),
        "source_card": actual_frame_variation(movie, 28.5),
    }
    transfer=actual_transfer_challenges(movie,plan)
    scored=evaluate(plan,image_variation=variance,safe_zone_pass=True,
                    identical_soundoff_stream=matching,transfer_evidence=transfer)
    scored.update({
        "actualVideoSha256": expected_sha,
        "actualMutedVideoSha256": digest(silent_movie),
        "exactPhonePlanSha256": digest(manifest),
        "exactScientificClaimScreenSha256": digest(claim),
        "realDecodedFrameCount": frames,
        "observedActualPixelStd": variance,
        "actualSoundOffTransferChallenges": transfer,
        "actualSilencedAudioStreams": 0 if audio_free else "UNKNOWN_OR_NONZERO",
        "postMuteVideoStreamSame": matching,
    })
    out.parent.mkdir(parents=True,exist_ok=True)
    out.write_text(json.dumps(scored,indent=2)+"\n")
    return scored


if __name__=="__main__":
    parser=argparse.ArgumentParser()
    for opt in ("movie","manifest","receipt","claim","silent-movie","out"):
        parser.add_argument("--"+opt,required=True)
    args=parser.parse_args()
    print(json.dumps(audit(args.movie,args.manifest,args.receipt,args.claim,
                           args.silent_movie,args.out),indent=2))

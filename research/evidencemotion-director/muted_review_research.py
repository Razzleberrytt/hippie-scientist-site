#!/usr/bin/env python3
"""Real-MP4 sound-off comprehension *review kit*, not a comprehension verdict.

Produces a muted H.264 film (same decoded pictures), fixed timestamp stills,
question-only participant form and a distinct source-bound scoring key.
Never invents respondents, listening/handset sessions or publication authority.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile

from PIL import Image, ImageDraw
from autonomous_script_asr_research import WAV_SHA
from phone_ui_audit import probe_movie, verify_shots

SCENE_IDS = (
    "sentence_1_part0", "sentence_1_part1", "sentence_2", "sentence_3",
    "sentence_4", "sentence_5_part0", "sentence_5_part1", "source_hold",
    "sentence_6",
)
CANDIDATE_STATUS = "NEW_RENDERED_RESEARCH_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW"
SCREEN_STATUS = "MECHANICAL_SOURCE_CAPTION_SCREEN_PASS_INDEPENDENT_REVIEW_REQUIRED"
QUESTIONS = (
    ("Q1", "Which two chemical structures are being compared?"),
    ("Q2", "What is the scientific name for the highlighted oxygen-and-hydrogen group?"),
    ("Q3", "Is the moving 3D molecular image actual binding footage, or a computed illustration?"),
    ("Q4", "Can this structure picture establish what the substance feels like in a person? Explain."),
    ("Q5", "Where can you check the 7-OH chemical record, and what is its record number?"),
)
SOURCE_REFS = ("https://pubchem.ncbi.nlm.nih.gov/compound/3034396",
               "https://pubchem.ncbi.nlm.nih.gov/compound/44301524")
EVIDENCE_WINDOWS = {
    "Q1": ["sentence_1_part0", "sentence_1_part1"],
    "Q2": ["sentence_2"],
    "Q3": ["sentence_4"],
    "Q4": ["sentence_5_part0", "sentence_5_part1"],
    "Q5": ["source_hold"],
}


def fail(code):
    raise ValueError("MUTED_REVIEW_HOLD:" + code)


def sha(path):
    digest = hashlib.sha256()
    with open(path, "rb") as handle:
        for chunk in iter(lambda: handle.read(1 << 20), b""):
            digest.update(chunk)
    return digest.hexdigest()


def invoke(*args, timeout=90):
    return subprocess.run(args, check=True, capture_output=True, timeout=timeout)


def reject_untrusted(movie, manifest, receipt, claim, width, height, duration):
    if (not movie.is_file() or movie.is_symlink()
            or any(not p.is_file() or p.is_symlink() for p in (manifest, receipt, claim))):
        fail("REGULAR_EXACT_MEDIA_AND_RECEIPTS_REQUIRED")
    data = json.loads(receipt.read_text(encoding="utf-8"))
    plan = json.loads(manifest.read_text(encoding="utf-8"))
    screen = json.loads(claim.read_text(encoding="utf-8"))
    movie_sha = sha(movie)
    if (data.get("videoSha256") != movie_sha
            or plan.get("expectedVideoSha256") != movie_sha
            or screen.get("actualVideoSha256") != movie_sha
            or screen.get("phonePlanSha256") != sha(manifest)
            or screen.get("receiptSha256") != sha(receipt)):
        fail("EXACT_FILM_OR_PROVENANCE_REVISIONS_DO_NOT_MATCH")
    if (data.get("sourceWavSha256") != WAV_SHA or screen.get("actualWavSha256") != WAV_SHA):
        fail("ORIGINAL_LOCKED_NARRATION_CHANGED")
    if (data.get("status") != CANDIDATE_STATUS or data.get("treatment") != "specimen"
            or data.get("resolution") != [1080, 1920] or data.get("isOriginalV5") is not False
            or data.get("scienceApproved") is not False or data.get("mayPublish") is not False
            or plan.get("status") != "RESEARCH_ONLY"
            or plan.get("releaseApproved") is not False
            or screen.get("status") != SCREEN_STATUS
            or screen.get("mayPublish") is not False
            or screen.get("mutedComprehensionApproved") is not False
            or width != 1080 or height != 1920):
        fail("RESEARCH_ONLY_AND_EXPLICIT_REVIEW_HOLD_REQUIRED")
    scenes = plan.get("shots")
    verify_shots(scenes, duration)
    if tuple(s["id"] for s in scenes) != SCENE_IDS:
        fail("EXACT_NINE_SOURCE_BOUND_SHOTS_REQUIRED")
    if (screen.get("emittedShotIntervalsInspected") != 9
            or screen.get("narratedScenesInspected") != 7):
        fail("SOURCE_SCENE_CLAIM_SCREEN_NOT_PERFORMED")
    compounds = data.get("chemistry")
    if (not isinstance(compounds, list) or
            {(x.get("cid"), x.get("url")) for x in compounds if isinstance(x, dict)} !=
            {(3034396, SOURCE_REFS[0]), (44301524, SOURCE_REFS[1])}):
        fail("TWO_EXACT_PUBCHEM_IDENTITIES_REQUIRED")
    # The actual source-linked film must convey the five required ideas in
    # its recorded visible annotations. This does NOT prove a viewer noticed.
    annotations = {s["id"]: " ".join(a["text"] for a in s["annotations"])
                   for s in scenes}
    for shot, required in {
        "sentence_1_part0": "MITRAGYNINE",
        "sentence_1_part1": "7-OH",
        "sentence_2": "hydroxyl",
        "sentence_4": "Computed 3D illustration",
        "sentence_5_part1": "HUMAN EXPERIENCE",
        "source_hold": "CID 44301524",
    }.items():
        if required not in annotations[shot]:
            fail("MISSING_SOUND_OFF_TEACHING_EVIDENCE_" + shot.upper())
    if ("CID 3034396" not in annotations["source_hold"]
            or "CID = compound record number" not in annotations["source_hold"]):
        fail("BOTH_SOURCE_IDENTITIES_AND_FIRST_CID_DEFINITION_REQUIRED")
    if any("CID" in annotations[s] for s in ("sentence_1_part0","sentence_1_part1")):
        fail("READING_OVERLOAD_FIRST_CID_MUST_BE_ON_HELD_SOURCE_CARD")
    return plan, data, movie_sha


def build(movie, manifest, receipt, claim, out):
    movie, manifest, receipt, claim, out = map(Path, (movie, manifest, receipt, claim, out))
    if not movie.is_file() or movie.is_symlink():
        fail("REAL_FILM_REQUIRED")
    width, height, duration, frames = probe_movie(movie)
    plan, data, movie_sha = reject_untrusted(
        movie, manifest, receipt, claim, width, height, duration)
    if not 1000 <= frames <= 2700:
        fail("FULL_RESEARCH_FILM_NOT_DECODED")
    if out.is_symlink() or (out.exists() and any(out.iterdir())):
        fail("FRESH_DESTINATION_ONLY_PREVENT_STALE_APPROVAL")
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".mute-review-", dir=out.parent) as tmp:
        staging = Path(tmp)
        muted = staging / "film-sound-off.mp4"
        invoke("ffmpeg", "-v", "error", "-nostdin", "-y", "-i", str(movie),
               "-map", "0:v:0", "-c:v", "copy", "-an", "-movflags", "+faststart",
               str(muted))
        probe = json.loads(invoke("ffprobe", "-v", "error",
            "-show_entries", "stream=codec_type,width,height", "-of", "json",
            str(muted)).stdout)
        tracks = probe.get("streams", [])
        if len(tracks) != 1 or tracks[0].get("codec_type") != "video":
            fail("SOUND_OFF_FILE_HAS_AUDIO_OR_MISSING_VIDEO")
        reference = invoke("ffmpeg", "-v", "error", "-i", str(movie), "-map", "0:v:0",
                           "-f", "streamhash", "-hash", "SHA256", "-")
        muted_stream = invoke("ffmpeg", "-v", "error", "-i", str(muted), "-map", "0:v:0",
                              "-f", "streamhash", "-hash", "SHA256", "-")
        if reference.stdout.strip() != muted_stream.stdout.strip():
            fail("MUTING_CHANGED_THE_VISUAL_FRAME_STREAM")
        sample_list = []
        for s in plan["shots"]:
            t = (s["startSec"] + s["endSec"]) / 2
            sample_list.append((s["id"], t))
        # Two tight acoustic-boundary samples, plus a first-half-second hook.
        spoken_not = plan["shots"][6]["startSec"]
        sample_list += [("first_half_second", .5),
                        ("before_spoken_not", spoken_not - .15),
                        ("after_spoken_not", spoken_not + .15)]
        thumbs = []
        for i, (key, t) in enumerate(sample_list):
            if not (0 <= t < duration):
                fail("FRAME_REVIEW_TIMES_OUTSIDE_MOVIE")
            target = staging / f"{i:02d}-{key}.png"
            invoke("ffmpeg", "-v", "error", "-nostdin", "-y", "-ss",
                   f"{t:.6f}", "-i", str(muted), "-frames:v", "1", str(target),
                   timeout=35)
            if not target.is_file() or target.stat().st_size == 0:
                fail("ACTUAL_MUTE_FRAME_EXTRACTION_FAILED")
            thumbs.append({"scene": key, "seconds": round(t, 6),
                           "file": target.name, "sha256": sha(target)})
        image = Image.new("RGB", (920, 4 * 520), "white")
        draw = ImageDraw.Draw(image)
        for i, entry in enumerate(thumbs):
            frame = Image.open(staging / entry["file"]).convert("RGB")
            frame.thumbnail((270, 480))
            column, row = i % 3, i // 3
            image.paste(frame, (16 + column * 305, 22 + row * 520))
            draw.text((16 + column * 305, 504 + row * 520),
                      entry["scene"][:24], fill="black")
        image.save(staging / "actual-muted-contact-sheet.jpg", quality=87)
        quiz = {"schema": "ths-mute-viewer-questions-v1", "condition": "SOUND_OFF",
                "blindInstruction": "Watch film-sound-off.mp4 at normal speed once. Do not read scoring-key.json first. Answer each question without source transcript.",
                "respondents": [], "questions": [
                    {"id": k, "prompt": v, "response": None} for k, v in QUESTIONS]}
        key = {"schema": "ths-mute-scoring-key-v1",
               "scope": "CONTENT_CHECK_NOT_AN_AUTOMATED_COMPREHENSION_SCORE",
               "answers": [
                   {"id": "Q1", "required": ["mitragynine", "7-hydroxymitragynine"],
                    "evidenceScenes": EVIDENCE_WINDOWS["Q1"]},
                   {"id": "Q2", "required": ["hydroxyl", "oxygen and hydrogen"],
                    "evidenceScenes": EVIDENCE_WINDOWS["Q2"]},
                   {"id": "Q3", "required": ["computed illustration", "not filmed binding"],
                    "evidenceScenes": EVIDENCE_WINDOWS["Q3"]},
                   {"id": "Q4", "required": ["no human effects inference"],
                    "evidenceScenes": EVIDENCE_WINDOWS["Q4"]},
                   {"id": "Q5", "required": ["PubChem", "44301524"],
                    "evidenceScenes": EVIDENCE_WINDOWS["Q5"]},
               ]}
        (staging / "viewer-questions.json").write_text(json.dumps(quiz, indent=2) + "\n")
        (staging / "scoring-key.json").write_text(json.dumps(key, indent=2) + "\n")
        report = {
            "schema": "ths-real-media-mute-comprehension-packet-v1",
            "result": "REVIEW_PACK_GENERATED_NO_AUDIENCE_COMPREHENSION_PASS",
            "actualFilmSha256": movie_sha,
            "mutedFilmSha256": sha(muted),
            "originalWavSha256": WAV_SHA,
            "manifestSha256": sha(manifest),
            "claimScreenSha256": sha(claim),
            "actualDecodedFramesCount": frames,
            "actualMuteFrames": thumbs,
            "imageBitstreamUnchangedByMuting": True,
            "soundOffHasZeroAudioTracks": True,
            "questions": len(QUESTIONS),
            "actualAudienceResponsesReceived": 0,
            "independentlyCalibratedViewerComprehensionVerified": False,
            "naturalVoicePronunciationVerified": False,
            "realHandsetPlaybackVerified": False,
            "excellentFirstFinalCredited": False,
            "mayPublish": False
        }
        (staging / "packet-receipt.json").write_text(json.dumps(report, indent=2) + "\n")
        out.mkdir(parents=True, exist_ok=True)
        for entry in staging.iterdir():
            shutil.move(str(entry), str(out / entry.name))
    return report


def main():
    p = argparse.ArgumentParser()
    for field in ("movie", "manifest", "receipt", "claim", "out"):
        p.add_argument("--" + field, required=True)
    a = p.parse_args()
    print(json.dumps(build(a.movie, a.manifest, a.receipt, a.claim, a.out), indent=2))


if __name__ == "__main__":
    main()

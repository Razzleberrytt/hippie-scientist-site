#!/usr/bin/env python3
"""Real original-source RGB pixel replay at eight immutable archived frame indices.

Uses restored ORIGINAL renderer source, exact archived WAV/timing candidate,
Pillow/RDKit/fonts. Fail closed on any mismatch. Never authenticates original
runner or awards science/craft/handset/release or five-render-streak credit.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

from original_replay_admission import (
    inspect_replay_inputs, ORIGINAL_TIMED_RECEIPT_SHA256,
    ORIGINAL_WAV_SHA256
)

CANDIDATE_SHA = "a034f00c4fdffaa3574058093e506f184c6b347a5b5561556005c28ec86db626"
FRAMES = (0, 60, 120, 360, 540, 750, 870, 1000)
ARCHIVED_PNG_SHA = {
    0: "580b8a55936a2acd661945f6a0349c16bee7570acfbd1d76d6dfd016c4c4bbf6",
    60: "4a6de568e68a11618055ce643eecef5c6ee5293a790be84153474a3baee2cd56",
    120: "ff13249df8bdeba53d863a2cdc575331231a05d49006a1ddd4f832312b6d0c0e",
    360: "3fea33d6b398e20e9dc8e4157f78969c2c86cc836d599bf50684a369e9d2ddeb",
    540: "31207bacc022c3aeceec5b964e4c9a8b03da9cf1606dfa94843c907973987f92",
    750: "c5b050aa7c4faa806283fb16293f06ed7432207c401f83fc709eda442e4062af",
    870: "fbf8795aedff1cc197d16b0f5f35d50c1bf12fca2f037773d2ebdad494b56ebb",
    1000: "09736c1db02818f17e31bbfab302fd0d6dfc5f8bc98fe6fae6c47666b9aa9e32",
}
ARCHIVED_PATH = "specimen-timed-native"
RECEIPT = "render-receipt.json"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def sha_file(path):
    hasher = hashlib.sha256()
    with Path(path).open("rb") as handle:
        for chunk in iter(lambda: handle.read(1048576), b""):
            hasher.update(chunk)
    return hasher.hexdigest()


def probe(*, source_dir, font_dir, wav, archive_dir):
    import PIL
    from PIL import Image
    import rdkit

    source_dir = Path(source_dir).resolve()
    archive_dir = Path(archive_dir).resolve()
    root = archive_dir / ARCHIVED_PATH
    admission = inspect_replay_inputs(
        receipt_path=root / RECEIPT, renderer_dir=source_dir,
        font_dir=font_dir, wav_path=wav,
    )
    report = {
        "schema": "ths-em-original-eight-native-source-frame-replay-v1",
        "status": "HOLD", "archiveReceiptSha256": ORIGINAL_TIMED_RECEIPT_SHA256,
        "sourceWavSha256": ORIGINAL_WAV_SHA256,
        "sourceVersionChecks": admission,
        "candidateSha256": CANDIDATE_SHA,
        "results": [],
        "allEightOriginalRgbImagesBitwiseIdentical": False,
        "all1031OriginalRgbFramesCaptured": False,
        "twoIndependentOriginalRendererRunsAuthenticated": False,
        "premiumCraftVerified": False, "mayPublish": False,
        "firstExcellentMasterAccepted": False, "fiveRenderStreakAccepted": False
    }
    if admission["status"] != "LOCAL_INPUT_PINS_MATCH_RESEARCH_ONLY":
        report["blockingReasons"] = ["ORIGINAL_ENVIRONMENT_ADMISSION_HOLD"] + admission["blockingReasons"]
        return report

    candidate_path = archive_dir / "result" / "alignment-candidate.json"
    if not candidate_path.is_file() or candidate_path.is_symlink() or sha_file(candidate_path) != CANDIDATE_SHA:
        report["blockingReasons"] = ["PINNED_ALIGNMENT_CANDIDATE_MISSING_OR_CHANGED"]
        return report
    alignment = json.loads(candidate_path.read_text())
    original_receipt = json.loads((root / RECEIPT).read_text())
    if (alignment.get("revisionSha256") != original_receipt.get("alignmentRevisionSha256")
            or alignment.get("inputSha256", {}).get("wav") != ORIGINAL_WAV_SHA256
            or alignment.get("sampleCount") != 824336
            or original_receipt.get("experimentCaptionMode") != "TIMED_RESEARCH"):
        report["blockingReasons"] = ["ARCHIVED_TIMELINE_OR_CAPTION_MODE_DRIFT"]
        return report
    import importlib
    sys.path.insert(0, str(source_dir))
    try:
        renderer = importlib.import_module("narration_locked_treatments")
        if renderer.FPS != 30 or math.ceil(alignment["sampleCount"] * 30 / 24000) != 1031:
            report["blockingReasons"] = ["SOURCE_TIMELINE_GEOMETRY_DRIFT"]
            return report
        scenes = renderer.timeline(alignment)
        font, font_hashes = renderer.fonts(font_dir)
        if font_hashes != original_receipt["fonts"]:
            report["blockingReasons"] = ["ORIGINAL_FONT_IDENTITY_CHANGED"]
            return report
        assets = renderer.chemistry_assets(light=False)
        assets["dark_diagram"] = renderer.chemistry_assets(light=False)["7_hydroxymitragynine"]["diagram"]
        failures = []
        for i in FRAMES:
            shot = renderer.render_frame(i / 30, scenes, assets, "specimen", (1080, 1920), font,
                                         caption_mode="timed_research")
            actual_raw = shot.convert("RGB").tobytes()
            ref = root / ("source_frame_%04d.png" % i)
            if (ref.is_symlink() or not ref.is_file() or
                    sha_file(ref) != ARCHIVED_PNG_SHA[i]):
                failures.append("ARCHIVED_FRAME_MISSING_OR_CHANGED:%d" % i)
                continue
            with Image.open(ref) as img:
                if img.size != (1080, 1920):
                    failures.append("ARCHIVED_GEOMETRY_MISMATCH:%d" % i)
                    continue
                expected_raw = img.convert("RGB").tobytes()
            same = actual_raw == expected_raw
            report["results"].append({
                "frame": i, "rgbBytes": len(actual_raw),
                "archivedRgbSha256": sha(expected_raw),
                "replayedRgbSha256": sha(actual_raw),
                "bitwiseIdentical": same
            })
            if not same:
                failures.append("ORIGINAL_SOURCE_PIXEL_MISMATCH:%d" % i)
        report["blockingReasons"] = failures
        report["allEightOriginalRgbImagesBitwiseIdentical"] = (len(report["results"]) == 8 and not failures)
        report["status"] = ("EIGHT_FRAME_SOURCE_PIXEL_MATCH_RESEARCH_ONLY"
                            if report["allEightOriginalRgbImagesBitwiseIdentical"] else "HOLD")
        return report
    finally:
        sys.path.pop(0)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", required=True)
    parser.add_argument("--font-dir", required=True)
    parser.add_argument("--wav", required=True)
    parser.add_argument("--archive-dir", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    outcome = probe(source_dir=args.source_dir, font_dir=args.font_dir,
                    wav=args.wav, archive_dir=args.archive_dir)
    Path(args.out).write_text(json.dumps(outcome, indent=2) + "\n")
    print(json.dumps({"status": outcome["status"], "blockingReasons": outcome.get("blockingReasons"),
                      "framesCompared": len(outcome["results"]), "mayPublish": False}, indent=2))
    raise SystemExit(0 if outcome["status"] == "EIGHT_FRAME_SOURCE_PIXEL_MATCH_RESEARCH_ONLY" else 2)

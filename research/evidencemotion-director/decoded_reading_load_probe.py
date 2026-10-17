#!/usr/bin/env python3
"""EM-034 negative-only physical OCR sample of an exact H.264 film.

Checks source-bound sampled glyphs and crowding from decoded pixels. The sample
is NEVER a phone, comprehension, science, or full-film legibility approval.
"""
import argparse
import hashlib
import json
import math
import re
import subprocess
import tempfile
from pathlib import Path

SCHEMA = "ths-em034-decoded-reading-negative-screen-v1"
MAX_SAMPLE_WORDS = 12  # Uncalibrated conservative triage cap, never an approval.


def hold(reason):
    raise ValueError("EM034_DECODED_READING_HOLD:" + reason)


def digest(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for chunk in iter(lambda: stream.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def unique_json(path):
    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                hold("DUPLICATE_MANIFEST_KEY")
            result[key] = value
        return result
    def no_constant(value):
        hold("NONFINITE_MANIFEST_NUMBER")
    try:
        return json.loads(Path(path).read_text(encoding="utf-8"),
                          object_pairs_hook=unique_pairs, parse_constant=no_constant,
                          parse_float=lambda s: finite_float(s))
    except (UnicodeDecodeError, json.JSONDecodeError):
        hold("UNREADABLE_MANIFEST")


def finite_float(value):
    result = float(value)
    if not math.isfinite(result):
        hold("NONFINITE_MANIFEST_NUMBER")
    return result


def run(args, reason):
    try:
        return subprocess.run(args, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                              check=True, timeout=45).stdout.decode("utf-8", "replace")
    except (OSError, subprocess.SubprocessError):
        hold(reason)


def probe_movie(movie):
    raw = run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-count_frames",
               "-show_entries", "stream=codec_name,width,height,r_frame_rate,nb_read_frames",
               "-of", "json", str(movie)], "FILM_PROBE_FAILED")
    try:
        streams = json.loads(raw)["streams"]
        video = streams[0]
        frames = int(video["nb_read_frames"])
    except (ValueError, KeyError, IndexError, TypeError):
        hold("EXACT_DECODED_FRAME_COUNT_MISSING")
    if (len(streams) != 1 or video.get("codec_name") != "h264"
        or (video.get("width"), video.get("height")) != (1080, 1920)
        or video.get("r_frame_rate") != "30/1" or frames < 12):
        hold("NATIVE_H264_1080X1920_30FPS_REQUIRED")
    return frames


def manifest_scenes(data, frames):
    if (not isinstance(data, dict) or set(data) !=
        {"schema", "filmSha256", "status", "mayPublish", "scenes"}
        or data["schema"] != SCHEMA or data["status"] != "RESEARCH_ONLY"
        or data["mayPublish"] is not False):
        hold("RESEARCH_ONLY_EXACT_MANIFEST_REQUIRED")
    scenes = data["scenes"]
    if not isinstance(scenes, list) or not 1 <= len(scenes) <= 24:
        hold("SCENE_INVENTORY_REQUIRED")
    cursor = 0
    names = set()
    for scene in scenes:
        if not isinstance(scene, dict) or set(scene) != {
                "id", "startFrame", "endFrameExclusive", "cropPx", "requiredTokens"}:
            hold("SCENE_FIELDS_REQUIRED")
        name, start, end = scene["id"], scene["startFrame"], scene["endFrameExclusive"]
        if (not isinstance(name, str) or not re.fullmatch(r"[a-z][a-z0-9_-]{0,49}", name)
            or name in names or type(start) is not int or type(end) is not int
            or start != cursor or end - start < 12 or end > frames):
            hold("NONCONTIGUOUS_OR_TOO_SHORT_SCENE")
        names.add(name)
        cursor = end
        x, y, w, h = scene["cropPx"] if isinstance(scene["cropPx"], list) and len(scene["cropPx"]) == 4 else (None,)*4
        if (any(type(v) is not int for v in (x, y, w, h)) or x < 0 or y < 0
            or w < 100 or h < 50 or x + w > 1080 or y + h > 1920):
            hold("UNSAFE_OR_SMALL_PHYSICAL_CROP")
        tokens = scene["requiredTokens"]
        if (not isinstance(tokens, list) or not 1 <= len(tokens) <= 8
            or any(not isinstance(t, str) or not re.fullmatch(r"[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*", t)
                   for t in tokens) or len(set(t.casefold() for t in tokens)) != len(tokens)):
            hold("INVALID_CRITICAL_WORD_INVENTORY")
    if cursor != frames:
        hold("INCOMPLETE_DECODED_FILM_SCENE_COVERAGE")
    return scenes


def words(text):
    return re.findall(r"[a-z0-9]+(?:-[a-z0-9]+)*", text.casefold())


def inspect(movie, manifest, out):
    movie, manifest, out = Path(movie), Path(manifest), Path(out)
    if (out.resolve() in (movie.resolve(), manifest.resolve()) or out.is_symlink()):
        hold("OUTPUT_ALIASES_SOURCE")
    data = unique_json(manifest)
    movie_sha = digest(movie)
    if (not isinstance(data.get("filmSha256"), str)
        or not re.fullmatch(r"[0-9a-f]{64}", data["filmSha256"])
        or data["filmSha256"] != movie_sha):
        hold("EXACT_ENCODED_FILM_SHA_MISMATCH")
    frames = probe_movie(movie)
    scenes = manifest_scenes(data, frames)
    observations = []
    with tempfile.TemporaryDirectory(prefix="em034-decoded-") as folder:
        for scene in scenes:
            start, end = scene["startFrame"], scene["endFrameExclusive"]
            count = end - start
            indices = [start + count // 4, start + count // 2, start + (3 * count) // 4]
            if len(set(indices)) != 3:
                hold("INSUFFICIENT_DISTINCT_REAL_FRAMES")
            x, y, w, h = scene["cropPx"]
            for index in indices:
                crop = Path(folder) / f"{scene['id']}-{index}.png"
                # Full movie is decoded to identify frame n; no input answer word
                # or transcript is passed to FFmpeg or the OCR engine.
                run(["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-i", str(movie),
                     "-vf", f"select=eq(n\\,{index}),crop={w}:{h}:{x}:{y}",
                     "-frames:v", "1", "-y", str(crop)], "EXACT_FRAME_DECODE_FAILED")
                if not crop.exists() or crop.stat().st_size < 100:
                    hold("ACTUAL_ENCODED_CROP_MISSING")
                raw = run(["tesseract", str(crop), "stdout", "--psm", "6"],
                          "PHYSICAL_OCR_FAILED")
                observed = words(raw)
                required = [t.casefold() for t in scene["requiredTokens"]]
                if any(t not in observed for t in required):
                    hold("REQUIRED_WORD_NOT_IN_SAME_DECODED_CROP:"+scene["id"])
                if len(observed) > MAX_SAMPLE_WORDS:
                    hold("SAMPLED_VISIBLE_TEXT_OVERLOAD:"+scene["id"])
                observations.append({"scene":scene["id"], "frameIndex":index,
                                     "timestampSec":round(index / 30, 6),
                                     "cropSha256":digest(crop),
                                     "observedWords":observed,
                                     "sampleVisibleWordCount":len(observed),
                                     "requiredTokensObserved":True})
    receipt = {"schema":SCHEMA, "status":"SAMPLED_NEGATIVE_SCREEN_NO_HOLD_REVIEW_REQUIRED",
               "filmSha256":movie_sha, "manifestSha256":digest(manifest),
               "nativeDecodedFrames":frames, "observations":observations,
               "physicalCropsChecked":len(observations),
               "maximumSampleWords":MAX_SAMPLE_WORDS,
               "everyFrameIndependentlyTextAudited":False,
               "estimatedAudienceReadingSpeedVerified":False,
               "timedCaptionWordFidelityVerified":False,
               "originalColorPhoneLegibilityApproved":False,
               "mutedComprehensionApproved":False,
               "qualifiedScienceApproved":False, "mayPublish":False}
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=out.parent, mode="w", encoding="utf-8",
                                     prefix=".em034-", suffix=".json", delete=False) as fh:
        temp = Path(fh.name)
        json.dump(receipt, fh, indent=2)
        fh.write("\n")
    temp.replace(out)
    return receipt


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--film", required=True)
    p.add_argument("--manifest", required=True)
    p.add_argument("--out", required=True)
    a = p.parse_args()
    print(json.dumps(inspect(a.film, a.manifest, a.out), indent=2))

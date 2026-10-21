#!/usr/bin/env python3
"""Align the owner-approved exact R8.12 WAV; emit MFA candidates, never approval."""
from __future__ import annotations
import argparse
import hashlib
import importlib.metadata
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import wave

MASTER_SHA = "82e94ea07dd28cd16ab86e0bd6b14c57dade0391583d31f03f36578813c7f6a1"
SOURCE_RECEIPT_SHA = "bf02082cccc62aead6381367887e13e727c01508ef4f0df6f58e40f134b62eea"
MASTER_FRAMES = 938368
RATE = 24000
MFA_VERSION = "3.3.8"
MODEL_PINS = {
    "dictionary": "e8c6c7b036ae2b7c78d2768b8dc6b1f9359175b842956d00b48c53c9c332e6b0",
    "acousticModel": "d35ce271ded357d833d2f4b8d1041dc3748b9538567ba13f2c697f4e4126711b",
    "g2pModel": "f079ae88f792458fa7c123b256e5b86cc55c29ac2ffc457c673e6c60c36cd143",
}
SCENES = ("hook", "leaf", "enzyme", "receptor", "qualifier",
          "study2019", "study2024", "itraconazole", "product", "cta")
PHONE = re.compile(r"(?:AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)[012]?|B|CH|D|DH|F|G|HH|JH|K|L|M|N|NG|P|R|S|SH|T|TH|V|W|Y|Z|ZH")

def hold(code):
    raise ValueError("OWNER_LOCKED_MFA_HOLD:" + code)

def sha_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

def regular(path):
    p = Path(path)
    if p.is_symlink() or not p.is_file():
        hold("SOURCE_NOT_REGULAR_FILE")
    return p.resolve()

def source_files(source_dir):
    root = Path(source_dir).resolve()
    wav = regular(root / "r812-mitragynine-authentic-voice-REVIEW.wav")
    receipt = regular(root / "r812-mitragynine-authentic-voice-REVIEW.receipt.json")
    if sha_file(wav) != MASTER_SHA:
        hold("UNAPPROVED_MASTER_SHA")
    if sha_file(receipt) != SOURCE_RECEIPT_SHA:
        hold("UNAPPROVED_SOURCE_RECEIPT_SHA")
    source = json.loads(receipt.read_text("utf-8"))
    if source.get("narrationWavSha256") != MASTER_SHA or source.get("durationFrames") != MASTER_FRAMES:
        hold("SOURCE_RECEIPT_MISMATCH")
    if (source.get("voice") != "am_michael" or source.get("voiceEngine") != "kokoro-onnx==0.6.1"
        or source.get("releaseAuthority") != "draft-only-not-for-publication"
        or source.get("humanAuditoryReview") != "pending"
        or source.get("wordLevelAlignmentCertified") is not False
        or source.get("timeStretchApplied") is not False):
        hold("ORIGINAL_SOURCE_GATES_CHANGED")
    with wave.open(str(wav), "rb") as audio:
        fmt = (audio.getnchannels(), audio.getsampwidth(), audio.getframerate(),
               audio.getcomptype(), audio.getnframes())
        if fmt != (1, 2, RATE, "NONE", MASTER_FRAMES):
            hold("UNAPPROVED_PCM_FORMAT_OR_DURATION")
        pcm = audio.readframes(MASTER_FRAMES)
    if len(pcm) != MASTER_FRAMES * 2:
        hold("TRUNCATED_PCM")
    clips = source.get("clips")
    if not isinstance(clips, list) or len(clips) != len(SCENES):
        hold("SCENE_COUNT_CHANGED")
    cursor = 0
    for i, (scene, name) in enumerate(zip(clips, SCENES)):
        start, end, pause = (scene.get(key) for key in
                             ("voiceStartFrame", "voiceEndFrame", "pauseAfterFrames"))
        if (scene.get("scene") != name or not isinstance(scene.get("voiceInput"), str)
            or not scene["voiceInput"].strip()
            or type(start) is not int or type(end) is not int or type(pause) is not int
            or start != cursor or not start < end <= MASTER_FRAMES
            or end-start != scene.get("naturalSpeechFrames")
            or pause != (4320 if i < len(SCENES)-1 else 0)):
            hold("SCENE_FRAME_OR_SCRIPT_DRIFT:" + name)
        cursor = end + pause
        if any(pcm[2*end:2*cursor]):
            hold("SOURCE_PAUSE_NOT_SILENT:" + name)
    if cursor != MASTER_FRAMES:
        hold("INCOMPLETE_SOURCE_SCENE_COVERAGE")
    return source, pcm

def stage_source(source_dir, destination):
    source, pcm = source_files(source_dir)
    root = Path(destination).resolve()
    if root.exists():
        hold("NEW_EMPTY_OUTPUT_DIR_REQUIRED")
    stage = root / "stage"
    stage.mkdir(parents=True)
    rows = []
    for i, scene in enumerate(source["clips"], 1):
        stem = f'{i:02d}-{scene["scene"]}'
        wav = stage / (stem + ".wav")
        with wave.open(str(wav), "wb") as audio:
            audio.setnchannels(1); audio.setsampwidth(2); audio.setframerate(RATE)
            audio.writeframes(pcm[2*scene["voiceStartFrame"]:2*scene["voiceEndFrame"]])
        transcript = stage / (stem + ".txt")
        transcript.write_text(scene["voiceInput"] + "\n", encoding="utf-8")
        rows.append({"scene": stem, "wav": wav.name, "transcript": transcript.name,
                     "masterStartFrame": scene["voiceStartFrame"],
                     "masterEndFrame": scene["voiceEndFrame"],
                     "wavSha256": sha_file(wav), "transcriptSha256": sha_file(transcript)})
    return root, rows, source

def dictionary_entries(text):
    entries = {}
    for line in text.splitlines():
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        phones = fields[1:]
        while phones:
            try:
                float(phones[0]); phones.pop(0)
            except ValueError:
                break
        if phones and all(PHONE.fullmatch(p) for p in phones):
            entries.setdefault(fields[0].casefold(), set()).add(tuple(phones))
    return entries

def run_mfa(args, work, timeout=300):
    env = {**os.environ, "MFA_ROOT_DIR": str(work/"mfa-state"),
           "OMP_NUM_THREADS": "2", "MKL_NUM_THREADS": "2",
           "CUDA_VISIBLE_DEVICES": ""}
    try:
        process = subprocess.run(["mfa", *args], cwd=work, env=env,
                                 capture_output=True, text=True, timeout=timeout)
    except (FileNotFoundError, subprocess.TimeoutExpired):
        hold("MFA_NOT_AVAILABLE_OR_TIMED_OUT:" + args[0])
    if process.returncode:
        (work/(args[0]+"-error.txt")).write_text(
            (process.stderr + "\n" + process.stdout)[-5000:], encoding="utf-8")
        hold("MFA_EXIT_NONZERO:" + args[0])

def absolute_phone_hypotheses(phones, scene_start_frame):
    """Convert strict MFA scene-relative phone milliseconds into full-master time."""
    offset_ms = scene_start_frame * 1000 / RATE
    return [{**phone, "startMs": float(phone["startMs"])+offset_ms,
             "endMs": float(phone["endMs"])+offset_ms} for phone in phones]

def execute(source_dir, dictionary, acoustic_model, g2p_model, out):
    models = {key: regular(path) for key, path in (
        ("dictionary", dictionary), ("acousticModel", acoustic_model), ("g2pModel", g2p_model))}
    for name, expected in MODEL_PINS.items():
        if sha_file(models[name]) != expected:
            hold("MODEL_SHA_MISMATCH:" + name)
    if importlib.metadata.version("Montreal-Forced-Aligner") != MFA_VERSION:
        hold("UNPINNED_MFA_RUNTIME")
    root, rows, source = stage_source(source_dir, out)
    sys.path.insert(0, str(Path(__file__).resolve().parents[2] / "research/evidencemotion-director"))
    from exact_wav_alignment import inspect_alignment
    stage = root/"stage"
    for name, filename in (("dictionary", "base.dict"), ("acousticModel", "acoustic.zip"),
                           ("g2pModel", "g2p.zip")):
        shutil.copyfile(models[name], stage/filename)
    words = [token.casefold().strip('.,!?;:"()') for scene in source["clips"]
             for token in scene["voiceInput"].split()]
    entries = dictionary_entries((stage/"base.dict").read_text("utf-8"))
    missing = sorted(set(words) - set(entries))
    if missing:
        (stage/"oovs.txt").write_text("\n".join(missing) + "\n", encoding="utf-8")
        run_mfa(["g2p", str(stage/"oovs.txt"), str(stage/"g2p.zip"), str(stage/"oovs.dict"),
                 "--num_jobs", "2", "--no_use_mp", "--clean", "-t", str(stage/"g2p-tmp")],
                root, 240)
        generated = dictionary_entries((stage/"oovs.dict").read_text("utf-8"))
        if set(generated) != set(missing):
            hold("OOV_G2P_CANDIDATE_MISSING")
        entries.update(generated)
    (stage/"alignment.dict").write_text(
        "".join(word+" "+" ".join(p)+"\n" for word in sorted(set(words))
                for p in sorted(entries[word])), encoding="utf-8")
    aligned = []
    for row in rows:
        stem = row["scene"]
        grid = stage/(stem + ".TextGrid")
        run_mfa(["align_one", str(stage/row["wav"]), str(stage/row["transcript"]),
                 str(stage/"alignment.dict"), str(stage/"acoustic.zip"), str(grid),
                 "--num_jobs", "2", "--no_use_mp", "--no_use_postgres",
                 "--no_tokenization", "--clean", "-t", str(stage/(stem+"-tmp"))],
                root, 300)
        names = {"wav": row["wav"], "transcript": row["transcript"],
                 "textgrid": grid.name, "dictionary": "alignment.dict",
                 "acousticModel": "acoustic.zip"}
        manifest = {key: {"path": filename, "sha256": sha_file(stage/filename)}
                    for key, filename in names.items()}
        candidate = inspect_alignment(stage, manifest)
        if candidate.get("mayPublish") is not False or candidate.get("timingAccuracyCalibrated") is not False:
            hold("SOURCE_IMPORTER_APPROVAL_BOUNDARY_CHANGED")
        for word in candidate["wordAlignment"]:
            a = row["masterStartFrame"] + round(float(word["startMs"]) * RATE/1000)
            b = row["masterStartFrame"] + round(float(word["endMs"]) * RATE/1000)
            if not row["masterStartFrame"] <= a < b <= row["masterEndFrame"]:
                hold("ALIGNED_WORD_OUTSIDE_SCENE:" + stem)
            aligned.append({"word": word["word"], "scene": stem,
                            "startFrame": a, "endFrameExclusive": b,
                            "startMs": a*1000/RATE, "endMs": b*1000/RATE,
                            "phoneHypotheses": absolute_phone_hypotheses(word["phones"], row["masterStartFrame"])})
        (root/(stem+"-candidate.json")).write_text(
            json.dumps(candidate, indent=2)+"\n", encoding="utf-8")
        row["textgridSha256"] = manifest["textgrid"]["sha256"]
        row["revisionSha256"] = candidate["revisionSha256"]
    expected = [token.casefold().strip('.,!?;:"()')
                for scene in source["clips"] for token in scene["voiceInput"].split()]
    actual = [token["word"].casefold().strip('.,!?;:"()') for token in aligned]
    if actual != expected or not aligned:
        hold("TRANSCRIPT_WORD_ORDER_CHANGED")
    report = {"schema": "ths-r812-owner-locked-mfa-word-candidate-v1",
      "status": "REAL_OFFLINE_MFA_CANDIDATE_REVIEW_ONLY",
      "originalWavSha256": MASTER_SHA, "originalWavFrames": MASTER_FRAMES,
      "sampleRate": RATE, "ownerSelectedOriginalNarrator": True,
      "narrationReSynthesized": False, "mfaActuallyExecuted": True,
      "mfaVersion": MFA_VERSION, "modelPins": MODEL_PINS, "sceneCount": len(rows),
      "alignedWordCount": len(aligned), "scenes": rows, "wordCandidates": aligned,
      "g2pCandidateWords": missing, "g2pPronunciationIndependentlyApproved": False,
      "phoneTimingCoordinateSystem": "full-master-absolute-ms",
      "wordTimingCalibrated": False, "humanWordTimingReviewed": False,
      "independentScienceApproved": False, "independentCraftApproved": False,
      "nativeMp4Created": False, "mayPublish": False}
    (root/"owner-locked-word-candidate.json").write_text(
        json.dumps(report,indent=2)+"\n", encoding="utf-8")
    return report

def main():
    parser = argparse.ArgumentParser()
    for field in ("source-dir", "dictionary", "acoustic-model", "g2p-model", "out"):
        parser.add_argument("--"+field, required=True)
    args = parser.parse_args()
    try:
        result = execute(args.source_dir, args.dictionary, args.acoustic_model,
                         args.g2p_model, args.out)
    except (ValueError, OSError, ImportError, importlib.metadata.PackageNotFoundError) as exc:
        print(json.dumps({"status": "HOLD", "error": str(exc), "mayPublish": False}))
        raise SystemExit(2)
    print(json.dumps({"status": result["status"], "candidateWords": result["alignedWordCount"],
                      "masterSha256": MASTER_SHA, "mayPublish": False}))

if __name__ == "__main__":
    main()

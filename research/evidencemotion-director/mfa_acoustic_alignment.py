#!/usr/bin/env python3
"""Execute pinned CPU MFA on original narration; no pronunciation certification.

Reuse the original script/source checks and byte-bound alignment importer.
G2P fills OOV dictionary *candidates*, never reviewer-approved pronunciation.
"""
import argparse
import hashlib
import importlib.metadata
import json
import os
import re
import shutil
import subprocess
import time
from pathlib import Path

from autonomous_script_asr_research import LINES, WAV_SHA, source_check, tokens
from exact_wav_alignment import inspect_alignment

MFA_VERSION = "3.3.8"
BRIEF_SHA = "db95adc5dce3eb6e19c81719fec9222e3511856e85dbf862351ce231c8661ea8"
MODEL_PINS = {
    "dictionary": "e8c6c7b036ae2b7c78d2768b8dc6b1f9359175b842956d00b48c53c9c332e6b0",
    "acousticModel": "d35ce271ded357d833d2f4b8d1041dc3748b9538567ba13f2c697f4e4126711b",
    "g2pModel": "f079ae88f792458fa7c123b256e5b86cc55c29ac2ffc457c673e6c60c36cd143",
}
PHONE = re.compile(r"(?:AA|AE|AH|AO|AW|AY|EH|ER|EY|IH|IY|OW|OY|UH|UW)[012]?|B|CH|D|DH|F|G|HH|JH|K|L|M|N|NG|P|R|S|SH|T|TH|V|W|Y|Z|ZH")


def hold(code):
    raise ValueError("MFA_ACOUSTIC_RESEARCH_HOLD:" + code)


def sha(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(1024*1024), b""):
            h.update(block)
    return h.hexdigest()


def parse_dictionary(text, strict=False):
    result = {}
    for line in text.splitlines():
        fields = line.split()
        if not fields or fields[0].startswith("#"):
            continue
        word, phones = fields[0].casefold(), fields[1:]
        # Official v3 dictionary has leading pronunciation/silence probabilities.
        # Preserve all phone variants, removing only those numerical columns.
        while phones:
            try:
                float(phones[0])
            except ValueError:
                break
            phones = phones[1:]
        if not phones or any(not PHONE.fullmatch(p) for p in phones):
            if strict:
                hold("INVALID_GENERATED_PHONES")
            continue
        value = tuple(phones)
        if value not in result.setdefault(word, []):
            result[word].append(value)
    return result


def select_dictionary(text, words):
    dictionary = parse_dictionary(text)
    selected = {word: dictionary[word] for word in sorted(set(words)) if word in dictionary}
    return selected, sorted(set(words)-set(selected))


def merge_candidates(base, missing, generated_text):
    generated = parse_dictionary(generated_text, strict=True)
    if set(generated) != set(missing):
        hold("GENERATED_OOV_PHONES_MISSING_OR_EXTRA")
    return {**base, **generated}


def term_windows(words):
    required = {
        "7-OH": ["seven", "o", "h"],
        "hydroxyl": ["hydroxyl"],
        "mitragynine": ["mitragynine"],
        "7-hydroxymitragynine": ["seven", "hydroxymitragynine"],
    }
    windows = []
    names = [x["word"].casefold() for x in words]
    for term, sequence in required.items():
        found = False
        for i in range(len(words)-len(sequence)+1):
            if names[i:i+len(sequence)] == sequence:
                found = True
                windows.append({"term": term, "startMs": words[i]["startMs"],
                                "endMs": words[i+len(sequence)-1]["endMs"],
                                "wordIndices": list(range(i, i+len(sequence))),
                                "pronunciationVerified": False,
                                "audiblePronunciationConfidence": None,
                                "verdict": "ACOUSTIC_WINDOW_FOR_CALIBRATED_REVIEW"})
        if not found:
            hold("SCIENTIFIC_TERM_COVERAGE_MISSING:" + term)
    return windows


def verify_brief_script(brief):
    if not isinstance(brief, dict) or not isinstance(brief.get("beats"), list):
        hold("BRIEF_SCRIPT_MISSING")
    lines = [beat.get("narration") for beat in brief["beats"] if isinstance(beat, dict) and beat.get("narration")]
    if lines != list(LINES):
        hold("BRIEF_SCRIPT_CHANGED")


def run_mfa(args, work, timeout, records):
    env = {**os.environ, "MFA_ROOT_DIR": str(work/"mfa-state"),
           "OMP_NUM_THREADS": "2", "MKL_NUM_THREADS": "2", "PYTHONUTF8": "1",
           "CUDA_VISIBLE_DEVICES": ""}
    start = time.monotonic()
    try:
        process = subprocess.run(["mfa", *args], cwd=work, env=env,
                                 capture_output=True, text=True, encoding="utf-8",
                                 errors="replace", timeout=timeout, check=False)
    except (OSError, subprocess.TimeoutExpired) as exc:
        hold("MFA_EXECUTION_FAILED:" + type(exc).__name__)
    logs = (process.stdout + "\n" + process.stderr).encode("utf-8")
    (work/(args[0]+".log")).write_bytes(logs)
    records.append({"operation": args[0], "exitCode": process.returncode,
                    "wallSeconds": round(time.monotonic()-start, 3),
                    "logSha256": hashlib.sha256(logs).hexdigest()})
    if process.returncode:
        hold("MFA_NONZERO_EXIT:" + args[0])


def execute(wav, brief, dictionary, acoustic_model, g2p_model, output):
    paths = {"wav": Path(wav).absolute(), "brief": Path(brief).absolute(),
             "dictionary": Path(dictionary).absolute(), "acousticModel": Path(acoustic_model).absolute(),
             "g2pModel": Path(g2p_model).absolute()}
    for name, p in paths.items():
        if not p.is_file() or any(x.is_symlink() for x in (p, *p.parents)) or p.stat().st_size > 100_000_000:
            hold("MISSING_OR_UNBOUNDED_INPUT:" + name)
    duration = source_check(paths["wav"])
    if sha(paths["brief"]) != BRIEF_SHA:
        hold("ORIGINAL_CREATIVE_BRIEF_CHANGED")
    verify_brief_script(json.loads(paths["brief"].read_text(encoding="utf-8")))
    for name, expected in MODEL_PINS.items():
        if sha(paths[name]) != expected:
            hold("MODEL_OR_DICTIONARY_CHANGED:" + name)
    if importlib.metadata.version("Montreal-Forced-Aligner") != MFA_VERSION:
        hold("UNPINNED_MFA_RUNTIME_VERSION")
    work = Path(output).resolve()
    if work.exists():
        hold("FRESH_OUTPUT_DIRECTORY_REQUIRED")
    if any(p == work or p.is_relative_to(work) for p in paths.values()):
        hold("OUTPUT_OVERLAPS_IMMUTABLE_INPUTS")
    work.mkdir(parents=True)
    # Copy immutable source/model bytes to the isolated bounded run directory.
    # No owner home directory, WAV edit, regeneration or time stretching.
    names = {"wav": "original.wav", "brief": "creative-brief.json", "dictionary": "base.dict",
             "acousticModel": "acoustic.zip", "g2pModel": "g2p.zip"}
    for field, name in names.items():
        shutil.copyfile(paths[field], work/name)
    words = tokens(" ".join(LINES))
    (work/"script.txt").write_text(" ".join(words)+"\n", encoding="utf-8")
    selected, missing = select_dictionary((work/"base.dict").read_text(encoding="utf-8"), words)
    records = []
    if missing:
        (work/"oovs.txt").write_text("\n".join(missing)+"\n", encoding="utf-8")
        run_mfa(["g2p", str(work/"oovs.txt"), str(work/"g2p.zip"), str(work/"generated.dict"),
                 "--num_jobs", "2", "--no_use_mp", "--clean", "-t", str(work/"g2p-temp")], work, 180, records)
        selected = merge_candidates(selected, missing, (work/"generated.dict").read_text(encoding="utf-8"))
    rendered_dictionary = "".join(word+" "+" ".join(phones)+"\n" for word in sorted(selected) for phones in selected[word])
    (work/"alignment.dict").write_text(rendered_dictionary, encoding="utf-8")
    run_mfa(["align_one", str(work/"original.wav"), str(work/"script.txt"), str(work/"alignment.dict"),
             str(work/"acoustic.zip"), str(work/"aligned.TextGrid"), "--num_jobs", "2", "--no_use_mp",
             "--no_use_postgres", "--no_tokenization", "--clean", "-t", str(work/"align-temp")], work, 300, records)
    source_check(paths["wav"])
    source_check(work/"original.wav")
    for name, expected in {"brief": BRIEF_SHA, **MODEL_PINS}.items():
        if sha(paths[name]) != expected or sha(work/names[name]) != expected:
            hold("INPUT_CHANGED_DURING_ALIGNMENT:" + name)
    mapping = {"wav": "original.wav", "transcript": "script.txt", "textgrid": "aligned.TextGrid",
               "dictionary": "alignment.dict", "acousticModel": "acoustic.zip"}
    manifest = {field: {"path": name, "sha256": sha(work/name)} for field, name in mapping.items()}
    (work/"alignment-manifest.json").write_text(json.dumps(manifest, indent=2)+"\n", encoding="utf-8")
    candidate = inspect_alignment(work, manifest)
    (work/"alignment-candidate.json").write_text(json.dumps(candidate, indent=2)+"\n", encoding="utf-8")
    receipt = {"schema": "ths-actual-mfa-acoustic-research-v1",
               "origin": "ACTUAL_MFA_ALIGN_ONE_PINNED_ORIGINAL_WAV", "mfaVersion": MFA_VERSION,
               "originalWavSha256": WAV_SHA, "creativeBriefSha256": BRIEF_SHA,
               "modelSha256": MODEL_PINS, "sourceDurationSeconds": duration,
               "scriptTokenCount": len(words), "alignedWordCount": len(candidate["wordAlignment"]),
               "alignmentCandidateSha256": sha(work/"alignment-candidate.json"),
               "alignmentRevisionSha256": candidate["revisionSha256"], "invocations": records,
               "termReviewWindows": term_windows(candidate["wordAlignment"]),
               "g2pCandidateWords": missing, "g2pCandidatesIndependentlyApproved": False,
               "timingAccuracyCalibrated": False, "phoneticPronunciationVerified": False,
               "scienceApproved": False, "craftApproved": False, "mayPublish": False,
               "status": "ACTUAL_ACOUSTIC_ALIGNMENT_CANDIDATE_CALIBRATION_REQUIRED"}
    (work/"mfa-run-receipt.json").write_text(json.dumps(receipt, indent=2)+"\n", encoding="utf-8")
    return receipt


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    for name in ("wav", "brief", "dictionary", "acoustic-model", "g2p-model", "out"):
        parser.add_argument("--"+name, required=True)
    args = parser.parse_args()
    try:
        result = execute(args.wav, args.brief, args.dictionary, args.acoustic_model, args.g2p_model, args.out)
    except (ValueError, OSError, importlib.metadata.PackageNotFoundError) as exc:
        print(json.dumps({"status": "HOLD", "error": str(exc), "mayPublish": False}))
        raise SystemExit(2)
    print(json.dumps(result, indent=2))

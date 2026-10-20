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



def validate_sourced_term_reference(record):
    """Validate a sourced IPA *reference*, never certify the original speaker.

    EM-014.02 must retain the exact EM-014.01 source interval; a published
    dictionary reading is a candidate target, not acoustic ground truth for
    Kokoro's actual WAV. In particular, standalone hydroxyl is not evidence
    for the compound name 7-hydroxymitragynine.
    """
    if not isinstance(record, dict) or record.get("schemaVersion") != "em01402-sourced-pronunciation-reference-v1":
        hold("EM01402_SCHEMA_INVALID")
    if record.get("unitKey") != "EM-014.02:hydroxyl:3670-4540" or record.get("spokenOccurrence") != "hydroxyl":
        hold("EM01402_UNIT_SUBSTITUTED")
    source = record.get("source")
    expected_source = {
        "originalWavSha256": WAV_SHA,
        "alignmentRevisionSha256": "2414833bfd35c18ad6c629c3d10cbfab8501b09e296cc1963db01638b854bbaf",
        "startMs": 3670, "endMs": 4540,
        "startSample": 88080, "endSampleExclusive": 108960, "sampleRate": 24000,
        "voiceId": "am_michael", "engine": "kokoro-onnx==0.6.1",
        "modelSha256": "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c",
        "voicebankSha256": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d",
    }
    if not isinstance(source, dict) or source != expected_source:
        hold("EM01402_ORIGINAL_SOURCE_PIN_MISMATCH")
    reference = record.get("reference")
    if not isinstance(reference, dict) or (
        reference.get("dialect") != "en-US"
        or reference.get("ipa") != "haɪˈdrɑːk.sɪl"
        or type(reference.get("primaryStressSyllable")) is not int
        or reference.get("primaryStressSyllable") != 2
        or reference.get("citedDictionaryUrl") != "https://dictionary.cambridge.org/us/pronunciation/english/hydroxyl"
        or reference.get("checkedOn") != "2026-10-18"
        or reference.get("scope") != "standalone hydroxyl only; not 7-hydroxymitragynine and not actual-WAV listening proof"
    ):
        hold("EM01402_SOURCE_ANCHOR_INVALID")
    review = record.get("acousticReview")
    if not isinstance(review, dict) or (
        review.get("originalClipReplayedForThisReference") is not False
        or review.get("listenerGroundTruthAvailable") is not False
        or review.get("pronunciationMatchesActualWav", "missing") is not None
        or review.get("phoneticPronunciationVerified") is not False
        or review.get("sourcePcmSlicePreviouslyVerifiedUnder") != "EM-014.01"
        or review.get("mayPublish") is not False
        or review.get("result") != "REFERENCE_ONLY_ACOUSTIC_AND_LISTENER_COMPARISON_PENDING"
    ):
        hold("EM01402_FALSE_AUDIO_OR_PUBLICATION_APPROVAL")
    return {
        "status": "SOURCE_PINNED_DICTIONARY_REFERENCE_ONLY",
        "unitKey": record["unitKey"],
        "actualPhonemeEvidenceVerified": False,
        "listenerCalibrationVerified": False,
        "mayPublish": False,
    }


def compare_mfa_phone_hypotheses(first, second):
    """Compare *forced-aligner hypotheses*, never conclude spoken pronunciation.

    Treat vowel stress digits separately from phone segments. The two actual
    original-WAV candidate sequences for 'mitragynine' at 2.11s and 9.46s
    differ at AH0 vs IH0; that is a vowel-*label* difference, not acoustic
    proof of a different vowel. Use independently aligned edit distances for
    full tokens and unstressed phone bases.
    """
    vowels = frozenset('AA AE AH AO AW AY EH ER EY IH IY OW OY UH UW'.split())

    def validate(seq):
        if not isinstance(seq, (list, tuple)) or not 1 <= len(seq) <= 100:
            raise ValueError("MFA_PHONE_HYPOTHESES_REQUIRED")
        if any(not isinstance(p, str) or not PHONE.fullmatch(p) for p in seq):
            raise ValueError("MFA_PHONE_SYMBOL_INVALID")

    def base(phone):
        return phone[:-1] if phone[-1] in '012' and phone[:-1] in vowels else phone

    validate(first)
    validate(second)

    def align(stress_neutral):
        rows, cols = len(first), len(second)
        # Each cell: (symbol edits, stress-only aligned disagreements).
        prev = [(j, 0) for j in range(cols + 1)]
        for i in range(1, rows + 1):
            curr = [(i, 0)]
            for j in range(1, cols + 1):
                a, b = first[i - 1], second[j - 1]
                same_base = base(a) == base(b)
                equivalent = same_base if stress_neutral else a == b
                old = prev[j - 1]
                diagonal = (old[0] + (not equivalent),
                            old[1] + int(stress_neutral and same_base and a != b))
                deletion = (prev[j][0] + 1, prev[j][1])
                insertion = (curr[j - 1][0] + 1, curr[j - 1][1])
                # Stable tie preference: diagonal, deletion, insertion.
                curr.append(min((diagonal, deletion, insertion), key=lambda pair: pair[0]))
            prev = curr
        return prev[cols]

    raw, _ = align(False)
    segmental, stress = align(True)
    return {
        "status": "MFA_PHONE_HYPOTHESIS_COMPARISON_ONLY",
        "rawTokenEditDistance": int(raw),
        "segmentalSymbolEditDistance": int(segmental),
        "stressMarkerDifferencesOnAlignedIdenticalVowels": int(stress),
        "differencesAreModelLabelHypothesesNotAcousticTruth": True,
        "independentOriginalAudioPhonemeReferenceAvailable": False,
        "phoneticPronunciationVerified": False,
        "mayPublish": False,
    }


def review_repeated_term_phone_hypotheses(candidate, windows):
    """Compare repeated *MFA label candidates* on one byte-pinned original WAV.

    A dictionary/forced alignment labels phones; it does not hear, identify,
    independently calibrate or approve the actual narrator's pronunciation.
    Invalid or mismatched evidence must not produce a review-looking receipt.
    """
    if not isinstance(candidate, dict) or candidate.get("mayPublish") is not False:
        hold("SOURCE_BOUND_MFA_CANDIDATE_REQUIRED")
    pins = candidate.get("inputSha256")
    if not isinstance(pins, dict) or pins.get("wav") != WAV_SHA:
        hold("REPEATED_PHONE_REVIEW_WRONG_WAV")
    words = candidate.get("wordAlignment")
    if not isinstance(words, list) or not 1 <= len(words) <= 2000:
        hold("REPEATED_PHONE_REVIEW_WORDS_INVALID")
    if not isinstance(windows, list) or len(windows) > 40:
        hold("REPEATED_PHONE_REVIEW_WINDOWS_INVALID")

    groups = {}
    seen_indices = set()
    for window in windows:
        if not isinstance(window, dict) or not isinstance(window.get("term"), str):
            hold("REPEATED_PHONE_REVIEW_WINDOW_INVALID")
        indices = window.get("wordIndices")
        if (not isinstance(indices, list) or not 1 <= len(indices) <= 3
                or any(type(i) is not int or i < 0 or i >= len(words) for i in indices)
                or indices != list(range(indices[0], indices[0] + len(indices)))):
            hold("REPEATED_PHONE_REVIEW_INDICES_INVALID")
        # A source hash cannot authenticate an arbitrary caller-supplied label.
        # Check every declared term against the actual aligned word spellings
        # before producing even a research-only repeated-pronunciation receipt.
        expected_words = TERM_WORD_SEQUENCES.get(window["term"])
        if expected_words is None:
            hold("REPEATED_PHONE_REVIEW_UNKNOWN_TERM")
        source_words = [words[i].get("word") if isinstance(words[i], dict) else None
                        for i in indices]
        if (any(not isinstance(word, str) for word in source_words)
                or [word.casefold() for word in source_words] != expected_words):
            hold("REPEATED_PHONE_REVIEW_TERM_WORD_MISMATCH")
        if any(index in seen_indices for index in indices):
            hold("REPEATED_PHONE_REVIEW_DUPLICATE_OR_OVERLAPPING_WINDOW")
        seen_indices.update(indices)
        phones = []
        for idx in indices:
            item = words[idx]
            if not isinstance(item, dict) or not isinstance(item.get("phones"), list):
                hold("REPEATED_PHONE_REVIEW_PHONES_MISSING")
            phones.extend(p.get("phone") if isinstance(p, dict) else None for p in item["phones"])
        if not 1 <= len(phones) <= 100 or any(not isinstance(p, str) or not PHONE.fullmatch(p) for p in phones):
            hold("REPEATED_PHONE_REVIEW_PHONES_INVALID")
        entries = groups.setdefault(window["term"], [])
        if entries and indices[0] <= entries[-1]["indices"][-1]:
            hold("REPEATED_PHONE_REVIEW_DUPLICATE_OR_OVERLAPPING_WINDOW")
        entries.append({"indices": indices, "phones": phones})
        if len(entries) > 20:
            hold("REPEATED_PHONE_REVIEW_OCCURRENCES_UNBOUNDED")

    result = []
    for term, entries in groups.items():
        for i, first in enumerate(entries):
            for second in entries[i + 1:]:
                result.append({
                    "term": term,
                    "firstWordIndices": first["indices"],
                    "secondWordIndices": second["indices"],
                    **compare_mfa_phone_hypotheses(first["phones"], second["phones"]),
                })
    return result


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


TERM_WORD_SEQUENCES = {
    "7-OH": ["seven", "o", "h"],
    "hydroxyl": ["hydroxyl"],
    "mitragynine": ["mitragynine"],
    "7-hydroxymitragynine": ["seven", "hydroxymitragynine"],
}


def term_windows(words):
    required = TERM_WORD_SEQUENCES
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
    review_windows = term_windows(candidate["wordAlignment"])
    label_reviews = review_repeated_term_phone_hypotheses(candidate, review_windows)
    receipt = {"schema": "ths-actual-mfa-acoustic-research-v1",
               "origin": "ACTUAL_MFA_ALIGN_ONE_PINNED_ORIGINAL_WAV", "mfaVersion": MFA_VERSION,
               "originalWavSha256": WAV_SHA, "creativeBriefSha256": BRIEF_SHA,
               "modelSha256": MODEL_PINS, "sourceDurationSeconds": duration,
               "scriptTokenCount": len(words), "alignedWordCount": len(candidate["wordAlignment"]),
               "alignmentCandidateSha256": sha(work/"alignment-candidate.json"),
               "alignmentRevisionSha256": candidate["revisionSha256"], "invocations": records,
               "termReviewWindows": review_windows,
               "repeatedTermMfaLabelComparisons": label_reviews,
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

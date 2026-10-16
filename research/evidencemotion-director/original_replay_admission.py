#!/usr/bin/env python3
"""Research-only exact-input admission before a costly original native replay.

This only attests local file bytes/runtime versions against a recovered,
SHA-locked ORIGINAL research receipt. It does NOT prove original host identity,
encoder version, two independent jobs, film quality, or any publishing gate.
"""
import argparse
import hashlib
import json
from pathlib import Path

ORIGINAL_TIMED_RECEIPT_SHA256 = "7b23cdcd007cc4ba8ef97122c3ee321c87e7a629e9a184b548392c7fc2b6017e"
ORIGINAL_WAV_SHA256 = "9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"
EXPECTED_RENDERER_FILES = frozenset((
    "narration_locked_treatments.py", "verified_molecular_comparison.py",
    "editorial_2d_cpu_research.py", "exact_wav_alignment.py",
    "autonomous_script_asr_research.py", "phone_ui_audit.py",
    "native_master_audit.py", "timed_caption_windows.py",
    "temporal_caption_audit.py", "source_locked_visual_direction.py",
    "source_bond_trace_direction.py",
))
EXPECTED_FONTS = frozenset(("DejaVuSans.ttf", "DejaVuSans-Bold.ttf"))


def digest(path):
    value = hashlib.sha256()
    with Path(path).open("rb") as file:
        for block in iter(lambda: file.read(1024 * 1024), b""):
            value.update(block)
    return value.hexdigest()


def strict_json(raw):
    def reject_duplicates(pairs):
        out = {}
        for name, value in pairs:
            if name in out:
                raise ValueError("DUPLICATE_JSON_KEY")
            out[name] = value
        return out
    def reject_constant(value):
        raise ValueError("NONFINITE_JSON_LITERAL")
    return json.loads(raw, object_pairs_hook=reject_duplicates, parse_constant=reject_constant)


def inspect_replay_inputs(*, receipt_path, renderer_dir, font_dir, wav_path,
                          expected_receipt_sha=ORIGINAL_TIMED_RECEIPT_SHA256,
                          expected_wav_sha=ORIGINAL_WAV_SHA256,
                          pillow_version=None, rdkit_version=None):
    """Report all concrete mismatches. No caller can self-assert admission.

    expected_receipt_sha override is strictly for small unit fixtures;
    the command-line entrypoint always uses ORIGINAL_TIMED_RECEIPT_SHA256.
    """
    if pillow_version is None:
        import PIL
        pillow_version = PIL.__version__
    if rdkit_version is None:
        import rdkit
        rdkit_version = rdkit.__version__
    receipt_path = Path(receipt_path)
    renderer_dir = Path(renderer_dir)
    font_dir = Path(font_dir)
    wav_path = Path(wav_path)
    actual = {}
    failures = []
    if (not receipt_path.is_file() or receipt_path.is_symlink()
            or digest(receipt_path) != expected_receipt_sha):
        failures.append("PINNED_ORIGINAL_RECEIPT_UNAVAILABLE_OR_CHANGED")
        return _report(failures, actual)
    try:
        raw = strict_json(receipt_path.read_text(encoding="utf-8"))
    except (ValueError, UnicodeError):
        failures.append("ORIGINAL_RECEIPT_MALFORMED")
        return _report(failures, actual)
    renderer_pins = raw.get("rendererSourcesSha256")
    font_pins = raw.get("fonts")
    if (not isinstance(renderer_pins, dict) or set(renderer_pins) != EXPECTED_RENDERER_FILES
            or not isinstance(font_pins, dict) or set(font_pins) != EXPECTED_FONTS
            or raw.get("sourceWavSha256") != expected_wav_sha
            or raw.get("resolution") != [1080, 1920] or raw.get("frames") != 1031
            or raw.get("fps") != 30 or raw.get("treatment") != "specimen"
            or raw.get("experimentCaptionMode") != "TIMED_RESEARCH"):
        failures.append("ORIGINAL_RECEIPT_CONTENT_INCONSISTENT")
        return _report(failures, actual)
    for name, expected in sorted(renderer_pins.items()):
        path = renderer_dir / name
        if not path.is_file() or path.is_symlink():
            failures.append("MISSING_OR_SYMLINK_RENDERER:" + name)
        else:
            actual[name] = digest(path)
            if actual[name] != expected:
                failures.append("RENDERER_SOURCE_DRIFT:" + name)
    for name, expected in sorted(font_pins.items()):
        path = font_dir / name
        if not path.is_file() or path.is_symlink():
            failures.append("MISSING_OR_SYMLINK_FONT:" + name)
        else:
            actual[name] = digest(path)
            if actual[name] != expected:
                failures.append("FONT_BYTES_DRIFT:" + name)
    if not wav_path.is_file() or wav_path.is_symlink():
        failures.append("PINNED_WAV_MISSING_OR_SYMLINK")
    else:
        actual["originalWavSha256"] = digest(wav_path)
        if actual["originalWavSha256"] != expected_wav_sha:
            failures.append("ORIGINAL_WAV_BYTES_DRIFT")
    actual["pillowVersion"] = pillow_version
    actual["rdkitVersion"] = rdkit_version
    if pillow_version != raw.get("pillowVersion"):
        failures.append("PILLOW_VERSION_DRIFT")
    if rdkit_version != raw.get("rdkitVersion"):
        failures.append("RDKIT_VERSION_DRIFT")
    return _report(failures, actual)


def _report(failures, actual):
    return {
        "schema": "ths-em-lane5-original-replay-admission-v1",
        "status": "HOLD" if failures else "LOCAL_INPUT_PINS_MATCH_RESEARCH_ONLY",
        "blockingReasons": failures,
        "observed": actual,
        "originalRunnerIndependentlyAuthenticated": False,
        "originalEncoderVersionAuthenticated": False,
        "twoNativeRendererRunsExecuted": False,
        "originalStdinRepeatabilityProven": False,
        "mayPublish": False,
        "firstExcellentMasterAccepted": False,
        "fiveRenderStreakAccepted": False,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--receipt", required=True)
    parser.add_argument("--renderer-dir", required=True)
    parser.add_argument("--font-dir", required=True)
    parser.add_argument("--wav", required=True)
    opts = parser.parse_args()
    out = inspect_replay_inputs(receipt_path=opts.receipt,
                                renderer_dir=opts.renderer_dir,
                                font_dir=opts.font_dir, wav_path=opts.wav)
    print(json.dumps(out, indent=2, sort_keys=True))
    raise SystemExit(2 if out["status"] == "HOLD" else 0)

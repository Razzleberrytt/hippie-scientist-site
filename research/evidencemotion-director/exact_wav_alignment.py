#!/usr/bin/env python3
"""Byte-bound MFA long-TextGrid import. Timing CANDIDATE, never pronunciation proof.

No model downloads, TTS, time stretching, network, or positive release verdicts.
All supplied artifacts stay local; a manifest must pin their actual bytes.
"""
import argparse
import hashlib
import io
import json
import math
import re
import wave
from pathlib import Path

SCHEMA = "ths-exact-wav-alignment-candidate-v1"
MAX_SECONDS = 180
FIELDS = ("wav", "transcript", "textgrid", "dictionary", "acousticModel")
UNKNOWN = {"<unk>", "unk", "spn", "<eps>"}


def hold(code):
    raise ValueError("EXACT_WAV_ALIGNMENT_HOLD:" + code)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def pinned_file(root, spec, field):
    if not isinstance(spec, dict) or set(spec) != {"path", "sha256"}:
        hold("INVALID_INPUT_SPEC:" + field)
    name, expected = spec["path"], spec["sha256"]
    if not isinstance(name, str) or not name or "\\" in name or ":" in name:
        hold("UNSAFE_INPUT_PATH:" + field)
    rel = Path(name)
    if rel.is_absolute() or any(p in {"..", "."} for p in name.split("/")):
        hold("UNSAFE_INPUT_PATH:" + field)
    p = root / rel
    if any(part.is_symlink() for part in (p, *p.parents)) or not p.is_file():
        hold("MISSING_OR_LINKED_INPUT:" + field)
    if not p.resolve().is_relative_to(root):
        hold("INPUT_OUTSIDE_ROOT:" + field)
    if not isinstance(expected, str) or not re.fullmatch(r"[a-f0-9]{64}", expected):
        hold("INVALID_EXPECTED_SHA:" + field)
    limit = 100_000_000 if field in {"acousticModel", "dictionary"} else 10_000_000
    if p.stat().st_size > limit:
        hold("INPUT_SIZE_LIMIT:" + field)
    data = p.read_bytes()
    if digest(data) != expected:
        hold("STALE_OR_CHANGED_INPUT:" + field)
    return p, data


def normalized_words(text):
    # Deliberately no scientific aliases or spelling repair. MFA punctuation
    # normalization is explicit: case fold and strip only boundary punctuation.
    return [w.casefold().strip('.,!?;:"()') for w in text.split()]


def parse_long_textgrid(text):
    """Strict single-speaker IntervalTier subset; unsupported forms HOLD.

    Quoted strings may contain doubled quotes. Parsing consumes every token,
    rather than regex-searching past malformed/unaccounted intervals.
    """
    token = re.compile(r'\s*("(?:[^"\n]|"")*"|[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?|[A-Za-z_][A-Za-z_?]*|[\[\]:=]|<exists>)')
    parts, pos = [], 0
    while pos < len(text):
        match = token.match(text, pos)
        if not match:
            if not text[pos:].strip():
                break
            hold("MALFORMED_TEXTGRID_TOKEN")
        parts.append(match.group(1))
        pos = match.end()
    index = 0

    def take(expected=None):
        nonlocal index
        if index >= len(parts):
            hold("TRUNCATED_TEXTGRID")
        value = parts[index]
        index += 1
        if expected is not None and value != expected:
            hold("UNEXPECTED_TEXTGRID_TOKEN")
        return value

    def seq(*values):
        for value in values:
            take(value)

    def number():
        try:
            n = float(take())
        except ValueError:
            hold("INVALID_INTERVAL_NUMBER")
        if not math.isfinite(n):
            hold("NONFINITE_INTERVAL")
        return n

    def count():
        n = number()
        if not n.is_integer() or not 0 <= n <= 20000:
            hold("INVALID_TEXTGRID_COUNT")
        return int(n)

    def quoted():
        value = take()
        if not value.startswith('"') or not value.endswith('"'):
            hold("UNQUOTED_TEXTGRID_STRING")
        return value[1:-1].replace('""', '"')

    seq("File", "type", "="); take('"ooTextFile"')
    seq("Object", "class", "="); take('"TextGrid"')
    seq("xmin", "="); start = number()
    seq("xmax", "="); end = number()
    seq("tiers?", "<exists>", "size", "="); size = count()
    if start != 0 or not 0 < end <= MAX_SECONDS or size != 2:
        hold("SINGLE_SPEAKER_WORD_AND_PHONE_TIERS_REQUIRED")
    seq("item", "[", "]", ":")
    tiers = {}
    for tier_index in range(1, size + 1):
        seq("item", "["); expected_index = count(); seq("]", ":")
        if expected_index != tier_index:
            hold("TIER_INDEX_MISMATCH")
        seq("class", "="); take('"IntervalTier"')
        seq("name", "="); name = quoted()
        seq("xmin", "="); lo = number()
        seq("xmax", "="); hi = number()
        if lo != start or abs(hi - end) > 1e-6 or name in tiers:
            hold("TIER_BOUNDS_OR_IDENTITY_INVALID")
        seq("intervals", ":", "size", "="); length = count()
        intervals, last = [], 0
        for interval_index in range(1, length + 1):
            seq("intervals", "["); actual_index = count(); seq("]", ":")
            seq("xmin", "="); a = number()
            seq("xmax", "="); b = number()
            seq("text", "="); label = quoted()
            if actual_index != interval_index or not 0 <= a < b <= end or abs(a-last) > 1e-6:
                hold("INVALID_OR_NONCONTIGUOUS_INTERVAL")
            intervals.append((a, b, label))
            last = b
        if not intervals or abs(last-end) > 1e-6:
            hold("INCOMPLETE_TIER_COVERAGE")
        tiers[name] = intervals
    if index != len(parts) or set(tiers) != {"words", "phones"}:
        hold("UNSUPPORTED_OR_EXTRA_TIERS")
    return end, tiers


def inspect_alignment(root, manifest):
    root = Path(root).resolve()
    if not isinstance(manifest, dict) or set(manifest) != set(FIELDS):
        hold("EXACT_FIVE_INPUT_MANIFEST_REQUIRED")
    files = {name: pinned_file(root, manifest[name], name) for name in FIELDS}
    with wave.open(io.BytesIO(files["wav"][1]), "rb") as src:
        if (src.getnchannels(), src.getsampwidth(), src.getframerate(), src.getcomptype()) != (1, 2, 24000, "NONE"):
            hold("ORIGINAL_PCM24K_MONO16_REQUIRED")
        frames = src.getnframes()
        pcm = src.readframes(frames)
    if len(pcm) != frames * 2 or not 1 <= frames / 24000 <= MAX_SECONDS:
        hold("TRUNCATED_OR_UNBOUNDED_WAV")
    duration = frames / 24000
    end, tiers = parse_long_textgrid(files["textgrid"][1].decode("utf-8-sig"))
    if abs(end-duration) > .001:
        hold("TEXTGRID_WAV_DURATION_MISMATCH")
    expected = normalized_words(files["transcript"][1].decode("utf-8-sig"))
    # Real MFA align_one uses <eps> for word-tier silence. Accept that exact
    # representation only when the entire interval is covered by silence/empty
    # phones. An epsilon phone remains UNKNOWN; it cannot hide unaligned speech.
    for a, b, text in tiers["words"]:
        if text == "<eps>":
            pause = [(x, y, label) for x, y, label in tiers["phones"] if x >= a-1e-6 and y <= b+1e-6]
            if (not pause or abs(pause[0][0]-a) > 1e-6 or abs(pause[-1][1]-b) > 1e-6
                    or any(label.casefold() not in {"", "sil", "sp"} for _, _, label in pause)):
                hold("EPSILON_INTERVAL_CONTAINS_NON_SILENCE")
    words = [(a, b, text) for a, b, text in tiers["words"] if text.strip() and text != "<eps>"]
    if len(words) > 2000:
        hold("WORD_COUNT_EXCEEDS_BOUNDED_RESEARCH")
    actual = [normalized_words(text) for _, _, text in words]
    if not expected or any(len(w) != 1 for w in actual) or [w[0] for w in actual] != expected:
        hold("TRANSCRIPT_WORDS_MISSING_CHANGED_OR_OOV")
    dictionary = {}
    for line in files["dictionary"][1].decode("utf-8-sig").splitlines():
        fields = line.split()
        if fields and not fields[0].startswith("#"):
            dictionary.setdefault(fields[0].casefold(), []).append(fields[1:])
    phone_entries = [(a, b, text) for a, b, text in tiers["phones"] if text.strip()]
    if any(text.casefold() in UNKNOWN for _, _, text in words + phone_entries):
        hold("UNKNOWN_WORD_OR_PHONE")
    result = []
    for word_index, (a, b, text) in enumerate(words):
        phones = [(x, y, label) for x, y, label in phone_entries if x >= a-1e-6 and y <= b+1e-6]
        if not phones or abs(phones[0][0]-a) > 1e-6 or abs(phones[-1][1]-b) > 1e-6 or any(abs(phones[i][0]-phones[i-1][1]) > 1e-6 for i in range(1, len(phones))):
            hold("WORD_PHONE_COVERAGE_MISSING:" + str(word_index))
        labels = [label for _, _, label in phones]
        if labels not in dictionary.get(expected[word_index], []):
            hold("PHONE_SEQUENCE_NOT_IN_PINNED_DICTIONARY:" + str(word_index))
        result.append({"word": text, "startMs": a*1000, "endMs": b*1000,
                       "phones": [{"phone": label, "startMs": x*1000, "endMs": y*1000} for x, y, label in phones]})
    # No speech phone may live outside a word. Empty/silence gaps are retained,
    # never removed or compressed to fit the picture.
    assigned = sum(len(w["phones"]) for w in result)
    non_silence = [p for p in phone_entries if p[2].casefold() not in {"sil", "sp"}]
    assigned_non_silence = sum(sum(p["phone"].casefold() not in {"sil", "sp"} for p in w["phones"]) for w in result)
    if assigned_non_silence != len(non_silence) or not assigned:
        hold("SPEECH_PHONES_OUTSIDE_WORDS")
    identities = {name: manifest[name]["sha256"] for name in FIELDS}
    revision = digest(json.dumps({"schema": SCHEMA, "inputs": identities, "wordAlignment": result}, sort_keys=True, separators=(",", ":")).encode())
    return {"schema": SCHEMA, "status": "BYTE_BOUND_WORD_TIMING_CANDIDATE_REVIEW_REQUIRED",
            "inputSha256": identities, "revisionSha256": revision,
            "sampleRate": 24000, "sampleCount": frames, "durationMs": math.ceil(duration*1000),
            "wordAlignment": result, "alignmentExecutedByThisImporter": False,
            "timingAccuracyCalibrated": False, "pronunciationVerified": False,
            "scienceApproved": False, "craftApproved": False, "mayPublish": False,
            "limitations": ["TextGrid is supplied evidence, not authenticated model execution.",
                            "Matching dictionary phones does not verify audible pronunciation or stress.",
                            "Calibrate against independently labeled real speech before final word cues.",
                            "Any input or word-timing change invalidates the revision and downstream cuts."]}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--manifest", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    output = Path(args.out)
    # A mistaken --out must never destroy original audio, evidence or manifest.
    try:
        manifest = json.loads(Path(args.manifest).read_text(encoding="utf-8"))
        inputs = [Path(args.manifest)] + [Path(args.root) / spec["path"] for spec in manifest.values() if isinstance(spec, dict) and isinstance(spec.get("path"), str)] if isinstance(manifest, dict) else [Path(args.manifest)]
        linked = any(p.is_symlink() for p in (output, *output.parents))
        collision = any(output.resolve() == p.resolve() or (output.exists() and p.exists() and output.samefile(p)) for p in inputs)
        if linked or collision:
            print(json.dumps({"status": "HOLD", "errors": ["REPORT_PATH_COLLIDES_WITH_INPUT_OR_LINK"], "mayPublish": False}))
            raise SystemExit(2)
    except (ValueError, OSError, UnicodeError) as exc:
        print(json.dumps({"status": "HOLD", "errors": ["MANIFEST_UNREADABLE:" + type(exc).__name__], "mayPublish": False}))
        raise SystemExit(2)
    try:
        verdict = inspect_alignment(args.root, manifest)
    except (ValueError, OSError, EOFError, wave.Error, UnicodeError) as exc:
        # Overwrite a previous candidate on failure: never leave stale PASS-like
        # timing available for accidental reuse. No raw file content in errors.
        code = str(exc) if isinstance(exc, ValueError) and str(exc).startswith("EXACT_WAV_ALIGNMENT_HOLD:") else type(exc).__name__
        verdict = {"schema": SCHEMA, "status": "HOLD", "errors": [code],
                   "wordAlignment": [], "mayPublish": False, "pronunciationVerified": False}
        output.write_text(json.dumps(verdict, indent=2) + "\n", encoding="utf-8")
        print(json.dumps(verdict))
        raise SystemExit(2)
    output.write_text(json.dumps(verdict, indent=2, allow_nan=False) + "\n", encoding="utf-8")
    print(json.dumps({key: value for key, value in verdict.items() if key != "wordAlignment"}, indent=2))

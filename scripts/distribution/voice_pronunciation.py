"""Versioned, spoken-only pronunciation overrides for the THS Kokoro house voice.

Never use this output for visible captions, scientific scripts, citation text,
or word-alignment transcripts. Synthesis must be followed by human audio QA.
"""
from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path

LEXICON_PATH = Path(__file__).with_name("voice-pronunciations.json")
SCHEMA = "ths-voice-pronunciation-lexicon-v1"
TERM_PATTERN = re.compile(r"^[a-z0-9]+(?:[ -][a-z0-9]+)*$")


def load_lexicon(path: Path | None = None) -> tuple[list[dict], str]:
    source = Path(path) if path is not None else LEXICON_PATH
    content = source.read_bytes()  # Missing/malformed dictionary must fail closed.
    payload = json.loads(content)
    if payload.get("schemaVersion") != SCHEMA or payload.get("language") != "en-US":
        raise ValueError("Unexpected voice pronunciation dictionary schema/language")
    entries = payload.get("entries")
    if not isinstance(entries, list) or not entries:
        raise ValueError("Voice pronunciation dictionary must have entries")
    seen = set()
    for entry in entries:
        if not isinstance(entry, dict):
            raise ValueError("Voice pronunciation entries must be objects")
        term, spoken = entry.get("term"), entry.get("spokenAs")
        if (not isinstance(term, str) or not TERM_PATTERN.fullmatch(term) or
                not isinstance(spoken, str) or not spoken.strip() or "-" in spoken or
                "\\n" in spoken or "\\r" in spoken or not entry.get("source")):
            raise ValueError("Invalid voice pronunciation entry")
        if term.lower() in seen:
            raise ValueError(f"Duplicate pronunciation term: {term}")
        seen.add(term.lower())
    return entries, hashlib.sha256(content).hexdigest()


def apply_pronunciations(text: str, path: Path | None = None) -> str:
    """Replace whole source terms only, longest first, in audio synthesis input.

    Visible scripts/subtitles are deliberately untouched. Do not rewrite inside
    longer chemical names, e.g. 7-hydroxymitragynine or mitragynines, unless the
    full chemical name is itself an explicit dictionary entry.
    """
    entries, _ = load_lexicon(path)
    mapping = {entry["term"].lower(): entry["spokenAs"] for entry in entries}
    alternatives = "|".join(re.escape(term) for term in
                            sorted(mapping, key=lambda term: (-len(term), term)))
    pattern = re.compile(r"(?<![A-Za-z])(?:" + alternatives + r")(?![A-Za-z])", re.I)
    return pattern.sub(lambda match: mapping[match.group(0).lower()], text)


def lexicon_receipt(path: Path | None = None) -> dict:
    entries, digest = load_lexicon(path)
    return {"schemaVersion": SCHEMA, "sha256": digest,
            "terms": [entry["term"] for entry in entries],
            "application": "narration-audio-only",
            "humanAuditoryReview": "required"}

#!/usr/bin/env python3
"""Fail-closed file handling for immutable EvidenceMotion research receipts.

This protects source inputs from output-path reuse. It does not review science
or grant media, reviewer, production, or publishing approval.
"""
import json
import os
import tempfile
from pathlib import Path


def prepare_research_output(destination, inputs):
    """Reject aliases/symlinks, then remove stale receipts before validation."""
    target = Path(destination)
    if target.is_symlink():
        raise ValueError("RESEARCH_RECEIPT_HOLD:OUTPUT_SYMLINK_OR_INPUT_ALIAS")
    # Path.resolve() catches direct and symlinked-parent aliases, but two
    # hardlinked names resolve to *different paths* despite referencing the
    # same source inode. Check both before unlinking the stale output name.
    for input_path in inputs:
        source = Path(input_path)
        if target.resolve() == source.resolve():
            raise ValueError("RESEARCH_RECEIPT_HOLD:OUTPUT_SYMLINK_OR_INPUT_ALIAS")
        try:
            same_existing_file = (target.exists() and source.exists()
                                  and os.path.samefile(target, source))
        except OSError as exc:
            raise ValueError("RESEARCH_RECEIPT_HOLD:OUTPUT_INPUT_IDENTITY_UNVERIFIABLE") from exc
        if same_existing_file:
            raise ValueError("RESEARCH_RECEIPT_HOLD:OUTPUT_SYMLINK_OR_INPUT_ALIAS")
    if target.exists() and not target.is_file():
        raise ValueError("RESEARCH_RECEIPT_HOLD:OUTPUT_MUST_BE_REGULAR_FILE")
    if target.exists():
        target.unlink()  # A subsequent failed replay must not leave stale evidence.
    return target


def emit_research_output(target, report):
    """Write to a same-directory temporary file, fsync, then replace atomically."""
    target = Path(target)
    pending = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=str(target.parent),
            prefix="." + target.name + ".", suffix=".tmp", delete=False,
        ) as stream:
            pending = Path(stream.name)
            stream.write(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(pending, target)
        pending = None
    finally:
        if pending is not None:
            pending.unlink(missing_ok=True)

def strict_research_json(raw):
    """Parse exact receipt bytes without silently accepting ambiguous JSON.

    The original file digest is still computed over its original bytes.
    This is integrity validation, not independent science review.
    """
    import math

    def reject(reason):
        raise ValueError("RESEARCH_JSON_HOLD:" + reason)

    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                reject("DUPLICATE_JSON_KEY:" + key)
            result[key] = value
        return result

    def finite_float(token):
        value = float(token)
        if not math.isfinite(value):
            reject("NONFINITE_JSON_NUMBER")
        return value

    try:
        return json.loads(
            raw, object_pairs_hook=unique_object, parse_float=finite_float,
            parse_constant=lambda _: reject("NONFINITE_JSON_NUMBER"),
        )
    except (UnicodeError, json.JSONDecodeError) as exc:
        reject("MALFORMED_JSON:" + str(exc))

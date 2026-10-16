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
    if target.is_symlink() or any(target.resolve() == Path(p).resolve() for p in inputs):
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

#!/usr/bin/env python3
"""Fail-closed readiness check for the approved THS Kokoro local narrator.

No downloads, pip installs, substitute voices, or environment mutation.
Use after installing pinned Python dependencies and restoring the voice vault.
"""
from __future__ import annotations

import argparse
import importlib.metadata
import json
import shutil
import subprocess
import sys
from pathlib import Path

REQUIRED_PACKAGES = {"kokoro-onnx": "0.6.1", "onnxruntime": "1.31.0"}
REQUIRED_COMMANDS = ("ffmpeg", "ffprobe", "espeak-ng")
VAULT_VALIDATOR = Path(__file__).with_name("voice-vault.py")


def check_runtime(vault: Path, *, python_version=None, package_version=None,
                  which=None, verify_vault=None) -> dict:
    """Fail closed for missing deps or wrong voice; injections are for unit tests."""
    python_version = python_version or sys.version_info[:2]
    package_version = package_version or importlib.metadata.version
    which = which or shutil.which
    if verify_vault is None:
        def verify_vault(folder):
            command = [sys.executable, str(VAULT_VALIDATOR), "verify", str(folder)]
            result = subprocess.run(command, capture_output=True, text=True,
                                    timeout=120, check=False)
            return result.returncode == 0

    errors = []
    if not (3, 10) <= tuple(python_version) <= (3, 12):
        errors.append("PYTHON_VERSION_UNSUPPORTED")
    for name, pinned in REQUIRED_PACKAGES.items():
        try:
            installed = package_version(name)
        except importlib.metadata.PackageNotFoundError:
            installed = None
        if installed != pinned:
            errors.append("WRONG_PACKAGE_" + name.upper().replace("-", "_"))
    for name in REQUIRED_COMMANDS:
        if not which(name):
            errors.append("MISSING_" + name.upper().replace("-", "_"))
    # Interpreter and packages alone are not proof. Reuse the immutable
    # SHA-256 model, voicebank and manifest validator instead of duplicating it.
    try:
        if not verify_vault(vault):
            errors.append("VOICE_VAULT_INVALID")
    except (OSError, subprocess.SubprocessError, ValueError, RuntimeError):
        errors.append("VOICE_VAULT_INVALID")

    return {
        "schemaVersion": "ths-original-voice-runtime-readiness-v1",
        "status": "PASS" if not errors else "HOLD",
        "approvedNarrator": "kokoro-onnx/0.6.1; Kokoro-82M INT8; am_michael",
        "python": ".".join(map(str, python_version)),
        "vault": str(vault),
        "errors": errors,
        "recovery": None if not errors else (
            "Use the repository's kokoro-voice-production.yml on a GitHub runner "
            "with Python 3.11 and the exact SHA-locked release; do not substitute "
            "a local/system/hosted voice or mark a silent render complete."
        ),
    }


def main():
    parser = argparse.ArgumentParser(description="Assert canonical THS voice runtime readiness")
    parser.add_argument("--vault", type=Path, required=True)
    parser.add_argument("--receipt", type=Path)
    args = parser.parse_args()
    result = check_runtime(args.vault.resolve())
    encoded = json.dumps(result, indent=2) + "\n"
    if args.receipt:
        args.receipt.parent.mkdir(parents=True, exist_ok=True)
        args.receipt.write_text(encoded, encoding="utf-8")
    print(encoded, end="")
    return 0 if result["status"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())

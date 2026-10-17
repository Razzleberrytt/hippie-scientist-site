#!/usr/bin/env python3
"""Restore the 11 archival original renderer files without altering current source.

Ten exact bytes came from immutable baseline ecc249f5...; phone_ui_audit.py
came from Git revision 5fde6994... before later safety fixes. Only recovered
versions may be used in an isolated, externally admitted ORIGINAL replay;
this is never a recommendation to revert production safety fixes.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import stat
import subprocess
import tempfile

BASE_COMMIT = "ecc249f5f460ca38be8850375b8b4f4a4d98b448"
PHONE_COMMIT = "5fde6994c09e8464606074e5a1f21b06385b95e5"
SOURCE_PATH = "research/evidencemotion-director/"
PINNED = {
    "narration_locked_treatments.py": "2e3a0cf029c5e5f8badb5236a6ab4d4690a08260bc4e542162544f146045c8bf",
    "verified_molecular_comparison.py": "80de958d89c8e0466147cb58c60b2c7a42cb1eee2f74633bf8c53e223c8e5db7",
    "editorial_2d_cpu_research.py": "2cb1eeaca6931e95e3fd8aa7d7040855d327c9877619a7f339adcb734b082e45",
    "exact_wav_alignment.py": "9088919f78a68ab730a13a064e98a1326c2ff29e4794e13aabd9b2ed1acbe65e",
    "autonomous_script_asr_research.py": "eccb4efad548b76566bd7ce0d163a8b18b2db4d03fdfab01b2d90eeebfe6bc18",
    "phone_ui_audit.py": "d66170eb8e30e66c920c11b26ad3bdb9da7db703881908c1895d501b092e44f2",
    "native_master_audit.py": "f3b45af413629fb344a5421b0bdc2bcc28ccf481dafc59c93f0c8d542205cfae",
    "timed_caption_windows.py": "cabc6b4f56217c932ea0e437630083fae18119fa3232fa10fd79c7de5d3cf855",
    "temporal_caption_audit.py": "7d94fe9b550b8470730f7e6592f984568648f04d358df15a5ae379edc0d68463",
    "source_locked_visual_direction.py": "866a6793204b03627c13d0992673a84b0ab2ba447b9a8c1702292d1967455947",
    "source_bond_trace_direction.py": "c9702e6ffab9ea612d7d36d6e7c2f2477fcb6b24adbd05ae48c5bdda682afe20",
}
REFS = {name: (PHONE_COMMIT if name == "phone_ui_audit.py" else BASE_COMMIT)
        for name in PINNED}
SAFE_NAME = re.compile(r"^[a-z][a-z0-9_]*\.py$")
SAFE_REF = re.compile(r"^[0-9a-f]{40}$")



def _cleanup_owned_readonly_stage(stage):
    """Remove only our fresh private stage, including Windows 0444 files.

    Windows refuses os.unlink on read-only files; the archival source should
    remain immutable in the successfully committed destination, but disposable
    staging files can be made writable for removal. Never repair symlinks,
    foreign paths, or arbitrary directories passed to a failed rmtree().
    """
    stage = Path(stage)
    if not stage.is_dir() or stage.is_symlink():
        raise ValueError("ORIGINAL_SOURCE_HOLD:UNSAFE_STAGE_CLEANUP")

    def on_readonly_error(operation, failed_path, exc_info):
        cause = exc_info[1]
        entry = Path(failed_path)
        if (not isinstance(cause, PermissionError)
                or operation not in (os.unlink, os.remove)
                or stage not in entry.parents
                or entry.is_symlink() or not entry.is_file()):
            raise cause
        entry.chmod(stat.S_IREAD | stat.S_IWRITE)
        operation(failed_path)

    shutil.rmtree(stage, onerror=on_readonly_error)



def restore_pinned_sources(repo, destination, *, pins=PINNED, refs=REFS):
    repo, destination = Path(repo).resolve(), Path(destination)
    if not repo.is_dir() or not (repo / ".git").exists():
        raise ValueError("ORIGINAL_SOURCE_HOLD:NOT_A_GIT_CHECKOUT")
    if destination.exists() or destination.is_symlink() or not destination.parent.is_dir():
        raise ValueError("ORIGINAL_SOURCE_HOLD:FRESH_OUTPUT_PARENT_REQUIRED")
    if not pins or set(pins) != set(refs):
        raise ValueError("ORIGINAL_SOURCE_HOLD:SOURCE_INVENTORY_DRIFT")
    stage = Path(tempfile.mkdtemp(prefix=".em-original-sources-", dir=destination.parent))
    receipts = []
    try:
        for name in sorted(pins):
            if not SAFE_NAME.fullmatch(name) or not SAFE_REF.fullmatch(refs[name]):
                raise ValueError("ORIGINAL_SOURCE_HOLD:INVALID_SOURCE_OR_REF")
            expected = pins[name]
            if not isinstance(expected, str) or not re.fullmatch(r"[0-9a-f]{64}", expected):
                raise ValueError("ORIGINAL_SOURCE_HOLD:INVALID_PIN")
            cmd = ["git", "-C", str(repo), "show", refs[name] + ":" + SOURCE_PATH + name]
            result = subprocess.run(cmd, capture_output=True, check=False, timeout=30)
            if result.returncode != 0:
                raise ValueError("ORIGINAL_SOURCE_HOLD:GIT_REVISION_UNAVAILABLE:" + name)
            observed = hashlib.sha256(result.stdout).hexdigest()
            if observed != expected:
                raise ValueError("ORIGINAL_SOURCE_HOLD:SOURCE_SHA_DRIFT:" + name)
            target = stage / name
            target.write_bytes(result.stdout)
            target.chmod(0o444)
            receipts.append({"name": name, "sourceCommit": refs[name],
                             "sha256": observed, "bytes": len(result.stdout)})
        # Atomically publish a complete new isolated tree. No production edits.
        os.replace(stage, destination)
    except BaseException as primary:
        # The root cause (bad ref/SHA etc.) must not be replaced by WinError5
        # while removing our private, read-only 0444 staging files.
        if stage.exists():
            try:
                _cleanup_owned_readonly_stage(stage)
            except Exception as cleanup:
                if hasattr(primary, "add_note"):
                    primary.add_note("ORIGINAL_SOURCE_HOLD:STAGE_CLEANUP_INCOMPLETE:"
                                     + type(cleanup).__name__)
        raise
    return {"schema": "ths-em-original-11-source-recovery-v1",
            "status": "PINNED_SOURCES_ONLY_RESTORED",
            "destination": str(destination.resolve()),
            "files": receipts, "allSha256Verified": True,
            "originalFullRenderExecuted": False,
            "originalFontsVerified": False,
            "mayPublish": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    print(json.dumps(restore_pinned_sources(args.repo, args.out), indent=2))

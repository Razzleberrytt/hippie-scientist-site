#!/usr/bin/env python3
"""EM-002.02: fail-closed documentation/source-byte policy crosswalk audit.

No security, merge, science, device or publishing authority is produced by PASS.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REPORT = ROOT / "research/evidencemotion-director/EM00202-POLICY-CROSSWALK-20261016.md"
SOURCES = {
    "AGENTS.md",
    "docs/CURRENT_SPRINT.md",
    "docs/DECISIONS.md",
    "research/evidencemotion-director/COMPLETION-CHECKLIST.md",
    "research/evidencemotion-director/research_workflow_release_guard.py",
}
GATES = (
    "**WIP / admission**",
    "**Source and scientific truth**",
    "**Spending / dependencies**",
    "**Security / privileged actions**",
    "**Protected integration / release**",
    "**Media, device and independent acceptance**",
    "**Publication / integration authorization**",
)
REQUIRED = (
    "October 12",
    "October 13",
    "rescinded the version freeze",
    "mayPublish=false",
    "releaseAuthorized=false",
    "EM-001.03.T",
    "EM-007.07",
    "0/1",
    "0/5",
    "26/46",  # This is a canonical historical tracker ratio, not new progress.
)
PIN = re.compile(r"^\| \`([^\`]+)\` \| \`([a-f0-9]{40})\` \|$", re.MULTILINE)
LINK = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


class PolicyCrosswalkHold(ValueError):
    pass


def git_blob_sha(contents):
    return hashlib.sha1(
        b"blob " + str(len(contents)).encode("ascii") + b"\0" + contents
    ).hexdigest()


def inspect(document, root=ROOT, source_overrides=None):
    if not isinstance(document, str) or not document.strip():
        raise PolicyCrosswalkHold("EMPTY_POLICY_CROSSWALK")
    if "mayPublish=true" in document or "releaseAuthorized=true" in document:
        raise PolicyCrosswalkHold("PREMATURE_RELEASE_AUTHORIZATION")
    pins = {}
    for path, sha in PIN.findall(document):
        if path in pins:
            raise PolicyCrosswalkHold("DUPLICATE_PIN:" + path)
        pins[path] = sha
    if set(pins) != SOURCES:
        raise PolicyCrosswalkHold("MISSING_OR_UNEXPECTED_POLICY_SOURCE")
    override = source_overrides or {}
    for path, sha in pins.items():
        candidate = root / path
        if path in override:
            raw = override[path]
        else:
            if not candidate.is_file():
                raise PolicyCrosswalkHold("MISSING_POLICY_SOURCE:" + path)
            raw = candidate.read_bytes()
        if not isinstance(raw, bytes) or git_blob_sha(raw) != sha:
            raise PolicyCrosswalkHold("STALE_POLICY_SOURCE:" + path)
    for gate in GATES:
        if document.count("| " + gate + " |") != 1:
            raise PolicyCrosswalkHold("MISSING_OR_DUPLICATED_GATE:" + gate)
    for term in REQUIRED:
        if term not in document:
            raise PolicyCrosswalkHold("MISSING_POLICY_HOLD_OR_DECISION:" + term)
    doc_dir = REPORT.parent
    for target in LINK.findall(document):
        if target.startswith(("https://", "http://", "#")):
            continue
        local = (doc_dir / target.split("#")[0]).resolve()
        if not local.is_relative_to(root.resolve()) or not local.is_file():
            raise PolicyCrosswalkHold("INVALID_POLICY_DOC_LINK:" + target)
    return {
        "status": "PASS_RESEARCH_POLICY_CROSSWALK_BYTES_ONLY",
        "sourcePins": pins,
        "policyRows": len(GATES),
        "mayPublish": False,
        "releaseAuthorized": False,
        "independentScienceApproved": False,
        "realIphonePlaybackVerified": False,
        "canonicalMilestonePromoted": False,
    }


def main():
    print(json.dumps(inspect(REPORT.read_text(encoding="utf-8")), indent=2))


if __name__ == "__main__":
    main()

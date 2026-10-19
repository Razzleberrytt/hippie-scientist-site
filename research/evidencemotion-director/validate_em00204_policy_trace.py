#!/usr/bin/env python3
"""EM-002.04: policy-to-governing-tracker source link integrity, research-only.

This validates a *research trace* across already-governing documents. A PASS
cannot approve a new workstream, publish, merge, certify science or accept media.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DIR = ROOT / "research/evidencemotion-director"
REGISTER = DIR / "GRANULAR-46-EXECUTION-REGISTER.md"
CANONICAL = DIR / "COMPLETION-CHECKLIST.md"
POLICY = DIR / "EM00202-POLICY-CROSSWALK-20261016.md"
PINNED_BLOBS = {
    "register": "8def8898cbd6ac3010e5e212ac981fd5b8fbc6ea",
    "canonical": "de3501764918492216e4a84c11e563d34fc71e6c",
    "policy": "d5a5cc64aaf231d67d541b5085b14acb529bbcf9",
}
TRACE_MARKER = "**EM-002.04 research-only policy trace (NOT child/parent acceptance):**"
TARGETS = {
    "EM00202-POLICY-CROSSWALK-20261016.md",
    "EM00203-RESEARCH-WORKFLOW-RELEASE-GUARD-20261016.md",
    "COMPLETION-CHECKLIST.md",
}
LINK = re.compile(r"\[[^\]]+\]\(([^)]+)\)")


class PolicyTrackerHold(ValueError):
    pass


def git_blob_sha(data):
    return hashlib.sha1(
        b"blob " + str(len(data)).encode("ascii") + b"\0" + data
    ).hexdigest()


def inspect(register, canonical, policy, check_pins=True):
    sources = {"register": register, "canonical": canonical, "policy": policy}
    if any(not isinstance(value, str) or not value.strip()
           for value in sources.values()):
        raise PolicyTrackerHold("EMPTY_GOVERNING_SOURCE")
    if check_pins:
        for name, content in sources.items():
            if git_blob_sha(content.encode("utf-8")) != PINNED_BLOBS[name]:
                raise PolicyTrackerHold("STALE_GOVERNING_SOURCE:" + name)
    if register.count(TRACE_MARKER) != 1:
        raise PolicyTrackerHold("MISSING_OR_DUPLICATE_TRACE_MARKER")
    row = next((line for line in register.splitlines()
                if line.startswith(TRACE_MARKER)), "")
    if not row or set(LINK.findall(row)) != TARGETS or len(LINK.findall(row)) != 3:
        raise PolicyTrackerHold("WRONG_OR_MISSING_POLICY_TRACE_LINK")
    for name in TARGETS:
        if not (DIR / name).is_file():
            raise PolicyTrackerHold("BROKEN_POLICY_TRACE_TARGET:" + name)
    if not re.search(r"^- \[ \] \*\*EM-002\.04\*\*", register, re.MULTILINE):
        raise PolicyTrackerHold("PREMATURE_CHILD_APPROVAL_OR_MISSING_TASK")
    for required in (
        "**Oct 12**", "**rescinded Oct 13**", "**three D/R/A normal workstreams**",
        "Research branch **draft/unmerged**", "separate", "`mayPublish=false`",
        "no new implementation lane",
    ):
        if required not in row:
            raise PolicyTrackerHold("MISSING_RELEASE_HOLD_OR_WIP_RULE:" + required)
    if not all(x in canonical for x in (
        "26/46", "0/1 excellent native final", "0/5 consecutive varied excellent first renders",
        "explicitly rescinded Oct 13", "no automatic production integration or publication rights",
    )):
        raise PolicyTrackerHold("CANONICAL_POLICY_OR_PREMIUM_GATE_MISSING")
    if not all(x in policy for x in (
        "**WIP / admission**", "**Source and scientific truth**",
        "**Spending / dependencies**", "**Security / privileged actions**",
        "**Protected integration / release**", "**Publication / integration authorization**",
        "`mayPublish=false`", "`releaseAuthorized=false`",
    )):
        raise PolicyTrackerHold("CROSSWALK_AUTHORITY_MISSING")
    return {
        "status": "PASS_RESEARCH_POLICY_TRACKER_LINK_ONLY",
        "gitBlobPins": PINNED_BLOBS,
        "linkedPolicyDocuments": sorted(TARGETS),
        "childMilestoneAccepted": False,
        "canonicalPromotion": False,
        "additionalWipSlot": False,
        "releaseAuthorized": False,
        "mayPublish": False,
    }


def main():
    print(json.dumps(inspect(
        REGISTER.read_text(encoding="utf-8"),
        CANONICAL.read_text(encoding="utf-8"),
        POLICY.read_text(encoding="utf-8"),
    ), indent=2))


if __name__ == "__main__":
    main()

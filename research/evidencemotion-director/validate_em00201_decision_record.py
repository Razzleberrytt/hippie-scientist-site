#!/usr/bin/env python3
"""EM-002.01: exact-byte dated freeze/rescission policy evidence audit.

This proves repository source-record consistency, NOT the identity of an
off-platform signer or independent release/science/film approval.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_MAP = {
    "oct12_research_limit": (
        "research/evidencemotion-director/COMPUTE-GATE.md",
        "5b011fb68e5a2182ddf0f59db270a5bf819e2d0c",
    ),
    "oct13_owner_decision": (
        "docs/DECISIONS.md",
        "80e43540c3ef6c43025715bdbb4564d3bb45d0d1",
    ),
    "current_canonical": (
        "research/evidencemotion-director/COMPLETION-CHECKLIST.md",
        "de3501764918492216e4a84c11e563d34fc71e6c",
    ),
}
COMMENT_URL = ("https://github.com/Razzleberrytt/hippie-scientist-site/"
               "issues/6743#issuecomment-6160074905")
IMPLEMENTATION_PR = ("https://github.com/Razzleberrytt/hippie-scientist-site/"
                     "pull/6788")
MERGE_SHA = "31341863d91695e2b206df487bd8d2a3e12a8364"


class DatedPolicyHold(ValueError):
    pass


def git_blob_sha(content):
    return hashlib.sha1(b"blob " + str(len(content)).encode("ascii") + b"\0" + content).hexdigest()


def audit(source_overrides=None):
    overrides = source_overrides or {}
    documents = {}
    for key, (path, expected) in SOURCE_MAP.items():
        data = overrides.get(key)
        if data is None:
            target = ROOT / path
            if not target.is_file() or target.is_symlink():
                raise DatedPolicyHold("MISSING_OR_UNTRUSTED_SOURCE:" + key)
            data = target.read_bytes()
        if not isinstance(data, bytes) or git_blob_sha(data) != expected:
            raise DatedPolicyHold("SOURCE_SHA_MISMATCH:" + key)
        documents[key] = data.decode("utf-8")
    oct12 = documents["oct12_research_limit"].split(
        "## Observed in this repository", 1
    )[0]
    if not all(s in oct12 for s in (
        "2026-10-12", "Owner-approved exploration",
        "Version freeze remains in force",
        "no new R-numbers", "publishing privileges",
        "one excellent first-render MP4", "five consecutive excellent first renders",
    )):
        raise DatedPolicyHold("OCT12_ORIGINAL_POLICY_NOT_PROVED")
    decisions = documents["oct13_owner_decision"]
    heading = "## 2026-10-13 — Owner rescinds EvidenceMotion capability/version freeze"
    if decisions.count(heading) != 1:
        raise DatedPolicyHold("OCT13_RESCISSION_SECTION_MISSING_OR_AMBIGUOUS")
    section = decisions.split(heading, 1)[1].split("\n## ", 1)[0]
    if not all(x in section for x in (
        "**RESCINDED by the owner**",
        "October 12 freeze", "Older documents", "superseded on this narrow point",
        "No first-premium-video", "before modifying the system",
        "repo WIP/sprint admission", "explicit authorized publishing",
        "Never auto-post", "research/production admission",
    )):
        raise DatedPolicyHold("OCT13_RESCISSION_OR_LIMITS_NOT_PROVED")
    canonical = documents["current_canonical"]
    if not all(x in canonical for x in (
        "26/46", "0/1 excellent native final",
        "0/5 consecutive varied excellent first renders",
        "freeze originally enforced in Oct 12 research is explicitly rescinded Oct 13",
        "no automatic production integration or publication rights",
    )):
        raise DatedPolicyHold("CANONICAL_HOLDS_NOT_PRESENT")
    return {
        "status": "PASS_DATED_REPOSITORY_POLICY_EVIDENCE_ONLY",
        "sourceGitBlobShas": {k: v[1] for k, v in SOURCE_MAP.items()},
        "oct12RecordedState": "VERSION_FREEZE_ACTIVE_AT_THAT_TIME",
        "oct13RecordedState": "VERSION_FREEZE_RESCINDED",
        "ownerCommentReference": COMMENT_URL,
        "mergedOwnerPolicyPullRequest": IMPLEMENTATION_PR,
        "mergedPolicyCommitSha": MERGE_SHA,
        "ownerCommentIdentityIndependentlyAuthenticated": False,
        "newWorkstreamAdmitted": False,
        "additionalPublishingPermission": False,
        "scientificAcceptance": False,
        "fullFilmAccepted": False,
        "mayPublish": False,
    }


def main():
    print(json.dumps(audit(), indent=2))


if __name__ == "__main__":
    main()

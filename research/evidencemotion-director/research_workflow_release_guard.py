#!/usr/bin/env python3
"""EM-002.03: reject accidental privileged EvidenceMotion *research* workflow edits.

This is a narrow declaration/static-command guard for two named GitHub Actions
workflows, NOT a substitute for branch protection, publisher security, CI,
human scientific review, or an assertion about arbitrary executed shell code.
No version label, research proof, or test result confers release permission.
"""
import hashlib
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
WORKFLOWS = (
    ".github/workflows/evidencemotion-actual-asr-research.yml",
    ".github/workflows/evidencemotion-atomic-proof-ledger.yml",
)
TOP = re.compile(r"^([A-Za-z][A-Za-z0-9_-]*):(?:[ \t].*)?$")
EVENT = re.compile(r"^  ([a-z][a-z0-9_-]*):[ \t]*$")
PERMISSION = re.compile(r"^  ([a-z-]+):[ \t]*([a-z]+)[ \t]*$")
JOB = re.compile(r"^  ([a-z][a-z0-9_-]*):[ \t]*$")
RELEASE_CMD = re.compile(
    r"(?i)\b(?:gh\s+release\s+(?:create|upload|edit)|"
    r"npm\s+publish|pnpm\s+publish|yarn\s+npm\s+publish|"
    r"wrangler\s+(?:deploy|pages\s+deploy)|"
    r"vercel\s+(?:deploy|--prod)|"
    r"gh\s+api\s+[^\n]*?/releases\b)"
)
DEPLOY_ACTION = re.compile(
    r"(?i)(?:deploy|publish|cloudflare|vercel|pages-action|release-action)"
)


class ResearchReleaseHold(ValueError):
    pass


def hold(code):
    raise ResearchReleaseHold("EM00203_RESEARCH_RELEASE_HOLD:" + code)


def inspect(name, text):
    if name not in WORKFLOWS or not isinstance(text, str) or not text.strip():
        hold("UNKNOWN_OR_EMPTY_WORKFLOW")
    if "\t" in text:
        hold("TAB_INDENTATION_OR_COMMAND")
    lines = text.splitlines()
    sections = {}
    for i, line in enumerate(lines):
        match = TOP.fullmatch(line)
        if match:
            key = match.group(1)
            if key in sections:
                hold("DUPLICATE_TOP_LEVEL_KEY:" + key)
            sections[key] = i
    if set(sections) != {"name", "on", "permissions", "jobs"}:
        hold("UNEXPECTED_OR_MISSING_TOP_LEVEL_KEY")
    if any(lines[sections[key]] != key + ":" for key in ("on", "permissions", "jobs")):
        hold("UNREVIEWED_INLINE_WORKFLOW_DECLARATION")
    if not (sections["name"] < sections["on"] < sections["permissions"] < sections["jobs"]):
        hold("UNREVIEWED_TOP_LEVEL_LAYOUT")

    event_lines = lines[sections["on"] + 1:sections["permissions"]]
    events = [m.group(1) for line in event_lines if (m := EVENT.fullmatch(line))]
    if not events or len(events) != len(set(events)) or set(events) - {"pull_request", "workflow_dispatch"}:
        hold("NON_REVIEW_TRIGGER_OR_DUPLICATE_EVENT")
    if "pull_request" not in events:
        hold("PULL_REQUEST_RESEARCH_CHECK_REQUIRED")
    # Reject unreviewed inline YAML, flow-style, or expression-based event
    # mutations; only straightforward reviewed declarative syntax is accepted.
    for line in event_lines:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if line.startswith("  ") and not line.startswith("    ") and not EVENT.fullmatch(line):
            hold("UNREVIEWED_EVENT_DECLARATION")
    perms = lines[sections["permissions"] + 1:sections["jobs"]]
    seen = {}
    for line in perms:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        match = PERMISSION.fullmatch(line)
        if not match or match.group(1) in seen:
            hold("MALFORMED_OR_DUPLICATE_PERMISSION")
        seen[match.group(1)] = match.group(2)
    if seen.get("contents") != "read" or set(seen) - {"contents", "actions"} or any(v != "read" for v in seen.values()):
        hold("PRIVILEGED_WORKFLOW_TOKEN")

    body = lines[sections["jobs"] + 1:]
    jobs = [m.group(1) for line in body if (m := JOB.fullmatch(line))]
    if not jobs or len(set(jobs)) != len(jobs):
        hold("MISSING_OR_DUPLICATE_JOBS")
    for line in body:
        code = line.lstrip()
        if not code or code.startswith("#"):
            continue
        if re.match(r"^\s{4}(?:permissions|environment|secrets|concurrency):\s*", line):
            hold("JOB_LEVEL_PRIVILEGE_OR_RELEASE_ENVIRONMENT")
        if "secrets." in code or "secrets[" in code:
            hold("UNREVIEWED_SECRET_ACCESS")
        if re.search(r"\buses:\s*\S+", code) and DEPLOY_ACTION.search(code):
            hold("RELEASE_OR_DEPLOY_ACTION")
        if RELEASE_CMD.search(code):
            hold("RELEASE_COMMAND_IN_RESEARCH_JOB")
    return {
        "status": "PASS_DECLARED_READ_ONLY_RESEARCH_WORKFLOWS_ONLY",
        "workflow": name,
        "sha256": hashlib.sha256(text.encode("utf-8")).hexdigest(),
        "triggers": sorted(events),
        "permissions": seen,
        "releaseAuthorized": False,
        "mayPublish": False,
        "humanApprovalGranted": False,
    }


def main():
    receipts = [inspect(name, (ROOT / name).read_text(encoding="utf-8"))
                for name in WORKFLOWS]
    print(json.dumps({"researchOnly": True, "releaseAuthorized": False,
                      "workflowReceipts": receipts}, indent=2))


if __name__ == "__main__":
    main()

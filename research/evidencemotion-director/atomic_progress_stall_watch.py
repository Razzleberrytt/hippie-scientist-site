#!/usr/bin/env python3
"""Read-only EvidenceMotion progress-plateau detector for validated atomic cards.

Only a separately validated current ledger can make a checkpoint. Two distinct
prior successful same-branch GitHub workflow artifacts can establish a plateau.
Missing history is UNKNOWN. This tool cannot add cards, sign off science or post.
"""
import argparse
import json
import os
import re
import subprocess
import tempfile
from pathlib import Path

from validate_atomic_proof_ledger import LEDGER, validate

SCHEMA = "ths-em-atomic-progress-stall-watch-v1"
ARTIFACT = "evidencemotion-atomic-progress-checkpoint"
# Existing *open* canonical work, routed to its source owner; this is a
# BLOCKER inventory, never a queue that awards earned atomic credit.
RECOVERY = (
    ("EM-007.07.X", 1, "EXTERNAL_QUALIFIED_REVIEW_NOT_RECEIVED",
     "Obtain a genuinely qualified or calibrated independent exact-film scientific review of spoken-001"),
    ("EM-008.02.X", 3, "BOTANICAL_BEFORE_AFTER_FILM_NOT_AUTHENTICATED",
     "Obtain before/after encoded botanical safety correction with real shot/frame provenance"),
    ("EM-007.07.T", 1, "DEPENDENT_ON_EM00707_X",
     "Validate a qualified actual-film review against original WAV and primary-source scope"),
    ("EM-008.01.T", 1, "BOTANICAL_ART_IN_SELECTED_FILM_NOT_VERIFIED",
     "Reconcile actual botanical frames with original H264, timestamps, and SHA-pinned source"),
)


def verified_checkpoint(path, repo, branch, run_id, head):
    if not (repo and branch and run_id and re.fullmatch(r"[a-f0-9]{40}", head)):
        raise ValueError("EXACT_CHECKPOINT_RUN_IDENTITY_REQUIRED")
    ledger = Path(path)
    proof = validate(json.loads(ledger.read_text(encoding="utf-8")), ledger.parent)
    return {"schema": SCHEMA, "repository": repo, "branch": branch,
            "runId": str(run_id), "headSha": head,
            "atomicCount": proof["provisionalCoverage"],
            "machineAudited": proof["individuallyAuditedMachineResearchOnly"],
            "inheritedProvisional": proof["inheritedProvisionalCoverageNotIndividuallyAudited"],
            "proofGroups": proof["evidenceGroupCount"], "denominator": 1590,
            "proofValidatorPassed": True, "mayPublish": False}


def trustworthy_previous(record, current):
    return (isinstance(record, dict) and record.get("schema") == SCHEMA and
            record.get("repository") == current["repository"] and
            record.get("branch") == current["branch"] and
            record.get("proofValidatorPassed") is True and
            record.get("mayPublish") is False and
            record.get("denominator") == 1590 and
            type(record.get("atomicCount")) is int and
            0 <= record["atomicCount"] <= 1590 and
            isinstance(record.get("runId"), str) and
            record["runId"] != current["runId"] and
            isinstance(record.get("headSha"), str) and
            re.fullmatch(r"[a-f0-9]{40}", record["headSha"]) is not None)


def decide(current, previous):
    if (current.get("schema") != SCHEMA or
        current.get("proofValidatorPassed") is not True or
        current.get("mayPublish") is not False or
        current.get("denominator") != 1590):
        raise ValueError("CURRENT_UNVERIFIED_NO_CREDIT_OR_STALL_DECISION")
    distinct = set()
    # Re-running the same source commit is one engineering checkpoint, not
    # independent evidence of a persistent source-progress plateau.
    distinct_heads = {current["headSha"]}
    records = []
    for rec in previous:  # newest to oldest; dedupe run AND source revision
        if (trustworthy_previous(rec, current) and rec["runId"] not in distinct
            and rec["headSha"] not in distinct_heads):
            records.append(rec)
            distinct.add(rec["runId"])
            distinct_heads.add(rec["headSha"])
            if len(records) == 2:
                break
    counts = [r["atomicCount"] for r in records]
    count = current["atomicCount"]
    if counts and count < counts[0]:
        status = "COUNT_REGRESSION_REQUIRES_RECONCILIATION"
    elif len(counts) < 2:
        status = "INSUFFICIENT_VERIFIED_HISTORY"
    elif count > counts[0]:
        status = "ADVANCING_VERIFIED"
    elif count == counts[0] == counts[1]:
        status = "STALLED_THREE_VERIFIED_CHECKPOINTS"
    else:
        status = "RECENT_PROGRESS_NOT_STALLED"
    stalled = status in ("STALLED_THREE_VERIFIED_CHECKPOINTS",
                         "COUNT_REGRESSION_REQUIRES_RECONCILIATION")
    return {"schema": SCHEMA, "status": status, "currentCount": count,
            "denominator": 1590, "previousCounts": counts,
            "verifiedHistoryLength": len(records), "requiresRecovery": stalled,
            "nextReadyUnclaimedCard": None,
            "namedBlockedRecoveryTargets": [
                {"atomicId": key, "lane": lane, "blocker": blocker, "nextAction": action}
                for key, lane, blocker, action in RECOVERY] if stalled else [],
            "recovery": "Use existing lane PR; repair exact blocker or advance another newly evidenced card; do not create filler credit",
            "newCardsCreditedByWatchdog": 0, "mayPublish": False,
            "approvalToMerge": False}


def authenticated_history_checkpoint(record, repo, branch, run, artifact_source, run_view):
    """Trust GitHub's completed successful proof workflow, not a downloaded
    checkpoint's self-declared PASS bit or caller-supplied run SHA alone.
    Failure, pending, wrong branch/head/workflow, and mismatched receipt HOLD.
    """
    head = run_view.get("headSha") if isinstance(run_view, dict) else None
    if (not isinstance(artifact_source, dict) or not isinstance(record, dict)
        or not isinstance(run_view, dict)
        or run_view.get("workflowName") != "EvidenceMotion atomic proof ledger gate"
        or run_view.get("status") != "completed"
        or run_view.get("conclusion") != "success"
        or run_view.get("headBranch") != branch
        or not isinstance(head, str)
        or re.fullmatch(r"[a-f0-9]{40}", head) is None
        or artifact_source.get("head_sha") != head
        or str(artifact_source.get("id")) != str(run)
        or record.get("repository") != repo
        or record.get("branch") != branch
        or record.get("runId") != str(run)
        or record.get("headSha") != head
        or record.get("schema") != SCHEMA
        or record.get("proofValidatorPassed") is not True
        or record.get("mayPublish") is not False):
        return False
    return True


def _gh(args):
    return subprocess.run(["gh", *args], check=True, capture_output=True,
                          timeout=45).stdout


def history_from_github(repo, branch, current_run):
    """Fetch two earlier distinct verified source revisions, not mere CI reruns."""
    if not os.environ.get("GH_TOKEN"):
        return [], "NO_GITHUB_READ_TOKEN"
    try:
        raw = _gh(["api", f"repos/{repo}/actions/artifacts?name={ARTIFACT}&per_page=100"])
        artifacts = json.loads(raw).get("artifacts", [])
        if not isinstance(artifacts, list):
            return [], "INVALID_ARTIFACT_INDEX"
        history = []
        seen = set()
        seen_source_heads = set()
        for a in sorted(artifacts, key=lambda x: x.get("created_at", ""), reverse=True):
            source = a.get("workflow_run") or {}
            run = str(source.get("id", ""))
            if (a.get("expired") or a.get("name") != ARTIFACT or
                source.get("head_branch") != branch or
                not run or run == str(current_run) or run in seen):
                continue
            seen.add(run)
            with tempfile.TemporaryDirectory() as tmp:
                try:
                    # A successful *workflow* is required; a prior artifact
                    # can be uploaded before later workflow steps fail.
                    run_view = json.loads(_gh([
                        "run", "view", run, "--repo", repo,
                        "--json", "workflowName,status,conclusion,headBranch,headSha"
                    ]))
                    if not (run_view.get("status") == "completed"
                            and run_view.get("conclusion") == "success"):
                        continue
                    # Separate reruns of one commit are not independent
                    # source revisions. Keep scanning for an earlier distinct
                    # verified source instead of stopping at two artifacts.
                    if run_view.get("headSha") in seen_source_heads:
                        continue
                    _gh(["run", "download", run, "--repo", repo,
                         "--name", ARTIFACT, "--dir", tmp])
                    record = json.loads((Path(tmp)/"snapshot.json").read_text())
                    if not authenticated_history_checkpoint(
                            record, repo, branch, run, source, run_view):
                        continue
                    history.append(record)
                    seen_source_heads.add(record["headSha"])
                except (subprocess.CalledProcessError, FileNotFoundError,
                        OSError, ValueError, TypeError, json.JSONDecodeError):
                    continue
            if len(history) >= 2:
                break
        return history, "OK" if len(history) >= 2 else "HISTORY_NOT_YET_ESTABLISHED"
    except (FileNotFoundError, OSError, subprocess.CalledProcessError,
            subprocess.TimeoutExpired, ValueError, TypeError):
        return [], "HISTORY_FETCH_FAILED_HOLD"


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--ledger", default=str(LEDGER))
    for flag in ("repo", "branch", "run-id", "head-sha", "snapshot-out", "report-out"):
        p.add_argument("--"+flag, required=True)
    p.add_argument("--read-gh-history", action="store_true")
    a = p.parse_args()
    current = verified_checkpoint(a.ledger, a.repo, a.branch,
                                  a.run_id, a.head_sha)
    previous, state = history_from_github(a.repo, a.branch, a.run_id) if a.read_gh_history else ([], "NOT_QUERIED")
    decision = decide(current, previous)
    decision["historyFetchStatus"] = state
    for name, obj in ((a.snapshot_out, current), (a.report_out, decision)):
        path = Path(name)
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(json.dumps(obj, indent=2, sort_keys=True)+"\n")
    print(json.dumps(decision, indent=2))
    return 0  # A plateau is an action/blocker signal, never fictitious test failure.


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""EvidenceMotion progress accounting: engineering merges are not atomic credit.

The snapshot is dated GitHub evidence, not a live REST result. Machine research
cards come exclusively from the separately validated exact-source proof ledger.
This report never edits the ledger, awards credits or authorizes publishing.
"""
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

from validate_atomic_proof_ledger import LEDGER, validate

HERE = Path(__file__).parent
OBSERVATION = HERE / "EM-PROGRESS-OBSERVATIONS-20261017.json"
SCHEMA = "ths-em-progress-observation-v1"
REPO = "Razzleberrytt/hippie-scientist-site"
LANES = tuple("lane" + str(i) for i in range(1, 6))
CATEGORIES = set(LANES) | {"integration", "ancillary_research", "daily_video_audit"}


def hold(reason):
    raise ValueError("PROGRESS_RECONCILIATION_HOLD:" + reason)


def reconcile(snapshot, audited, today_utc=None):
    if not isinstance(snapshot, dict) or snapshot.get("schema") != SCHEMA or snapshot.get("repository") != REPO:
        hold("UNKNOWN_SNAPSHOT_OR_REPOSITORY")
    date = snapshot.get("observedDate")
    stamp = snapshot.get("observedAtUtc")
    try:
        if not isinstance(date, str) or not isinstance(stamp, str):
            raise ValueError
        observed_date = datetime.strptime(date, "%Y-%m-%d").date()
        stamp_datetime = datetime.fromisoformat(stamp.replace("Z", "+00:00"))
        if stamp_datetime.tzinfo is None or stamp_datetime.astimezone(timezone.utc).date() != observed_date:
            raise ValueError
    except ValueError:
        hold("INVALID_DATED_OBSERVATION")
    if not isinstance(audited, dict) or audited.get("mayPublish") is not False:
        hold("ATOMIC_PROOF_NOT_VALIDATED_OR_RELEASE_GATE_TAMPER")
    machine = audited.get("individuallyAuditedMachineResearchOnly")
    inherited = audited.get("inheritedProvisionalCoverageNotIndividuallyAudited")
    coverage = audited.get("provisionalCoverage")
    if (type(machine) is not int or type(inherited) is not int
        or type(coverage) is not int or machine + inherited != coverage
        or audited.get("totalAtomicTemplates") != 1590
        or snapshot.get("baselineMachineAuditedResearchCards") != 168
        or snapshot.get("baselineInheritedProvisionalCards") != 707):
        hold("CREDIT_BASELINE_OR_LEDGER_ARITHMETIC_UNTRUSTED")
    merged = snapshot.get("mergedPRs")
    open_prs = snapshot.get("openPRs")
    if not isinstance(merged, list) or not isinstance(open_prs, list):
        hold("MISSING_MERGE_OR_OPEN_PR_INVENTORY")
    seen_pr = set()
    commits = set()
    lanes = {lane: 0 for lane in LANES}
    categories = {}
    for item in merged:
        if not isinstance(item, dict):
            hold("INVALID_MERGE_ROW")
        number, sha, lane, merged_at = (item.get("number"), item.get("mergeCommitSha"),
                                       item.get("lane"), item.get("mergedAt"))
        if (type(number) is not int or number in seen_pr or number <= 0
            or not isinstance(sha, str) or not re.fullmatch(r"[a-f0-9]{40}", sha)
            or lane not in CATEGORIES or not isinstance(merged_at, str)
            or not merged_at.startswith(date + "T")
            or item.get("url") != f"https://github.com/{REPO}/pull/{number}"):
            hold("DUPLICATE_UNVERIFIED_OR_WRONG_DATE_MERGE_ROW")
        seen_pr.add(number)
        commits.add(sha)
        categories[lane] = categories.get(lane, 0) + 1
        if lane in lanes:
            lanes[lane] += 1
    seen_open = set()
    for item in open_prs:
        if not isinstance(item, dict) or type(item.get("number")) is not int:
            hold("INVALID_OPEN_PR_OBSERVATION")
        n = item["number"]
        if n in seen_pr or n in seen_open or item.get("url") != f"https://github.com/{REPO}/pull/{n}":
            hold("MERGED_PR_RELISTED_AS_OPEN_OR_DUPLICATE")
        seen_open.add(n)
    if today_utc is None:
        today_utc = datetime.now(timezone.utc).date()
    if isinstance(today_utc, str):
        today_utc = datetime.strptime(today_utc, "%Y-%m-%d").date()
    freshness = "DATED_CURRENT_OBSERVATION" if today_utc == observed_date else "HISTORICAL_SNAPSHOT_NOT_LIVE"
    if machine < 168:
        status = "MACHINE_CARD_REGRESSION_REQUIRES_AUDIT"
    elif machine == 168 and merged:
        status = "MERGED_ENGINEERING_WITH_UNRECONCILED_CREDIT"
    else:
        status = "CARD_CREDIT_ADVANCED_VERIFY_EACH_NEW_SOURCE"
    return {
        "schema": "ths-em-progress-reconciliation-result-v1",
        "observationDate": date,
        "freshness": freshness,
        "engineeringMergedPRs": len(merged),
        "distinctMergeCommits": len(commits),
        "duplicateMergeCommitAppearances": len(merged) - len(commits),
        "mergedFiveLanePRs": lanes,
        "mergedOtherCategories": {k: v for k, v in sorted(categories.items()) if k not in lanes},
        "openPRsAtObservationOnly": len(open_prs),
        "machineAuditedCards": machine,
        "inheritedProvisionalNotIndividuallyAudited": inherited,
        "provisionalCoverageCards": coverage,
        "totalPlanningCards": 1590,
        "newCardsAwardedByThisReport": 0,
        "status": status,
        "nextStep": "Map only previously uncredited canonical IDs to exact original evidence, then update ledger and independent validator tests.",
        "excellentFirstRenderApproved": False,
        "fiveFirstRenderStreakApproved": False,
        "mayPublish": False,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--observation", type=Path, default=OBSERVATION)
    parser.add_argument("--ledger", type=Path, default=LEDGER)
    args = parser.parse_args()
    audited = validate(json.loads(args.ledger.read_text(encoding="utf-8")), args.ledger.parent)
    snapshot = json.loads(args.observation.read_text(encoding="utf-8"))
    print(json.dumps(reconcile(snapshot, audited), indent=2, sort_keys=True))


if __name__ == "__main__":
    main()

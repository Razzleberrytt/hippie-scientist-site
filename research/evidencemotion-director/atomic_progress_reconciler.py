#!/usr/bin/env python3
"""EvidenceMotion progress readout: evidence credit != merged engineering events.

Never grants video release, independent reviewer, human, handset or science
approval. A dated GitHub observation must never masquerade as current live data.
"""
import argparse
import json
import re
from datetime import datetime, timezone
from collections import Counter, defaultdict
from pathlib import Path
from validate_atomic_proof_ledger import LEDGER, validate

DIRECTORY=Path(__file__).parent
DEFAULT_OBSERVATION=DIRECTORY/"EM-PROGRESS-OBSERVATIONS-20261017.json"
LANES={
    "lane1": (1, 8), "lane2": (9, 17), "lane3": (18, 28),
    "lane4": (29, 37), "lane5": (38, 46),
}
SCHEMA="ths-em-progress-observation-v1"
SHA=re.compile(r"^[0-9a-f]{40}$")


def reconcile(ledger_data, source_directory, observation):
    audited=validate(ledger_data,source_directory)
    if not isinstance(observation,dict) or observation.get("schema")!=SCHEMA:
        raise ValueError("PROGRESS_HOLD:BAD_OBSERVATION_SCHEMA")
    if (not re.fullmatch(r"20\d{2}-\d{2}-\d{2}",str(observation.get("observedDate","")))
        or observation.get("repository")!="Razzleberrytt/hippie-scientist-site"
        or not isinstance(observation.get("mergedPRs"),list)
        or not isinstance(observation.get("openPRs"),list)):
        raise ValueError("PROGRESS_HOLD:BAD_OBSERVATION_SCOPE")
    observed_at=observation.get("observedAtUtc")
    try:
        when=datetime.fromisoformat(observed_at.replace("Z","+00:00"))
        if when.tzinfo is None or when.astimezone(timezone.utc).date().isoformat()!=observation["observedDate"]:
            raise ValueError("date conflict")
    except (ValueError,AttributeError,TypeError):
        raise ValueError("PROGRESS_HOLD:OBSERVATION_TIMESTAMP_NOT_SOURCE_BOUND")
    window_start=observation.get("mergedWindowStart",observation["observedDate"])
    if (not re.fullmatch(r"20\d{2}-\d{2}-\d{2}",str(window_start))
        or window_start>observation["observedDate"]):
        raise ValueError("PROGRESS_HOLD:INVALID_MERGE_WINDOW")
    merged=observation["mergedPRs"]
    numbers=set()
    commits=defaultdict(list)
    lane_merge_counts=Counter({k:0 for k in LANES})
    special=Counter()
    for item in merged:
        if not isinstance(item,dict) or type(item.get("number")) is not int or item["number"]<=0:
            raise ValueError("PROGRESS_HOLD:INVALID_PR_RECORD")
        n=item["number"]
        if n in numbers:
            raise ValueError("PROGRESS_HOLD:DUPLICATE_PR")
        numbers.add(n)
        title,sha,stamp=item.get("title"),item.get("mergeCommitSha"),item.get("mergedAt")
        if (not isinstance(title,str) or not title or not isinstance(sha,str)
            or not SHA.fullmatch(sha) or not isinstance(stamp,str)
            or not (window_start<=stamp[:10]<=observation["observedDate"])
            or item.get("url")!=f"https://github.com/Razzleberrytt/hippie-scientist-site/pull/{n}"
            or not any(token in title.lower() for token in ("evidencemotion", "gut-absorption"))):
            raise ValueError("PROGRESS_HOLD:MERGE_SOURCE_OR_DAY_MISMATCH")
        lane=item.get("lane")
        if lane in LANES:
            lane_merge_counts[lane]+=1
        elif lane in ("integration","daily_video_audit","ancillary_research"):
            special[lane]+=1
        else:
            raise ValueError("PROGRESS_HOLD:UNKNOWN_LANE_OR_SCOPE")
        commits[sha].append(n)
    open_numbers=set()
    for item in observation["openPRs"]:
        if (not isinstance(item,dict) or type(item.get("number")) is not int
            or item["number"]<=0 or item["number"] in open_numbers
            or item["number"] in numbers
            or item.get("state")!="OPEN_AT_OBSERVATION_ONLY"
            or item.get("url")!=f"https://github.com/Razzleberrytt/hippie-scientist-site/pull/{item['number']}"):
            raise ValueError("PROGRESS_HOLD:INCONSISTENT_OPEN_PR_SNAPSHOT")
        open_numbers.add(item["number"])
    if observation.get("baselineMachineAuditedResearchCards")!=168 or observation.get("baselineInheritedProvisionalCards")!=707:
        raise ValueError("PROGRESS_HOLD:BAD_BASELINE_IDENTITY")
    distribution=Counter({k:0 for k in LANES})
    for card in audited["individualResearchCardIDs"]:
        parent=int(card[3:6])
        matched=[lane for lane,(start,end) in LANES.items() if start<=parent<=end]
        if len(matched)!=1:
            raise ValueError("PROGRESS_HOLD:UNKNOWN_CANONICAL_PARENT")
        distribution[matched[0]]+=1
    individually=audited["individuallyAuditedMachineResearchOnly"]
    baseline=observation["baselineMachineAuditedResearchCards"]
    delta=individually-baseline
    # An unchanged proof count despite merged PRs is an audit work queue, not
    # proof that all merged PRs are eligible for further card credit.
    state=("NEEDS_CARD_RECONCILIATION" if merged and delta==0
           else "PROOF_COUNT_CHANGED_REVIEW_DELTA" if delta!=0 else "NO_MERGES_IN_OBSERVATION")
    result={
        "schema":"ths-em-progress-reconciliation-v1",
        "sourceObservationDate":observation["observedDate"],
        "sourceObservationAtUtc":observation.get("observedAtUtc"),
        "sourceMode":("LIVE_GITHUB_API_CHECKED" if observation.get("source")=="LIVE_GITHUB_API_VERIFIED" else "DATED_VERIFIED_SNAPSHOT_NOT_LIVE"),
        "mergeWindowStart":window_start,
        "freshness":("DATED_CURRENT_OBSERVATION" if
                     datetime.now(timezone.utc).date().isoformat()==observation["observedDate"]
                     else "HISTORICAL_SNAPSHOT_NOT_LIVE"),
        "mergedPRs":len(merged),
        "distinctMergeCommits":len(commits),
        "sharedIntegrationCommits":[{"sha":sha,"prs":sorted(ids)} for sha,ids in sorted(commits.items()) if len(ids)>1],
        "fiveActiveLanesMergedPRs":sum(lane_merge_counts.values()),
        "perLaneMergedPRs":dict(lane_merge_counts),
        "nonLanePRs":dict(special),
        "openPRsAtObservation":len(open_numbers),
        "proofGroups":audited["evidenceGroupCount"],
        "individualMachineVerifiedResearchCards":individually,
        "individualVerifiedByLane":dict(distribution),
        "inheritedProvisionalNOTIndividuallyAudited":audited["inheritedProvisionalCoverageNotIndividuallyAudited"],
        "provisionalCoverageOnly":audited["provisionalCoverage"],
        "notEvenProvisionallyMapped":1590-audited["provisionalCoverage"],
        "totalTemplates":1590,
        "newIndividualResearchCreditsSinceBaseline":delta,
        "reconciliationState":state,
        "nextAccountingAction":"Map fresh exact-source accepted evidence to a previously uncredited canonical card; avoid existing groups and human/device approval claims.",
        "acceptedResearchFoundations":26,
        "totalFoundations":46,
        "excellentFirstRender":{"accepted":0,"required":1},
        "variedExcellentFirstRenderStreak":{"accepted":0,"required":5},
        "actualExternalHumanScienceDeviceAndReleaseApprovals":"UNKNOWN_OR_HOLD",
        "mayPublish":False,
        "verifiedEngineeringMergesAreNotCardCredit":True,
    }
    if sum(result["individualVerifiedByLane"].values())!=individually:
        raise ValueError("PROGRESS_HOLD:LANE_DISTRIBUTION_MISMATCH")
    return result


def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--observation",type=Path,default=DEFAULT_OBSERVATION)
    p.add_argument("--out",type=Path)
    a=p.parse_args()
    ledger=json.loads(LEDGER.read_text(encoding="utf-8"))
    observation=json.loads(a.observation.read_text(encoding="utf-8"))
    report=reconcile(ledger,LEDGER.parent,observation)
    output=json.dumps(report,indent=2,sort_keys=True)+"\n"
    if a.out:
        a.out.write_text(output,encoding="utf-8")
    print(output,end="")


if __name__=="__main__":
    main()

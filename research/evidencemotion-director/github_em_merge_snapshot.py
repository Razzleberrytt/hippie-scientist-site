#!/usr/bin/env python3
"""Read actual GitHub merged PRs; NEVER assign atomic credit from merge events.

For hosted checks with GH_TOKEN. Fails on incomplete API searches; never
silently substitutes a stale local observation for a broken live lookup.
"""
import argparse
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from atomic_progress_reconciler import reconcile
from validate_atomic_proof_ledger import LEDGER

REPO="Razzleberrytt/hippie-scientist-site"
START="2026-10-17"
API="https://api.github.com"
CATEGORIES={"lane1","lane2","lane3","lane4","lane5",
            "integration","ancillary_research","daily_video_audit"}


def category(title):
    title=title.lower()
    lane=re.search(r"lane[\s-]*(\d+)",title)
    if lane:
        return ("lane"+lane.group(1)) if 1<=int(lane.group(1))<=5 else "ancillary_research"
    if "gut-absorption" in title or "gut absorption v9" in title:
        return "daily_video_audit"
    return "integration"


def request_json(url, token):
    headers={"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28",
             "Authorization":"Bearer "+token,"User-Agent":"ths-evidencemotion-progress"}
    with urlopen(Request(url,headers=headers),timeout=25) as r:
        return json.load(r)


def search_all(query, token, fetch=request_json):
    collected=[]
    for page in range(1,11):
        q=urlencode({"q":query,"per_page":100,"page":page})
        result=fetch(API+"/search/issues?"+q,token)
        total=result.get("total_count")
        items=result.get("items")
        if not isinstance(total,int) or not isinstance(items,list) or total>1000:
            raise ValueError("PROGRESS_LIVE_HOLD:UNBOUNDED_OR_INVALID_GITHUB_SEARCH")
        collected.extend(items)
        if len(collected)>=total:
            if len(collected)!=total:
                raise ValueError("PROGRESS_LIVE_HOLD:OVERLAPPING_SEARCH_PAGES")
            return collected
        if not items:
            raise ValueError("PROGRESS_LIVE_HOLD:INCOMPLETE_GITHUB_SEARCH_PAGE")
    raise ValueError("PROGRESS_LIVE_HOLD:INCOMPLETE_GITHUB_SEARCH")


def live_observation(token,now=None,start=START,fetch=request_json):
    if not token:
        raise ValueError("PROGRESS_LIVE_HOLD:EXPLICIT_GITHUB_TOKEN_REQUIRED")
    now=now or datetime.now(timezone.utc)
    today=now.astimezone(timezone.utc).date().isoformat()
    if not re.fullmatch(r"20\d{2}-\d{2}-\d{2}",start) or start>today:
        raise ValueError("PROGRESS_LIVE_HOLD:INVALID_START_DATE")
    issues=search_all(f"repo:{REPO} is:pr is:merged merged:>={start}",token,fetch)
    merged=[]
    for item in issues:
        title=item.get("title","")
        if not isinstance(title,str) or not ("evidencemotion" in title.lower() or "gut-absorption" in title.lower()):
            continue
        n=item.get("number")
        if type(n) is not int or n<=0:
            raise ValueError("PROGRESS_LIVE_HOLD:INVALID_PR_NUMBER")
        pr=fetch(f"{API}/repos/{REPO}/pulls/{n}",token)
        sha=pr.get("merge_commit_sha")
        timestamp=pr.get("merged_at")
        if (pr.get("number")!=n or not isinstance(timestamp,str) or
            not isinstance(sha,str) or not re.fullmatch(r"[0-9a-f]{40}",sha)):
            raise ValueError("PROGRESS_LIVE_HOLD:MISSING_INDEPENDENT_MERGE_DETAIL")
        if not start<=timestamp[:10]<=today:
            raise ValueError("PROGRESS_LIVE_HOLD:MERGE_OUTSIDE_PERIOD")
        merged.append({"number":n,"title":title,"mergedAt":timestamp,
            "mergeCommitSha":sha,"lane":category(title),
            "url":f"https://github.com/{REPO}/pull/{n}"})
    open_rows=search_all(f"repo:{REPO} is:pr is:open EvidenceMotion",token,fetch)
    open_prs=[]
    for item in open_rows:
        n=item.get("number")
        if type(n) is not int or n<=0 or not isinstance(item.get("title"),str):
            raise ValueError("PROGRESS_LIVE_HOLD:INVALID_OPEN_PR")
        open_prs.append({"number":n,"title":item["title"],"lane":category(item["title"]),
                        "state":"OPEN_AT_OBSERVATION_ONLY",
                        "url":f"https://github.com/{REPO}/pull/{n}"})
    return {"schema":"ths-em-progress-observation-v1",
        "source":"LIVE_GITHUB_API_VERIFIED","repository":REPO,
        "observedDate":today,"mergedWindowStart":start,
        "observedAtUtc":now.astimezone(timezone.utc).isoformat(),
        "baselineMachineAuditedResearchCards":168,
        "baselineInheritedProvisionalCards":707,
        "mergedPRs":merged,"openPRs":open_prs,
        "limits":["Live API at stated instant; future merges are not included.",
                "Merged PRs are NOT research card credits; duplicate commit SHAs deduplicate.",
                "GitHub Search indexing can lag immediately after a merge; rerun if source incomplete.",
                "Physical phone, independent science, human creative review and publishing remain HOLD."]}


def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--start",default=START)
    ap.add_argument("--out",type=Path)
    ap.add_argument("--snapshot-out",type=Path)
    a=ap.parse_args()
    snapshot=live_observation(os.environ.get("GH_TOKEN",""),start=a.start)
    if a.snapshot_out:
        a.snapshot_out.write_text(json.dumps(snapshot,indent=2)+"\n",encoding="utf-8")
    ledger=json.loads(LEDGER.read_text(encoding="utf-8"))
    report=reconcile(ledger,LEDGER.parent,snapshot)
    if a.out:
        a.out.write_text(json.dumps(report,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report,indent=2))


if __name__=="__main__":
    main()

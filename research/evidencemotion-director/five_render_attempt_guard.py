#!/usr/bin/env python3
"""Fail-closed research attempt integrity: EM-038.06 and EM-044.06–07.

Declared positive verdicts are not authenticated scientific, viewer, craft,
handset or production evidence. This module cannot grant acceptance.
"""
import argparse
import hashlib
import json
import re
from pathlib import Path

SCHEMA = "ths-em-five-render-first-attempt-register-v1"
HEX64 = re.compile(r"^[a-f0-9]{64}$")
ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{1,95}$")
DECISIONS = frozenset(("PASS", "FAIL", "HOLD"))


def hold(msg):
    raise ValueError("EM_STREAK_RESEARCH_HOLD:" + msg)


def verify(register):
    if not isinstance(register, dict) or register.get("schema") != SCHEMA:
        hold("UNKNOWN_REGISTER_SCHEMA")
    if register.get("mayPublish") is not False:
        hold("PUBLICATION_NOT_AUTHORIZED")
    if register.get("claimedAcceptedStreak", 0) != 0:
        hold("SELF_APPROVED_STREAK_FORBIDDEN")
    attempts = register.get("attempts")
    if not isinstance(attempts, list):
        hold("APPEND_ONLY_ATTEMPTS_REQUIRED")
    seen_runs, seen_films, ordinal_for = set(), set(), {}
    evaluated, streak, max_streak, revisions = [], 0, 0, 0
    for index, item in enumerate(attempts):
        if not isinstance(item, dict):
            hold("MALFORMED_ATTEMPT:" + str(index))
        run, subject = item.get("runId"), item.get("subjectId")
        if (not isinstance(run, str) or not ID.fullmatch(run)
                or not isinstance(subject, str) or not ID.fullmatch(subject)):
            hold("RUN_OR_SUBJECT_ID_REQUIRED:" + str(index))
        if run in seen_runs:
            hold("DUPLICATE_RUN_ID:" + run)
        seen_runs.add(run)
        film, source = item.get("filmSha256"), item.get("sourceSha256")
        if (not isinstance(film, str) or not HEX64.fullmatch(film)
                or not isinstance(source, str) or not HEX64.fullmatch(source)):
            hold("IMMUTABLE_SOURCE_AND_FILM_SHA_REQUIRED:" + run)
        if film in seen_films:
            hold("DUPLICATE_FILM_BYTES_CANNOT_BE_NEW_ATTEMPT:" + run)
        seen_films.add(film)
        ordinal = item.get("renderOrdinal")
        if type(ordinal) is not int or ordinal < 1:
            hold("INVALID_RENDER_ORDINAL:" + run)
        expected = ordinal_for.get(subject, 0) + 1
        if ordinal != expected:
            hold("GAPPED_OR_REORDERED_SUBJECT_ATTEMPTS:" + run)
        ordinal_for[subject] = ordinal
        if type(item.get("firstFinal")) is not bool or item["firstFinal"] != (ordinal == 1):
            hold("REVISED_RENDER_DISGUISED_AS_FIRST:" + run)
        outcome = item.get("declaredDecision")
        if not isinstance(outcome, str) or outcome not in DECISIONS:
            hold("UNKNOWN_DECLARED_DECISION:" + run)
        # A streak is *consecutive attempts*, not consecutive eligible rows.
        # A revised/rerendered film interrupts the streak even if declared PASS:
        # skipping it would silently bridge first renders on both sides.
        # Declared PASSes are not authenticated science/craft release approvals.
        previous_streak = streak
        if ordinal != 1:
            revisions += 1
            eligible = False
            streak = 0
            break_reason = "REVISION_NOT_FIRST_RENDER"
        else:
            eligible = outcome == "PASS"
            streak = streak + 1 if eligible else 0
            break_reason = None if eligible else "DECLARED_" + outcome
            max_streak = max(max_streak, streak)
        evaluated.append({"runId": run, "subjectId": subject,
                          "renderOrdinal": ordinal, "firstFinal": ordinal == 1,
                          "declaredDecision": outcome, "declaredEligible": eligible,
                          "declaredStreakBeforeEvent": previous_streak,
                          "declaredStreakAfterEvent": streak,
                          "streakBreakReason": break_reason,
                          "independentlyApproved": False})
    return {"schema": "ths-em-five-render-integrity-report-v1",
            "registeredAttempts": len(evaluated),
            "registeredDistinctSubjects": len(ordinal_for),
            "registeredRevisionsExcluded": revisions,
            "provisionalDeclaredConsecutiveFirstPasses": streak,
            "provisionalMaxDeclaredFirstPasses": max_streak,
            "lastFiveFirstAttemptsDeclaredPass": streak >= 5,
            "allHistoricalAttemptsProvenPresent": False,
            "independentScienceVoiceCraftHandsetAudienceAndVarietyVerified": False,
            "firstExcellentMasterAccepted": False,
            "fiveRenderMilestoneAccepted": False,
            "authorizedPromotion": False, "mayPublish": False,
            "status": "RESEARCH_INTEGRITY_ONLY_NO_STREAK_APPROVAL",
            "attempts": evaluated}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    path = Path(args.register)
    if not path.is_file() or path.is_symlink():
        hold("REGISTRY_FILE_REQUIRED")
    report = verify(json.loads(path.read_text(encoding="utf-8")))
    dest = Path(args.out)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(report["status"])


if __name__ == "__main__":
    main()

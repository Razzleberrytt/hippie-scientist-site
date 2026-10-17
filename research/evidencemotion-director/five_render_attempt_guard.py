#!/usr/bin/env python3
"""Fail-closed research attempt integrity: EM-038.06 and EM-044.06–07.

Declared positive verdicts are not authenticated scientific, viewer, craft,
handset or production evidence. This module cannot grant acceptance.
"""
import argparse
import hashlib
import json
import math
import os
import re
import tempfile
from pathlib import Path

SCHEMA = "ths-em-five-render-first-attempt-register-v1"
HEX64 = re.compile(r"^[a-f0-9]{64}$")
ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{1,95}$")
DECISIONS = frozenset(("PASS", "FAIL", "HOLD"))

REGISTER_FIELDS = frozenset(("schema", "mayPublish", "claimedAcceptedStreak", "attempts"))
ATTEMPT_FIELDS = frozenset((
    "runId", "subjectId", "renderOrdinal", "firstFinal", "sourceSha256",
    "filmSha256", "declaredDecision",
))



def hold(msg):
    raise ValueError("EM_STREAK_RESEARCH_HOLD:" + msg)


def verify(register):
    if not isinstance(register, dict) or register.get("schema") != SCHEMA:
        hold("UNKNOWN_REGISTER_SCHEMA")
    if register.get("mayPublish") is not False:
        hold("PUBLICATION_NOT_AUTHORIZED")
    if type(register.get("claimedAcceptedStreak")) is not int or register["claimedAcceptedStreak"] != 0:
        hold("SELF_APPROVED_STREAK_FORBIDDEN")
    if set(register) != REGISTER_FIELDS:
        hold("UNRECOGNIZED_REGISTER_FIELDS")
    attempts = register.get("attempts")
    if not isinstance(attempts, list):
        hold("APPEND_ONLY_ATTEMPTS_REQUIRED")
    seen_runs, seen_films, ordinal_for = set(), set(), {}
    evaluated, streak, max_streak, revisions = [], 0, 0, 0
    for index, item in enumerate(attempts):
        if not isinstance(item, dict):
            hold("MALFORMED_ATTEMPT:" + str(index))
        if set(item) != ATTEMPT_FIELDS:
            hold("UNRECOGNIZED_ATTEMPT_FIELDS:" + str(index))
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



def _no_duplicate_keys(pairs):
    obj = {}
    for key, value in pairs:
        if key in obj:
            hold("DUPLICATED_JSON_FIELD:" + key)
        obj[key] = value
    return obj


def _reject_invalid_number(value):
    hold("INVALID_NONFINITE_JSON_NUMBER:" + str(value))


def _all_numbers_finite(value):
    if isinstance(value, float):
        if not math.isfinite(value):
            hold("NONFINITE_REGISTER_NUMBER")
    elif isinstance(value, dict):
        for v in value.values():
            _all_numbers_finite(v)
    elif isinstance(value, list):
        for v in value:
            _all_numbers_finite(v)


def _has_symlinked_parent(path):
    """Refuse indirect folder aliases, not just a symlink at the last parent."""
    ancestor = Path(os.path.abspath(os.fspath(path))).parent
    while True:
        if ancestor.is_symlink():
            return True
        if ancestor == ancestor.parent:
            return False
        ancestor = ancestor.parent


def read_register(path, *, required_sha=None):
    """A non-symlink JSON file with identity anchored outside its own contents."""
    file = Path(path)
    if (not file.is_file() or file.is_symlink() or _has_symlinked_parent(file)
            or file.stat().st_size == 0 or file.stat().st_size > 2_000_000):
        hold("REGISTER_FILE_MISSING_OR_UNSAFE")
    raw = file.read_bytes()
    digest = hashlib.sha256(raw).hexdigest()
    if required_sha is not None:
        if not isinstance(required_sha, str) or not HEX64.fullmatch(required_sha):
            hold("EXTERNAL_PREVIOUS_REGISTER_SHA_REQUIRED")
        if digest != required_sha:
            hold("PREVIOUS_REGISTER_BYTES_CHANGED")
    try:
        content = json.loads(raw.decode("utf-8"), object_pairs_hook=_no_duplicate_keys,
                             parse_constant=_reject_invalid_number)
    except (UnicodeError, ValueError) as exc:
        hold("MALFORMED_REGISTER_JSON:" + str(exc))
    _all_numbers_finite(content)
    verify(content)
    return content, digest


def verify_append_only(current, previous, previous_sha):
    """One anchored prior ledger protects failures/revisions from retroactive deletion.

    This is *continuity to an externally pinned snapshot*, not a historical
    completeness audit. Someone could have omitted attempts before that first
    externally trusted snapshot, so the authoritative streak stays unapproved.
    """
    verify(previous)
    report = verify(current)
    if not isinstance(previous_sha, str) or not HEX64.fullmatch(previous_sha):
        hold("EXTERNAL_PREVIOUS_REGISTER_SHA_REQUIRED")
    old = previous["attempts"]
    new = current["attempts"]
    # Detect missing/altered historical rows before comparing event counts.
    # Equal-length attempts with one removed and another substituted must
    # report rewritten history, not merely "nothing appended".
    if len(new) < len(old) or new[:len(old)] != old:
        hold("PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED")
    if len(new) == len(old):
        hold("NO_NEW_APPEND_ONLY_ATTEMPT")
    report.update({
        "appendOnlyAgainstPinnedPrior": True,
        "externalPreviousRegisterSha256": previous_sha,
        "previousRegisteredAttempts": len(old),
        "newAppendedAttemptCount": len(new) - len(old),
        "newAppendedRunIds": [a["runId"] for a in new[len(old):]],
        "allHistoricalAttemptsProvenPresent": False,
        "independentScienceVoiceCraftHandsetAudienceAndVarietyVerified": False,
        "firstExcellentMasterAccepted": False,
        "fiveRenderMilestoneAccepted": False,
        "authorizedPromotion": False,
        "mayPublish": False,
    })
    return report


def write_report_no_clobber(path, report):
    """Do not overwrite an older research report or follow a final-file alias."""
    output = Path(path)
    if (not output.parent.is_dir() or _has_symlinked_parent(output)
            or output.exists() or output.is_symlink()):
        hold("REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE")
    blob = (json.dumps(report, indent=2, allow_nan=False) + "\n").encode("utf-8")
    staged = None
    try:
        with tempfile.NamedTemporaryFile(dir=output.parent, prefix=".em-streak-",
                                         suffix=".tmp", delete=False) as f:
            staged = Path(f.name)
            f.write(blob)
            f.flush()
            os.fsync(f.fileno())
        if hashlib.sha256(staged.read_bytes()).digest() != hashlib.sha256(blob).digest():
            hold("STAGED_REPORT_HASH_MISMATCH")
        try:
            os.link(staged, output)
        except FileExistsError:
            hold("REPORT_ALREADY_EXISTS")
    finally:
        if staged is not None:
            staged.unlink(missing_ok=True)
    return output


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--register", required=True)
    parser.add_argument("--previous-register")
    parser.add_argument("--previous-sha")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    if bool(args.previous_register) != bool(args.previous_sha):
        hold("PREVIOUS_REGISTER_AND_EXTERNAL_SHA_REQUIRED_TOGETHER")
    current, _ = read_register(args.register)
    if args.previous_register:
        previous, pinned_sha = read_register(
            args.previous_register, required_sha=args.previous_sha)
        report = verify_append_only(current, previous, pinned_sha)
    else:
        report = verify(current)
    write_report_no_clobber(args.out, report)
    print(report["status"])


if __name__ == "__main__":
    main()

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
import stat
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
    candidate = Path(path)
    # Keep literal ".." components: abspath/normpath can erase a traversed
    # symlink before we check the path that the filesystem will actually walk.
    ancestor = (candidate if candidate.is_absolute() else Path.cwd() / candidate).parent
    while True:
        if ancestor.is_symlink():
            return True
        if ancestor == ancestor.parent:
            return False
        ancestor = ancestor.parent


def _read_stable_register_bytes(file):
    """Bound the physical read and reject files replaced after path preflight.

    Both the opened descriptor and the final directory entry must match the
    preflight identity. O_NOFOLLOW independently rejects late symlink swaps on
    platforms that support it. This is a local file-integrity check, not proof
    that the first historical attempt was ever registered.
    """
    if _has_symlinked_parent(file):
        hold("REGISTER_FILE_MISSING_OR_UNSAFE")
    try:
        before = os.stat(file, follow_symlinks=False)
        if not stat.S_ISREG(before.st_mode) or not 0 < before.st_size <= 2_000_000:
            hold("REGISTER_FILE_MISSING_OR_UNSAFE")
        flags = os.O_RDONLY | getattr(os, "O_BINARY", 0) | getattr(os, "O_NOFOLLOW", 0)
        fd = os.open(file, flags)
        try:
            opened = os.fstat(fd)
            if (not stat.S_ISREG(opened.st_mode)
                    or (opened.st_dev, opened.st_ino) != (before.st_dev, before.st_ino)):
                hold("REGISTER_FILE_MISSING_OR_UNSAFE")
            # Dup keeps the original descriptor available for post-read fstat;
            # read at most the configured limit plus one detection byte.
            with os.fdopen(os.dup(fd), "rb") as stream:
                raw = stream.read(2_000_001)
                # A same-length in-place edit may evade coarse timestamp checks
                # (including restored mtime). Re-read on the SAME open file
                # descriptor rather than trusting the path or file metadata.
                # This checks mid-read stability, not atomic disk snapshots.
                stream.seek(0)
                if raw != stream.read(2_000_001):
                    hold("REGISTER_BYTES_CHANGED_DURING_READ")
            finished = os.fstat(fd)
        finally:
            os.close(fd)
        after = os.stat(file, follow_symlinks=False)
    except OSError:
        hold("REGISTER_FILE_MISSING_OR_UNSAFE")
    # Windows may expose creation time for stat(path).st_ctime_ns and
    # metadata-change time for fstat(fd).st_ctime_ns. Compare stability
    # within each stat surface, not an unrelated path-vs-descriptor clock.
    # Still require the opened object and final path to have the same
    # physical identity, and require two identical bounded descriptor reads.
    path_metadata = (before.st_dev, before.st_ino, before.st_size,
                     before.st_mtime_ns, before.st_ctime_ns)
    final_path_metadata = (after.st_dev, after.st_ino, after.st_size,
                           after.st_mtime_ns, after.st_ctime_ns)
    descriptor_metadata = (opened.st_dev, opened.st_ino, opened.st_size,
                           opened.st_mtime_ns, opened.st_ctime_ns)
    final_descriptor_metadata = (finished.st_dev, finished.st_ino,
                                 finished.st_size, finished.st_mtime_ns,
                                 finished.st_ctime_ns)
    if (_has_symlinked_parent(file)
            or not stat.S_ISREG(after.st_mode)
            or not stat.S_ISREG(finished.st_mode)
            or len(raw) == 0 or len(raw) > 2_000_000
            or path_metadata != final_path_metadata
            or descriptor_metadata != final_descriptor_metadata
            or (opened.st_dev, opened.st_ino, opened.st_size, opened.st_mtime_ns)
               != (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns)
            or len(raw) != before.st_size):
        hold("REGISTER_FILE_MISSING_OR_UNSAFE")
    return raw


def read_register(path, *, required_sha=None):
    """Read exact bounded file bytes before externally checking prior SHA."""
    file = Path(path)
    raw = _read_stable_register_bytes(file)
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


RESEARCH_REPORT_FIELDS = frozenset((
    "schema", "status", "registeredAttempts", "registeredDistinctSubjects",
    "registeredRevisionsExcluded", "provisionalDeclaredConsecutiveFirstPasses",
    "provisionalMaxDeclaredFirstPasses", "lastFiveFirstAttemptsDeclaredPass",
    "allHistoricalAttemptsProvenPresent",
    "independentScienceVoiceCraftHandsetAudienceAndVarietyVerified",
    "firstExcellentMasterAccepted", "fiveRenderMilestoneAccepted",
    "authorizedPromotion", "mayPublish", "attempts",
))
RESEARCH_APPEND_FIELDS = frozenset((
    "appendOnlyAgainstPinnedPrior", "externalPreviousRegisterSha256",
    "previousRegisteredAttempts", "newAppendedAttemptCount",
    "newAppendedRunIds",
))
RESEARCH_ATTEMPT_FIELDS = frozenset((
    "runId", "subjectId", "renderOrdinal", "firstFinal",
    "declaredDecision", "declaredEligible", "declaredStreakBeforeEvent",
    "declaredStreakAfterEvent", "streakBreakReason",
    "independentlyApproved",
))
RESEARCH_WITHHELD_APPROVALS = frozenset((
    "allHistoricalAttemptsProvenPresent",
    "independentScienceVoiceCraftHandsetAudienceAndVarietyVerified",
    "firstExcellentMasterAccepted", "fiveRenderMilestoneAccepted",
    "authorizedPromotion", "mayPublish",
))


def validate_report_for_write(report):
    """Never persist arbitrary approval claims as our guarded streak report.

    This enforces report structure and withheld authority; it does not
    authenticate an input run, independent review, or a historical attempt.
    """
    if (not isinstance(report, dict)
            or set(report) not in (RESEARCH_REPORT_FIELDS,
                                   RESEARCH_REPORT_FIELDS | RESEARCH_APPEND_FIELDS)
            or report.get("schema") != "ths-em-five-render-integrity-report-v1"
            or report.get("status") != "RESEARCH_INTEGRITY_ONLY_NO_STREAK_APPROVAL"
            or any(report.get(key) is not False for key in RESEARCH_WITHHELD_APPROVALS)):
        hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    entries = report.get("attempts")
    if not isinstance(entries, list):
        hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    for item in entries:
        if (not isinstance(item, dict)
                or set(item) != RESEARCH_ATTEMPT_FIELDS
                or item.get("independentlyApproved") is not False):
            hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    total = len(entries)
    for key in ("registeredAttempts", "registeredDistinctSubjects",
                "registeredRevisionsExcluded",
                "provisionalDeclaredConsecutiveFirstPasses",
                "provisionalMaxDeclaredFirstPasses"):
        if type(report.get(key)) is not int or report[key] < 0:
            hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    if (report["registeredAttempts"] != total
            or report["registeredDistinctSubjects"] > total
            or report["registeredRevisionsExcluded"] > total
            or report["provisionalDeclaredConsecutiveFirstPasses"] > total
            or report["provisionalMaxDeclaredFirstPasses"] > total
            or report["provisionalMaxDeclaredFirstPasses"]
               < report["provisionalDeclaredConsecutiveFirstPasses"]
            or report.get("lastFiveFirstAttemptsDeclaredPass") is not
               (report["provisionalDeclaredConsecutiveFirstPasses"] >= 5)):
        hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    # Recompute the entire provisional timeline from the report's own rows.
    # Structural checks alone admit forged streaks (including five claimed
    # consecutive PASSes after a recorded FAIL). Report rows intentionally do
    # not carry source/film hashes; this is mathematical consistency only,
    # NOT original-film authenticity or historical-completeness attestation.
    seen_runs, next_ordinal, streak, maximum, revisions = set(), {}, 0, 0, 0
    for row in entries:
        run, subject, ordinal = row["runId"], row["subjectId"], row["renderOrdinal"]
        decision = row["declaredDecision"]
        if (not isinstance(run, str) or not ID.fullmatch(run)
                or run in seen_runs or not isinstance(subject, str)
                or not ID.fullmatch(subject) or type(ordinal) is not int
                or ordinal != next_ordinal.get(subject, 0) + 1
                or type(row["firstFinal"]) is not bool
                or row["firstFinal"] is not (ordinal == 1)
                or not isinstance(decision, str) or decision not in DECISIONS):
            hold("RESEARCH_REPORT_TIMELINE_DRIFT")
        seen_runs.add(run)
        next_ordinal[subject] = ordinal
        before = streak
        if ordinal != 1:
            revisions += 1
            streak = 0
            eligible, reason = False, "REVISION_NOT_FIRST_RENDER"
        else:
            eligible = decision == "PASS"
            streak = streak + 1 if eligible else 0
            reason = None if eligible else "DECLARED_" + decision
            maximum = max(maximum, streak)
        if (row["declaredEligible"] is not eligible
                or type(row["declaredStreakBeforeEvent"]) is not int
                or row["declaredStreakBeforeEvent"] != before
                or type(row["declaredStreakAfterEvent"]) is not int
                or row["declaredStreakAfterEvent"] != streak
                or row["streakBreakReason"] != reason):
            hold("RESEARCH_REPORT_TIMELINE_DRIFT")
    if (report["registeredDistinctSubjects"] != len(next_ordinal)
            or report["registeredRevisionsExcluded"] != revisions
            or report["provisionalDeclaredConsecutiveFirstPasses"] != streak
            or report["provisionalMaxDeclaredFirstPasses"] != maximum):
        hold("RESEARCH_REPORT_TIMELINE_DRIFT")
    if set(report) == RESEARCH_REPORT_FIELDS | RESEARCH_APPEND_FIELDS:
        prior = report.get("previousRegisteredAttempts")
        count = report.get("newAppendedAttemptCount")
        newly_added = report.get("newAppendedRunIds")
        if (report.get("appendOnlyAgainstPinnedPrior") is not True
                or not isinstance(report.get("externalPreviousRegisterSha256"), str)
                or not HEX64.fullmatch(report["externalPreviousRegisterSha256"])
                or type(prior) is not int or prior < 0 or prior >= total
                or type(count) is not int or count != total - prior
                or not isinstance(newly_added, list)
                or newly_added != [item["runId"] for item in entries[prior:]]):
            hold("UNAUTHORIZED_RESEARCH_REPORT_CONTENT")
    return True


def write_report_no_clobber(path, report):
    """Do not overwrite an older research report or follow a final-file alias."""
    validate_report_for_write(report)
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

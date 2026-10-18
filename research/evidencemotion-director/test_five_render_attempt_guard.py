"""Regression: iterations and malformed ledgers cannot fake an excellent streak."""
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock
from five_render_attempt_guard import (SCHEMA, verify, verify_append_only,
                                       read_register, write_report_no_clobber)


def atom(value):
    return hashlib.sha256(value.encode()).hexdigest()


def attempt(i, subject=None, ordinal=1, decision="PASS"):
    subject = subject or f"topic-{i}"
    return {"runId": f"run-{i}", "subjectId": subject,
            "renderOrdinal": ordinal, "firstFinal": ordinal == 1,
            "sourceSha256": atom(f"source-{i}"),
            "filmSha256": atom(f"movie-{i}"),
            "declaredDecision": decision}


def register(items):
    return {"schema": SCHEMA, "mayPublish": False,
            "claimedAcceptedStreak": 0, "attempts": items}


class FirstRenderIntegrityTests(unittest.TestCase):
    def test_empty_is_not_excellence(self):
        r = verify(register([]))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 0)
        self.assertFalse(r["fiveRenderMilestoneAccepted"])

    def test_five_distinct_declared_passes_never_self_approve(self):
        r = verify(register([attempt(i) for i in range(5)]))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 5)
        self.assertTrue(r["lastFiveFirstAttemptsDeclaredPass"])
        self.assertFalse(r["fiveRenderMilestoneAccepted"])
        self.assertFalse(r["firstExcellentMasterAccepted"])
        self.assertFalse(r["mayPublish"])
        self.assertFalse(r["allHistoricalAttemptsProvenPresent"])

    def test_failure_resets_declared_streak(self):
        x = [attempt(i) for i in range(3)] + [attempt(3, decision="FAIL"), attempt(4)]
        r = verify(register(x))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 1)
        self.assertEqual(r["provisionalMaxDeclaredFirstPasses"], 3)

    def test_hold_resets_declared_streak(self):
        self.assertEqual(verify(register([attempt(0), attempt(1, decision="HOLD"),
                                          attempt(2)]))["provisionalDeclaredConsecutiveFirstPasses"], 1)

    def test_revisions_cannot_accumulate_first_render_streak(self):
        x = [attempt(0, subject="first"), attempt(1, subject="first", ordinal=2),
             attempt(2, subject="second")]
        r = verify(register(x))
        self.assertEqual(r["registeredRevisionsExcluded"], 1)
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 1)
        self.assertEqual(r["attempts"][1]["declaredStreakBeforeEvent"], 1)
        self.assertEqual(r["attempts"][1]["declaredStreakAfterEvent"], 0)
        self.assertEqual(r["attempts"][1]["streakBreakReason"], "REVISION_NOT_FIRST_RENDER")
        self.assertFalse(r["attempts"][1]["declaredEligible"])

    def test_revision_cannot_bridge_two_plus_three_first_attempts(self):
        # This was the original false-positive: five PASS first renders in two
        # clusters with an intervening repair, incorrectly reported as 5/5.
        x = [attempt(0, subject="topic-a"), attempt(1, subject="topic-b"),
             attempt(2, subject="topic-a", ordinal=2)]
        x += [attempt(i) for i in (3, 4, 5)]
        r = verify(register(x))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 3)
        self.assertEqual(r["provisionalMaxDeclaredFirstPasses"], 3)
        self.assertFalse(r["lastFiveFirstAttemptsDeclaredPass"])
        self.assertFalse(r["fiveRenderMilestoneAccepted"])

    def test_revision_after_five_first_attempt_passes_resets_current_streak(self):
        x = [attempt(i) for i in range(5)]
        x.append(attempt(5, subject="topic-0", ordinal=2, decision="PASS"))
        r = verify(register(x))
        self.assertEqual(r["provisionalMaxDeclaredFirstPasses"], 5)
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 0)
        self.assertFalse(r["lastFiveFirstAttemptsDeclaredPass"])
        self.assertFalse(r["fiveRenderMilestoneAccepted"])

    def test_failed_revision_also_breaks_streak(self):
        r = verify(register([attempt(0), attempt(1, subject="topic-0",
                                               ordinal=2, decision="FAIL"), attempt(2)]))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 1)
        self.assertEqual(r["attempts"][1]["streakBreakReason"], "REVISION_NOT_FIRST_RENDER")

    def test_new_distinct_five_run_sequence_can_restart_after_revision(self):
        x = [attempt(0), attempt(1, subject="topic-0", ordinal=2)]
        x += [attempt(i) for i in range(2, 7)]
        r = verify(register(x))
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 5)
        self.assertTrue(r["lastFiveFirstAttemptsDeclaredPass"])
        self.assertFalse(r["fiveRenderMilestoneAccepted"])
        self.assertFalse(r["firstExcellentMasterAccepted"])
        self.assertFalse(r["mayPublish"])

    def test_failed_first_attempt_has_auditable_break_reason(self):
        r = verify(register([attempt(0), attempt(1, decision="HOLD")]))
        self.assertEqual(r["attempts"][1]["declaredStreakBeforeEvent"], 1)
        self.assertEqual(r["attempts"][1]["declaredStreakAfterEvent"], 0)
        self.assertEqual(r["attempts"][1]["streakBreakReason"], "DECLARED_HOLD")

    def test_relabelled_revision_rejected(self):
        x = [attempt(0, subject="same"), attempt(1, subject="same", ordinal=2)]
        x[1]["firstFinal"] = True
        with self.assertRaisesRegex(ValueError, "REVISED_RENDER_DISGUISED_AS_FIRST"):
            verify(register(x))

    def test_hidden_first_or_gapped_ordinal_rejected(self):
        with self.assertRaisesRegex(ValueError, "GAPPED_OR_REORDERED"):
            verify(register([attempt(3, subject="same", ordinal=2)]))

    def test_duplicate_movie_bytes_rejected(self):
        x = [attempt(0), attempt(1)]
        x[1]["filmSha256"] = x[0]["filmSha256"]
        with self.assertRaisesRegex(ValueError, "DUPLICATE_FILM_BYTES"):
            verify(register(x))

    def test_duplicate_run_rejected(self):
        x = [attempt(0), attempt(1)]
        x[1]["runId"] = x[0]["runId"]
        with self.assertRaisesRegex(ValueError, "DUPLICATE_RUN_ID"):
            verify(register(x))

    def test_invalid_source_hash_rejected(self):
        x = [attempt(0)]
        x[0]["sourceSha256"] = "none"
        with self.assertRaisesRegex(ValueError, "IMMUTABLE_SOURCE_AND_FILM_SHA"):
            verify(register(x))

    def test_boolean_ordinal_rejected(self):
        x = [attempt(0)]
        x[0]["renderOrdinal"] = True
        with self.assertRaisesRegex(ValueError, "INVALID_RENDER_ORDINAL"):
            verify(register(x))

    def test_unknown_decision_rejected(self):
        with self.assertRaisesRegex(ValueError, "UNKNOWN_DECLARED_DECISION"):
            verify(register([attempt(0, decision="VERIFIED")]))

    def test_forged_publication_or_accepted_streak_rejected(self):
        x = register([attempt(0)])
        x["mayPublish"] = True
        with self.assertRaisesRegex(ValueError, "PUBLICATION_NOT_AUTHORIZED"):
            verify(x)
        x["mayPublish"] = False
        x["claimedAcceptedStreak"] = 1
        with self.assertRaisesRegex(ValueError, "SELF_APPROVED_STREAK"):
            verify(x)


    def test_pinned_previous_history_one_new_event_accepted_research_only(self):
        prior = register([attempt(0), attempt(1, decision="FAIL")])
        current = register(prior["attempts"] + [attempt(2)])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "previous.json"
            raw = (json.dumps(prior) + "\n").encode()
            path.write_bytes(raw)
            parsed, sha = read_register(path, required_sha=hashlib.sha256(raw).hexdigest())
            report = verify_append_only(current, parsed, sha)
            self.assertTrue(report["appendOnlyAgainstPinnedPrior"])
            self.assertEqual(report["previousRegisteredAttempts"], 2)
            self.assertEqual(report["newAppendedAttemptCount"], 1)
            self.assertEqual(report["newAppendedRunIds"], ["run-2"])
            self.assertEqual(report["provisionalDeclaredConsecutiveFirstPasses"], 1)
            self.assertFalse(report["allHistoricalAttemptsProvenPresent"])
            self.assertFalse(report["fiveRenderMilestoneAccepted"])
            self.assertFalse(report["mayPublish"])

    def test_pinned_previous_failed_attempt_cannot_be_deleted(self):
        prior = register([attempt(0), attempt(1, decision="FAIL"), attempt(2)])
        rewritten = register([attempt(0), attempt(2), attempt(3)])
        with self.assertRaisesRegex(ValueError, "PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED"):
            verify_append_only(rewritten, prior, atom("prior"))

    def test_pinned_previous_decision_and_first_final_cannot_be_rewritten(self):
        prior = register([attempt(0), attempt(1, decision="FAIL")])
        changed = register([attempt(0), attempt(1), attempt(2)])
        with self.assertRaisesRegex(ValueError, "PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED"):
            verify_append_only(changed, prior, atom("prior"))
        changed = register([attempt(0), attempt(1, decision="HOLD"), attempt(2)])
        with self.assertRaisesRegex(ValueError, "PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED"):
            verify_append_only(changed, prior, atom("prior"))

    def test_pinned_previous_rerender_cannot_be_omitted(self):
        prior = register([attempt(0, subject="original"),
                          attempt(1, subject="original", ordinal=2)])
        edited = register([attempt(0, subject="original"), attempt(2), attempt(3)])
        with self.assertRaisesRegex(ValueError, "PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED"):
            verify_append_only(edited, prior, atom("prior"))

    def test_pinned_previous_order_change_or_no_new_entry_refused(self):
        prior = register([attempt(0), attempt(1)])
        with self.assertRaisesRegex(ValueError, "NO_NEW_APPEND_ONLY_ATTEMPT"):
            verify_append_only(prior, prior, atom("prior"))
        reordered = register([attempt(1), attempt(0), attempt(2)])
        with self.assertRaisesRegex(ValueError, "PREVIOUS_ATTEMPTS_REWRITTEN_OR_DELETED"):
            verify_append_only(reordered, prior, atom("prior"))

    def test_prior_file_bytes_require_external_sha(self):
        prior = register([attempt(0)])
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "pinned.json"
            path.write_text(json.dumps(prior))
            with self.assertRaisesRegex(ValueError, "PREVIOUS_REGISTER_BYTES_CHANGED"):
                read_register(path, required_sha=atom("wrong"))
            with self.assertRaisesRegex(ValueError, "EXTERNAL_PREVIOUS_REGISTER_SHA_REQUIRED"):
                read_register(path, required_sha="not-a-hash")
            link = Path(directory) / "alias.json"
            link.symlink_to(path)
            with self.assertRaisesRegex(ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                read_register(link)

    def test_windows_path_creation_time_may_differ_from_descriptor_change_time(self):
        # Synthetic Windows surface: stable path stat() and stable descriptor
        # fstat() may legitimately report different st_ctime_ns semantics.
        prior = register([attempt(0)])
        raw = json.dumps(prior).encode("utf-8")
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "prior.json"
            file.write_bytes(raw)
            real_fstat = os.fstat

            def descriptor_clock(fd):
                observed = real_fstat(fd)
                return SimpleNamespace(
                    st_mode=observed.st_mode, st_dev=observed.st_dev,
                    st_ino=observed.st_ino, st_size=observed.st_size,
                    st_mtime_ns=observed.st_mtime_ns,
                    st_ctime_ns=observed.st_ctime_ns + 86_400_000_000_000)

            with mock.patch("five_render_attempt_guard.os.fstat",
                            side_effect=descriptor_clock):
                parsed, actual = read_register(
                    file, required_sha=hashlib.sha256(raw).hexdigest())
            self.assertEqual(parsed, prior)
            self.assertEqual(actual, hashlib.sha256(raw).hexdigest())

    def test_descriptor_metadata_change_during_read_remains_held(self):
        prior = register([attempt(0)])
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "prior.json"
            file.write_text(json.dumps(prior))
            real_fstat = os.fstat
            calls = 0

            def changing_descriptor_clock(fd):
                nonlocal calls
                observed = real_fstat(fd)
                calls += 1
                return SimpleNamespace(
                    st_mode=observed.st_mode, st_dev=observed.st_dev,
                    st_ino=observed.st_ino, st_size=observed.st_size,
                    st_mtime_ns=observed.st_mtime_ns,
                    st_ctime_ns=observed.st_ctime_ns
                    + (86_400_000_000_000 if calls >= 2 else 0))

            with mock.patch("five_render_attempt_guard.os.fstat",
                            side_effect=changing_descriptor_clock):
                with self.assertRaisesRegex(
                        ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                    read_register(file)

    def test_path_metadata_change_during_read_remains_held(self):
        prior = register([attempt(0)])
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "prior.json"
            file.write_text(json.dumps(prior))
            real_stat = os.stat
            calls = 0

            def changing_path_clock(path, *args, **kwargs):
                nonlocal calls
                observed = real_stat(path, *args, **kwargs)
                if os.fspath(path) != os.fspath(file):
                    return observed
                calls += 1
                return SimpleNamespace(
                    st_mode=observed.st_mode, st_dev=observed.st_dev,
                    st_ino=observed.st_ino, st_size=observed.st_size,
                    st_mtime_ns=observed.st_mtime_ns,
                    st_ctime_ns=observed.st_ctime_ns
                    + (86_400_000_000_000 if calls >= 2 else 0))

            with mock.patch("five_render_attempt_guard.os.stat",
                            side_effect=changing_path_clock):
                with self.assertRaisesRegex(
                        ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                    read_register(file)

    def test_same_descriptor_mid_read_byte_mutation_is_rejected(self):
        # Even a byte-for-byte length-preserving update must not yield a
        # silently accepted first-render history between two physical reads.
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "attempts.json"
            before = json.dumps(register([attempt(0)])).encode("utf-8")
            after = json.dumps(register([attempt(1)])).encode("utf-8")
            self.assertEqual(len(before), len(after))
            file.write_bytes(before)
            real_fdopen = os.fdopen

            class MidReadSwap:
                def __init__(self, stream):
                    self.stream = stream
                    self.once = True

                def __enter__(self):
                    self.stream.__enter__()
                    return self

                def __exit__(self, *args):
                    return self.stream.__exit__(*args)

                def read(self, *args):
                    content = self.stream.read(*args)
                    if self.once:
                        self.once = False
                        with open(file, "r+b") as writer:
                            writer.write(after)
                            writer.flush()
                            os.fsync(writer.fileno())
                    return content

                def seek(self, *args):
                    return self.stream.seek(*args)

            with mock.patch("five_render_attempt_guard.os.fdopen",
                            side_effect=lambda fd, mode:
                                MidReadSwap(real_fdopen(fd, mode))):
                with self.assertRaisesRegex(
                        ValueError, "REGISTER_BYTES_CHANGED_DURING_READ"):
                    read_register(file)
            self.assertEqual(file.read_bytes(), after)

    def test_register_path_swap_between_preflight_and_open_is_rejected(self):
        # Existing path-then-read logic can accept changed, still-valid JSON.
        # Use a deterministic swap precisely at the descriptor-open boundary.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            victim = root / "attempts.json"
            replacement = root / "different-attempts.json"
            first = json.dumps(register([attempt(0)])).encode("utf-8")
            second = json.dumps(register([attempt(1)])).encode("utf-8")
            self.assertEqual(len(first), len(second))
            victim.write_bytes(first)
            replacement.write_bytes(second)
            real_open = os.open
            def swap_before_open(path, *args, **kwargs):
                if os.fspath(path) == os.fspath(victim):
                    os.replace(replacement, victim)
                return real_open(path, *args, **kwargs)
            with mock.patch("five_render_attempt_guard.os.open",
                            side_effect=swap_before_open):
                with self.assertRaisesRegex(ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                    read_register(victim)
            self.assertEqual(victim.read_bytes(), second)

    def test_register_read_rejects_late_symlink_switch(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            victim = root / "attempts.json"
            other = root / "replacement.json"
            victim.write_text(json.dumps(register([attempt(0)])))
            other.write_text(json.dumps(register([attempt(1)])))
            real_open = os.open
            def swap_for_symlink(path, *args, **kwargs):
                if os.fspath(path) == os.fspath(victim):
                    victim.unlink()
                    victim.symlink_to(other)
                return real_open(path, *args, **kwargs)
            try:
                probe = root / "symlink-check"
                probe.symlink_to(other)
                probe.unlink()
            except (OSError, NotImplementedError) as exc:
                self.skipTest(f"symlinks unavailable: {exc}")
            with mock.patch("five_render_attempt_guard.os.open",
                            side_effect=swap_for_symlink):
                with self.assertRaisesRegex(ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                    read_register(victim)
            self.assertEqual(other.read_text(), json.dumps(register([attempt(1)])))

    def test_json_duplicate_fields_nan_and_overflow_refused(self):
        prior = register([attempt(0)])
        with tempfile.TemporaryDirectory() as directory:
            file = Path(directory) / "candidate.json"
            for invalid in (
                    '{"schema":"wrong","schema":"'+SCHEMA+'","mayPublish":false,'
                    '"claimedAcceptedStreak":0,"attempts":[]}',
                    json.dumps(prior).replace('"mayPublish": false',
                                             '"mayPublish": false, "mayPublish": true'),
                    json.dumps(prior).replace('"claimedAcceptedStreak": 0',
                                             '"claimedAcceptedStreak": NaN'),
                    json.dumps(prior).replace('"claimedAcceptedStreak": 0',
                                             '"claimedAcceptedStreak": 1e999'),
            ):
                with self.subTest(invalid=invalid[:75]):
                    file.write_text(invalid)
                    with self.assertRaisesRegex(ValueError, "MALFORMED_REGISTER_JSON|NONFINITE_REGISTER_NUMBER"):
                        read_register(file)

    def test_register_fields_and_false_zero_coercion_refused(self):
        r = register([attempt(0)])
        r["externalReviewerApproved"] = True
        with self.assertRaisesRegex(ValueError, "UNRECOGNIZED_REGISTER_FIELDS"):
            verify(r)
        r = register([attempt(0)])
        r["attempts"][0]["mayPublish"] = True
        with self.assertRaisesRegex(ValueError, "UNRECOGNIZED_ATTEMPT_FIELDS"):
            verify(r)
        r = register([attempt(0)])
        r["claimedAcceptedStreak"] = False
        with self.assertRaisesRegex(ValueError, "SELF_APPROVED_STREAK"):
            verify(r)

    def test_report_no_clobber_and_symlink_target_preserved(self):
        report = verify(register([attempt(0)]))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "held-report.json"
            write_report_no_clobber(output, report)
            self.assertEqual(json.loads(output.read_text()), report)
            original = output.read_bytes()
            with self.assertRaisesRegex(ValueError, "REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE"):
                write_report_no_clobber(output, report)
            self.assertEqual(output.read_bytes(), original)
            alias = root / "alias.json"
            alias.symlink_to(output)
            with self.assertRaisesRegex(ValueError, "REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE"):
                write_report_no_clobber(alias, report)
            self.assertEqual(output.read_bytes(), original)

    def test_research_report_writer_rejects_forged_approval_and_extra_fields(self):
        original = verify(register([attempt(0), attempt(1, decision="FAIL")]))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            bogus = [
                ("publish", {**original, "mayPublish": True}),
                ("first-excellent", {**original, "firstExcellentMasterAccepted": True}),
                ("five-render", {**original, "fiveRenderMilestoneAccepted": True}),
                ("independent", {**original,
                                 "independentScienceVoiceCraftHandsetAudienceAndVarietyVerified": True}),
                ("foreign-field", {**original, "externalReviewerApproved": True}),
                ("missing", {k: v for k, v in original.items() if k != "mayPublish"}),
                ("coerced", {**original, "authorizedPromotion": 0}),
                ("forged-attempt", {**original, "attempts": [
                    {**original["attempts"][0], "independentlyApproved": True},
                    original["attempts"][1]]}),
                ("extra-attempt", {**original, "attempts": [
                    {**original["attempts"][0], "humanApproved": True},
                    original["attempts"][1]]}),
                ("false-count", {**original, "registeredAttempts": 500}),
                ("fake-five", {**original, "lastFiveFirstAttemptsDeclaredPass": True}),
            ]
            for label, candidate in bogus:
                with self.subTest(label=label):
                    output = root / (label + ".json")
                    with self.assertRaisesRegex(ValueError,
                                                "UNAUTHORIZED_RESEARCH_REPORT_CONTENT"):
                        write_report_no_clobber(output, candidate)
                    self.assertFalse(output.exists())
            self.assertFalse(any(root.iterdir()))

    def test_research_report_writer_allows_real_append_only_hold(self):
        previous = register([attempt(0, decision="FAIL")])
        current = register(previous["attempts"] + [attempt(1)])
        report = verify_append_only(current, previous, atom("previous-register"))
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            output = root / "valid-append-HOLD.json"
            write_report_no_clobber(output, report)
            self.assertEqual(json.loads(output.read_text()), report)
            tampered = {**report, "newAppendedRunIds": ["invented-run"]}
            with self.assertRaisesRegex(ValueError,
                                        "UNAUTHORIZED_RESEARCH_REPORT_CONTENT"):
                write_report_no_clobber(root / "invented.json", tampered)
            self.assertEqual([p.name for p in root.iterdir()], ["valid-append-HOLD.json"])

    def test_research_report_replays_first_render_math_instead_of_trusting_it(self):
        from copy import deepcopy
        original = verify(register([
            attempt(0), attempt(1), attempt(2, decision="FAIL"),
            attempt(3), attempt(4), attempt(5)]))
        self.assertEqual(original["provisionalDeclaredConsecutiveFirstPasses"], 3)
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            modified = []
            def mutate(name, change):
                candidate = deepcopy(original)
                change(candidate)
                modified.append((name, candidate))
            mutate("inflated-streak", lambda c: (
                c.__setitem__("provisionalDeclaredConsecutiveFirstPasses", 5),
                c.__setitem__("provisionalMaxDeclaredFirstPasses", 5),
                c.__setitem__("lastFiveFirstAttemptsDeclaredPass", True)))
            mutate("fake-eligible-failure", lambda c:
                   c["attempts"][2].__setitem__("declaredEligible", True))
            mutate("fake-event-streak", lambda c:
                   c["attempts"][3].__setitem__("declaredStreakAfterEvent", 4))
            mutate("coerced-event-boolean", lambda c:
                   c["attempts"][0].__setitem__("declaredStreakAfterEvent", True))
            mutate("disguised-revision", lambda c: (
                c["attempts"][4].__setitem__("subjectId", "topic-0"),
                c["attempts"][4].__setitem__("renderOrdinal", 2),
                c["attempts"][4].__setitem__("firstFinal", False)))
            mutate("forged-break-reason", lambda c:
                   c["attempts"][2].__setitem__("streakBreakReason", None))
            mutate("duplicate-run", lambda c:
                   c["attempts"][3].__setitem__("runId", "run-0"))
            mutate("false-distinct-subject-count", lambda c:
                   c.__setitem__("registeredDistinctSubjects", 1))
            for name, candidate in modified:
                with self.subTest(name=name):
                    target = root / (name + ".json")
                    with self.assertRaisesRegex(ValueError,
                                                "RESEARCH_REPORT_TIMELINE_DRIFT"):
                        write_report_no_clobber(target, candidate)
                    self.assertFalse(target.exists())
            self.assertEqual(list(root.iterdir()), [])

    def test_research_report_true_declared_five_still_never_authorizes_release(self):
        report = verify(register([attempt(i) for i in range(5)]))
        self.assertTrue(report["lastFiveFirstAttemptsDeclaredPass"])
        with tempfile.TemporaryDirectory() as directory:
            output = Path(directory) / "declared-only-HOLD.json"
            write_report_no_clobber(output, report)
            result = json.loads(output.read_text())
            self.assertEqual(result["provisionalDeclaredConsecutiveFirstPasses"], 5)
            self.assertFalse(result["fiveRenderMilestoneAccepted"])
            self.assertFalse(result["authorizedPromotion"])
            self.assertFalse(result["mayPublish"])

    def test_nested_symlinked_ancestor_refused_for_input_and_new_report(self):
        # A non-symlink final parent is not sufficient: an earlier folder
        # in the same lexical path could redirect the owner evidence store.
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            real = root / "actual" / "nested"
            real.mkdir(parents=True)
            previous = real / "previous.json"
            previous.write_text(json.dumps(register([attempt(0)])))
            alias = root / "alias"
            try:
                alias.symlink_to(root / "actual", target_is_directory=True)
            except (OSError, NotImplementedError) as exc:
                self.skipTest(f"directory symlinks unavailable: {exc}")
            redirected_previous = alias / "nested" / "previous.json"
            self.assertFalse(redirected_previous.is_symlink())
            self.assertFalse(redirected_previous.parent.is_symlink())
            with self.assertRaisesRegex(ValueError, "REGISTER_FILE_MISSING_OR_UNSAFE"):
                read_register(redirected_previous)
            redirected_output = alias / "nested" / "new-report.json"
            with self.assertRaisesRegex(ValueError, "REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE"):
                write_report_no_clobber(redirected_output, verify(register([attempt(1)])))
            self.assertFalse((real / "new-report.json").exists())
            # A lexical ".." must not normalize away a symlink the OS
            # traverses before reaching the final (otherwise safe) folder.
            other = root / "nested"
            other.mkdir()
            dotdot_output = alias / ".." / "nested" / "dotdot.json"
            self.assertTrue(dotdot_output.parent.is_dir())
            with self.assertRaisesRegex(ValueError, "REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE"):
                write_report_no_clobber(dotdot_output, verify(register([attempt(2)])))
            self.assertFalse((other / "dotdot.json").exists())
            self.assertEqual(json.loads(previous.read_text())["schema"], SCHEMA)

    def test_append_cli_requires_prior_sha_and_never_says_approved(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            prev = root / "prev.json"
            prev.write_text(json.dumps(register([attempt(0, decision="FAIL")])))
            cur = root / "current.json"
            cur.write_text(json.dumps(register([attempt(0, decision="FAIL"), attempt(1)])))
            destination = root / "research-HOLD.json"
            script = Path(__file__).with_name("five_render_attempt_guard.py")
            base = [sys.executable, str(script), "--register", str(cur),
                    "--previous-register", str(prev), "--out", str(destination)]
            missing = subprocess.run(base, capture_output=True, text=True)
            self.assertNotEqual(missing.returncode, 0)
            self.assertFalse(destination.exists())
            raw = prev.read_bytes()
            p = subprocess.run(base + ["--previous-sha", hashlib.sha256(raw).hexdigest()],
                               capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, p.stderr)
            result = json.loads(destination.read_text())
            self.assertTrue(result["appendOnlyAgainstPinnedPrior"])
            self.assertFalse(result["firstExcellentMasterAccepted"])
            self.assertFalse(result["mayPublish"])
            p2 = subprocess.run(base + ["--previous-sha", hashlib.sha256(raw).hexdigest()],
                                capture_output=True, text=True)
            self.assertNotEqual(p2.returncode, 0)
            self.assertIn("REPORT_PATH_ALREADY_EXISTS_OR_UNSAFE", p2.stderr)



if __name__ == "__main__":
    unittest.main()

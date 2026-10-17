"""Regression: iterations and malformed ledgers cannot fake an excellent streak."""
import hashlib
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
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

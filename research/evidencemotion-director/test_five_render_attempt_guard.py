"""Regression: iterations and malformed ledgers cannot fake an excellent streak."""
import hashlib
import unittest
from five_render_attempt_guard import SCHEMA, verify


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
        self.assertEqual(r["provisionalDeclaredConsecutiveFirstPasses"], 2)
        self.assertFalse(r["attempts"][1]["declaredEligible"])

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


if __name__ == "__main__":
    unittest.main()

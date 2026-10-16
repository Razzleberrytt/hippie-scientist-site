"""EM-007.06: deliberate wrong-source, fake-effect and qualifier-erasure controls.

Synthetic adversarial edits are *not* scientific evidence. Each mutation is
rehashable, so the actual claim/content validator must refuse it.  This
suite is kept separate from native playback and must never grant publishing.
"""
import copy
import hashlib
import json
import unittest
from unittest.mock import patch

from claim_source_context_join import join, SUPPORT
from test_claim_source_context_join import LEDGER, visual_fixture
from scientific_uncertainty_ledger import classify as classify_uncertainty
from claim_strength_source_limits import evaluate as compare_claim_strength


def digest(data):
    # Attackers can serialize changed inputs and compute a fresh valid SHA.
    return hashlib.sha256(json.dumps(data, sort_keys=True).encode("utf-8")).hexdigest()


class ScienceAdversarialMatrix(unittest.TestCase):
    def setUp(self):
        self.spoken = json.loads(LEDGER.read_text(encoding="utf-8"))
        self.visual = visual_fixture()

    def source_join(self):
        return join(self.spoken, self.visual,
                    spoken_sha=digest(self.spoken), visual_sha=digest(self.visual))

    def test_baseline_eight_original_claims_remain_research_hold(self):
        original = self.source_join()
        self.assertEqual([v["claimId"] for v in original["claims"]],
                         [f"spoken-{n:03d}" for n in range(1,9)])
        self.assertEqual(original["materialClaimCount"], 6)
        self.assertFalse(original["mayPublish"])
        source_hash = digest(original)
        uncertainty = classify_uncertainty(original, source_sha=source_hash)
        compare = compare_claim_strength(
            original, uncertainty,
            source_join_sha=source_hash, uncertainty_sha=digest(uncertainty))
        self.assertEqual(compare["spokenClaimsAssessed"], 8)
        self.assertEqual(compare["materialClaimsWithSourceScopeComparison"], 6)
        self.assertFalse(compare["humanStudyComparisonPossible"])
        self.assertFalse(compare["clinicalStrengthClaimsApproved"])
        self.assertFalse(compare["mayPublish"])

    def test_swapped_7oh_pubchem_source_card_is_rejected_after_rehash(self):
        annotations = self.visual["rows"][7]["emittedSourceAnnotations"]["source"]
        annotations[2] = "7-OH • CID 3034396"
        with self.assertRaisesRegex(ValueError, "SOURCE_CARD_MISMATCH"):
            self.source_join()

    def test_changed_primary_chemical_source_scope_rejected_after_rehash(self):
        modified = (("pubchem:3034396",), "HUMAN_EFFECTS_PROVEN", "HUMAN_TRIAL")
        with patch.dict(SUPPORT, {"spoken-002": modified}):
            with self.assertRaisesRegex(ValueError, "SOURCE_SCOPE_EXCEEDS"):
                self.source_join()

    def test_fabricated_analgesic_withdrawal_claim_in_overlay_rejected(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"] = [
            "Clinically proven to treat withdrawal"]
        with self.assertRaisesRegex(ValueError,
                                    "UNSUPPORTED_TREATMENT_OR_EFFECT_TEXT"):
            self.source_join()

    def test_not_film_qualifier_erased_without_changing_input_shape(self):
        self.visual["rows"][4]["emittedSourceAnnotations"]["disclosure"] = [
            "Computed 3D illustration"]
        with self.assertRaisesRegex(ValueError, "NOT_FILMED"):
            self.source_join()

    def test_human_experience_inequality_qualifier_erased(self):
        self.visual["rows"][6]["emittedSourceAnnotations"]["science"] = [
            "HUMAN EXPERIENCE"]
        with self.assertRaisesRegex(ValueError, "HUMAN_EXPERIENCE"):
            self.source_join()

    def test_spoken_not_computed_qualifiers_cannot_be_rewritten_consistently(self):
        for claim_id, original, altered in (
            ("spoken-004", "computed", "observed"),
            ("spoken-005", "not", "definitely"),
            ("spoken-007", "not", "yes"),
        ):
            self.setUp()
            claim = next(x for x in self.spoken["assertions"] if x["id"] == claim_id)
            idx = next(i for i in claim["wordIndices"]
                       if self.spoken["words"][i]["word"] == original)
            self.spoken["words"][idx]["word"] = altered
            claim["text"] = " ".join(
                self.spoken["words"][i]["word"] for i in claim["wordIndices"])
            with self.subTest(claim=claim_id), self.assertRaisesRegex(
                    ValueError, "EXACT_FROZEN_73_WORD"):
                self.source_join()

    def test_swapped_source_join_study_identity_fails_even_with_fresh_sha(self):
        original = self.source_join()
        original["claims"][6]["humanStudyId"] = "PMID:00000000"
        with self.assertRaisesRegex(ValueError,
                                    "CLAIM_SCOPE_OR_CLINICAL_EVIDENCE_CONFLATION"):
            classify_uncertainty(original, source_sha=digest(original))

    def test_no_fake_approval_through_clinical_metadata_after_rehash(self):
        original = self.source_join()
        original["sources"]["pubchem:44301524"]["measuredHumanOutcome"] = (
            "human withdrawal symptoms resolved")
        with self.assertRaisesRegex(ValueError,
                                    "CHEMICAL_RECORD_CANNOT_BECOME_HUMAN_STUDY"):
            classify_uncertainty(original, source_sha=digest(original))


if __name__ == "__main__":
    unittest.main()

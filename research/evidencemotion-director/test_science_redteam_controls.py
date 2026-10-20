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
        pinned_spoken = json.loads(LEDGER.read_text(encoding="utf-8"))
        source_sha = (hashlib.sha256(LEDGER.read_bytes()).hexdigest()
                      if self.spoken == pinned_spoken else digest(self.spoken))
        return join(self.spoken, self.visual,
                    spoken_sha=source_sha, visual_sha=digest(self.visual))

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

    def test_em008_botanical_measured_content_and_absence_controls_hold(self):
        # Rehashed phone/OCR-like metadata cannot turn chemistry into a
        # measured amount, positive detection, or proved absence in a plant.
        for text in (
            "Kratom leaf contains measured 7-OH",
            "Leaf 7-OH: 4.2 mg/g",
            "Kratom powder has no 7-hydroxymitragynine content",
            "This plant contains 7OH; illustration, not proof of 7-OH content",
        ):
            with self.subTest(text=text):
                self.setUp()
                self.visual["rows"][0]["emittedSourceAnnotations"]["science"] = [text]
                with self.assertRaisesRegex(ValueError, "UNVERIFIED_BOTANICAL_7OH_CONTENT"):
                    self.source_join()

    def test_em008_spoken_spelling_and_unicode_seven_oh_rejected(self):
        for text in (
            "Kratom leaves have 7-hydroxymitragynine",
            "Kratom leaves have seven o h",
            "Kratom leaves have 7‑OH",
            "Kratom leaves have 7 hydroxy mitragynine",
        ):
            self.setUp()
            self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=[text]
            with self.subTest(text=text), self.assertRaisesRegex(
                    ValueError, "UNVERIFIED_BOTANICAL_7OH_CONTENT"):
                self.source_join()

    def test_em008_cross_shot_botanical_assay_implied_across_cut_rejected(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=["Kratom leaves"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=["have seven o h"]
        with self.assertRaisesRegex(ValueError,"UNVERIFIED_BOTANICAL_7OH_CROSS_SHOT"):
            self.source_join()

    def test_em008_neutral_disclosure_across_shots_remains_hold_not_rejected(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["disclosure"]=[
            "Schematic illustration; not evidence of a clinical outcome"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=[
            "7-OH is a chemical diagram label"]
        result=self.source_join()
        self.assertFalse(result["mayPublish"])

    def test_em008_split_biological_labels_cannot_evade_content_guard(self):
        # Two separately innocent-looking captions form one false visual
        # inference when read together in the same encoded shot.
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"] = [
            "Kratom leaf", "7-OH", "Confirmed 3.5 mg per gram"]
        with self.assertRaisesRegex(ValueError, "UNVERIFIED_BOTANICAL_7OH_CONTENT"):
            self.source_join()

    def test_em008_clear_disclosure_and_chemical_id_remain_research_only(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["disclosure"] = [
            "Schematic illustration; not evidence of a clinical outcome"]
        report = self.source_join()
        self.assertFalse(report["mayPublish"])
        self.assertFalse(report["clinicalSourceClaimsApproved"])
        self.assertFalse(report["claims"][0]["sourceLinksSupportClinicalEffect"])

    def test_em008_unverified_botanical_absence_phrases_fail_closed(self):
        # Rehashed visual metadata is not an assay. Both positive and
        # *negative* botanical-content claims demand actual evidence.
        for text in (
            "Kratom leaf is 7-OH-free",
            "Raw kratom leaves are free of 7-hydroxymitragynine",
            "No 7-OH in kratom leaves",
            "Leaf powder lacks 7OH",
            "7-hydroxymitragynine is undetectable in kratom extract",
            "Kratom plants without 7-OH",
            "Kratom 7-OH-free illustration; not proof",
        ):
            with self.subTest(text=text):
                self.setUp()
                self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=[text]
                with self.assertRaisesRegex(ValueError, "UNVERIFIED_BOTANICAL_7OH_CONTENT"):
                    self.source_join()

    def test_em008_negated_content_split_across_shots_is_not_a_disclosure(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=["Kratom leaf"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=["7-OH-free"]
        with self.assertRaisesRegex(ValueError, "UNVERIFIED_BOTANICAL_7OH_CROSS_SHOT"):
            self.source_join()

    def test_em008_three_shot_botanical_absence_rejected_after_rehash(self):
        # Neither adjacent pair contains the full plant + 7-OH + absence
        # assertion; the contiguous three-shot reading does.
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=["Kratom leaves"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=["from the tested sample"]
        self.visual["rows"][2]["emittedSourceAnnotations"]["science"]=["7-OH is undetectable"]
        with self.assertRaisesRegex(ValueError,"UNVERIFIED_BOTANICAL_7OH_THREE_SHOT"):
            self.source_join()

    def test_em008_three_shot_botanical_positive_claim_also_rejected(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=["Kratom leaf"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=["in the submitted batch"]
        self.visual["rows"][2]["emittedSourceAnnotations"]["science"]=["7-OH measured at 4mg"]
        with self.assertRaisesRegex(ValueError,"UNVERIFIED_BOTANICAL_7OH_THREE_SHOT"):
            self.source_join()

    def test_em008_disclaimer_cannot_sanitize_detectable_or_measurable_content(self):
        # A disclaimer cannot make an empirical product-content claim true.
        for text in (
            "Kratom 7-OH is detectable; botanical illustration, not proof",
            "Kratom extract 7-OH is measurable; illustration, not proof",
            "Kratom 7-OH is rich; illustration, not proof",
            "Kratom 7-OH test result; illustration, not proof",
            "7-OH detectable in capsules; botanical illustration, not proof",
        ):
            with self.subTest(text=text):
                self.setUp()
                self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=[text]
                with self.assertRaisesRegex(
                        ValueError, "UNVERIFIED_BOTANICAL_7OH_CONTENT"):
                    self.source_join()

    def test_em008_four_shot_botanical_assertion_stays_unverified(self):
        # Each shorter window misses at least one piece of the invented assay.
        for idx, value in enumerate((
            "Kratom leaf", "from the sample", "in the batch", "7-OH is detectable"
        )):
            self.visual["rows"][idx]["emittedSourceAnnotations"]["science"]=[value]
        with self.assertRaisesRegex(
                ValueError, "UNVERIFIED_BOTANICAL_7OH_FOUR_SHOT"):
            self.source_join()

    def test_em007_four_shot_receptor_assertion_fails_closed(self):
        for idx, value in enumerate((
            "7-OH activates", "the", "mu", "receptor"
        )):
            self.visual["rows"][idx]["emittedSourceAnnotations"]["science"]=[value]
        with self.assertRaisesRegex(
                ValueError, "UNSUPPORTED_TREATMENT_OR_EFFECT_CROSS_SHOT"):
            self.source_join()

    def test_em008_three_shot_neutral_illustration_stays_hold_not_clinical(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["disclosure"]=[
            "Schematic illustration"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["disclosure"]=[
            "not proof of a human outcome"]
        # Preserve the exact 2D chemical comparison and its no-reaction disclosure.
        self.visual["rows"][2]["emittedSourceAnnotations"]["science"].append(
            "Chemical structure diagram, not a clinical study")
        result=self.source_join()
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["clinicalSourceClaimsApproved"])

    def test_em008_neutral_illustration_without_assay_claim_stays_unapproved(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["disclosure"]=[
            "Schematic illustration; not evidence of a clinical outcome"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=[
            "7-OH is a chemical diagram label"]
        receipt=self.source_join()
        self.assertFalse(receipt["mayPublish"])
        self.assertFalse(receipt["clinicalSourceClaimsApproved"])

    def test_unsourced_human_effect_receptor_and_safety_claims_rejected(self):
        # Rehashing the visual inventory cannot convert molecular structure
        # labels into human clinical, receptor assay or safety evidence.
        for text in (
            "7-OH reduces withdrawal cravings",
            "7-OH alleviates pain",
            "7-OH decreases anxiety symptoms",
            "7-OH activates mu opioid receptors",
            "7-OH binds the mu receptor",
            "7-OH is an opioid agonist",
            "7-OH is non-addictive",
            "7-OH is proven safe",
        ):
            self.setUp()
            self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=[text]
            with self.subTest(text=text), self.assertRaisesRegex(
                ValueError,"UNSUPPORTED_TREATMENT_OR_EFFECT_TEXT"
            ):
                self.source_join()

    def test_clinical_claim_split_across_two_or_three_shots_is_rejected(self):
        # Re-serialization and a new media receipt cannot upgrade a
        # two/three-shot sentence into human-outcome or receptor-assay data.
        attempts=(
            (("7-OH reduces", "withdrawal cravings"),2),
            (("7-OH", "activates mu", "opioid receptors"),3),
        )
        for labels,span in attempts:
            self.setUp()
            for i,label in enumerate(labels):
                self.visual["rows"][i]["emittedSourceAnnotations"]["science"]=[label]
            with self.subTest(span=span),self.assertRaisesRegex(
                ValueError,"UNSUPPORTED_TREATMENT_OR_EFFECT_CROSS_SHOT"
            ):
                self.source_join()

    def test_neutral_two_and_three_shot_chemical_labels_remain_hold(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["science"]=[
            "Computed structure"]
        self.visual["rows"][1]["emittedSourceAnnotations"]["science"]=[
            "not measured receptor footage"]
        # Preserve the exact 2D comparison labels in scene 2.
        self.visual["rows"][2]["emittedSourceAnnotations"]["science"].append(
            "Chemical identifier, not a human trial")
        report=self.source_join()
        self.assertFalse(report["mayPublish"])
        self.assertFalse(report["clinicalSourceClaimsApproved"])

    def test_neutral_computed_science_disclosure_remains_research_hold(self):
        self.visual["rows"][0]["emittedSourceAnnotations"]["disclosure"]=[
            "Computed molecular illustration; not measured human effects"]
        report=self.source_join()
        self.assertFalse(report["mayPublish"])
        self.assertFalse(report["clinicalSourceClaimsApproved"])

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

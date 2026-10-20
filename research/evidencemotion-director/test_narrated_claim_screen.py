"""Adversarial source/voice/caption contract fixtures. No positive science approval."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import LINES, WAV_SHA
from narrated_claim_screen import inspect, sha256_file, EXPECTED_NON_CAPTION_ANNOTATIONS
from verified_molecular_comparison import MITRAGYNINE, HYDROXYMITRAGYNINE


class RealFilmClaimScreenTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.movie, self.wav = self.root / "film.mp4", self.root / "narration.wav"
        self.movie.write_bytes(b"synthetic-film-not-an-MP4")
        self.wav.write_bytes(b"synthetic-wave-not-a-WAV")
        self.receipt_file, self.plan_file = self.root / "receipt.json", self.root / "plan.json"
        self.scenes, self.shots = [], []
        lines = list(LINES[:5]) + [""] + [LINES[5]]
        ids = [f"sentence_{i}" for i in range(1, 6)] + ["source_hold", "sentence_6"]
        for i, (sid, line) in enumerate(zip(ids, lines)):
            words = line.split()
            start, end = i * 5., (i+1)*5.
            cues = [{"text": w, "startSec": start + .1+j*.10, "endSec": start + .2+j*.10} for j, w in enumerate(words)]
            if sid == "sentence_5":
                for c in cues:
                    if c["text"] == "not": c["startSec"] = start + 2.
            self.scenes.append({"id": sid, "startSec": start, "endSec": end, "line": line, "captionWords": cues})
            ann = [{"role": role, "text": text}
                   for role, text in EXPECTED_NON_CAPTION_ANNOTATIONS[sid]]
            ann += [{"role": "caption", "text": w} for w in words]
            if sid == "sentence_1":
                diff = next(c["startSec"] for c in cues if c["text"] == "different")
                second = copy.deepcopy(ann)
                next(a for a in second if a.get("role") == "hook")["text"] = "7-OH"
                pivot = words.index("different")
                first = ann[:2] + [{"role":"caption","text":w} for w in words[:pivot]]
                second = second[:2] + [{"role":"caption","text":w} for w in words[pivot:]]
                self.shots.extend([
                    {"id": "sentence_1_part0", "startSec": start, "endSec": diff,
                     "annotations": first, "assetKind": "deterministic_science"},
                    {"id": "sentence_1_part1", "startSec": diff, "endSec": end,
                     "annotations": second, "assetKind": "deterministic_science"},
                ])
            elif sid == "sentence_5":
                pivot = words.index("not")
                pre = copy.deepcopy(ann[:1]) + [
                    {"role": "caption", "text": w} for w in words[:pivot]]
                post = [
                    {"role": "science", "text": "≠"},
                    {"role": "science", "text": "HUMAN EXPERIENCE"}] + [
                    {"role": "caption", "text": w} for w in words[pivot:]]
                self.shots.extend([
                    {"id": sid + "_part0", "startSec": start, "endSec": start+2.,
                     "annotations": pre, "assetKind": "deterministic_science"},
                    {"id": sid + "_part1", "startSec": start+2., "endSec": end,
                     "annotations": post, "assetKind": "deterministic_science"}])
            else:
                self.shots.append({"id": sid, "startSec": start, "endSec": end,
                                   "annotations": ann, "assetKind": "deterministic_science"})
        sources = [MITRAGYNINE, HYDROXYMITRAGYNINE]
        self.receipt = {"videoSha256": sha256_file(self.movie), "sourceWavSha256": WAV_SHA,
                        "status": "NEW_RENDERED_RESEARCH_CANDIDATE_REQUIRES_INDEPENDENT_REVIEW",
                        "treatment": "specimen", "resolution": [1080,1920],
                        "nativePixelsDrawnAtOutputResolution": True, "isOriginalV5": False,
                        "scienceApproved": False, "mayPublish": False,
                        "chemistry": [{"cid": s.pubchem_cid, "inchiKey": s.inchi_key, "url": s.source_url} for s in sources],
                        "scenes": self.scenes}
        self.plan = {"status": "RESEARCH_ONLY", "releaseApproved": False,
                     "expectedVideoSha256": sha256_file(self.movie), "shots": self.shots}
        self.original_hash = sha256_file

    def shot(self, shot_id):
        return next(s for s in self.shots if s["id"] == shot_id)

    def screen(self):
        self.receipt_file.write_text(json.dumps(self.receipt))
        self.plan_file.write_text(json.dumps(self.plan))
        def digest(path):
            return WAV_SHA if Path(path) == self.wav else self.original_hash(path)
        with patch("narrated_claim_screen.sha256_file", side_effect=digest):
            return inspect(self.movie, self.wav, self.receipt_file, self.plan_file)

    def test_full_mechanical_contract_stays_nonpublishing(self):
        r = self.screen()
        self.assertEqual((r["narratedScenesInspected"], r["emittedShotIntervalsInspected"]), (7,9))
        self.assertEqual(len(r["reviewRows"]), 7)
        self.assertFalse(r["mayPublish"])
        self.assertFalse(r["independentScientificReviewApproved"])

    def test_mutated_caption_word_refused(self):
        next(a for a in self.shots[0]["annotations"] if a["role"] == "caption")["text"] = "Mitragynine"
        with self.assertRaisesRegex(ValueError, "VISIBLE_CAPTIONS_MISMATCH"):
            self.screen()

    def test_wrong_cid_and_missing_source_refused(self):
        self.receipt["chemistry"][1]["cid"] = 111
        with self.assertRaisesRegex(ValueError, "COMPOUND_SOURCE_IDENTITY"):
            self.screen()
        self.receipt["chemistry"][1]["cid"] = HYDROXYMITRAGYNINE.pubchem_cid
        self.shot("source_hold")["annotations"] = [
            a for a in self.shot("source_hold")["annotations"] if a["text"] != "7-OH • CID 44301524"]
        with self.assertRaisesRegex(ValueError, "VISIBLE_PRIMARY_SOURCE_LABEL"):
            self.screen()

    def test_first_visible_cid_defined_on_held_source_card(self):
        source=self.shot("source_hold")["annotations"]
        removed=next(a for a in source if a["text"]=="CID = compound record number")
        source.remove(removed)
        with self.assertRaisesRegex(ValueError,"VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()
        source.insert(4,removed)
        self.assertFalse(self.screen()["mayPublish"])
        for name in ("sentence_1_part0","sentence_1_part1"):
            self.assertFalse(any("CID" in a["text"] for a in
                             self.shot(name)["annotations"] if a["role"]!="caption"))

    def test_3d_scene_cannot_fall_back_to_unexplained_technical_title(self):
        self.shot("sentence_4")["annotations"][0]["text"] = "The pose\nis computed."
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_3d_scene_cannot_claim_observed_binding(self):
        self.shot("sentence_4")["annotations"][0]["text"] = "Observed binding event"
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_computed_3d_without_caveat_refused(self):
        self.shot("sentence_2")["annotations"] = [
            a for a in self.shot("sentence_2")["annotations"] if a.get("role") != "disclosure"]
        with self.assertRaisesRegex(ValueError, "COMPUTED_MODEL_UNDISCLOSED"):
            self.screen()

    def test_early_caption_cannot_spoil_negation(self):
        self.shot("sentence_5_part0")["annotations"].append(
            {"role": "caption", "text": "not"})
        with self.assertRaisesRegex(ValueError, "VISIBLE_CAPTIONS_MISMATCH"):
            self.screen()

    def test_late_caption_preserves_exact_original_words(self):
        self.shot("sentence_5_part1")["annotations"][-1]["text"] = "really."
        with self.assertRaisesRegex(ValueError, "VISIBLE_CAPTIONS_MISMATCH"):
            self.screen()

    def test_early_title_cannot_spoil_limitation(self):
        self.shot("sentence_5_part0")["annotations"][0]["text"] = (
            self.shot("sentence_5_part1")["annotations"][1]["text"])
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_late_title_must_match_the_approved_limit(self):
        self.shot("sentence_5_part1")["annotations"][1]["text"] = "Scientifically proven effects"
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_negation_not_claimed_before_narrator_says_not(self):
        self.shot("sentence_5_part0")["annotations"].append({"role": "science", "text": "≠"})
        with self.assertRaisesRegex(ValueError, "STRUCTURE_EFFECTS_NEGATION_INVERTED"):
            self.screen()

    def test_fabricated_human_claim_refused(self):
        self.shot("sentence_3")["annotations"].append({"role": "science", "text": "Clinically proven to treat withdrawal"})
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_unlisted_health_claim_is_always_refused(self):
        self.shot("sentence_3")["annotations"].append({"role": "science", "text": "Relieves withdrawal symptoms"})
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_incorrect_chemical_identity_in_science_title_is_refused(self):
        self.shot("sentence_3")["annotations"][0]["text"] = "A record of\nMitragynine."
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_wrong_scene_even_for_whitelisted_text_refused(self):
        self.shot("sentence_3")["annotations"].insert(1, {"role": "science", "text": "Look closer."})
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_duplicate_source_label_is_refused(self):
        self.shot("source_hold")["annotations"].append({"role": "source", "text": "7-OH • CID 44301524"})
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_source_label_role_swap_is_refused(self):
        self.shot("source_hold")["annotations"][2]["role"] = "science"
        # The stronger primary-CID identity screen now rejects this before
        # the later generic annotation allowlist. Either way, source role
        # corruption must never become publication-eligible.
        with self.assertRaisesRegex(ValueError, "VISIBLE_PRIMARY_SOURCE_LABEL_DRIFT"):
            self.screen()

    def test_original_labels_preserve_exact_order(self):
        result = self.screen()
        self.assertEqual(result["status"], "MECHANICAL_SOURCE_CAPTION_SCREEN_PASS_INDEPENDENT_REVIEW_REQUIRED")

    def test_comparison_switches_two_distinct_cids_on_spoken_cue(self):
        result = self.screen()
        self.assertEqual(result["emittedShotIntervalsInspected"], 9)
        self.assertIn("MITRAGYNINE",
                      [a["text"] for a in self.shot("sentence_1_part0")["annotations"]])
        self.assertIn("7-OH",
                      [a["text"] for a in self.shot("sentence_1_part1")["annotations"]])

    def test_comparison_wrong_source_identity_refused(self):
        self.shot("sentence_1_part1")["annotations"][1]["text"] = "MITRAGYNINE"
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
            self.screen()

    def test_comparison_cut_not_at_spoken_difference_refused(self):
        self.shot("sentence_1_part1")["startSec"] += .25
        with self.assertRaisesRegex(ValueError, "COMPARISON_MUST_CUT_AT_SPOKEN_DIFFERENT"):
            self.screen()

    def test_source_wav_and_video_byte_change_refused(self):
        self.movie.write_bytes(b"other bytes")
        with self.assertRaisesRegex(ValueError, "REAL_VIDEO_OR_SOURCE_AUDIO_IDENTITY"):
            self.screen()

    def test_revised_spoken_line_and_scene_reordering_refused(self):
        self.scenes[0]["line"] = "Effects proven"
        with self.assertRaisesRegex(ValueError, "FROZEN_SPOKEN_SCRIPT_DRIFT"):
            self.screen()


if __name__ == "__main__":
    unittest.main()

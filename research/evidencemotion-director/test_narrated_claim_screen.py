"""Adversarial source/voice/caption contract fixtures. No positive science approval."""
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from autonomous_script_asr_research import LINES, WAV_SHA
from narrated_claim_screen import inspect, sha256_file
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
            ann = [{"role": "caption", "text": w} for w in words]
            if sid in ("sentence_1", "sentence_2", "sentence_4", "sentence_6"):
                ann += [{"role": "disclosure", "text": "Computed 3D illustration"},
                        {"role": "disclosure", "text": "Hydrogen atoms omitted"}]
            if sid == "source_hold":
                ann += [{"role": "source", "text": t} for t in ("PubChem", "CID 44301524", "C23H30N2O5", "pubchem.ncbi.nlm.nih.gov")]
            if sid == "sentence_5":
                self.shots.extend([{"id": sid + "_part0", "startSec": start, "endSec": start+2.,
                                    "annotations": copy.deepcopy(ann), "assetKind": "deterministic_science"},
                                   {"id": sid + "_part1", "startSec": start+2., "endSec": end,
                                    "annotations": copy.deepcopy(ann) + [{"role": "science", "text": "≠"}],
                                    "assetKind": "deterministic_science"}])
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

    def screen(self):
        self.receipt_file.write_text(json.dumps(self.receipt))
        self.plan_file.write_text(json.dumps(self.plan))
        def digest(path):
            return WAV_SHA if Path(path) == self.wav else self.original_hash(path)
        with patch("narrated_claim_screen.sha256_file", side_effect=digest):
            return inspect(self.movie, self.wav, self.receipt_file, self.plan_file)

    def test_full_mechanical_contract_stays_nonpublishing(self):
        r = self.screen()
        self.assertEqual((r["narratedScenesInspected"], r["emittedShotIntervalsInspected"]), (7,8))
        self.assertEqual(len(r["reviewRows"]), 7)
        self.assertFalse(r["mayPublish"])
        self.assertFalse(r["independentScientificReviewApproved"])

    def test_mutated_caption_word_refused(self):
        self.shots[0]["annotations"][0]["text"] = "Mitragynine"
        with self.assertRaisesRegex(ValueError, "VISIBLE_CAPTIONS_MISMATCH"):
            self.screen()

    def test_wrong_cid_and_missing_source_refused(self):
        self.receipt["chemistry"][1]["cid"] = 111
        with self.assertRaisesRegex(ValueError, "COMPOUND_SOURCE_IDENTITY"):
            self.screen()
        self.receipt["chemistry"][1]["cid"] = HYDROXYMITRAGYNINE.pubchem_cid
        self.shots[6]["annotations"] = [a for a in self.shots[6]["annotations"] if a["text"] != "CID 44301524"]
        with self.assertRaisesRegex(ValueError, "VISIBLE_PRIMARY_SOURCE_LABEL"):
            self.screen()

    def test_computed_3d_without_caveat_refused(self):
        self.shots[0]["annotations"] = [a for a in self.shots[0]["annotations"] if a.get("role") != "disclosure"]
        with self.assertRaisesRegex(ValueError, "COMPUTED_MODEL_UNDISCLOSED"):
            self.screen()

    def test_negation_not_claimed_before_narrator_says_not(self):
        self.shots[4]["annotations"].append({"role": "science", "text": "≠"})
        with self.assertRaisesRegex(ValueError, "STRUCTURE_EFFECTS_NEGATION_INVERTED"):
            self.screen()

    def test_fabricated_human_claim_refused(self):
        self.shots[2]["annotations"].append({"role": "science", "text": "Clinically proven to treat withdrawal"})
        with self.assertRaisesRegex(ValueError, "VISUAL_CLAIM_UNSUPPORTED"):
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

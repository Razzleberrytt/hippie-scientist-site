"""Fail-closed acoustic research; speech similarity is NOT pronunciation accuracy."""
import io
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import wave

import numpy as np

from repeated_term_acoustic_guard import (
    SOURCE_ARCHIVE_SHA, audit, compare, decode_pcm, digest, distance, trajectory,
    source_clip_sample_offsets, audit_original_source,
    audit_pose_poles_conflict, audit_pose_files, audit_pose_internal_reference_set,
)

ARCHIVE=Path(os.getenv("EM_LANE2_PREVIOUS_PACKET",
                 "/nonexistent/original-lane2-term-triage.zip"))


def tone(hz, duration=.45):
    t=np.arange(round(duration*24000))/24000
    return .15*(np.sin(2*np.pi*hz*t)+.3*np.sin(2*np.pi*2.07*hz*t))*np.sin(np.pi*t/duration)


class SpectralNegativeTests(unittest.TestCase):
    def test_gain_independent_positive_is_not_phonetic_proof(self):
        a=tone(240)
        report=compare(a,a*.6,[tone(470),tone(860)])
        self.assertTrue(report["repeatPatternConsistent"])
        self.assertFalse(report["phonesOrWordIdentityProven"])

    def test_replaced_second_term_rejected_by_pcm_comparison(self):
        a=tone(240)
        result=compare(a,tone(860),[tone(470),tone(860)])
        self.assertFalse(result["repeatPatternConsistent"])

    def test_silence_cannot_spoof_spectral_similarity(self):
        with self.assertRaisesRegex(ValueError,"SPEECH_ENERGY_MISSING"):
            trajectory(np.zeros(24000))

    def test_short_or_nonfinite_or_multichannel_vectors_rejected(self):
        for source in (np.ones(40), np.full(3000,np.nan), np.ones((3000,2))):
            with self.assertRaises(ValueError):
                trajectory(source)

    def test_forged_or_silent_feature_vectors_rejected(self):
        for bad in (np.ones((5,12)),np.zeros((5,13)),np.full((5,13),np.nan)):
            with self.assertRaises(ValueError):
                distance(np.ones((5,13)),bad)

    def test_missing_and_changed_source_packet_fail_closed(self):
        self.assertEqual(audit(Path("/nonexistent/speech.zip"))["status"],"HOLD")
        with tempfile.TemporaryDirectory() as td:
            bad=Path(td)/"forged.zip"
            bad.write_bytes(b"PK\x03\x04fake-packet")
            r=audit(bad)
            self.assertIn("SOURCE_ARCHIVE_HASH_CHANGED",r["errors"])
            self.assertFalse(r["mayPublish"])

    def test_invalid_waveform_cannot_be_read_as_voice(self):
        for data in (b"junk",b"RIFF"+bytes(80)):
            with self.assertRaises(ValueError):
                decode_pcm(data)

    def test_standalone_cli_error_status_never_zero(self):
        p=subprocess.run([sys.executable,str(Path(__file__).with_name(
            "repeated_term_acoustic_guard.py")),"--source-archive",
            "/nonexistent/voice.zip"],capture_output=True,text=True,timeout=20)
        self.assertEqual(p.returncode,2)
        self.assertIn('"mayPublish": false',p.stdout)



class SyntheticMasterLinkTests(unittest.TestCase):
    """Synthetic controls only; original 34.35s master is NOT in hosted checkout."""

    @staticmethod
    def wav(pcm, channels=1):
        stream = io.BytesIO()
        with wave.open(stream, "wb") as out:
            out.setnchannels(channels)
            out.setsampwidth(2)
            out.setframerate(24000)
            out.writeframes(pcm)
        return stream.getvalue()

    @classmethod
    def fixture(cls):
        samples = np.random.default_rng(417).integers(
            -16000, 16000, size=36000, dtype=np.int16).astype("<i2").tobytes()
        master = cls.wav(samples)
        clips = {2: cls.wav(samples[4800:16800]),
                 4: cls.wav(samples[38000:50000])}
        return master, clips

    def test_source_provenance_exact_pcm_offsets(self):
        master, clips = self.fixture()
        offsets = source_clip_sample_offsets(master, clips, digest(master))
        self.assertEqual(offsets, {2: 2400, 4: 19000})

    def test_source_provenance_rejects_changed_master_hash(self):
        master, clips = self.fixture()
        with self.assertRaisesRegex(ValueError, "ORIGINAL_MASTER_WAV_SHA_CHANGED"):
            source_clip_sample_offsets(master, clips, "0"*64)

    def test_source_provenance_rejects_modified_excerpt(self):
        master, clips = self.fixture()
        with wave.open(io.BytesIO(clips[4]), "rb") as w:
            data = bytearray(w.readframes(w.getnframes()))
        data[17] ^= 1
        clips[4] = self.wav(bytes(data))
        with self.assertRaisesRegex(ValueError,
                                    "ORIGINAL_CLIP_NOT_UNIQUELY_EXTRACTED_FROM_MASTER"):
            source_clip_sample_offsets(master, clips, digest(master))

    def test_source_provenance_rejects_reused_identical_excerpt(self):
        master, clips = self.fixture()
        with wave.open(io.BytesIO(master), "rb") as w:
            original = w.readframes(w.getnframes())
        doubled = self.wav(original + original)
        with self.assertRaisesRegex(ValueError,
                                    "ORIGINAL_CLIP_NOT_UNIQUELY_EXTRACTED_FROM_MASTER"):
            source_clip_sample_offsets(doubled, clips, digest(doubled))

    def test_source_provenance_rejects_wrong_master_audio_format(self):
        master, clips = self.fixture()
        with wave.open(io.BytesIO(master), "rb") as w:
            samples = w.readframes(w.getnframes())
        stereo = self.wav(samples, channels=2)
        with self.assertRaisesRegex(ValueError, "ORIGINAL_MASTER_WAV_FORMAT_INVALID"):
            source_clip_sample_offsets(stereo, clips, digest(stereo))



class OriginalMfaCliContractTests(unittest.TestCase):
    def test_new_mode_missing_files_returns_hold_with_no_publication(self):
        with tempfile.TemporaryDirectory() as td:
            unknown = Path(td) / "nonexistent.wav"
            out = audit_original_source(unknown, unknown, unknown)
            self.assertEqual(out["status"], "HOLD")
            self.assertFalse(out["mayPublish"])
            self.assertFalse(out["pronunciationVerified"])
            self.assertFalse(out["sourceWavIndependentlyRehashed"])

    def test_rehashed_non_original_wav_cannot_claim_original_source(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td)
            master = root / "source.wav"
            receipt = root / "mfa.json"
            alignment = root / "alignment.json"
            master.write_bytes(b"not the 34.35-second original")
            receipt.write_text("{}")
            alignment.write_text("{}")
            out = audit_original_source(master, receipt, alignment)
            self.assertEqual(out["status"], "HOLD")
            self.assertIn("ORIGINAL_MASTER_WAV_SHA_CHANGED", out["errors"])
            self.assertFalse(out["mayPublish"])

    def test_cli_incomplete_source_triplet_refuses_false_green(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        for flags in ([], ["--mfa-receipt", "/nonexistent/mfa.json"],
                      ["--original-wav", "/nonexistent/source.wav",
                       "--mfa-receipt", "/nonexistent/mfa.json"]):
            with self.subTest(flags=flags):
                done = subprocess.run([sys.executable, script, *flags],
                                      capture_output=True, text=True, timeout=20)
                self.assertEqual(done.returncode, 2, done.stderr)
                self.assertIn('"mayPublish": false', done.stdout)
                self.assertIn('"status": "HOLD"', done.stdout)


MASTER = Path(os.getenv("EM_LANE2_ORIGINAL_WAV", "/nonexistent/original-lane2.wav"))
MFA_RECEIPT = Path(os.getenv("EM_LANE2_MFA_RECEIPT", "/nonexistent/mfa-receipt.json"))
MFA_ALIGNMENT = Path(os.getenv("EM_LANE2_MFA_ALIGNMENT", "/nonexistent/mfa-alignment.json"))


@unittest.skipUnless(all(p.is_file() for p in (MASTER, MFA_RECEIPT, MFA_ALIGNMENT)),
    "Original SHA-pinned WAV + MFA inputs absent in CI; original-media proof NOT faked")
class OriginalMasterMfaTests(unittest.TestCase):
    def test_four_real_excerpts_bit_identical_and_repeat_controls_source_verified(self):
        result = audit_original_source(MASTER, MFA_RECEIPT, MFA_ALIGNMENT)
        self.assertEqual(result["status"], "RESEARCH_REPEATED_TERM_PATTERN_ONLY", result)
        self.assertEqual(result["sourceClipSampleOffsetsInOriginalWav"],
                         {1: 13440, 2: 50640, 3: 172560, 4: 227040})
        self.assertAlmostEqual(result["repeatNormalizedSpectralDistance"], .203533, places=5)
        self.assertAlmostEqual(result["closestOtherOriginalTermDistance"], .605658, places=5)
        self.assertTrue(result["sourceWavIndependentlyRehashed"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["pronunciationVerified"])
        self.assertFalse(result["phonemeIdentityVerified"])
        self.assertFalse(result["wordTimingCalibrated"])

    def test_real_master_one_byte_mutation_fails_even_without_changed_mfa(self):
        with tempfile.TemporaryDirectory() as td:
            changed = Path(td) / "altered.wav"
            raw = bytearray(MASTER.read_bytes())
            raw[-100] ^= 1
            changed.write_bytes(raw)
            report = audit_original_source(changed, MFA_RECEIPT, MFA_ALIGNMENT)
            self.assertEqual(report["status"], "HOLD")
            self.assertIn("ORIGINAL_MASTER_WAV_SHA_CHANGED", report["errors"])

    def test_real_alignment_modified_word_boundary_fails_before_clip_comparison(self):
        with tempfile.TemporaryDirectory() as td:
            altered = Path(td) / "changed-alignment.json"
            raw = MFA_ALIGNMENT.read_bytes()
            altered.write_bytes(raw + b" ")
            report = audit_original_source(MASTER, MFA_RECEIPT, altered)
            self.assertEqual(report["status"], "HOLD")
            self.assertIn("ORIGINAL_MFA_ALIGNMENT_SHA_CHANGED", report["errors"])



class PoseConflictNegativeTests(unittest.TestCase):
    def test_unavailable_source_fails_closed_without_spelling_winner(self):
        bad = audit_pose_files("/nonexistent/voice.wav",
                               "/nonexistent/alignment.json", "/nonexistent/asr.json")
        self.assertEqual(bad["status"], "HOLD")
        self.assertFalse(bad["mayPublish"])

    def test_wrong_source_and_missing_source_types_do_not_approve(self):
        for source, alignment, asr in (
            (b"fake source", b"{}", b"{}"),
            (None, b"{}", b"{}"),
            (b"fake source", b"{}", 8),
        ):
            with self.subTest(source_type=str(type(source))):
                result = audit_pose_poles_conflict(source, alignment, asr)
                self.assertEqual(result["status"], "HOLD")
                self.assertFalse(result["pronunciationVerified"])

    def test_pose_cli_incomplete_triplet_remains_hold(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        for args in (
            ["--pose-asr-receipt", "/nonexistent/asr.json"],
            ["--pose-asr-receipt", "/nonexistent/asr.json",
             "--original-wav", "/nonexistent/wav.wav",
             "--mfa-alignment", "/nonexistent/alignment.json"],
        ):
            completed = subprocess.run([sys.executable, script, *args],
                                       capture_output=True, text=True, timeout=20)
            self.assertEqual(completed.returncode, 2, completed.stderr)
            self.assertIn('"mayPublish": false', completed.stdout)


ASR_SOURCE = Path(os.getenv("EM_LANE2_ASR_RECEIPT", "/nonexistent/lane2-asr.json"))


@unittest.skipUnless(all(x.is_file() for x in (MASTER, MFA_ALIGNMENT, ASR_SOURCE)),
    "Original complete WAV/MFA/ASR files unavailable in hosted checkout; no fake real-media PASS")
class ActualPoseConflictTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = MASTER.read_bytes()
        cls.alignment = MFA_ALIGNMENT.read_bytes()
        cls.asr = ASR_SOURCE.read_bytes()

    def test_original_actual_pose_poles_conflict_is_review_hold(self):
        result = audit_pose_poles_conflict(self.source, self.alignment, self.asr)
        self.assertEqual(result["status"], "RESEARCH_LEXICAL_DISAGREEMENT_REVIEW_HOLD", result)
        self.assertIsNone(result["lexicalWinner"])
        self.assertEqual(result["originalSourceSamples"], 11280)
        self.assertEqual(result["asrWordHypothesis"], "poles")
        self.assertEqual(result["forcedAlignmentWordHypothesis"], "pose")
        self.assertFalse(result["phonemeIdentityVerified"])
        self.assertFalse(result["mayPublish"])

    def test_real_source_word_alignment_or_asr_mutation_stays_hold(self):
        for index, source in enumerate((self.source, self.alignment, self.asr)):
            with self.subTest(source_index=index):
                altered = bytearray(source)
                altered[-1] ^= 1
                trio = [self.source, self.alignment, self.asr]
                trio[index] = bytes(altered)
                output = audit_pose_poles_conflict(*trio)
                self.assertEqual(output["status"], "HOLD")
                self.assertFalse(output["mayPublish"])

    def test_cli_source_conflict_is_nonzero_even_when_pinned(self):
        completed = subprocess.run([
            sys.executable, str(Path(__file__).with_name("repeated_term_acoustic_guard.py")),
            "--original-wav", str(MASTER), "--mfa-alignment", str(MFA_ALIGNMENT),
            "--pose-asr-receipt", str(ASR_SOURCE)],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(completed.returncode, 3, completed.stderr)
        self.assertIn('"lexicalWinner": null', completed.stdout)
        self.assertIn('"mayPublish": false', completed.stdout)



class PoseInternalContrastNegativeTests(unittest.TestCase):
    def test_incomplete_contrast_cli_must_hold_not_auto_approve(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        for args in (
            ["--pose-internal-contrasts"],
            ["--pose-internal-contrasts", "--original-wav", "/nonexistent/voice.wav",
             "--mfa-alignment", "/nonexistent/alignment.json",
             "--pose-asr-receipt", "/nonexistent/asr.json"],
        ):
            result = subprocess.run([sys.executable, script, *args],
                                    capture_output=True, text=True, timeout=20)
            self.assertEqual(result.returncode, 2, result.stderr)
            self.assertIn('"mayPublish": false', result.stdout)
            self.assertIn('"status": "HOLD"', result.stdout)

    def test_fake_source_never_promotes_lateral_evidence(self):
        result = audit_pose_internal_reference_set(b"synthetic source", b"{}",
                                                    b"synthetic ASR")
        self.assertEqual(result["status"], "HOLD")
        self.assertFalse(result["pronunciationVerified"])
        self.assertFalse(result["mayPublish"])

    def test_unprovided_archive_cannot_supply_calibration(self):
        result = audit_pose_files("/nonexistent/voice.wav",
                                  "/nonexistent/alignment.json",
                                  "/nonexistent/asr.json",
                                  include_internal_controls=True)
        self.assertEqual(result["status"], "HOLD")
        self.assertFalse(result["sourceWavIndependentlyRehashed"])


@unittest.skipUnless(all(x.is_file() for x in (MASTER, MFA_ALIGNMENT, ASR_SOURCE)),
    "Exact original media and model receipts absent from hosted CI; no fake controls PASS")
class ActualPoseInternalContrastTests(unittest.TestCase):
    def test_all_five_same_narrator_clips_source_sha_verified_without_phoneme_claim(self):
        result = audit_pose_files(MASTER, MFA_ALIGNMENT, ASR_SOURCE,
                                  include_internal_controls=True)
        self.assertEqual(result["status"], "RESEARCH_POSE_INTERNAL_CONTRAST_REVIEW_ONLY",
                         result)
        self.assertEqual(result["comparisonCount"], 5)
        self.assertEqual([x["mfaWordIndex"] for x in result["sameNarratorSourceBoundControls"]],
                         [37, 38, 61, 68, 71])
        self.assertTrue(all(x["physicalSameNarrationSourceVerified"]
                            for x in result["sameNarratorSourceBoundControls"]))
        self.assertFalse(any(x["authoredLabelIsCalibratedPhoneticTruth"]
                             for x in result["sameNarratorSourceBoundControls"]))
        for key in ("lateralPresenceClassified", "phonemeReferenceCalibrated",
                    "mayPublish", "pronunciationVerified", "phonemeIdentityVerified",
                    "wordTimingCalibrated"):
            self.assertFalse(result[key], key)
        self.assertIsNone(result["lexicalWinner"])

    def test_changed_real_source_models_are_not_accepted_as_calibrated_evidence(self):
        original = [MASTER.read_bytes(), MFA_ALIGNMENT.read_bytes(),
                    ASR_SOURCE.read_bytes()]
        for index, payload in enumerate(original):
            with self.subTest(input_index=index):
                modified = bytearray(payload)
                modified[-1] ^= 1
                inputs = list(original)
                inputs[index] = bytes(modified)
                result = audit_pose_internal_reference_set(*inputs)
                self.assertEqual(result["status"], "HOLD")
                self.assertFalse(result["mayPublish"])

    def test_cli_same_source_comparators_return_research_hold_exit_three(self):
        completed = subprocess.run([
            sys.executable, str(Path(__file__).with_name("repeated_term_acoustic_guard.py")),
            "--original-wav", str(MASTER),
            "--mfa-alignment", str(MFA_ALIGNMENT),
            "--pose-asr-receipt", str(ASR_SOURCE),
            "--pose-internal-contrasts"], capture_output=True, text=True, timeout=20)
        self.assertEqual(completed.returncode, 3, completed.stderr)
        self.assertIn('"comparisonCount": 5', completed.stdout)
        self.assertIn('"lexicalWinner": null', completed.stdout)
        self.assertIn('"mayPublish": false', completed.stdout)


@unittest.skipUnless(ARCHIVE.is_file(),
    "Archived source audio absent from CI checkout; no fake original-media PASS")
class ActualArchivedSourceTests(unittest.TestCase):
    def test_immutable_two_mitragynine_words_are_similar_not_certified(self):
        self.assertEqual(digest(ARCHIVE.read_bytes()),SOURCE_ARCHIVE_SHA)
        out=audit(ARCHIVE)
        self.assertEqual(out["status"],"RESEARCH_REPEATED_TERM_PATTERN_ONLY",out)
        self.assertAlmostEqual(out["repeatNormalizedSpectralDistance"],.203533,places=4)
        self.assertAlmostEqual(out["closestOtherOriginalTermDistance"],.605658,places=4)
        self.assertTrue(out["repeatPatternConsistent"])
        self.assertFalse(out["pronunciationVerified"])
        self.assertFalse(out["wordTimingCalibrated"])
        self.assertFalse(out["sourceWavIndependentlyRehashed"])
        self.assertFalse(out["mayPublish"])

    def test_actual_original_clip_substitution_is_a_physical_failure(self):
        import zipfile
        with zipfile.ZipFile(ARCHIVE) as z:
            xs={i:decode_pcm(z.read(f"review/clips/review-{i:02}.wav"))
                for i in range(1,5)}
        authentic=compare(xs[2],xs[4],[xs[1],xs[3]])
        changed=compare(xs[2],xs[1],[xs[1],xs[3]])
        self.assertTrue(authentic["repeatPatternConsistent"])
        self.assertFalse(changed["repeatPatternConsistent"])
        self.assertGreater(changed["repeatNormalizedSpectralDistance"],
                           authentic["repeatNormalizedSpectralDistance"])

    def test_valid_original_packet_exits_review_code_three_not_zero(self):
        done=subprocess.run([sys.executable,str(Path(__file__).with_name(
            "repeated_term_acoustic_guard.py")),"--source-archive",str(ARCHIVE)],
            capture_output=True,text=True,timeout=20)
        self.assertEqual(done.returncode,3,done.stderr)
        self.assertIn('"mayPublish": false',done.stdout)


if __name__=="__main__":
    unittest.main()

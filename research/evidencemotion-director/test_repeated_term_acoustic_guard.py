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
    source_clip_sample_offsets,
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

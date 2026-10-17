"""Fail-closed acoustic research; speech similarity is NOT pronunciation accuracy."""
import io
import json
import zipfile
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import wave
import repeated_term_acoustic_guard as original_guard
import gut_caption_audio_gate as gut_voice_gate

import numpy as np

from repeated_term_acoustic_guard import (
    SOURCE_ARCHIVE_SHA, audit, compare, decode_pcm, digest, distance, trajectory,
    source_clip_sample_offsets, audit_original_source,
    SOURCE_WAV_REFERENCE, MFA_SOURCE_ALIGNMENT_SHA, ORIGINAL_PCM_EXCERPT_SHA256,
    audit_pose_poles_conflict, audit_pose_files, audit_pose_internal_reference_set,
    spectral_band_trace, evaluate_blind_reference_pairs, audit_reference_archive,
    audit_original_asr_digital_zero_onsets,
)

ARCHIVE=Path(os.getenv("EM_LANE2_PREVIOUS_PACKET",
                 "/nonexistent/original-lane2-term-triage.zip"))


def tone(hz, duration=.45):
    t=np.arange(round(duration*24000))/24000
    return .15*(np.sin(2*np.pi*hz*t)+.3*np.sin(2*np.pi*2.07*hz*t))*np.sin(np.pi*t/duration)


class SpectralNegativeTests(unittest.TestCase):

    def test_gain_headroom_safe_never_grants_release_or_true_peak(self):
        source=np.zeros(24000); source[:4000]=.4
        result=original_guard.audit_research_gain_only_envelope(
            source, source.copy(), 1.5, ((4000,12000),))
        self.assertEqual(result["status"],"RESEARCH_SAMPLE_HEADROOM_ONLY_HOLD")
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["ebuTruePeakMeasured"])
        self.assertFalse(result["integratedLoudnessMeasured"])

    def test_gain_headroom_blocks_near_full_scale_even_without_clipped_samples(self):
        source=np.zeros(24000); source[:4000]=.4
        result=original_guard.audit_research_gain_only_envelope(
            source,source,2.0,((4000,12000),))
        self.assertEqual(result["status"],"HOLD")
        self.assertFalse(result["sampleOnlyHeadroomScreenPass"])
        self.assertEqual(result["projectedPreEncodeSamplesAtOrAboveFullScale"],0)

    def test_gain_headroom_blocks_actual_preencode_overload(self):
        source=np.zeros(24000); source[:4000]=.4
        result=original_guard.audit_research_gain_only_envelope(
            source,source,3.04,((4000,12000),))
        self.assertEqual(result["status"],"HOLD")
        self.assertGreater(result["projectedPreEncodeSamplesAtOrAboveFullScale"],0)

    def test_gain_headroom_detects_changed_exact_silent_source_hold(self):
        source=np.zeros(24000); source[:4000]=.4
        altered=source.copy();altered[6000]=.1
        result=original_guard.audit_research_gain_only_envelope(
            source,altered,1.1,((4000,12000),))
        self.assertIn("SOURCE_SILENCE_CHANGED",result["errors"][0])

    def test_gain_headroom_rejects_invalid_source_shapes_and_numbers(self):
        source=np.zeros(24000); source[:4000]=.4
        for invalid in (source[:-1],np.full(24000,np.nan),np.zeros(24000)):
            result=original_guard.audit_research_gain_only_envelope(
                source,invalid,1.1,((4000,12000),))
            self.assertEqual(result["status"],"HOLD")

    def test_gain_headroom_rejects_invalid_gain_or_silence_window(self):
        source=np.zeros(24000); source[:4000]=.4
        for invalid in (None,"foo",float("nan"),float("inf"),0,20):
            result=original_guard.audit_research_gain_only_envelope(
                source,source,invalid,((4000,12000),))
            self.assertEqual(result["status"],"HOLD")
        for invalid in (((-1,12),),((4000,24001),),((4000,4000),),((True,50),)):
            result=original_guard.audit_research_gain_only_envelope(
                source,source,1.1,invalid)
            self.assertEqual(result["status"],"HOLD")

    def test_gain_headroom_does_not_fake_pcm_source_provenance(self):
        source=np.zeros(24000); source[:4000]=.4
        result=original_guard.audit_research_gain_only_envelope(
            source,source,1.1,((4000,12000),))
        self.assertFalse(result["sourceHashesVerifiedByThisHelper"])
        self.assertFalse(result["filmEncodedAndDecoded"])
        self.assertFalse(result["productionAudioApproved"])

    @staticmethod
    def dynamic_source_fixture():
        t = np.arange(24000)/24000
        source = .06*np.sin(2*np.pi*300*t)
        source[18000:] = 0
        return source

    def test_dynamic_gain_slew_safe_is_never_production_approval(self):
        x = self.dynamic_source_fixture()
        r = original_guard.audit_research_dynamic_gain_slew(
            x, x*2.8, ((18000, 24000),))
        self.assertEqual(r["status"], "RESEARCH_DYNAMIC_SLEW_SCREEN_HOLD")
        for key in ("mayPublish", "productionAudioApproved",
                    "phonemeIdentityVerified", "wordTimingCalibrated",
                    "decodedAACTruePeakVerifiedByThisHelper",
                    "perceptualPumpingOrVoiceQualityProven"):
            self.assertFalse(r[key])

    def test_dynamic_gain_slew_rejects_abrupt_splice(self):
        x = self.dynamic_source_fixture()
        y = x*2.8
        y[6000:6240] = x[6000:6240]*.8
        r = original_guard.audit_research_dynamic_gain_slew(
            x, y, ((18000, 24000),))
        self.assertIn("DYNAMIC_ABRUPT_GAIN_ENVELOPE", r["errors"])

    def test_dynamic_gain_slew_rejects_unsafe_peak(self):
        x = self.dynamic_source_fixture()
        r = original_guard.audit_research_dynamic_gain_slew(
            x, x*13, ((18000, 24000),))
        self.assertIn("HEADROOM_EXCEEDED", r["errors"][0])

    def test_dynamic_gain_slew_rejects_zero_hold_tampering(self):
        x = self.dynamic_source_fixture()
        y = x*2.8
        y[19000] = .004
        r = original_guard.audit_research_dynamic_gain_slew(
            x, y, ((18000, 24000),))
        self.assertIn("ZERO_SPANS_CHANGED", r["errors"][0])

    def test_dynamic_gain_slew_rejects_invalid_and_silent_pcm(self):
        x = self.dynamic_source_fixture()
        for bad in (x[:-1], np.full(24000, float("nan")),
                    np.zeros(24000), np.ones((24000, 2))):
            r = original_guard.audit_research_dynamic_gain_slew(
                x, bad, ((18000, 24000),))
            self.assertEqual(r["status"], "HOLD")

    def test_dynamic_gain_slew_rejects_polarity_substitution(self):
        x = self.dynamic_source_fixture()
        r = original_guard.audit_research_dynamic_gain_slew(
            x, -x*2.8, ((18000, 24000),))
        self.assertIn("POLARITY", r["errors"][0])

    def test_dynamic_gain_slew_rejects_invalid_silence_intervals(self):
        x = self.dynamic_source_fixture()
        for invalid in (((-1, 2),), ((1, 24001),),
                        ((True, 5),), ((1, 1),)):
            r = original_guard.audit_research_dynamic_gain_slew(
                x, x*2.8, invalid)
            self.assertEqual(r["status"], "HOLD")

    @staticmethod
    def quiet_source_fixture():
        t = np.arange(24000)/24000
        source = np.zeros(24000)
        source[:4000] = .06*np.sin(2*np.pi*300*t[:4000])
        source[4000:14000] = .002*np.sin(2*np.pi*300*t[4000:14000])
        return source

    def test_quiet_source_pass_still_holds_publication(self):
        x=self.quiet_source_fixture()
        r=original_guard.audit_research_quiet_speech_preservation(x,x*2.8)
        self.assertEqual(r["status"],"RESEARCH_QUIET_SIGNAL_SCREEN_HOLD")
        self.assertGreater(r["quietSourceWindows"],10)
        for field in ("mayPublish","productionAudioApproved",
                      "phonemeIdentityVerified","qualifiedListenerReviewed",
                      "sourceHashesVerifiedByThisHelper","physicalFilmAudioVerified"):
            self.assertFalse(r[field])

    def test_quiet_source_muted_word_tail_is_rejected(self):
        x=self.quiet_source_fixture()
        y=x*2.8; y[6000:6240]=0
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_SPEECH_DROP",r["errors"][0])
        self.assertIn(.25,r["firstFailingQuietWindowStartSeconds"])

    def test_quiet_source_substituted_fragment_is_rejected(self):
        x=self.quiet_source_fixture()
        y=x*2.8
        y[6000:6480]=.002*np.sin(np.arange(480)*2*np.pi*900/24000)*2.8
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_SPEECH_DROP",r["errors"][0])

    def test_quiet_source_unbounded_gain_is_rejected(self):
        x=self.quiet_source_fixture()
        y=x*2.8; y[6000:6240]=x[6000:6240]*10
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_SPEECH_DROP",r["errors"][0])

    def test_quiet_source_exact_digital_zero_cannot_fill(self):
        x=self.quiet_source_fixture()
        y=x*2.8; y[18000]=.01
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_SOURCE_ZERO_WINDOW_FILLED",r["errors"][0])

    def test_quiet_source_invalid_truncated_nan_or_2d_fails(self):
        x=self.quiet_source_fixture()
        for bad in (np.zeros(24000), x[:-1], np.full(24000,np.nan),
                    np.ones((24000,1))):
            r=original_guard.audit_research_quiet_speech_preservation(x,bad)
            self.assertEqual(r["status"],"HOLD")

    def test_quiet_source_trailing_silent_partial_frame_must_stay_silent(self):
        x=np.pad(self.quiet_source_fixture(),(0,176))
        y=x*2.8; y[-1]=.01
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_UNMEASURED_TAIL_SILENCE_CHANGED",r["errors"][0])

    def test_quiet_source_nonzero_partial_frame_is_checked(self):
        x=np.pad(self.quiet_source_fixture(),(0,176))
        x[-176:]=.003*np.sin(np.arange(176)*2*np.pi*400/24000)
        y=x*2.8
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertEqual(r["status"],"RESEARCH_QUIET_SIGNAL_SCREEN_HOLD")
        y[-176:]=0
        r=original_guard.audit_research_quiet_speech_preservation(x,y)
        self.assertIn("QUIET_UNMEASURED_TAIL_GAIN_INVALID",r["errors"][0])

    def test_quiet_source_intact_silent_partial_frame_accepted_research_only(self):
        x=np.pad(self.quiet_source_fixture(),(0,176))
        r=original_guard.audit_research_quiet_speech_preservation(x,x*2.8)
        self.assertEqual(r["status"],"RESEARCH_QUIET_SIGNAL_SCREEN_HOLD")


    @staticmethod
    def pcm_aac_clock_fixture():
        # Repeatable broadband stand-in: a timing test, NOT real speech.
        rng = np.random.default_rng(9)
        a = rng.normal(0, .1, 48000)
        a[:10000] = 0
        a[24000:26000] = 0
        return a

    def test_pcm_aac_aligned_signal_research_holds_approval(self):
        x = self.pcm_aac_clock_fixture()
        r = original_guard.audit_research_pcm_aac_delivery(
            x, np.pad(x, (0, 1008)))
        self.assertEqual(r["status"], "RESEARCH_AAC_SOURCE_CLOCK_HOLD")
        self.assertFalse(r["mayPublish"])
        self.assertFalse(r["finishedFilmVerified"])
        self.assertFalse(r["wordTimingCalibrated"])
        self.assertEqual(r["trailingCodecPaddingSamples"], 1008)

    def test_pcm_aac_10ms_shift_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        shifted = np.pad(x[:-240], (240, 1008))
        r = original_guard.audit_research_pcm_aac_delivery(x, shifted)
        self.assertEqual(r["status"], "HOLD")

    def test_pcm_aac_dropped_spoken_window_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        changed = np.pad(x, (0, 1008))
        changed[30000:36000] = 0
        r = original_guard.audit_research_pcm_aac_delivery(x, changed)
        self.assertIn("DISCREPANCY", r["errors"][0])

    def test_pcm_aac_source_silence_filled_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        changed = np.pad(x, (0, 1008))
        changed[1000:2000] = .1
        r = original_guard.audit_research_pcm_aac_delivery(x, changed)
        self.assertEqual(r["status"], "HOLD")

    def test_pcm_aac_nonzero_codec_padding_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        changed = np.pad(x, (0, 1008))
        changed[-10:] = .2
        r = original_guard.audit_research_pcm_aac_delivery(x, changed)
        self.assertIn("TRAILING_PADDING", r["errors"][0])

    def test_pcm_aac_excessive_padding_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        r = original_guard.audit_research_pcm_aac_delivery(
            x, np.pad(x, (0, 2000)))
        self.assertEqual(r["status"], "HOLD")

    def test_pcm_aac_invalid_and_truncated_pcm_is_rejected(self):
        x = self.pcm_aac_clock_fixture()
        for bad in (np.zeros((48000, 1)), np.full(48000, np.nan),
                    np.array([.2]), np.zeros(48000), x[:-1]):
            r = original_guard.audit_research_pcm_aac_delivery(x, bad)
            self.assertEqual(r["status"], "HOLD")

    def test_pcm_aac_no_source_speech_is_rejected(self):
        x = np.zeros(48000)
        r = original_guard.audit_research_pcm_aac_delivery(x, x)
        self.assertEqual(r["status"], "HOLD")

    def test_pcm_aac_actual_ffmpeg_decode_and_tampered_identity(self):
        import shutil
        if not (shutil.which("ffmpeg") and shutil.which("ffprobe")):
            self.skipTest("native FFmpeg not available")
        x = self.pcm_aac_clock_fixture()
        # Keep a generous signal-only fixture with full zeros on the first
        # second and strong synthetic broadband content elsewhere.
        pcm = np.asarray(np.rint(np.clip(x, -1, 1)*32767),
                         dtype="<i2").tobytes()
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)/"source.wav"
            encoded = Path(td)/"encoded.m4a"
            with wave.open(str(source), "wb") as wav:
                wav.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                wav.writeframes(pcm)
            subprocess.run(
                ["ffmpeg", "-nostdin", "-v", "error", "-xerror", "-y",
                 "-i", str(source), "-c:a", "aac", "-b:a", "160k",
                 str(encoded)], capture_output=True, check=True, timeout=30)
            good = original_guard.audit_research_pinned_aac_files(
                source, encoded, digest(source.read_bytes()),
                digest(encoded.read_bytes()))
            # Physical decoding must be demonstrable, regardless of whether
            # a synthetic codec screening oracle holds this particular noise.
            self.assertTrue(good.get("standaloneAACBytesPhysicallyDecoded"),
                            good)
            self.assertFalse(good["mayPublish"])
            self.assertFalse(good["finishedFilmVerified"])
            rejected = original_guard.audit_research_pinned_aac_files(
                source, encoded, "0"*64, digest(encoded.read_bytes()))
            self.assertIn("PREENCODE_WAV_SHA_MISMATCH", rejected["errors"])
            rejected = original_guard.audit_research_pinned_aac_files(
                source, encoded, digest(source.read_bytes()), "0"*64)
            self.assertIn("ENCODED_AAC_SHA_MISMATCH", rejected["errors"])


    @staticmethod
    def native_mux_fixture(td):
        old, aac, mux = (Path(td)/s for s in
                         ("archive.mp4", "candidate.m4a", "mux.mp4"))
        commands = (
            ["ffmpeg", "-nostdin", "-v", "error", "-y",
             "-f", "lavfi", "-i", "color=c=blue:s=96x170:r=30:d=1.2",
             "-f", "lavfi", "-i",
             "sine=frequency=400:sample_rate=24000:duration=1.2",
             "-c:v", "libx264", "-pix_fmt", "yuv420p",
             "-c:a", "aac", "-b:a", "128k", "-shortest", str(old)],
            ["ffmpeg", "-nostdin", "-v", "error", "-y",
             "-i", str(old), "-map", "0:a:0", "-c:a", "copy", str(aac)],
            ["ffmpeg", "-nostdin", "-v", "error", "-y",
             "-i", str(old), "-i", str(aac),
             "-map", "0:v:0", "-map", "1:a:0", "-c", "copy", str(mux)],
        )
        for command in commands:
            subprocess.run(command, check=True, timeout=30,
                           capture_output=True)
        return old, aac, mux

    def test_native_mux_actual_ffmpeg_packets_video_and_audio(self):
        import shutil
        if not all(shutil.which(cmd) for cmd in
                   ("ffmpeg", "ffprobe")):
            self.skipTest("native media toolchain unavailable")
        with tempfile.TemporaryDirectory() as td:
            old, aac, mux = self.native_mux_fixture(td)
            result = original_guard.audit_research_pinned_mux_identity(
                old, aac, mux, digest(old.read_bytes()),
                digest(aac.read_bytes()), digest(mux.read_bytes()))
        self.assertEqual(result["status"], "RESEARCH_NATIVE_MUX_IDENTITY_HOLD",
                         result)
        self.assertTrue(result["researchPacketAndDecodedSignalIdentical"])
        self.assertGreater(result["h264PacketsCompared"], 20)
        self.assertGreater(result["aacPacketsCompared"], 10)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["wordTimingCalibrated"])
        self.assertFalse(result["captionTimingApproved"])
        self.assertFalse(result["sourceHashesIndependentlyTrustedByThisHelper"])

    def test_native_mux_forged_sha_or_missing_media_holds(self):
        import shutil
        if not shutil.which("ffmpeg"):
            self.skipTest("FFmpeg not installed")
        with tempfile.TemporaryDirectory() as td:
            old, aac, mux = self.native_mux_fixture(td)
            shas = [digest(path.read_bytes()) for path in (old,aac,mux)]
            for index in range(3):
                bad=list(shas);bad[index]="0"*64
                result=original_guard.audit_research_pinned_mux_identity(
                    old,aac,mux,*bad)
                self.assertEqual(result["status"],"HOLD")
                self.assertFalse(result["mayPublish"])
            result=original_guard.audit_research_pinned_mux_identity(
                old,aac,mux, "bogus",*shas[1:])
            self.assertIn("EXPECTED_SHA_INVALID",result["errors"][0])

    def test_native_mux_shifted_aac_pts_holds_even_with_self_hash(self):
        import shutil
        if not shutil.which("ffmpeg"):
            self.skipTest("FFmpeg not installed")
        with tempfile.TemporaryDirectory() as td:
            old, aac, mux = self.native_mux_fixture(td)
            shifted=Path(td)/"shifted.mp4"
            subprocess.run(
                ["ffmpeg", "-nostdin", "-v", "error", "-y",
                 "-i", str(old), "-itsoffset", "0.17", "-i", str(aac),
                 "-map", "0:v:0", "-map", "1:a:0", "-c", "copy",
                 str(shifted)], check=True, timeout=30,
                capture_output=True)
            r=original_guard.audit_research_pinned_mux_identity(
                old,aac,shifted, digest(old.read_bytes()),
                digest(aac.read_bytes()), digest(shifted.read_bytes()))
        self.assertIn("NATIVE_MUX_AAC_PACKET_OR_PTS_CHANGED",r["errors"])

    def test_native_mux_video_reencode_holds_even_with_self_hash(self):
        import shutil
        if not shutil.which("ffmpeg"):
            self.skipTest("FFmpeg not installed")
        with tempfile.TemporaryDirectory() as td:
            old, aac, mux = self.native_mux_fixture(td)
            altered=Path(td)/"altered.mp4"
            subprocess.run(
                ["ffmpeg", "-nostdin", "-v", "error", "-y",
                 "-i", str(old), "-i", str(aac), "-map", "0:v:0",
                 "-map", "1:a:0", "-vf", "drawbox=x=8:y=10:w=30:h=25:color=yellow:t=fill", "-c:v", "libx264",
                 "-c:a", "copy", str(altered)],
                check=True, timeout=30, capture_output=True)
            r=original_guard.audit_research_pinned_mux_identity(
                old,aac,altered,digest(old.read_bytes()),
                digest(aac.read_bytes()),digest(altered.read_bytes()))
        self.assertIn("NATIVE_MUX_VIDEO_PACKET_OR_TIMELINE_CHANGED",
                      r["errors"])


    @staticmethod
    def gut_synthetic_cues():
        return [(i+1, round(i*1.2, 2), round(i*1.2+.70, 2),
                 "Synthetic placeholder cue") for i in range(19)]

    @staticmethod
    def gut_synthetic_pcm(cues):
        signal = np.zeros((24*48000, 2), dtype=np.float32)
        for _, start, end, _ in cues:
            lo, hi = round(start*48000), round(end*48000)
            t = np.arange(hi-lo, dtype=float)/48000
            voice = .07*np.sin(2*np.pi*330*t)
            signal[lo:hi, 0] = voice
            signal[lo:hi, 1] = voice
        return signal

    def test_gut_19_cue_srt_must_not_overlap(self):
        def stamp(ms):
            hours = ms//3600000
            minutes = (ms//60000)%60
            seconds = (ms//1000)%60
            return f"{hours:02}:{minutes:02}:{seconds:02},{ms%1000:03}"
        blocks = []
        for i, (_, start, end, phrase) in enumerate(
                self.gut_synthetic_cues(), 1):
            blocks.append(f"{i}\n{stamp(int(start*1000))} --> "
                          f"{stamp(int(end*1000))}\n{phrase}")
        raw = ("\n\n".join(blocks) + "\n").encode()
        self.assertEqual(len(gut_voice_gate.parse_srt(raw)), 19)
        with self.assertRaisesRegex(ValueError, "EXACT_19"):
            gut_voice_gate.parse_srt(("\n\n".join(blocks[:-1])).encode())
        with self.assertRaisesRegex(ValueError, "INDEX"):
            gut_voice_gate.parse_srt(raw.replace(b"19\n", b"99\n", 1))
        with self.assertRaisesRegex(ValueError, "OVERLAP"):
            gut_voice_gate.parse_srt(raw.replace(
                b"00:00:01,200", b"00:00:00,500", 1))

    def test_gut_pcm_activity_research_hold_never_verifies_phonemes(self):
        cues = self.gut_synthetic_cues()
        pcm = self.gut_synthetic_pcm(cues)
        r = gut_voice_gate.audit_pcm_cues(pcm, cues)
        self.assertEqual(r["status"], "RESEARCH_GUT_AUDIO_SRT_COVERAGE_HOLD",r)
        self.assertEqual(r["matchedSrtCueCount"], 19)
        for key in ("mayPublish", "wordTimingCalibrated", "scienceApproved",
                    "spokenWordsConfirmedAgainstCaptions"):
            self.assertFalse(r[key])

    def test_gut_muted_caption_audio_is_automatically_flagged(self):
        cues = self.gut_synthetic_cues()
        pcm = self.gut_synthetic_pcm(cues)
        start = int(round(cues[4][1]*48000))
        pcm[start:start+int(.6*48000)] = 0
        r = gut_voice_gate.audit_pcm_cues(pcm, cues)
        self.assertEqual(r["status"], "HOLD")
        self.assertIn(5, r["lowActivityCueIds"])

    def test_gut_unsubtitled_spoken_gap_is_automatically_flagged(self):
        cues = self.gut_synthetic_cues()
        pcm = self.gut_synthetic_pcm(cues)
        start = int(round((cues[0][2]+.06)*48000))
        t = np.arange(int(.4*48000))/48000
        pcm[start:start+len(t), :] = (
            .07*np.sin(2*np.pi*300*t))[:,None]
        r = gut_voice_gate.audit_pcm_cues(pcm, cues)
        self.assertEqual(r["status"], "HOLD")
        self.assertGreater(len(r["highActivityDeclaredGapIntervals"]), 0)

    def test_gut_codec_and_wrong_source_hashes_never_promote(self):
        with tempfile.TemporaryDirectory() as td:
            fakefilm = Path(td)/"latest.mp4"
            fakesrt = Path(td)/"captions.srt"
            fakefilm.write_bytes(b"this is not a real Gut MP4")
            fakesrt.write_bytes(b"fabricated")
            r = gut_voice_gate.audit_pinned_film_srt(fakefilm, fakesrt)
            self.assertIn("FILM_SHA_MISMATCH", r["errors"][0])
            with patch.object(gut_voice_gate, "GUT_FILM_SHA",
                              gut_voice_gate.digest(fakefilm.read_bytes())):
                r = gut_voice_gate.audit_pinned_film_srt(fakefilm, fakesrt)
            self.assertIn("CAPTION_SOURCE_SHA_MISMATCH", r["errors"][0])
            self.assertFalse(r["mayPublish"])


    @staticmethod
    def gut_pause_fixture():
        # 19 sequential caption cues in six groups, with EXACTLY five
        # >350ms source-declared silent intervals, like real owner SRT.
        cues = []
        current = .2
        for group_id, group_size in enumerate((3, 3, 3, 3, 4, 3)):
            for _ in range(group_size):
                begin = round(current, 4)
                current = begin+.65
                cues.append((len(cues)+1, begin, round(current, 4),
                             "Synthetic sound-only caption"))
            if group_id < 5:
                current += .7
        audio = np.zeros((int((current+1)*48000),2),dtype=np.float32)
        for _, begin, end, _ in cues:
            lo, hi = round(begin*48000), round(end*48000)
            ts=np.arange(hi-lo)/48000
            voice=.07*np.sin(2*np.pi*310*ts)
            audio[lo:hi,:] = voice[:,None]
        return audio, cues

    def test_gut_long_pause_five_edge_research_hold(self):
        pcm,cues=self.gut_pause_fixture()
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(pcm,cues)
        self.assertEqual(result["status"],"RESEARCH_LONG_PAUSE_EDGES_HOLD",
                         result)
        self.assertEqual(result["pauseGroupsChecked"],5)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["spokenWordsConfirmedAgainstCaptions"])
        self.assertFalse(result["wordTimingCalibrated"])

    def test_gut_long_pause_rejects_200ms_shifted_narration(self):
        pcm,cues=self.gut_pause_fixture()
        shifted=np.zeros_like(pcm)
        shifted[9600:]=pcm[:-9600]
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(shifted,cues)
        self.assertEqual(result["status"],"HOLD")
        self.assertIn("GUT_PAUSE_EDGE_OR_LEAK",result["errors"])

    def test_gut_long_pause_rejects_forged_gap_speech(self):
        pcm,cues=self.gut_pause_fixture()
        start=int(round((cues[2][2]+.20)*48000))
        duration=round(.2*48000)
        t=np.arange(duration)/48000
        pcm[start:start+duration,:]=(.09*np.sin(2*np.pi*400*t))[:,None]
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(pcm,cues)
        self.assertEqual(result["status"],"HOLD")
        self.assertGreater(len(result["failingPauseGroups"]),0)

    def test_gut_long_pause_rejects_missing_beginning_of_phrase(self):
        pcm,cues=self.gut_pause_fixture()
        start=int(round(cues[3][1]*48000))
        pcm[start:start+round(.25*48000),:]=0
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(pcm,cues)
        self.assertEqual(result["status"],"HOLD")

    def test_gut_long_pause_checks_both_stereo_channels(self):
        pcm,cues=self.gut_pause_fixture()
        start=int(round((cues[2][2]+.20)*48000))
        duration=round(.2*48000)
        t=np.arange(duration)/48000
        anti=.09*np.sin(2*np.pi*400*t)
        pcm[start:start+duration,0]=anti
        pcm[start:start+duration,1]=-anti
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(pcm,cues)
        self.assertEqual(result["status"],"HOLD")
        self.assertGreater(len(result["failingPauseGroups"]),0)

    def test_gut_long_pause_rejects_malformed_or_missing_inventory(self):
        pcm,cues=self.gut_pause_fixture()
        for altered in (cues[:-1], [(*cues[0][:3],""),
                                       *cues[1:]],
                        [cues[0],cues[0],*cues[2:]]):
            result=gut_voice_gate.audit_pcm_long_pause_boundaries(pcm,altered)
            self.assertEqual(result["status"],"HOLD")
        result=gut_voice_gate.audit_pcm_long_pause_boundaries(
            np.full_like(pcm,float("nan")),cues)
        self.assertEqual(result["status"],"HOLD")

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




class OriginalDigitalZeroNegativeTests(unittest.TestCase):
    """Actual source SHA-pinned in production mode; synthetic audio only in CI."""

    @staticmethod
    def fixture():
        pcm = np.full(824336, 1000, dtype="<i2")
        pcm[663600:746160] = 0  # 27.65..31.09 s: synthetic physical silence
        stream = io.BytesIO()
        with wave.open(stream, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(pcm.tobytes())
        original = stream.getvalue()
        rows = [{"word": "earlier", "start": i*.02, "end": i*.02+.01}
                for i in range(69)]
        rows.append({"word": "That's", "start": 30.8, "end": 31.4})
        asr = json.dumps({"sourceWavSha256": digest(original),
                          "mayPublish": False, "recognizedWords": rows}).encode()
        return original, asr

    def test_290ms_impossible_word_onset_detected_physically(self):
        original, asr = self.fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(original)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr)):
                result = audit_original_asr_digital_zero_onsets(original, asr)
        self.assertEqual(result["status"], "RESEARCH_IMPOSSIBLE_ASR_ZERO_ONSET_HOLD", result)
        self.assertEqual(result["wordCountScreened"], 70)
        self.assertEqual(result["contradictionCount"], 1)
        row = result["contradictions"][0]
        self.assertEqual(row["wordIndex"], 69)
        self.assertEqual(row["claimedStartSample"], 739200)
        self.assertEqual(row["firstNonzeroSampleOrOneSecondLimit"], 746160)
        self.assertEqual(row["provenDigitalZeroAfterOnsetMs"], 290)
        for key in ("mayPublish", "pronunciationVerified", "phonemeIdentityVerified",
                    "wordTimingCalibrated", "wordOnsetsApproved"):
            self.assertFalse(result[key])

    def test_nonzero_at_start_never_grants_timing_or_voice_certification(self):
        original, asr = self.fixture()
        data = json.loads(asr)
        data["recognizedWords"][-1]["start"] = 31.10
        modified = json.dumps(data).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(original)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(modified)):
                out = audit_original_asr_digital_zero_onsets(original, modified)
        self.assertEqual(out["status"], "RESEARCH_NO_ZERO_ONSET_CONTRADICTION_HOLD")
        self.assertEqual(out["contradictionCount"], 0)
        self.assertFalse(out["wordOnsetsApproved"])

    def test_short_word_wholly_in_110ms_digital_silence_is_flagged(self):
        original, asr = self.fixture()
        with wave.open(io.BytesIO(original), "rb") as source:
            pcm = np.frombuffer(source.readframes(source.getnframes()),
                                dtype="<i2").copy()
        # A 110ms silence is below the original 150ms onset threshold.
        pcm[100000:102640] = 0
        rebuilt = io.BytesIO()
        with wave.open(rebuilt, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(pcm.tobytes())
        updated_wav = rebuilt.getvalue()
        receipt = json.loads(asr)
        receipt["sourceWavSha256"] = digest(updated_wav)
        receipt["recognizedWords"][68].update({
            "word": "short", "start": 100100 / 24000,
            "end": 101300 / 24000})
        changed_asr = json.dumps(receipt).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(updated_wav)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(changed_asr)):
                result = audit_original_asr_digital_zero_onsets(updated_wav, changed_asr)
        self.assertEqual(result["status"], "RESEARCH_IMPOSSIBLE_ASR_ZERO_ONSET_HOLD")
        self.assertEqual(result["contradictionCount"], 2)
        short = next(x for x in result["contradictions"] if x["wordIndex"] == 68)
        self.assertLess(short["provenDigitalZeroAfterOnsetMs"], 150)
        self.assertTrue(short["entireClaimedWordIntervalIsDigitalZero"])
        self.assertEqual(short["contradictionType"], "FULL_WORD_DIGITAL_ZERO")
        self.assertEqual(short["claimedEndSample"], 101300)
        self.assertFalse(result["wordOnsetsApproved"])
        self.assertFalse(result["mayPublish"])

    def test_short_silence_crossing_nonzero_is_not_falsely_full_word(self):
        original, asr = self.fixture()
        with wave.open(io.BytesIO(original), "rb") as source:
            pcm = np.frombuffer(source.readframes(source.getnframes()),
                                dtype="<i2").copy()
        pcm[100000:102640] = 0
        rebuilt = io.BytesIO()
        with wave.open(rebuilt, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(pcm.tobytes())
        updated_wav = rebuilt.getvalue()
        receipt = json.loads(asr)
        receipt["sourceWavSha256"] = digest(updated_wav)
        receipt["recognizedWords"][68].update({
            "word": "crossing", "start": 100100 / 24000,
            "end": 103600 / 24000})
        changed_asr = json.dumps(receipt).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(updated_wav)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(changed_asr)):
                result = audit_original_asr_digital_zero_onsets(updated_wav, changed_asr)
        self.assertEqual(result["contradictionCount"], 1)
        self.assertEqual(result["contradictions"][0]["wordIndex"], 69)
        self.assertEqual(result["contradictions"][0]["contradictionType"],
                         "ONSET_150MS_BEFORE_ANY_NONZERO")
        self.assertFalse(result["mayPublish"])

    def test_subsample_length_asr_word_is_invalid_not_falsely_silent(self):
        original, asr = self.fixture()
        receipt = json.loads(asr)
        receipt["recognizedWords"][0].update({"start": 0.003,
                                               "end": 0.003001})
        changed_asr = json.dumps(receipt).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(original)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(changed_asr)):
                out = audit_original_asr_digital_zero_onsets(original, changed_asr)
        self.assertEqual(out["status"], "HOLD")
        self.assertIn("DIGITAL_ZERO_ASR_WORD_INTERVAL_COLLAPSES_TO_ZERO_SAMPLES",
                      out["errors"])
        self.assertFalse(out["mayPublish"])

    def test_source_hash_and_asr_hash_tamper_are_rejected(self):
        original, asr = self.fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(original)):
            with patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr)):
                altered = bytearray(original)
                altered[-10] ^= 1
                out = audit_original_asr_digital_zero_onsets(bytes(altered), asr)
                self.assertIn("DIGITAL_ZERO_ORIGINAL_WAV_SHA_CHANGED", out["errors"])
                self.assertEqual(out["status"], "HOLD")
                out = audit_original_asr_digital_zero_onsets(original, asr+b" ")
                self.assertIn("DIGITAL_ZERO_ORIGINAL_ASR_SHA_CHANGED", out["errors"])
                self.assertFalse(out["mayPublish"])

    def test_missing_source_cli_never_implies_acceptance(self):
        cmd = subprocess.run([
            sys.executable, str(Path(__file__).with_name("repeated_term_acoustic_guard.py")),
            "--original-wav", "/nonexistent/narration.wav", "--pose-asr-receipt",
            "/nonexistent/asr.json", "--asr-zero-onset-audit"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(cmd.returncode, 2, cmd.stderr)
        self.assertIn('"status": "HOLD"', cmd.stdout)
        self.assertIn('"mayPublish": false', cmd.stdout)


    @staticmethod
    def mfa_signal_fixture(silence_at_word_20=False):
        pcm = np.full(824336, 1500, dtype="<i2")
        if silence_at_word_20:
            pcm[96000:98400] = 0
        wav_out = io.BytesIO()
        with wave.open(wav_out, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(pcm.tobytes())
        source = wav_out.getvalue()
        words = [
            {"word": "candidate", "startMs": i * 200.0,
             "endMs": i * 200.0 + 100.0} for i in range(73)
        ]
        candidate = json.dumps({
            "inputSha256": {"wav": digest(source)},
            "sampleRate": 24000, "sampleCount": 824336,
            "mayPublish": False, "pronunciationVerified": False,
            "timingAccuracyCalibrated": False,
            "wordAlignment": words,
        }).encode()
        return source, candidate

    def test_mfa_73_source_word_windows_have_no_false_approval(self):
        wav_raw, alignment_raw = self.mfa_signal_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)):
            with patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(alignment_raw)):
                result = original_guard.audit_original_mfa_word_signal_windows(
                    wav_raw, alignment_raw)
        self.assertEqual(result["status"], "RESEARCH_MFA_NO_FULL_ZERO_WORD_HOLD")
        self.assertEqual(result["mfaWordWindowsScreened"], 73)
        self.assertEqual(result["wholeWordDigitalZeroCount"], 0)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["wordOnsetsApproved"])
        self.assertFalse(result["wordTimingCalibrated"])
        self.assertFalse(result["phonemeIdentityVerified"])

    def test_mfa_wholly_silent_forced_word_is_detected_physically(self):
        wav_raw, alignment_raw = self.mfa_signal_fixture(silence_at_word_20=True)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)):
            with patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(alignment_raw)):
                result = original_guard.audit_original_mfa_word_signal_windows(
                    wav_raw, alignment_raw)
        self.assertEqual(result["status"], "RESEARCH_MFA_WHOLE_WORD_ZERO_HOLD")
        self.assertEqual(result["wholeWordDigitalZeroCount"], 1)
        self.assertEqual(result["wholeWordDigitalZeroContradictions"], [{
            "wordIndex": 20, "forcedWordHypothesis": "candidate",
            "startSample": 96000, "endSample": 98400,
            "wholeCandidateWindowIsExactDigitalZero": True}])
        self.assertFalse(result["mayPublish"])

    def test_mfa_source_sha_and_schema_tampering_fail_closed(self):
        wav_raw, candidate = self.mfa_signal_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)):
            with patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(candidate)):
                bad_wav = wav_raw[:-2] + bytes([wav_raw[-2] ^ 1, wav_raw[-1]])
                result = original_guard.audit_original_mfa_word_signal_windows(
                    bad_wav, candidate)
                self.assertEqual(result["status"], "HOLD")
                self.assertIn("MFA_SIGNAL_ORIGINAL_WAV_SHA_CHANGED", result["errors"])
                data = json.loads(candidate)
                data["wordAlignment"][4]["startMs"] = False
                changed = json.dumps(data).encode()
                result = original_guard.audit_original_mfa_word_signal_windows(
                    wav_raw, changed)
                self.assertEqual(result["status"], "HOLD")
                self.assertIn("MFA_SIGNAL_ALIGNMENT_SHA_CHANGED", result["errors"])
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)):
            with patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(changed)):
                result = original_guard.audit_original_mfa_word_signal_windows(
                    wav_raw, changed)
        self.assertEqual(result["status"], "HOLD")
        self.assertIn("MFA_SIGNAL_WORD_BOUNDS_OR_ORDER_INVALID", result["errors"])

    def test_mfa_signal_cli_missing_source_never_certifies(self):
        cmd = subprocess.run([
            sys.executable, str(Path(__file__).with_name("repeated_term_acoustic_guard.py")),
            "--mfa-zero-interval-audit", "--original-wav", "/nonexistent/master.wav",
            "--mfa-alignment", "/nonexistent/align.json"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(cmd.returncode, 2, cmd.stderr)
        self.assertIn('"mayPublish": false', cmd.stdout)
        self.assertIn('"status": "HOLD"', cmd.stdout)


    @staticmethod
    def cross_model_fixture():
        """73 synthetic authored, 70 synthetic guessed; 6 lexical + 30 timing.

        Invented word labels, not actual original transcript or phonetic gold.
        """
        pcm = np.full(824336, 930, dtype="<i2")
        out = io.BytesIO()
        with wave.open(out, "wb") as wav:
            wav.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            wav.writeframes(pcm.tobytes())
        original = out.getvalue()
        authored = [{"word": f"w{i:02}", "startMs": 100 + i*440,
                     "endMs": 350 + i*440} for i in range(73)]
        alignment = json.dumps({
            "inputSha256": {"wav": digest(original)},
            "sampleRate": 24000, "sampleCount": 824336,
            "mayPublish": False, "pronunciationVerified": False,
            "timingAccuracyCalibrated": False,
            "wordAlignment": authored,
        }).encode()
        replacements = {2: (3, ("sevenoh",)), 7: (1, ("mitrogenine",)),
                        16: (2, ("seven", "hydroxyl")), 19: (1, ("mitrogenine",)),
                        37: (1, ("poles",)), 63: (2, ("thats",))}
        matched = [i for i in range(73)
                   if not any(start <= i < start+count
                              for start, (count, _) in replacements.items())]
        onset_flagged = set(matched[:15])
        offset_flagged = set(matched[14:30])
        guessed = []
        i = 0
        while i < 73:
            if i in replacements:
                consumed, replacement_words = replacements[i]
                for j, spoken in enumerate(replacement_words):
                    source_index = i+j
                    end_index = (i+consumed-1 if len(replacement_words) == 1
                                 else source_index)
                    guessed.append({"word": spoken,
                                    "start": authored[source_index]["startMs"]/1000,
                                    "end": authored[end_index]["endMs"]/1000})
                i += consumed
                continue
            m = authored[i]
            guessed.append({"word": m["word"],
                            "start": (m["startMs"] + (215 if i in onset_flagged else 0))/1000,
                            "end": (m["endMs"] + (210 if i in offset_flagged else 0))/1000})
            i += 1
        assert len(guessed) == 70
        asr = json.dumps({
            "sourceWavSha256": digest(original), "mayPublish": False,
            "recognizedWords": guessed,
        }).encode()
        return original, alignment, asr

    def test_original_cross_model_queue_six_lexical_thirty_distinct_timing(self):
        audio, mfa, asr = self.cross_model_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(audio)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            result = original_guard.audit_original_cross_model_word_timing(
                audio, mfa, asr)
        self.assertEqual(result["status"], "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD", result)
        self.assertEqual(result["matchedWordPairCount"], 63)
        self.assertEqual(result["lexicalDisagreementBlockCount"], 6)
        self.assertEqual(result["onsetDisagreementOverThresholdCount"], 15)
        self.assertEqual(result["offsetDisagreementOverThresholdCount"], 16)
        self.assertEqual(result["distinctMatchedWordTimingReviewCount"], 30)
        self.assertEqual(result["reviewQueueCaseCount"], 36)
        self.assertEqual(len(result["lexicalDisagreements"]), 6)
        self.assertEqual(len(result["timingReviews"]), 30)
        for case in [*result["lexicalDisagreements"], *result["timingReviews"]]:
            lo, hi = case["sourceStartSample"], case["sourceEndSample"]
            with wave.open(io.BytesIO(audio), "rb") as w:
                pcm = w.readframes(w.getnframes())
            self.assertEqual(digest(pcm[lo*2:hi*2]), case["sourcePcmSha256"])
        for key in ("mayPublish", "pronunciationVerified",
                    "phonemeIdentityVerified", "wordTimingCalibrated",
                    "captionTimingApproved", "independentHumanAnnotationPresent"):
            self.assertFalse(result[key])
        self.assertIsNone(result["lexicalWinner"])

    def test_cross_model_mismatched_sha_and_malformed_bounds_fail_closed(self):
        audio, mfa, asr = self.cross_model_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(audio)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            r = original_guard.audit_original_cross_model_word_timing(
                audio[:-2]+b"00", mfa, asr)
            self.assertEqual(r["status"], "HOLD")
            self.assertIn("CROSS_MODEL_WAV_SHA_MISMATCH", r["errors"])
        data = json.loads(asr)
        data["recognizedWords"][1]["start"] = True
        altered = json.dumps(data).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(audio)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(altered))):
            r = original_guard.audit_original_cross_model_word_timing(
                audio, mfa, altered)
            self.assertEqual(r["status"], "HOLD")
            self.assertIn("CROSS_MODEL_WORD_TIMES_OR_TEXT_INVALID", r["errors"])
            self.assertFalse(r["mayPublish"])

    def test_cross_model_cli_requires_exclusive_three_sha_pinned_sources(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        cmd = subprocess.run([sys.executable, script,
            "--cross-model-timing-review", "--original-wav", "/nonexistent.wav",
            "--mfa-alignment", "/nonexistent.json",
            "--pose-asr-receipt", "/nonexistent-asr.json"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(cmd.returncode, 2, cmd.stderr)
        self.assertIn('"mayPublish": false', cmd.stdout)
        self.assertIn('"status": "HOLD"', cmd.stdout)
        mixed = subprocess.run([sys.executable, script,
            "--cross-model-timing-review", "--original-wav", "/nonexistent.wav",
            "--mfa-alignment", "/nonexistent.json",
            "--pose-asr-receipt", "/nonexistent-asr.json",
            "--asr-zero-onset-audit"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(mixed.returncode, 2, mixed.stderr)
        self.assertIn("CROSS_MODEL_REVIEW_REQUIRES_EXACT_THREE_SOURCE_INPUTS",
                      mixed.stdout)



    @staticmethod
    def source_bound_listening_fixture():
        wav_raw, mfa, asr = OriginalDigitalZeroNegativeTests.cross_model_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            queue = original_guard.audit_original_cross_model_word_timing(
                wav_raw, mfa, asr)
        assert queue["status"] == "RESEARCH_ORIGINAL_WORD_REVIEW_QUEUE_HOLD"
        decisions = [
            {"id": f"LEX-{i:02d}", "heard": "unreviewed",
             "timing": "unreviewed", "notes": ""}
            for i in range(1, 7)]
        decisions += [
            {"id": f"TIME-{i:02d}", "heard": "unreviewed",
             "timing": "unreviewed", "notes": ""}
            for i in range(1, 31)]
        notes = {"schema": "ths-lane2-human-listening-notes-v1",
                 "originalWavSha256": digest(wav_raw),
                 "reviewerSelfReported": True,
                 "phoneticGroundTruthIndependentlyValidated": False,
                 "mayPublish": False,
                 "reviewedAt": "2026-10-16T23:47:20.123Z",
                 "decisions": decisions}
        return queue, notes

    def test_offline_player_blank_and_partial_notes_bind_without_gold_promotion(self):
        queue, notes = self.source_bound_listening_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          queue["sourceWavSha256"]):
            result = original_guard.bind_self_reported_listening_notes(
                queue, json.dumps(notes).encode())
            self.assertEqual(result["status"],
                             "RESEARCH_SELF_REPORTED_LISTENING_HANDOFF_HOLD", result)
            self.assertEqual(result["sourceCaseCount"], 36)
            self.assertEqual(result["selfReportedCaseCount"], 0)
            self.assertEqual(result["unreviewedCaseCount"], 36)
            # Import the actual browser's choices and multiline textarea values.
            notes["decisions"][0].update({
                "heard": "written_mfa", "timing": "unclear",
                "notes": "possible phoneme?\\nneeds independent ear review"})
            notes["decisions"][-1].update({
                "heard": "unreviewed", "timing": "asr_closer", "notes": ""})
            result = original_guard.bind_self_reported_listening_notes(
                queue, json.dumps(notes).encode())
        self.assertEqual(result["selfReportedCaseCount"], 2)
        self.assertEqual(result["unreviewedCaseCount"], 34)
        self.assertTrue(result["selfReportValuesJoinedToPinnedSourceCases"])
        one = next(x for x in result["caseNotes"] if x["caseId"] == "LEX-01")
        self.assertEqual(one["originalSourcePcmSha256"],
                         queue["lexicalDisagreements"][0]["sourcePcmSha256"])
        self.assertEqual(one["originalStartSample"],
                         queue["lexicalDisagreements"][0]["sourceStartSample"])
        self.assertIn("independent ear review", one["selfReportedNotes"])
        for name in ("mayPublish", "captionTimingApproved", "wordTimingCalibrated",
                     "pronunciationVerified", "phonemeIdentityVerified",
                     "independentHumanAnnotationVerified", "speakerIdentityVerified"):
            self.assertFalse(result[name], name)
        self.assertIsNone(result["lexicalWinner"])

    def test_offline_review_rejects_duplication_missing_cases_wrong_source(self):
        queue, notes = self.source_bound_listening_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          queue["sourceWavSha256"]):
            scenarios = [
                ("duplicate", lambda x: x["decisions"][-1].update(
                    {"id": "LEX-01"}), "LISTENING_NOTES_UNKNOWN_OR_DUPLICATE_CASE"),
                ("missing", lambda x: x["decisions"].pop(),
                 "LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID"),
                ("source", lambda x: x.update({"originalWavSha256": "0"*64}),
                 "LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID"),
                ("publish", lambda x: x.update({"mayPublish": True}),
                 "LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID"),
                ("independent", lambda x: x.update({
                    "phoneticGroundTruthIndependentlyValidated": True}),
                 "LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID"),
                ("unknown", lambda x: x["decisions"][0].update({
                    "heard": "confirmed_pose", "timing": "approved"}),
                 "LISTENING_NOTES_DECISION_VALUE_INVALID"),
                ("extra", lambda x: x.update({"captionTimingApproved": True}),
                 "LISTENING_NOTES_SCHEMA_SOURCE_OR_STATUS_INVALID"),
                ("notes_oversize", lambda x: x["decisions"][0].update({
                    "notes": "x"*2001}),
                 "LISTENING_NOTES_DECISION_VALUE_INVALID"),
            ]
            for name, modifier, expected in scenarios:
                with self.subTest(name=name):
                    candidate = json.loads(json.dumps(notes))
                    modifier(candidate)
                    result = original_guard.bind_self_reported_listening_notes(
                        queue, json.dumps(candidate).encode())
                    self.assertEqual(result["status"], "HOLD", result)
                    self.assertIn(expected, result["errors"], result)
                    self.assertFalse(result["mayPublish"])
            # Fail even if an attacker inserts a duplicate key in a different
            # order to exploit first-wins/last-wins JSON parsers.
            raw = json.dumps(notes)
            duplicate = raw.replace('"mayPublish": false',
                                    '"mayPublish": true, "mayPublish": false', 1)
            result = original_guard.bind_self_reported_listening_notes(
                queue, duplicate.encode())
            self.assertEqual(result["status"], "HOLD")
            self.assertIn("LISTENING_NOTES_JSON_OR_CASES_UNREADABLE", result["errors"])

    def test_offline_review_cli_must_use_cross_model_mode(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        request = subprocess.run([
            sys.executable, script, "--human-review-json",
            "/nonexistent/listener-export.json"], capture_output=True, text=True,
            timeout=20)
        self.assertEqual(request.returncode, 2)
        self.assertIn("LISTENING_NOTES_REQUIRES_EXCLUSIVE_CROSS_MODEL_SOURCE_MODE",
                      request.stdout)
        self.assertIn('"mayPublish": false', request.stdout)
        request = subprocess.run([
            sys.executable, script, "--cross-model-timing-review",
            "--human-review-json", "/nonexistent/listener-export.json",
            "--original-wav", "/nonexistent/master.wav",
            "--mfa-alignment", "/nonexistent/mfa.json",
            "--pose-asr-receipt", "/nonexistent/asr.json"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(request.returncode, 2)
        self.assertIn("CROSS_MODEL_REVIEW_FILES_MISSING_OR_UNSAFE", request.stdout)
        self.assertIn('"mayPublish": false', request.stdout)



    @staticmethod
    def original_dead_air_fixture(inject=True):
        original, mfa, asr = OriginalDigitalZeroNegativeTests.cross_model_fixture()
        if not inject:
            return original, mfa, asr
        with wave.open(io.BytesIO(original), "rb") as source:
            samples = np.frombuffer(source.readframes(source.getnframes()),
                                    dtype="<i2").copy()
        samples[663600:746160] = 0  # 27.65–31.09s: 3.44s source-like pause
        out = io.BytesIO()
        with wave.open(out, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(samples.tobytes())
        changed = out.getvalue()
        m = json.loads(mfa)
        m["inputSha256"]["wav"] = digest(changed)
        mfa = json.dumps(m).encode()
        a = json.loads(asr)
        a["sourceWavSha256"] = digest(changed)
        asr = json.dumps(a).encode()
        return changed, mfa, asr

    def test_long_original_zero_pause_creative_hold_and_conflicting_asr(self):
        wav_raw, mfa, asr = self.original_dead_air_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            report = original_guard.audit_original_narration_dead_air(
                wav_raw, mfa, asr)
        self.assertEqual(report["status"], "RESEARCH_DEAD_AIR_CREATIVE_REVIEW_HOLD",
                         report)
        self.assertEqual(report["longDigitalZeroIntervalCount"], 1, report)
        pause = report["longDigitalZeroIntervals"][0]
        self.assertEqual(pause["startSample"], 663600)
        self.assertEqual(pause["endSample"], 746160)
        self.assertEqual(pause["durationMs"], 3440)
        self.assertTrue(pause["allOriginalPcmSamplesAreZero"])
        self.assertTrue(pause["asrOnsetsClaimedDuringDigitalZero"])
        self.assertEqual(pause["zeroPcmSha256"],
                         digest(bytes((746160 - 663600)*2)))
        for key in ("mayPublish", "pronunciationVerified",
                    "phonemeIdentityVerified", "wordTimingCalibrated",
                    "captionTimingApproved", "pauseCraftApproved",
                    "audioAltered", "automaticPauseRemovalAllowed",
                    "automaticCaptionShiftAllowed"):
            self.assertFalse(report[key], key)

    def test_audio_without_long_digital_zero_grants_no_approval(self):
        wav_raw, mfa, asr = self.original_dead_air_fixture(inject=False)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            result = original_guard.audit_original_narration_dead_air(
                wav_raw, mfa, asr)
        self.assertEqual(result["longDigitalZeroIntervalCount"], 0)
        self.assertEqual(result["status"], "RESEARCH_DEAD_AIR_CREATIVE_REVIEW_HOLD")
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["captionTimingApproved"])

    def test_dead_air_tampered_master_and_wrong_mode_refused(self):
        wav_raw, mfa, asr = self.original_dead_air_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(wav_raw)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA", digest(mfa))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA", digest(asr))):
            bad = wav_raw[:-2] + bytes([wav_raw[-2] ^ 1, wav_raw[-1]])
            result = original_guard.audit_original_narration_dead_air(
                bad, mfa, asr)
        self.assertEqual(result["status"], "HOLD")
        self.assertIn("DEAD_AIR_REQUIRES_AUTHENTICATED_CROSS_MODEL_SOURCES",
                      result["errors"])
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        process = subprocess.run([
            sys.executable, script, "--original-dead-air-review",
            "--original-wav", "/nonexistent/voice.wav",
            "--mfa-alignment", "/nonexistent/mfa.json",
            "--pose-asr-receipt", "/nonexistent/asr.json",
            "--cross-model-timing-review"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(process.returncode, 2, process.stderr)
        self.assertIn("DEAD_AIR_REQUIRES_EXCLUSIVE_ORIGINAL_THREE_SOURCE_MODE",
                      process.stdout)
        self.assertIn('"mayPublish": false', process.stdout)



    @staticmethod
    def pause_preview_fixture(keep_ms=1200):
        original, _, _ = OriginalDigitalZeroNegativeTests.original_dead_air_fixture()
        with wave.open(io.BytesIO(original), "rb") as w:
            pcm = w.readframes(w.getnframes())
        begin, end, left, right = 663600, 746160, 628800, 775200
        cut = begin + keep_ms * 24
        data = pcm[left*2:cut*2] + pcm[end*2:right*2]
        output = io.BytesIO()
        with wave.open(output, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(data)
        return original, output.getvalue()

    def test_original_pause_auditions_three_preserve_voice_pcm_bit_exact(self):
        for retain in (3440, 1200, 650):
            with self.subTest(retain=retain):
                source, preview = self.pause_preview_fixture(retain)
                with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                                  digest(source)):
                    r = original_guard.audit_original_pause_audition_pcm(
                        source, preview, retain)
                self.assertEqual(r["status"], "RESEARCH_EXACT_ZERO_PAUSE_AUDITION_HOLD", r)
                self.assertTrue(r["voicePcmSamplesPreservedExactly"])
                self.assertTrue(r["removedOnlyExactZeroSamples"])
                self.assertEqual(r["removedPauseMs"], 3440 - retain)
                self.assertEqual(r["previewSampleCount"],
                                 146400 - (3440 - retain) * 24)
                self.assertEqual(r["candidateWavSha256"], digest(preview))
                self.assertFalse(r["mayPublish"])
                self.assertFalse(r["previewApprovedForProduction"])
                self.assertFalse(r["captionTimingApproved"])
                self.assertFalse(r["wordTimingCalibrated"])

    def test_pause_audition_rejects_one_changed_real_voice_sample(self):
        source, preview = self.pause_preview_fixture(1200)
        with wave.open(io.BytesIO(preview), "rb") as w:
            pcm = bytearray(w.readframes(w.getnframes()))
        # One bit changed in a real nonzero sample before the original pause.
        pcm[15] ^= 1
        changed = io.BytesIO()
        with wave.open(changed, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(pcm)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(source)):
            r = original_guard.audit_original_pause_audition_pcm(
                source, changed.getvalue(), 1200)
        self.assertEqual(r["status"], "HOLD", r)
        self.assertIn("PAUSE_PREVIEW_NONZERO_VOICE_OR_CUT_OFFSET_CHANGED", r["errors"])
        self.assertFalse(r["mayPublish"])

    def test_pause_audition_rejects_wrong_cut_claim_or_source_change(self):
        source, preview = self.pause_preview_fixture(650)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(source)):
            r = original_guard.audit_original_pause_audition_pcm(
                source, preview, 1200)
            self.assertEqual(r["status"], "HOLD")
            self.assertIn("PAUSE_PREVIEW_FRAME_COUNT_OR_LENGTH_INVALID", r["errors"])
            r = original_guard.audit_original_pause_audition_pcm(
                source, preview, 250)
            self.assertIn("PAUSE_PREVIEW_RETAINED_DURATION_NOT_IN_RESEARCH_SET",
                          r["errors"])
            r = original_guard.audit_original_pause_audition_pcm(
                source[:-2] + b"00", preview, 650)
            self.assertIn("PAUSE_PREVIEW_ORIGINAL_WAV_SHA_CHANGED", r["errors"])
        with wave.open(io.BytesIO(source), "rb") as w:
            pcm = bytearray(w.readframes(w.getnframes()))
        pcm[700000*2] = 1  # Artificially add signal in original certified zero gap.
        changed_source = io.BytesIO()
        with wave.open(changed_source, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(pcm)
        forged = changed_source.getvalue()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(forged)):
            r = original_guard.audit_original_pause_audition_pcm(
                forged, preview, 650)
        self.assertIn(
            "PAUSE_PREVIEW_EXPECTED_PHYSICAL_SOURCE_SILENCE_MISSING",
            r["errors"])
        self.assertFalse(r["mayPublish"])

    def test_pause_audition_cli_refuses_missing_and_implicit_modes(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        commands = [
            (["--original-pause-audition-audit",
              "--original-wav", "/nonexistent/original.wav",
              "--pause-preview-wav", "/nonexistent/preview.wav",
              "--pause-retained-ms", "650"],
             "PAUSE_PREVIEW_FILES_MISSING_OR_UNSAFE"),
            (["--pause-preview-wav", "/nonexistent/preview.wav",
              "--pause-retained-ms", "1200"],
             "PAUSE_PREVIEW_ARGUMENTS_REQUIRE_EXPLICIT_AUDIT_MODE"),
            (["--original-pause-audition-audit",
              "--original-wav", "/nonexistent/original.wav",
              "--pause-preview-wav", "/nonexistent/preview.wav",
              "--pause-retained-ms", "650", "--original-dead-air-review"],
             "PAUSE_PREVIEW_REQUIRES_EXCLUSIVE_SOURCE_AND_CANDIDATE"),
        ]
        for args, expected in commands:
            with self.subTest(expected=expected):
                p = subprocess.run([sys.executable, script, *args],
                    capture_output=True, text=True, timeout=20)
                self.assertEqual(p.returncode, 2, p.stderr)
                self.assertIn(expected, p.stdout)
                self.assertIn('"mayPublish": false', p.stdout)



    @staticmethod
    def frame_native_plan_fixture():
        original, _, _ = OriginalDigitalZeroNegativeTests.original_dead_air_fixture()
        # The hosted test is SYNTHETIC. The actual archived MP4+receipt are
        # replayed independently, and must never be counted as hosted fixtures.
        film = b"research-only-stand-in-native-video"
        words = [
            {"text": "That's" if i == 0 else f"word{i}",
             "startSec": round(31.25+i*.28, 6),
             "endSec": round(31.49+i*.28, 6)}
            for i in range(9)]
        receipt = {
            "videoSha256": digest(film),
            "sourceWavSha256": digest(original),
            "frames": 1031, "fps": 30, "isOriginalV5": False,
            "mayPublish": False, "pronunciationVerified": False,
            "candidateCaptionWindowsAppliedToFilm": True,
            "craftApproved": False, "scienceApproved": False,
            "scenes": [
                {"id": "sentence_5", "endSec": 27.35},
                {"id": "source_hold", "line": "",
                 "startSec": 27.35, "endSec": 31.25},
                {"id": "sentence_6", "startSec": 31.25,
                 "captionWords": words}
            ]}
        raw = json.dumps(receipt).encode()
        return original, film, raw

    def test_frame_native_plan_preserves_800_pcm_samples_per_30fps_frame(self):
        audio, film, receipt = self.frame_native_plan_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(audio)), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_VIDEO_SHA",
                             digest(film))), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                             digest(receipt))):
            result = original_guard.audit_archived_frame_native_pause_plan(
                audio, film, receipt)
        self.assertEqual(result["status"], "RESEARCH_FRAME_NATIVE_PAUSE_PLAN_HOLD",
                         result)
        self.assertEqual(result["samplesPerVideoFrame"], 800)
        self.assertEqual(result["originalExactZeroSamples"], [663600, 746160])
        plans = result["researchPlans"]
        self.assertEqual([x["removedWhole30fpsFrames"] for x in plans],
                         [0, 67, 84])
        self.assertEqual([x["cutStartOriginalSample"] for x in plans],
                         [664000, 664000, 664000])
        self.assertEqual([x["cutEndOriginalSample"] for x in plans],
                         [664000, 717600, 731200])
        self.assertEqual([x["researchProposedNativeFilmFrames"] for x in plans],
                         [1031, 964, 947])
        self.assertEqual([x["proposedRetainedOriginalPauseMs"] for x in plans],
                         [3440, 1206.666667, 640])
        self.assertEqual([x["researchProposedOriginalWavSamples"] for x in plans],
                         [824336, 770736, 757136])
        self.assertEqual([x["audioAuditionExactDurationIsNotFrameAligned"]
                          for x in plans], [False, True, True])
        self.assertEqual(plans[1]["firstFollowingCaptionProposalStartSec"],
                         round(31.25-67/30, 6))
        # Source cue 31.25s is 937.5 frames: no integer-frame
        # voice-preserving cut will snap its caption to 30fps by itself.
        for plan in plans:
            self.assertTrue(plan["captionSubframeTransitionsStillRequireFilmQA"])
            cues = plan["followingNineCaptionsResearchOnly"]
            self.assertEqual(len(cues), 9)
            self.assertAlmostEqual(
                cues[0]["proposedStartNearestFrameErrorMs"], 1000/60,
                places=5)
            for cue in cues:
                self.assertGreaterEqual(cue["proposedStartNearestFrameErrorMs"], 0)
                self.assertLessEqual(cue["proposedStartNearestFrameErrorMs"], 16.666667)
                self.assertGreaterEqual(cue["proposedEndNearestFrameErrorMs"], 0)
                self.assertLessEqual(cue["proposedEndNearestFrameErrorMs"], 16.666667)
        for flag in ("mayPublish", "productionEditApproved",
                     "captionTimingApproved", "wordTimingCalibrated",
                     "voicePronunciationVerified", "creativePauseApproved",
                     "originalVoiceOrFilmModified", "nativeVideoProduced",
                     "sourceCardReadingTimeApproved"):
            self.assertFalse(result[flag], flag)

    def test_frame_native_plan_mismatched_video_receipt_source_holds(self):
        audio, film, receipt = self.frame_native_plan_fixture()
        original_guard_ref = digest(audio)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          original_guard_ref), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_VIDEO_SHA",
                             digest(film))), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                             digest(receipt))):
            bad_film = film + b"tamper"
            r = original_guard.audit_archived_frame_native_pause_plan(
                audio, bad_film, receipt)
            self.assertIn("FRAME_PLAN_PINNED_NATIVE_FILM_SHA_CHANGED", r["errors"])
            bad_source = audio[:-2]+bytes([audio[-2]^1, audio[-1]])
            r = original_guard.audit_archived_frame_native_pause_plan(
                bad_source, film, receipt)
            self.assertIn("FRAME_PLAN_PINNED_ORIGINAL_WAV_SHA_CHANGED", r["errors"])
        altered = json.loads(receipt)
        altered["scenes"][-2]["endSec"] = 31.24
        changed = json.dumps(altered).encode()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          original_guard_ref), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_VIDEO_SHA",
                             digest(film))), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                             digest(changed))):
            r = original_guard.audit_archived_frame_native_pause_plan(
                audio, film, changed)
        self.assertEqual(r["status"], "HOLD")
        self.assertIn(
            "FRAME_PLAN_FILM_SOURCE_CARD_OR_FOLLOWING_CUE_CHANGED", r["errors"])
        self.assertFalse(r["mayPublish"])

    def test_frame_native_cues_cannot_overlap_or_disguise_empty_words(self):
        audio, film, receipt = self.frame_native_plan_fixture()
        for defect in ("overlap", "blank", "non_string"):
            with self.subTest(defect=defect):
                data = json.loads(receipt)
                cues = data["scenes"][-1]["captionWords"]
                if defect == "overlap":
                    # Individually valid absolute timestamps, but a word
                    # starts before its preceding cue has finished.
                    cues[2]["startSec"] = cues[1]["startSec"]
                elif defect == "blank":
                    cues[2]["text"] = "   "
                else:
                    cues[2]["text"] = 123
                altered = json.dumps(data).encode()
                with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                                  digest(audio)), (
                        patch.object(original_guard,
                                     "ARCHIVED_TIMED_NATIVE_VIDEO_SHA",
                                     digest(film))), (
                        patch.object(original_guard,
                                     "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                                     digest(altered))):
                    result = original_guard.audit_archived_frame_native_pause_plan(
                        audio, film, altered)
                self.assertEqual(result["status"], "HOLD")
                self.assertIn("FRAME_PLAN_FOLLOWING_CAPTION_CUE_INVALID",
                              result["errors"])
                self.assertFalse(result["mayPublish"])

    def test_frame_native_plan_missing_inputs_and_implicit_mode_hold(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        cases = [
            (["--frame-native-pause-plan",
              "--original-wav", "/nonexistent/source.wav",
              "--native-research-film", "/nonexistent/research.mp4",
              "--native-render-receipt", "/nonexistent/receipt.json"],
             "FRAME_PLAN_ARCHIVED_FILES_MISSING_OR_UNSAFE"),
            (["--native-research-film", "/nonexistent/research.mp4"],
             "FRAME_PLAN_FILM_RECEIPT_REQUIRE_EXPLICIT_RESEARCH_MODE"),
            (["--frame-native-pause-plan", "--original-wav", "missing.wav",
              "--native-research-film", "missing.mp4",
              "--native-render-receipt", "missing.json",
              "--original-pause-audition-audit"],
             "FRAME_PLAN_REQUIRES_THREE_EXCLUSIVE_SOURCE_INPUTS"),
        ]
        for args, error in cases:
            with self.subTest(error=error):
                r = subprocess.run([sys.executable, script, *args],
                    capture_output=True, text=True, timeout=20)
                self.assertEqual(r.returncode, 2, r.stderr)
                self.assertIn(error, r.stdout)
                self.assertIn('"mayPublish": false', r.stdout)



    @staticmethod
    def original_suffix_scene_fixture(kind_acoustic_variant="paired_trough"):
        # Synthetic 73-/70-token research receipts, real-length physical
        # digital-zero PCM and a stand-in receipt/film. NOT authentic media.
        original, film, old_receipt = (
            OriginalDigitalZeroNegativeTests.frame_native_plan_fixture())
        # Preserve the exact 27.65..31.09s digital-zero interval; model the
        # real-world low-level post-zero noise separately from audible attack.
        with wave.open(io.BytesIO(original), "rb") as w:
            original_pcm = np.frombuffer(
                w.readframes(w.getnframes()), dtype="<i2").copy()
        original_pcm[746160:round(31.26*24000)] = 1
        if kind_acoustic_variant == "paired_trough":
            original_pcm[round(31.59*24000):round(31.61*24000)] = 1
        elif kind_acoustic_variant == "single_quiet_window":
            original_pcm[round(31.59*24000):round(31.60*24000)] = 1
        elif kind_acoustic_variant == "no_trough":
            pass
        elif kind_acoustic_variant == "no_sustained_rise":
            original_pcm[round(31.59*24000):round(31.80*24000)] = 1
        else:
            raise ValueError("UNEXPECTED_SYNTHETIC_KIND_ACOUSTIC_VARIANT")
        out = io.BytesIO()
        with wave.open(out, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(original_pcm.tobytes())
        original = out.getvalue()
        mfa_words = [
            {"word": f"w{i}", "startMs": 100+i*420,
             "endMs": 300+i*420} for i in range(63)]
        last_mfa = [
            ("that", 31250, 31430), ("s", 31430, 31490),
            ("the", 31490, 31580), ("kind", 31580, 31770),
            ("of", 31770, 31870), ("detail", 31870, 32420),
            ("worth", 32420, 32790), ("looking", 32850, 33170),
            ("closer", 33170, 33650), ("at", 33650, 33890)]
        mfa_words.extend({"word": w, "startMs": a, "endMs": b}
                         for w, a, b in last_mfa)
        alignment = json.dumps({
            "inputSha256": {"wav": digest(original)},
            "sampleRate": 24000, "sampleCount": 824336,
            "mayPublish": False, "pronunciationVerified": False,
            "timingAccuracyCalibrated": False,
            "wordAlignment": mfa_words,
        }).encode()
        guesses = [
            {"word": f"r{i}", "start": round(.15+i*.44, 4),
             "end": round(.35+i*.44, 4)} for i in range(61)]
        suffix_asr = [
            ("That's", 30.8, 31.56), ("the", 31.56, 31.74),
            ("kind", 31.74, 31.88), ("of", 31.88, 31.96),
            ("detail", 31.96, 32.36), ("worth", 32.36, 32.88),
            ("looking", 32.88, 33.28), ("closer", 33.28, 33.64),
            ("at.", 33.64, 34.28)]
        guesses.extend({"word": w, "start": a, "end": b}
                       for w, a, b in suffix_asr)
        asr = json.dumps({
            "sourceWavSha256": digest(original), "mayPublish": False,
            "recognizedWords": guesses,
        }).encode()
        receipt = json.loads(old_receipt)
        # All three independently checked provenance joins must now point to
        # this changed SYNTHETIC source; don't weaken the source-pin guard.
        receipt["sourceWavSha256"] = digest(original)
        cues = [
            ("That's", 31.25, 31.49), ("the", 31.49, 31.58),
            ("kind", 31.58, 31.77), ("of", 31.77, 31.87),
            ("detail", 31.87, 32.42), ("worth", 32.42, 32.79),
            ("looking", 32.85, 33.17), ("closer", 33.17, 33.65),
            ("at.", 33.65, 33.89)]
        receipt["scenes"][-1]["captionWords"] = [
            {"text": word, "startSec": a, "endSec": b}
            for word, a, b in cues]
        receipt_raw = json.dumps(receipt).encode()
        return original, alignment, asr, film, receipt_raw

    @staticmethod
    def check_suffix_scene(five):
        original, alignment, asr, film, receipt = five
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          digest(original)), (
                patch.object(original_guard, "MFA_SOURCE_ALIGNMENT_SHA",
                             digest(alignment))), (
                patch.object(original_guard, "POSE_ASR_RECEIPT_SHA",
                             digest(asr))), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_VIDEO_SHA",
                             digest(film))), (
                patch.object(original_guard, "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                             digest(receipt))):
            return original_guard.audit_archived_suffix_cue_hypotheses(
                original, alignment, asr, film, receipt)

    def test_archived_suffix_nine_hypothesis_cues_and_source_zero_veto(self):
        five = self.original_suffix_scene_fixture()
        report = self.check_suffix_scene(five)
        self.assertEqual(report["status"],
                         "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD", report)
        self.assertEqual(report["cueCount"], 9)
        self.assertEqual(report["impossibleAsrOnsetCount"], 1)
        rise = report["postSilenceSustainedSignalRise"]
        self.assertEqual(rise["firstQualifyingWindowSec"], 31.26)
        self.assertEqual(rise["firstCaptionCueMinusSignalRiseMs"], -10.0)
        self.assertEqual(rise["firstEligibleVideoFrameMinusSignalRiseMs"], 6.667)
        self.assertEqual(rise["signalRiseMinusFirstAsrHypothesisMs"], 460.0)
        kind = report["kindSourceEnergyCorridor"]
        self.assertEqual(kind["status"], "RESEARCH_ENERGY_CORRIDOR_ONLY_HOLD")
        self.assertEqual(kind["twoWindowTroughSec"], [31.59, 31.61])
        self.assertEqual(kind["firstTwoWindowEnergyRiseSec"], 31.61)
        self.assertEqual(kind["riseMinusCaptionCandidateMs"], 30.0)
        self.assertEqual(kind["asrCandidateMinusRiseMs"], 130.0)
        self.assertTrue(kind["observedEnergyTransition"])
        self.assertFalse(kind["originalPcmWordOrPhonemeIdentified"])
        self.assertFalse(kind["newWordBoundaryCertified"])
        self.assertFalse(rise["phonemeOrWordOnsetIdentified"])
        self.assertTrue(rise["researchEnergyHeuristicOnly"])
        self.assertEqual(report["cueReviewRows"][0]["captionWord"], "That's")
        self.assertEqual(report["cueReviewRows"][0][
            "firstMathematicallyEligibleVideoFrame"], 938)
        self.assertTrue(report["cueReviewRows"][0][
            "asrClaimedOnsetDuringVerifiedPcmZero"])
        self.assertEqual(report["cueReviewRows"][0]["decision"],
                         "PHYSICALLY_IMPOSSIBLE_ASR_ONSET_REVIEW_HOLD")
        self.assertFalse(report["decodedCaptionPixelsVerifiedByThisAudit"])
        pcm = wave.open(io.BytesIO(five[0]), "rb").readframes(824336)
        for row in report["cueReviewRows"]:
            lo, hi = row["sourceReviewPcmRange"]
            self.assertEqual(
                digest(pcm[lo*2:hi*2]), row["sourceReviewPcmSha256"])
        for key in ("mayPublish", "pronunciationVerified",
                    "wordTimingCalibrated", "captionTimingApproved",
                    "nativeFilmModified", "independentHumanListeningVerified"):
            self.assertFalse(report[key])

    def test_kind_timing_single_low_window_never_conjures_word_attack(self):
        five = self.original_suffix_scene_fixture("single_quiet_window")
        report = self.check_suffix_scene(five)
        self.assertEqual(
            report["status"], "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD",
            report)
        kind = report["kindSourceEnergyCorridor"]
        self.assertEqual(kind["status"],
                         "NO_STABLE_TROUGH_THEN_RISE_REVIEW_HOLD")
        self.assertFalse(kind["observedEnergyTransition"])
        self.assertFalse(kind["captionTimingApproved"])
        self.assertFalse(report["mayPublish"])

    def test_kind_timing_no_timed_trough_or_no_rise_stays_hold(self):
        for variant in ("no_trough", "no_sustained_rise"):
            with self.subTest(variant=variant):
                report = self.check_suffix_scene(
                    self.original_suffix_scene_fixture(variant))
                self.assertEqual(report["status"],
                    "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD", report)
                kind = report["kindSourceEnergyCorridor"]
                self.assertFalse(kind["observedEnergyTransition"])
                self.assertEqual(
                    kind["status"], "NO_STABLE_TROUGH_THEN_RISE_REVIEW_HOLD")
                self.assertFalse(report["pronunciationVerified"])
                self.assertFalse(report["wordTimingCalibrated"])


    def test_post_silence_single_10ms_glitch_is_not_speech_onset(self):
        original, mfa, asr, film, receipt = (
            self.original_suffix_scene_fixture())
        with wave.open(io.BytesIO(original), "rb") as w:
            pcm = np.frombuffer(w.readframes(w.getnframes()), "<i2").copy()
        pcm[round(31.14*24000):round(31.15*24000)] = 6000
        stream = io.BytesIO()
        with wave.open(stream, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(pcm.tobytes())
        amended = stream.getvalue()
        a = json.loads(mfa)
        a["inputSha256"]["wav"] = digest(amended)
        b = json.loads(asr)
        b["sourceWavSha256"] = digest(amended)
        receipt_obj = json.loads(receipt)
        receipt_obj["sourceWavSha256"] = digest(amended)
        report = self.check_suffix_scene((
            amended, json.dumps(a).encode(), json.dumps(b).encode(),
            film, json.dumps(receipt_obj).encode()))
        self.assertEqual(report["status"],
                         "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD", report)
        self.assertEqual(report["postSilenceSustainedSignalRise"][
            "firstQualifyingWindowSec"], 31.26)
        self.assertFalse(report["wordTimingCalibrated"])

    def test_post_zero_without_sustained_rise_does_not_fake_time(self):
        original, mfa, asr, film, receipt = (
            self.original_suffix_scene_fixture())
        with wave.open(io.BytesIO(original), "rb") as w:
            pcm = np.frombuffer(w.readframes(w.getnframes()), "<i2").copy()
        pcm[746160:round(31.60*24000)] = 1
        stream = io.BytesIO()
        with wave.open(stream, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(pcm.tobytes())
        amended = stream.getvalue()
        a = json.loads(mfa)
        a["inputSha256"]["wav"] = digest(amended)
        b = json.loads(asr)
        b["sourceWavSha256"] = digest(amended)
        receipt_obj = json.loads(receipt)
        receipt_obj["sourceWavSha256"] = digest(amended)
        report = self.check_suffix_scene((
            amended, json.dumps(a).encode(), json.dumps(b).encode(),
            film, json.dumps(receipt_obj).encode()))
        self.assertEqual(report["status"], "HOLD")
        self.assertIn("SUFFIX_CUES_POST_ZERO_SUSTAINED_SIGNAL_NOT_FOUND",
                      report["errors"])
        self.assertFalse(report["mayPublish"])


    def test_archived_suffix_source_pin_or_incorrect_text_holds(self):
        five = self.original_suffix_scene_fixture()
        # Pinned inputs must all join before any word/cue analysis.
        for changed in (0, 1, 2, 3, 4):
            data = list(five)
            data[changed] += b"changed"
            with self.subTest(source=changed):
                self.assertEqual(self.check_suffix_scene(data)["status"], "HOLD")
        data = list(five)
        altered = json.loads(data[4])
        altered["scenes"][-1]["captionWords"][4]["text"] = "fabricated"
        data[4] = json.dumps(altered).encode()
        result = self.check_suffix_scene(data)
        self.assertIn("SUFFIX_CUES_SOURCE_LEXICAL_LAYOUT_CHANGED",
                      result["errors"])
        self.assertFalse(result["mayPublish"])

    def test_archived_suffix_cannot_promote_asr_to_phonetic_truth(self):
        original, mfa, asr, film, receipt = (
            self.original_suffix_scene_fixture())
        data = json.loads(asr)
        # Moving the first guess outside original silence does not prove
        # it became the right phoneme/word onset or approve the film.
        data["recognizedWords"][61]["start"] = 31.12
        asr = json.dumps(data).encode()
        report = self.check_suffix_scene((original, mfa, asr, film, receipt))
        self.assertEqual(report["status"],
                         "RESEARCH_ARCHIVED_SUFFIX_WORD_REVIEW_HOLD")
        self.assertEqual(report["impossibleAsrOnsetCount"], 0)
        self.assertFalse(report["pronunciationVerified"])
        self.assertFalse(report["captionTimingApproved"])
        self.assertTrue(report["reviewerDecisionRequired"])

    @staticmethod
    def encoded_aac_screen_fixture():
        """Real-duration synthetic speech carrier, NOT original media or AAC."""
        source, film, receipt = (
            OriginalDigitalZeroNegativeTests.frame_native_plan_fixture())
        with wave.open(io.BytesIO(source), "rb") as w:
            raw = np.frombuffer(w.readframes(w.getnframes()),
                                dtype="<i2").copy()
        # Physical nonconstant modulated synthetic tone permits genuinely
        # independent source-vs-decode waveform-lag negative controls.
        t = np.arange(len(raw), dtype=np.float64)/24000
        audio = .20*np.sin(2*np.pi*(155*t + 8*np.sin(t*.7)))
        audio *= (0.75 + .2*np.sin(2*np.pi*.75*t))
        raw[:] = np.rint(audio*32768).astype("<i2")
        raw[663600:746160] = 0
        out = io.BytesIO()
        with wave.open(out, "wb") as w:
            w.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            w.writeframes(raw.tobytes())
        source = out.getvalue()
        report = json.loads(receipt)
        report["sourceWavSha256"] = digest(source)
        receipt = json.dumps(report).encode()
        # Synthetic proxy of decoded f32le samples, not forged hosted AAC.
        decoded = np.concatenate(
            (raw.astype("<f4")/32768*.92, np.zeros(1008, dtype="<f4")))
        return source, film, receipt, decoded

    @staticmethod
    def check_synthetic_encoded(source, film, receipt, decoded):
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE",
                          digest(source)), (
                patch.object(original_guard,
                             "ARCHIVED_TIMED_NATIVE_VIDEO_SHA", digest(film))), (
                patch.object(original_guard,
                             "ARCHIVED_TIMED_NATIVE_RECEIPT_SHA",
                             digest(receipt))):
            return original_guard.audit_archived_encoded_audio_sync(
                source, film, receipt, decoded.astype("<f4").tobytes())

    def test_encoded_audio_six_actual_signal_windows_synthetic_only(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        report = self.check_synthetic_encoded(source, film, receipt, decoded)
        self.assertEqual(report["status"],
                         "RESEARCH_ARCHIVED_ENCODED_AUDIO_SYNC_HOLD", report)
        self.assertEqual(report["testedRealSignalWindows"], 6)
        self.assertEqual(report["decodedAacSampleCount"], 825344)
        gain = report["gainAndHeadroomResearch"]
        self.assertTrue(gain["encodedSamplePeakBelowFullScale"])
        self.assertFalse(gain["ebuR128TruePeakMeasuredByThisAudit"])
        self.assertFalse(gain["ebuR128IntegratedLoudnessMeasuredByThisAudit"])
        self.assertFalse(gain["gainIntentIndependentlyApproved"])
        self.assertFalse(gain["creativeLoudnessOrNaturalnessApproved"])
        self.assertAlmostEqual(gain["encodedVsSourceRmsGainDb"], -0.724,
                               delta=0.003)
        self.assertGreater(gain["sourceSamplePeakDbFS"], -22)
        self.assertGreaterEqual(report["rollingSignalScreen"]["speechActiveWindowCount"], 100)
        self.assertGreaterEqual(report["rollingSignalScreen"]["exactDigitalSilenceWindowCount"], 6)
        self.assertEqual(report["rollingSignalScreen"]["belowThresholdWindows"], [])
        self.assertEqual(report["rollingSignalScreen"]["unexpectedAudioDuringExactSourceSilence"], [])
        self.assertTrue(report["rollingSignalScreen"]["sourceWavEverySampleScreened"])
        self.assertEqual(report["rollingSignalScreen"]["finalSourceTailScreen"][
            "sampleCount"], 2336)
        self.assertFalse(report["rollingSignalScreen"]["finalSourceTailScreen"][
            "unmeasuredSourceTailRejected"])
        for item in report["diagnosticWindows"]:
            self.assertEqual(item["bestEnvelopeLagMs"], 0)
            self.assertGreater(item["zeroLagDecodedPcmCorrelation"], .99)
            self.assertTrue(item["signalSyncScreenPass"])
        for gate in ("mayPublish", "pronunciationVerified",
                     "phonemeIdentityVerified", "wordTimingCalibrated",
                     "captionTimingApproved", "audioCraftApproved",
                     "actualRevisedFilmReviewed", "decoderRunBoundToNativeFilm"):
            self.assertFalse(report[gate], gate)

    def test_encoded_added_dc_is_visible_despite_perfect_correlation(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        baseline = self.check_synthetic_encoded(source, film, receipt, decoded)
        self.assertEqual(baseline["status"],
                         "RESEARCH_ARCHIVED_ENCODED_AUDIO_SYNC_HOLD", baseline)
        self.assertFalse(baseline["gainAndHeadroomResearch"][
            "dcOffsetResearch"]["dcBiasRequiresReview"])
        with wave.open(io.BytesIO(source), "rb") as w:
            pcm = np.frombuffer(w.readframes(w.getnframes()),
                                dtype="<i2").copy()
        # Synthetic encoded-only DC injection alters no original media.
        # Inject only through sustained voiced source 2..24s: deliberately
        # avoid the 27.65..31.09s SOURCE-HOLD boundary, whose modulation
        # the preexisting 500ms correlation screen correctly rejects.
        # This isolates the actual previously-blind additive-DC failure mode.
        biased = decoded.copy()
        biased[2*24000:24*24000] += np.float32(.04)
        out = self.check_synthetic_encoded(source, film, receipt, biased)
        self.assertEqual(out["status"],
                         "RESEARCH_ARCHIVED_ENCODED_AUDIO_SYNC_HOLD", out)
        dc = out["gainAndHeadroomResearch"]["dcOffsetResearch"]
        self.assertTrue(dc["dcBiasRequiresReview"], dc)
        self.assertFalse(dc["sourceMayAlreadyCarryBias"])
        self.assertGreaterEqual(dc["encodedBiasedIntervals"], 20)
        self.assertFalse(dc["automaticHighpassOrGainChangeApproved"])
        self.assertFalse(out["mayPublish"])
        # The six and rolling Pearson correlation tests cannot distinguish
        # additive DC from untouched phonetic carrier; the independent
        # mean-amplitude diagnostic is therefore necessary.
        self.assertTrue(all(x["signalSyncScreenPass"]
                            for x in out["diagnosticWindows"]))
        self.assertFalse(out["rollingSignalScreen"]["belowThresholdWindows"])

    def test_full_scale_aac_peak_cannot_hide_inside_perfect_sync(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        for val in (1.0, -1.0, 1.002, -1.002):
            with self.subTest(peak=val):
                altered = decoded.copy()
                # This is a SINGLE-sample full-scale event. Every 500ms
                # speech window can remain >0.95 correlated despite it.
                altered[round(20.85*24000)] = val
                report = self.check_synthetic_encoded(
                    source, film, receipt, altered)
                self.assertEqual(report["status"], "HOLD")
                self.assertIn("ENCODED_AUDIO_FULL_SCALE_PCM_PEAK_HOLD",
                              report["errors"])
                self.assertFalse(report["mayPublish"])

    def test_nearly_full_scale_sample_requires_review_not_false_clipping(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        almost = decoded.copy()
        almost[round(20.85*24000)] = .995
        report = self.check_synthetic_encoded(source, film, receipt, almost)
        # This level still needs a real True-Peak measurement, but a
        # SAMPLE-peak hard stop must not mislabel .995 as >=full-scale.
        self.assertNotIn("ENCODED_AUDIO_FULL_SCALE_PCM_PEAK_HOLD",
                         report.get("errors", []))
        self.assertFalse(report["mayPublish"])

    def test_encoded_audio_shifted_and_corrupted_pcm_fail_closed(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        shifted = np.concatenate(
            (np.zeros(720, dtype="<f4"), decoded[:-720]))
        self.assertEqual(self.check_synthetic_encoded(
            source, film, receipt, shifted)["status"], "HOLD")
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      self.check_synthetic_encoded(
                          source, film, receipt, shifted)["errors"])
        for bad in (
                np.zeros_like(decoded),
                np.full_like(decoded, np.nan),
                decoded[:-1009],
                decoded[:-1]):
            with self.subTest(case=len(bad), rms=float(
                    np.nan_to_num(bad).std())):
                self.assertEqual(self.check_synthetic_encoded(
                    source, film, receipt, bad)["status"], "HOLD")

    def test_quiet_real_speech_window_cannot_be_dropped_between_loud_anchors(self):
        source, film, receipt, _ = self.encoded_aac_screen_fixture()
        with wave.open(io.BytesIO(source), "rb") as w:
            pcm = np.frombuffer(w.readframes(w.getnframes()), "<i2").copy()
        lo, hi = round(3.2*24000), round(3.8*24000)
        # Quiet physically nonzero speech, between all six louder anchor spans.
        pcm[lo:hi] = np.rint(pcm[lo:hi].astype(float)*.001).astype("<i2")
        with io.BytesIO() as sink:
            with wave.open(sink, "wb") as w:
                w.setparams((1,2,24000,0,"NONE","not compressed"))
                w.writeframes(pcm.tobytes())
            quiet_source = sink.getvalue()
        metadata = json.loads(receipt)
        metadata["sourceWavSha256"] = digest(quiet_source)
        quiet_receipt = json.dumps(metadata).encode()
        decoded = np.concatenate((
            pcm.astype("<f4")/32768*.92, np.zeros(1008,dtype="<f4")))
        intact = self.check_synthetic_encoded(
            quiet_source, film, quiet_receipt, decoded)
        self.assertEqual(intact["status"],
                         "RESEARCH_ARCHIVED_ENCODED_AUDIO_SYNC_HOLD", intact)
        self.assertGreaterEqual(
            intact["rollingSignalScreen"]["quietNonzeroSourceWindowCount"], 1)
        dropped = decoded.copy()
        dropped[lo:hi] = 0
        result = self.check_synthetic_encoded(
            quiet_source, film, quiet_receipt, dropped)
        self.assertEqual(result["status"], "HOLD", result)
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      result["errors"])
        losses = result["rollingSignalScreen"]["quietWindowFailures"]
        self.assertTrue(any(row["startSeconds"] == 3.25 for row in losses), losses)
        self.assertFalse(result["mayPublish"])

    def test_uncalibrated_ultrafaint_word_region_is_not_silent_pass(self):
        source, film, receipt, _ = self.encoded_aac_screen_fixture()
        with wave.open(io.BytesIO(source), "rb") as w:
            pcm = np.frombuffer(w.readframes(w.getnframes()), "<i2").copy()
        lo, hi = round(3.2*24000), round(3.8*24000)
        pcm[lo:hi] = np.rint(pcm[lo:hi].astype(float)*.0001).astype("<i2")
        self.assertTrue(np.any(pcm[lo:hi]))
        sink = io.BytesIO()
        with wave.open(sink, "wb") as w:
            w.setparams((1,2,24000,0,"NONE","not compressed"))
            w.writeframes(pcm.tobytes())
        faint_source = sink.getvalue()
        metadata = json.loads(receipt)
        metadata["sourceWavSha256"] = digest(faint_source)
        faint_receipt = json.dumps(metadata).encode()
        decoded = np.concatenate((
            pcm.astype("<f4")/32768*.92, np.zeros(1008,dtype="<f4")))
        result = self.check_synthetic_encoded(
            faint_source, film, faint_receipt, decoded)
        self.assertEqual(result["status"], "HOLD", result)
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      result["errors"])
        self.assertTrue(result["rollingSignalScreen"][
            "unresolvedUltraFaintSourceWindows"])
        self.assertFalse(result["mayPublish"])

    def test_rolling_screen_detects_unchecked_gap_audio_substitution(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        # Original six anchor windows do not cover this 4.1..4.4 sec gap.
        # A malicious splice there previously evaded every anchor check.
        modified = decoded.copy()
        modified[round(4.1*24000):round(4.4*24000)] = 0
        report = self.check_synthetic_encoded(
            source, film, receipt, modified)
        self.assertEqual(report["status"], "HOLD")
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      report["errors"])
        self.assertTrue(report["rollingSignalScreen"]["belowThresholdWindows"])
        self.assertFalse(report["mayPublish"])

    def test_rolling_screen_rejects_inserted_audio_during_exact_zero_hold(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        modified = decoded.copy()
        modified[29*24000:round(29.35*24000)] = .11
        report = self.check_synthetic_encoded(
            source, film, receipt, modified)
        self.assertEqual(report["status"], "HOLD")
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      report["errors"])
        self.assertTrue(report["rollingSignalScreen"][
            "unexpectedAudioDuringExactSourceSilence"])
        self.assertFalse(report["mayPublish"])

    def test_trailing_97ms_after_last_rolling_window_is_not_ignored(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        altered = decoded.copy()
        # The original 500ms/250ms grid ends at sample 822000, but
        # authenticated source ends at sample 824336.
        altered[823200:824336] = 0
        result = self.check_synthetic_encoded(
            source, film, receipt, altered)
        self.assertEqual(result["status"], "HOLD")
        self.assertIn("ENCODED_AUDIO_LOCALIZED_SIGNAL_OR_SILENCE_HOLD",
                      result["errors"])
        self.assertTrue(result["rollingSignalScreen"][
            "finalSourceTailScreen"]["unmeasuredSourceTailRejected"])
        self.assertFalse(result["mayPublish"])

    def test_encoded_audio_forged_source_and_receipt_do_not_grant_sync(self):
        source, film, receipt, decoded = self.encoded_aac_screen_fixture()
        self.assertIn("ENCODED_AUDIO_PINNED_SOURCE_PREFLIGHT_FAILED",
                      self.check_synthetic_encoded(
                          source, film+b"changed", receipt, decoded)["errors"])
        data = json.loads(receipt)
        data["scenes"][-2]["endSec"] = 31.24
        altered = json.dumps(data).encode()
        self.assertEqual(self.check_synthetic_encoded(
            source, film, altered, decoded)["status"], "HOLD")
        self.assertFalse(self.check_synthetic_encoded(
            source, film, receipt, decoded)["decoderRunBoundToNativeFilm"])

    def test_encoded_audio_cli_missing_or_mixed_modes_fail_closed(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        cases = [
            (["--archived-aac-sync-review",
              "--original-wav", "/not-here.wav",
              "--native-research-film", "/not-here.mp4",
              "--native-render-receipt", "/not-here.json"],
             "ENCODED_AUDIO_FILES_MISSING_OR_UNSAFE"),
            (["--archived-aac-sync-review",
              "--original-wav", "/not-here.wav",
              "--native-research-film", "/not-here.mp4"],
             "ENCODED_AUDIO_REQUIRES_EXCLUSIVE_ARCHIVED_THREE_INPUTS"),
            (["--archived-aac-sync-review", "--frame-native-pause-plan"],
             "ENCODED_AUDIO_REQUIRES_EXCLUSIVE_ARCHIVED_THREE_INPUTS"),
        ]
        for args, message in cases:
            with self.subTest(message=message):
                p = subprocess.run([sys.executable, script, *args],
                                   capture_output=True, text=True, timeout=20)
                self.assertEqual(p.returncode, 2, p.stdout+p.stderr)
                self.assertIn(message, p.stdout)
                self.assertIn('"mayPublish": false', p.stdout)




    # Reuse the already registered OriginalDigitalZeroNegativeTests class;
    # Lane2 hosted CI intentionally rejects new unregistered test classes.
    # Packet metadata is independent from bit-exact AAC payload.
    @staticmethod
    def packets(last_duration=16):
        result = []
        for i in range(807):
            result.append({"pts": -1024+i*1024,
                           "dts": -1024+i*1024,
                           "duration": last_duration if i == 806 else 1024,
                           "size": "4" if i >= 805 else "400"})
        return result

    def test_real_807_packet_shape_flags_final_eight_sample_difference(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        result = original_guard.compare_revised_aac_packet_timeline(
            self.packets(16), self.packets(8), sha, sha)
        self.assertEqual(result["status"],
                         "RESEARCH_REVISED_AAC_METADATA_MISMATCH_HOLD")
        self.assertEqual(result["audioPacketCount"], 807)
        self.assertTrue(result["bitExactAacPayloadPreserved"])
        self.assertFalse(result["packetTimelineMetadataEqual"])
        self.assertEqual(result["timelineMetadataDisagreementCount"], 1)
        self.assertEqual(result["packetTimelineDifferences"][0]["packetIndex"], 806)
        self.assertEqual(result["packetTimelineDifferences"][0]["archived"]["duration"], 16)
        self.assertEqual(result["packetTimelineDifferences"][0]["revised"]["duration"], 8)
        self.assertEqual(result["packetTimelineDifferences"][0][
            "revisedMinusArchivedDurationSamples"], -8)
        self.assertAlmostEqual(result["packetTimelineDifferences"][0][
            "revisedMinusArchivedDurationMs"], -0.333333, delta=.000001)
        self.assertEqual(result["originalTotalPacketDurationSamplesIncludingPriming"], 825360)
        self.assertEqual(result["revisedTotalPacketDurationSamplesIncludingPriming"], 825352)
        self.assertEqual(result["archivedLastPacketPresentationEndSample"], 824336)
        self.assertEqual(result["revisedLastPacketPresentationEndSample"], 824328)
        for denied in ("mayPublish", "audioCraftApproved", "wordTimingCalibrated",
                       "pronunciationVerified", "revisedFilmVerifiedForRelease"):
            self.assertFalse(result[denied])

    def test_exact_metadata_copy_still_cannot_be_promoted(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        r = original_guard.compare_revised_aac_packet_timeline(
            self.packets(), self.packets(), sha, sha)
        self.assertEqual(r["status"],
                         "RESEARCH_REVISED_AAC_BITSTREAM_TIMELINE_MATCH_HOLD")
        self.assertTrue(r["packetTimelineMetadataEqual"])
        self.assertEqual(r["packetTimelineDisagreementCount"]
                         if "packetTimelineDisagreementCount" in r
                         else r["timelineMetadataDisagreementCount"], 0)
        self.assertFalse(r["mayPublish"])
        self.assertTrue(r["qualifiedListeningStillRequired"])

    def test_changed_aac_bytes_rejected_even_with_equal_metadata(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        r = original_guard.compare_revised_aac_packet_timeline(
            self.packets(), self.packets(), sha, "0"*64)
        self.assertEqual(r["status"], "HOLD")
        self.assertIn("REVISED_AUDIO_ADTS_PAYLOAD_NOT_PINNED_OR_IDENTICAL",
                      r["errors"])
        self.assertFalse(r["mayPublish"])

    def test_invalid_duplicate_packet_timestamp_and_schema_rejected(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        bads = []
        reordered = self.packets()
        reordered[470], reordered[471] = reordered[471], reordered[470]
        bads.append(reordered)
        impossible = self.packets()
        impossible[806]["duration"] = False
        bads.append(impossible)
        extra = self.packets()
        extra[0]["unsourcedApproval"] = True
        bads.append(extra)
        negative = self.packets()
        negative[500]["duration"] = -1
        bads.append(negative)
        tampered = self.packets()
        tampered[0]["pts"] = "nan"
        bads.append(tampered)
        for idx, bad in enumerate(bads):
            with self.subTest(case=idx):
                r = original_guard.compare_revised_aac_packet_timeline(
                    self.packets(), bad, sha, sha)
                self.assertEqual(r["status"], "HOLD")
                self.assertFalse(r["mayPublish"])

    def test_altered_payload_packet_size_is_metadata_discrepancy_not_match(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        b = self.packets()
        b[425]["size"] = "401"
        r = original_guard.compare_revised_aac_packet_timeline(
            self.packets(), b, sha, sha)
        self.assertFalse(r["packetTimelineMetadataEqual"])
        self.assertEqual(r["packetTimelineDifferences"][0]["packetIndex"], 425)
        self.assertFalse(r["mayPublish"])

    def test_real_ffprobe_priming_side_data_does_not_change_metadata_result(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        a, b = self.packets(16), self.packets(8)
        priming = {"side_data_type": "Skip Samples", "skip_samples": 1024,
                   "discard_padding": 0, "skip_reason": 0,
                   "discard_reason": 0}
        a[0]["side_data_list"] = [dict(priming)]
        b[0]["side_data_list"] = [dict(priming)]
        result = original_guard.compare_revised_aac_packet_timeline(
            a, b, sha, sha)
        self.assertEqual(result["status"],
                         "RESEARCH_REVISED_AAC_METADATA_MISMATCH_HOLD")
        self.assertEqual(result["timelineMetadataDisagreementCount"], 1)
        self.assertEqual(result["packetTimelineDifferences"][0]["packetIndex"], 806)
        self.assertTrue(result["bitExactAacPayloadPreserved"])

    def test_priming_or_discard_side_data_changes_must_be_reported(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        a, b = self.packets(), self.packets()
        side = {"side_data_type": "Skip Samples", "skip_samples": 1024,
                "discard_padding": 0, "skip_reason": 0,
                "discard_reason": 0}
        a[0]["side_data_list"] = [dict(side)]
        b[0]["side_data_list"] = [dict(side)]
        b[0]["side_data_list"][0]["skip_samples"] = 512
        r = original_guard.compare_revised_aac_packet_timeline(
            a, b, sha, sha)
        self.assertEqual(r["timelineMetadataDisagreementCount"], 1)
        self.assertFalse(r["packetTimelineMetadataEqual"])
        self.assertEqual(r["packetTimelineDifferences"][0]["packetIndex"], 0)
        self.assertFalse(r["mayPublish"])

    def test_untrusted_or_missing_aac_skip_samples_never_falsely_approves(self):
        sha = original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        for bad in (
            [{"side_data_type": "Skip Samples", "skip_samples": -1,
              "discard_padding": 0, "skip_reason": 0, "discard_reason": 0}],
            [{"side_data_type": "Other" ,"skip_samples": 1024,
              "discard_padding": 0, "skip_reason": 0, "discard_reason": 0}],
            [{"side_data_type": "Skip Samples", "skip_samples": True,
              "discard_padding": 0, "skip_reason": 0, "discard_reason": 0}],
            [{}],
        ):
            with self.subTest(side=bad):
                b = self.packets()
                b[0]["side_data_list"] = bad
                r = original_guard.compare_revised_aac_packet_timeline(
                    self.packets(), b, sha, sha)
                self.assertEqual(r["status"], "HOLD")
                self.assertIn("REVISED_AUDIO_PACKET_TIMESTAMP_OR_SCHEMA_INVALID",
                              r["errors"])

    def test_revised_aac_cli_requires_both_exclusive_films(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        choices = (
            (["--revised-aac-packet-timeline"],
             "REVISED_AAC_TIMELINE_REQUIRES_EXCLUSIVE_TWO_FILMS"),
            (["--revised-aac-packet-timeline",
              "--native-research-film", "/not-there/source.mp4",
              "--revised-research-film", "/not-there/revised.mp4"],
             "REVISED_AUDIO_PINNED_FILMS_NOT_PRESENT"),
            (["--revised-research-film", "/not-there/revised.mp4"],
             "REVISED_AAC_FILM_REQUIRES_EXPLICIT_RESEARCH_MODE"),
            (["--revised-aac-packet-timeline",
              "--native-research-film", "source.mp4",
              "--revised-research-film", "new.mp4",
              "--archived-aac-sync-review"],
             "REVISED_AAC_TIMELINE_REQUIRES_EXCLUSIVE_TWO_FILMS"),
        )
        for args, reason in choices:
            with self.subTest(reason=reason):
                c = subprocess.run([sys.executable, script, *args],
                                   capture_output=True, text=True, timeout=20)
                self.assertEqual(c.returncode, 2)
                self.assertIn(reason, c.stdout)
                self.assertIn('"mayPublish": false', c.stdout)



    @staticmethod
    def revised_caption_blank_source_fixture():
        """Synthetic exact-duration WAV + 94 representative grayscale counts.

        Physical scene observation has exactly two internal blank frames
        984–985 and 14 trailing blanks 1017–1030. Actual media is NOT
        included in hosted CI; film-file entrypoint does physical decoding.
        """
        samples=np.zeros(824336,dtype="<i2")
        for frame in [*range(938,984),*range(986,1017)]:
            samples[frame*800:min((frame+1)*800,len(samples))]=2000
        output=io.BytesIO()
        with wave.open(output,"wb") as w:
            w.setparams((1,2,24000,0,"NONE","not compressed"))
            w.writeframes(samples.tobytes())
        displayed=set([*range(938,984),*range(986,1017)])
        ink=[4600 if frame in displayed else 0
             for frame in range(937,1031)]
        return output.getvalue(),ink

    @staticmethod
    def check_revised_caption_source(audio,counts,
                                     film_sha=None,adts_sha=None):
        if film_sha is None:
            film_sha=original_guard.REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA
        if adts_sha is None:
            adts_sha=original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA
        with patch.object(original_guard,"SOURCE_WAV_REFERENCE",
                          digest(audio)):
            return original_guard.audit_revised_caption_voice_gaps(
                audio,counts,film_sha,adts_sha)

    def test_scientific_names_are_an_asr_mismatch_not_proven_wrong_speech(self):
        # Original-free 824336-sample simulated VO carrier and 73/70 receipts:
        # source SHA pins are synthetic, never a claim about real narrator CI.
        source, _, _, _=self.encoded_aac_screen_fixture()
        _, frozen_mfa, frozen_asr, _, _=self.original_suffix_scene_fixture()
        mfa=json.loads(frozen_mfa)
        asr=json.loads(frozen_asr)
        mfa["inputSha256"]["wav"]=digest(source)
        asr["sourceWavSha256"]=digest(source)
        for idx,word in ((7,"mitragynine"),(9,"hydroxyl"),(16,"seven"),
                         (17,"hydroxymitragynine"),(19,"mitragynine"),
                         (28,"chemical")):
            mfa["wordAlignment"][idx]["word"]=word
        for idx in (7,19):
            # Synthetic first-party ledger uses 200ms placeholders.
            # 410ms remains before next 420ms-onset synthetic word and
            # permits all seven +/-120ms same-word source control cuts.
            mfa["wordAlignment"][idx]["endMs"]=(
                mfa["wordAlignment"][idx]["startMs"]+410)
        row=mfa["wordAlignment"][17]
        # The original synthetic MFA ledger's 200ms word is too short
        # for ±120ms onset probes; extend only this test fixture.
        row["endMs"]=row["startMs"]+700
        row["phones"]=[{"phone":"M","startMs":row["startMs"]+180,
                        "endMs":row["startMs"]+200}]
        for idx,word in ((5," Mitrogenine?"),(15," hydroxometrogenine"),
                         (17," Mitrogenine.")):
            asr["recognizedWords"][idx]["word"]=word
        fa=json.dumps(mfa).encode()
        fb=json.dumps(asr).encode()
        def inspect(wav,align,recognized):
            with patch.object(original_guard,"SOURCE_WAV_REFERENCE",digest(source)), (
                 patch.object(original_guard,"MFA_SOURCE_ALIGNMENT_SHA",digest(fa))), (
                 patch.object(original_guard,"POSE_ASR_RECEIPT_SHA",digest(fb))):
                return original_guard.audit_scientific_name_source_triage(
                    wav,align,recognized)
        report=inspect(source,fa,fb)
        self.assertEqual(report["status"],
            "RESEARCH_SCIENTIFIC_NAMES_ACOUSTIC_TRIAGE_HOLD",report)
        self.assertEqual(report["nameCandidateCount"],3)
        self.assertEqual(report["mismatchedAsrScientificNameTokens"],3)
        self.assertEqual(len(report["spectralResearch"][
            "embeddedTailVsUnrelatedSameNarratorControls"]),2)
        self.assertFalse(report["pronunciationVerified"])
        self.assertFalse(report["mayPublish"])
        self.assertIsNone(report["reviewerVerdict"])
        bad=inspect(source[:-2]+b"XX",fa,fb)
        self.assertEqual(bad["status"],"HOLD")
        self.assertIn("SCIENTIFIC_NAMES_REQUIRE_PINNED_SOURCE_MFA_ASR",
                      bad["errors"])
        missing=json.loads(fa)
        del missing["wordAlignment"][17]["phones"]
        self.assertEqual(inspect(source,json.dumps(missing).encode(),fb)[
            "status"],"HOLD")
        with patch.object(original_guard,"SOURCE_WAV_REFERENCE",digest(source)), (
             patch.object(original_guard,"MFA_SOURCE_ALIGNMENT_SHA",digest(fa))), (
             patch.object(original_guard,"POSE_ASR_RECEIPT_SHA",digest(fb))):
            embedded=original_guard.audit_cross_model_files(
                "/file/does/not/exist","/also/missing","/third/missing")
            self.assertEqual(embedded["status"],"HOLD")


    def test_scientific_name_onset_sweep_is_sha_bound_and_cannot_certify(self):
        source, _, _, _=self.encoded_aac_screen_fixture()
        _, mfa_raw, asr_raw, _, _=self.original_suffix_scene_fixture()
        mfa=json.loads(mfa_raw); asr=json.loads(asr_raw)
        mfa["inputSha256"]["wav"]=digest(source)
        asr["sourceWavSha256"]=digest(source)
        for idx,word in ((7,"mitragynine"),(9,"hydroxyl"),(16,"seven"),
                         (17,"hydroxymitragynine"),(19,"mitragynine"),
                         (28,"chemical")):
            mfa["wordAlignment"][idx]["word"]=word
        for idx in (7,19):
            # Synthetic first-party ledger uses 200ms placeholders.
            # 410ms remains before next 420ms-onset synthetic word and
            # permits all seven +/-120ms same-word source control cuts.
            mfa["wordAlignment"][idx]["endMs"]=(
                mfa["wordAlignment"][idx]["startMs"]+410)
        record=mfa["wordAlignment"][17]
        # Deliberately construct a >240ms context on each side of the
        # forced M label; the stock 200ms synthetic word has no room for
        # a seven-boundary sweep. Keep source spans and exact SHA binding.
        record["endMs"]=record["startMs"]+700
        record["phones"]=[{"phone":"M","startMs":record["startMs"]+180}]
        for idx,word in ((5,"Mitrogenine"),(15,"hydroxometrogenine"),
                         (17,"Mitrogenine")):
            asr["recognizedWords"][idx]["word"]=word
        frozen_mfa=json.dumps(mfa).encode()
        frozen_asr=json.dumps(asr).encode()
        with (patch.object(original_guard,"SOURCE_WAV_REFERENCE",digest(source)),
              patch.object(original_guard,"MFA_SOURCE_ALIGNMENT_SHA",
                           digest(frozen_mfa)),
              patch.object(original_guard,"POSE_ASR_RECEIPT_SHA",
                           digest(frozen_asr))):
            out=original_guard.audit_scientific_name_source_triage(
                source,frozen_mfa,frozen_asr)
        self.assertEqual(out["status"],
                         "RESEARCH_SCIENTIFIC_NAMES_ACOUSTIC_TRIAGE_HOLD",out)
        analysis=out["spectralResearch"]
        self.assertEqual(len(analysis["boundarySensitivitySourceOnly"]),7)
        self.assertEqual(
            [x["startRelativeToForcedMfaMs"] for x in
             analysis["boundarySensitivitySourceOnly"]],
            [-120,-80,-40,0,40,80,120])
        self.assertEqual(
            analysis["boundarySensitivitySourceOnly"][3]["sourcePcmSha256"],
            analysis["embeddedTailPcmSha256"])
        self.assertEqual(
            analysis["boundarySensitivitySourceOnly"][3]["distanceToStandalone1"],
            analysis["embeddedMfaTailVsStandaloneDistances"][0])
        for r in analysis["boundarySensitivityDistanceRanges"]:
            self.assertGreaterEqual(r["distanceRange"],0)
            self.assertLessEqual(r["minDistance"],r["maxDistance"])
        self.assertTrue(analysis["singleBestDistanceCannotEstablishPhonemeIdentity"])
        controls=analysis["sameSpokenNameControlSweeps"]
        self.assertEqual(len(controls),2)
        self.assertEqual(len(controls[0]),7)
        self.assertEqual(len(controls[1]),7)
        self.assertEqual([z["shiftRelativeToMfaMs"] for z in controls[0]],
                         [-120,-80,-40,0,40,80,120])
        self.assertEqual([z["shiftRelativeToMfaMs"] for z in controls[1]],
                         [-120,-80,-40,0,40,80,120])
        for z in controls:
            self.assertEqual(z[3]["distanceToOtherStandalone"],
                             analysis["standaloneRepeatDistance"])
            self.assertFalse(z[3]["phoneticCalibration"])
        self.assertEqual(len(analysis["sameSpokenNameControlRanges"]),2)
        self.assertIsNone(analysis["compoundBoundaryInstabilityUniqueToCompound"])
        self.assertTrue(analysis["relativeBoundaryScoreNotACalibratedPhoneticTest"])
        self.assertFalse(out["pronunciationVerified"])
        self.assertFalse(out["mayPublish"])

    def test_kind_broadband_two_window_event_is_not_phonetic_truth(self):
        source, _, _ = self.frame_native_plan_fixture()
        with wave.open(io.BytesIO(source),"rb") as w:
            signal=np.frombuffer(w.readframes(w.getnframes()),"<i2").copy()
        # Contrived 2x broadband 10ms windows after two quiet windows and
        # independent voiced 2x energy continuation. Never actual narrator.
        sr=24000
        signal[3159*240:3161*240]=0
        rng=np.random.default_rng(20261017)
        burst=rng.integers(-2200,2200,size=480,dtype=np.int16)
        signal[3161*240:3163*240]=burst
        t=np.arange(480)/sr
        signal[3165*240:3167*240]=np.rint(6500*np.sin(2*np.pi*210*t)).astype("<i2")
        def wrapped(pcm):
            sink=io.BytesIO()
            with wave.open(sink,"wb") as w:
                w.setparams((1,2,24000,0,"NONE","not compressed"))
                w.writeframes(pcm.tobytes())
            return sink.getvalue()
        corrected=wrapped(signal)
        with patch.object(original_guard,"SOURCE_WAV_REFERENCE",digest(corrected)):
            report=original_guard.audit_kind_spectral_transition_research(corrected)
            self.assertEqual(report["status"],
                 "RESEARCH_BROADBAND_TRANSITION_CANDIDATE_HOLD",report)
            self.assertTrue(report["highFrequencyTransitionDetected"])
            self.assertEqual(report["candidate"]["firstBroadbandWindowSec"],31.61)
            self.assertFalse(report["actualWordOrPhonemeVerified"])
            self.assertFalse(report["mayPublish"])
            # One broadband transient is not a two-window phone-like event.
            single=signal.copy()
            single[3162*240:3163*240]=0
            one_off=wrapped(single)
            with patch.object(original_guard,"SOURCE_WAV_REFERENCE",digest(one_off)):
                rejected=original_guard.audit_kind_spectral_transition_research(one_off)
                self.assertEqual(rejected["status"],
                    "RESEARCH_NO_CALIBRATED_BROADBAND_TRANSITION_HOLD")
                self.assertFalse(rejected["highFrequencyTransitionDetected"])
            # Even a known pattern cannot be reused against changed source.
            changed=corrected[:-2]+bytes((corrected[-2]^1,corrected[-1]))
            bad=original_guard.audit_kind_spectral_transition_research(changed)
            self.assertIn("KIND_BURST_ORIGINAL_WAV_SHA_CHANGED",bad["errors"])

    def test_current_film_full_aac_and_packet_guards_fail_closed_with_mock_decoder(self):
        # Hosted physical-shaped synthetic fixture; patched pins are NOT
        # evidence that the first-party movie was included in hosted CI.
        original, _ = self.revised_caption_blank_source_fixture()
        film = b"synthetic-non-film-bytes" * 200
        adts = b"synthetic-encoded-aac-stream"
        fake_pcm = np.zeros(825344, dtype="<f4").tobytes()
        packets = []
        for i in range(807):
            pts = -1024 + 1024*i
            packets.append({"pts": pts, "dts": pts,
                            "duration": 8 if i == 806 else 1024,
                            "size": 4 if i == 806 else 400})
        def packet_json(rows):
            return json.dumps({"packets": rows},sort_keys=True).encode()
        signature = digest(json.dumps([
            [int(row[k]) for k in ("pts","dts","duration","size")]
            for row in packets],separators=(",",":")).encode())
        # Every last-frame glyph is present in this synthetic ROI. Physical
        # media/caption decoding stays an independent real-world requirement.
        synthetic_roi = bytes([255]) * (94 * 790 * 100)
        variant = {"decoded": fake_pcm, "packetJson": packet_json(packets)}
        def fake_process(command, **kwargs):
            if command[0] == "ffprobe":
                body = variant["packetJson"]
            elif "f32le" in command:
                body = variant["decoded"]
            elif "adts" in command:
                body = adts
            elif "rawvideo" in command:
                body = synthetic_roi
            else:
                raise AssertionError("unexpected synthetic decoder command")
            return subprocess.CompletedProcess(command, 0, stdout=body, stderr=b"")
        with tempfile.TemporaryDirectory() as td:
            source_path = Path(td) / "source.wav"
            film_path = Path(td) / "frozen-standin.mp4"
            source_path.write_bytes(original)
            film_path.write_bytes(film)
            with (patch.object(original_guard,"SOURCE_WAV_REFERENCE",
                               digest(original)),
                  patch.object(original_guard,"REVISED_SCENE4_LEGIBLE_FILM_SHA",
                               digest(film)),
                  patch.object(original_guard,
                               "REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA",
                               digest(adts)),
                  patch.object(original_guard,
                               "REVISED_FULL_DECODED_AAC_PCM_SHA",
                               digest(fake_pcm)),
                  patch.object(original_guard,
                               "REVISED_AAC_PACKET_TUPLE_SHA",signature),
                  patch("subprocess.run",side_effect=fake_process)):
                good = original_guard.audit_revised_caption_voice_gaps_files(
                    source_path,film_path)
                self.assertEqual(good["status"],
                    "RESEARCH_REVISED_CAPTION_VOICE_GAP_SCREEN_HOLD",good)
                self.assertTrue(good["fullNativeAacBytesAndPacketTimelineVerified"])
                self.assertFalse(good["mayPublish"])
                variant["decoded"] = fake_pcm[:-4] + b"FAIL"
                bad_audio = original_guard.audit_revised_caption_voice_gaps_files(
                    source_path,film_path)
                self.assertIn("CAPTION_GAP_FULL_NATIVE_AAC_DECODE_CHANGED",
                              bad_audio["errors"])
                variant["decoded"] = fake_pcm
                moved = [dict(row) for row in packets]
                moved[700]["pts"] += 3
                variant["packetJson"] = packet_json(moved)
                bad_timestamps = original_guard.audit_revised_caption_voice_gaps_files(
                    source_path,film_path)
                self.assertIn("CAPTION_GAP_FULL_NATIVE_AAC_PACKET_TIMELINE_CHANGED",
                              bad_timestamps["errors"])
                variant["packetJson"] = packet_json(packets)
                film_path.write_bytes(film + b"changed")
                changed_film = original_guard.audit_revised_caption_voice_gaps_files(
                    source_path,film_path)
                self.assertIn("CAPTION_GAP_PINNED_SOURCES_CHANGED",
                              changed_film["errors"])
                self.assertTrue(all(not x["mayPublish"] for x in
                    (bad_audio,bad_timestamps,changed_film)))


    def test_new_seq_film_pins_do_not_accept_mutated_or_unreviewed_film(self):
        source, counts = self.revised_caption_blank_source_fixture()
        for film_sha in (original_guard.REVISED_SCENE4_SEQUENTIAL_FILM_SHA,
                         original_guard.REVISED_SCENE4_LEGIBLE_FILM_SHA):
            with self.subTest(film=film_sha):
                r=self.check_revised_caption_source(source,counts,
                                                    film_sha=film_sha)
                self.assertEqual(r["status"],
                    "RESEARCH_REVISED_CAPTION_VOICE_GAP_SCREEN_HOLD",r)
                self.assertFalse(r["mayPublish"])
                bad=self.check_revised_caption_source(source,counts,
                                                     film_sha="0"*64)
                self.assertEqual(bad["status"],"HOLD")
                self.assertIn("CAPTION_GAP_REVISED_FILM_OR_AAC_NOT_SOURCE_PINNED",
                              bad["errors"])
                self.assertFalse(bad["mayPublish"])

    def test_caption_presence_matches_authentic_film_shape_synthetic_source(self):
        audio,counts=self.revised_caption_blank_source_fixture()
        result=self.check_revised_caption_source(audio,counts)
        self.assertEqual(result["status"],
            "RESEARCH_REVISED_CAPTION_VOICE_GAP_SCREEN_HOLD",result)
        self.assertEqual(result["totalFramesChecked"],94)
        self.assertEqual(result["captionPresentFrames"],77)
        self.assertEqual(result["visuallyBlankFrames"],17)
        self.assertEqual(
            [x["frame"] for x in result["allVisualBlankFrameMeasurements"]],
            [937,984,985,*range(1017,1031)])
        self.assertEqual(result["blankFramesWithSourceSpeechEnergy"],[])
        self.assertEqual(result["ambiguousRoiFrames"],[])
        self.assertFalse(result["physicalVideoFrameDecodeVerifiedByThisFunction"])
        for key in ("mayPublish","pronunciationVerified","wordTimingCalibrated",
                    "captionTimingApproved","actualPhoneReviewApproved"):
            self.assertFalse(result[key])

    def test_middle_of_spoken_caption_disappearing_cannot_pass(self):
        audio,counts=self.revised_caption_blank_source_fixture()
        altered=counts.copy()
        altered[960-937]=0
        result=self.check_revised_caption_source(audio,altered)
        self.assertEqual(result["status"],"HOLD")
        self.assertIn("CAPTION_GAP_VOICE_ACTIVE_WITHOUT_CAPTION",
                      result["errors"])
        self.assertEqual(
            [x["frame"] for x in result["blankFramesWithSourceSpeechEnergy"]],
            [960])
        self.assertFalse(result["mayPublish"])

    def test_voice_inserted_during_original_blank_gap_fails_closed(self):
        audio,counts=self.revised_caption_blank_source_fixture()
        with wave.open(io.BytesIO(audio),"rb") as w:
            pcm=np.frombuffer(w.readframes(w.getnframes()),"<i2").copy()
        pcm[984*800:986*800]=3000
        target=io.BytesIO()
        with wave.open(target,"wb") as w:
            w.setparams((1,2,24000,0,"NONE","not compressed"))
            w.writeframes(pcm.tobytes())
        result=self.check_revised_caption_source(target.getvalue(),counts)
        self.assertEqual(result["status"],"HOLD")
        self.assertEqual(
            [x["frame"] for x in result["blankFramesWithSourceSpeechEnergy"]],
            [984,985])
        self.assertFalse(result["wordTimingCalibrated"])

    def test_brightness_indeterminate_and_invalid_frame_schema_hold(self):
        audio,counts=self.revised_caption_blank_source_fixture()
        confused=counts.copy()
        confused[10]=380
        report=self.check_revised_caption_source(audio,confused)
        self.assertEqual(report["status"],"HOLD")
        self.assertIn("CAPTION_GAP_ROI_INDETERMINATE",report["errors"])
        for bad in (counts[:-1],counts+[0],
                    [*counts[:-1],True],
                    [*counts[:-1],79001],
                    [*counts[:-1],-1]):
            with self.subTest(length=len(bad),tail=bad[-1]):
                result=self.check_revised_caption_source(audio,bad)
                self.assertEqual(result["status"],"HOLD")
                self.assertIn(
                    "CAPTION_GAP_FRAME_COUNT_OR_PIXEL_SCHEMA_INVALID",
                    result["errors"])

    def test_caption_research_fails_on_unpinned_voice_video_or_aac(self):
        audio,counts=self.revised_caption_blank_source_fixture()
        self.assertIn("CAPTION_GAP_ORIGINAL_VOICE_SHA_MISMATCH",
            original_guard.audit_revised_caption_voice_gaps(
                audio,counts,
                original_guard.REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA,
                original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA)["errors"])
        for film,aac in (
            ("0"*64,original_guard.REVISED_AND_ARCHIVED_AUDIO_ADTS_SHA),
            (original_guard.REVISED_SCENE4_PHONE_FOOTNOTES_FILM_SHA,"1"*64)):
            r=self.check_revised_caption_source(audio,counts,film,aac)
            self.assertEqual(r["status"],"HOLD")
            self.assertFalse(r["mayPublish"])

    def test_caption_voice_gap_cli_requires_one_exclusive_physical_pair(self):
        script=str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        cases=(
            (["--revised-caption-voice-gap"],
             "CAPTION_GAP_REQUIRES_EXCLUSIVE_ORIGINAL_WAV_AND_REVISED_FILM"),
            (["--revised-caption-voice-gap",
              "--original-wav","/missing/narration.wav",
              "--revised-research-film","/missing/film.mp4"],
             "CAPTION_GAP_REQUIRED_FILES_MISSING_OR_UNSAFE"),
            (["--revised-caption-voice-gap",
              "--original-wav","/missing/narration.wav",
              "--revised-research-film","/missing/film.mp4",
              "--revised-aac-packet-timeline"],
             "CAPTION_GAP_REQUIRES_EXCLUSIVE_ORIGINAL_WAV_AND_REVISED_FILM"),
        )
        for args,reason in cases:
            with self.subTest(reason=reason):
                p=subprocess.run([sys.executable,script,*args],
                                 capture_output=True,text=True,timeout=20)
                self.assertEqual(p.returncode,2)
                self.assertIn(reason,p.stdout)
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



@unittest.skipUnless(all(x.is_file() for x in (MASTER, MFA_ALIGNMENT)),
    "Original source WAV and MFA word windows unavailable in hosted checkout")
class PhysicallyRecoveredOriginalPcmBlacklistTests(unittest.TestCase):
    """Physical original-source hash oracle. No phonetic inference."""

    @staticmethod
    def source_pcm():
        wav_raw = MASTER.read_bytes()
        alignment_raw = MFA_ALIGNMENT.read_bytes()
        assert digest(wav_raw) == SOURCE_WAV_REFERENCE
        assert digest(alignment_raw) == MFA_SOURCE_ALIGNMENT_SHA
        with wave.open(io.BytesIO(wav_raw), "rb") as src:
            assert (src.getnchannels(), src.getsampwidth(),
                    src.getframerate(), src.getnframes()) == (1, 2, 24000, 824336)
            pcm = src.readframes(src.getnframes())
        words = json.loads(alignment_raw)["wordAlignment"]
        assert len(words) == 73
        windows = [(2, 3, 4), (7,), (16, 17), (19,), (37,), (38,),
                   (61,), (68,), (71,)]
        excerpts = []
        for indices in windows:
            a = round(words[indices[0]]["startMs"]*24)
            b = round(words[indices[-1]]["endMs"]*24)
            assert 0 <= a < b <= 824336
            excerpts.append(pcm[a*2:b*2])
        return excerpts

    def test_nine_source_word_excerpts_rehash_to_exact_blacklist(self):
        excerpts = self.source_pcm()
        self.assertEqual(len(excerpts), 9)
        self.assertEqual({digest(x) for x in excerpts},
                         ORIGINAL_PCM_EXCERPT_SHA256)

    def test_actual_original_rejects_trimmed_unlisted_pcm_window(self):
        with wave.open(str(MASTER), "rb") as source:
            original = source.readframes(source.getnframes())
        start, end = 429000, 436000  # inside 17.87-18.34 sec pose/poles dispute
        trimmed = original[start*2:end*2]
        self.assertEqual(len(trimmed), 7000*2)
        self.assertNotIn(digest(trimmed), ORIGINAL_PCM_EXCERPT_SHA256)
        out_wav = io.BytesIO()
        with wave.open(out_wav, "wb") as f:
            f.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            f.writeframes(trimmed)
        rows, clips = BlindReferenceBenchmarkTests.fixture()
        row = rows[-1]
        clips[row["sampleId"]] = out_wav.getvalue() + b"JUNK"
        row["wavSha256"] = digest(clips[row["sampleId"]])
        report = evaluate_blind_reference_pairs(rows, clips, set(), MASTER.read_bytes())
        self.assertEqual(report["status"], "HOLD", report)
        self.assertIn("REFERENCE_EXCERPT_REUSED_FROM_ORIGINAL_MASTER",
                      report["errors"])
        self.assertTrue(report["originalMasterPcmContainmentScreened"])
        self.assertFalse(report["mayPublish"])

    def test_original_pose_audio_rewrapped_with_new_wav_sha_is_excluded(self):
        target_pcm = self.source_pcm()[4]
        stream = io.BytesIO()
        with wave.open(stream, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(target_pcm)
        original = stream.getvalue()
        rewrapped = original + b"JUNK"
        self.assertNotEqual(digest(original), digest(rewrapped))
        rows, clips = BlindReferenceBenchmarkTests.fixture()
        last = rows[-1]
        last["wavSha256"] = digest(rewrapped)
        clips[last["sampleId"]] = rewrapped
        result = evaluate_blind_reference_pairs(rows, clips, set())
        self.assertEqual(result["status"], "HOLD", result)
        self.assertIn("REFERENCE_ORIGINAL_TARGET_PCM_REUSE", result["errors"])
        self.assertFalse(result["calibrationComplete"])
        self.assertFalse(result["mayPublish"])


    def test_actual_original_pose_gain_changed_pcm_still_excluded(self):
        # Optional actual-media regression: the CI checkout does not carry
        # source narrator bytes. With original source injected and SHA-pinned,
        # the previously unseen gain-transformed original word still HOLDs.
        original_full = MASTER.read_bytes()
        self.assertEqual(digest(original_full), SOURCE_WAV_REFERENCE)
        source_excerpt = self.source_pcm()[4]
        with wave.open(io.BytesIO(original_full), "rb") as original:
            original_pcm = original.readframes(original.getnframes())
        for factor in (2, -1):
            with self.subTest(factor=factor):
                changed_pcm = np.clip(
                    np.frombuffer(source_excerpt, dtype="<i2").astype(np.int32)
                    * factor, -32768, 32767).astype("<i2").tobytes()
                self.assertNotEqual(digest(source_excerpt), digest(changed_pcm))
                self.assertNotIn(changed_pcm, original_pcm)
                wave_bytes = io.BytesIO()
                with wave.open(wave_bytes, "wb") as altered:
                    altered.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                    altered.writeframes(changed_pcm)
                cases, references = BlindReferenceBenchmarkTests.fixture()
                last = cases[-1]
                last["wavSha256"] = digest(wave_bytes.getvalue())
                references[last["sampleId"]] = wave_bytes.getvalue()
                screened = evaluate_blind_reference_pairs(
                    cases, references, set(), original_full)
                self.assertEqual(screened["status"], "HOLD", screened)
                self.assertIn("REFERENCE_GAIN_OR_POLARITY_EXCERPT_FROM_ORIGINAL_MASTER",
                              screened["errors"])
                self.assertTrue(screened["originalMasterSignTrajectoryScreened"])
                self.assertFalse(screened["mayPublish"])


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



class SpectralTraceSignalOnlyTests(unittest.TestCase):
    """Synthetic acoustic controls; none are /l/ pronunciation examples."""

    @staticmethod
    def sine_pcm(hz, gain=.35, duration=.5):
        n = round(duration * 24000)
        x = gain*np.sin(2*np.pi*hz*np.arange(n)/24000)
        return (np.clip(x*32767, -32768, 32767).astype("<i2")).tobytes()

    def test_low_and_high_spectral_signal_separation_is_not_phoneme_identity(self):
        low = spectral_band_trace(self.sine_pcm(700))
        high = spectral_band_trace(self.sine_pcm(2600))
        self.assertGreater(low["activeRatioDbMedian"],
                           high["activeRatioDbMedian"] + 20)
        self.assertEqual(low["analysisType"],
                         "RESEARCH_SPECTRAL_ENERGY_ONLY_NOT_PHONEMES")
        for result in (low, high):
            self.assertFalse(result["phonemeIdentityVerified"])
            self.assertFalse(result["lateralPresenceClassified"])

    def test_relative_gain_does_not_invent_word_or_lateral_verdict(self):
        original = spectral_band_trace(self.sine_pcm(700))
        quieter = spectral_band_trace(self.sine_pcm(700, gain=.17))
        self.assertAlmostEqual(original["activeRatioDbMedian"],
                               quieter["activeRatioDbMedian"], delta=1.0)
        self.assertEqual(original["totalFrames"], quieter["totalFrames"])
        self.assertFalse(quieter["lateralPresenceClassified"])

    def test_silence_invalid_and_truncated_sources_fail(self):
        for data in (b"", b"bad", bytes(12000), bytes(4801)):
            with self.subTest(size=len(data)), self.assertRaises(ValueError):
                spectral_band_trace(data)

    def test_frame_hop_and_trace_values_are_fixed_and_finite(self):
        report = spectral_band_trace(self.sine_pcm(700))
        self.assertEqual(report["frameMs"], 25)
        self.assertEqual(report["hopMs"], 10)
        self.assertEqual(len(report["trace"]), report["totalFrames"])
        self.assertGreater(report["activeFrames"], 5)
        self.assertEqual(report["trace"][0]["centerMs"], 12.5)
        for step in report["trace"]:
            self.assertTrue(np.isfinite(step["bandRatioDb"]))
            self.assertTrue(np.isfinite(step["relativeRms"]))


class BlindReferenceBenchmarkTests(unittest.TestCase):
    """Synthetic labels test implementation, NOT independent /l/ reference data."""

    @staticmethod
    def wav(freq, variation):
        n = 9600
        t = np.arange(n)/24000
        signal = .25*np.sin(2*np.pi*(freq + variation)*t)*np.sin(np.pi*t/.4)
        samples = (signal*32767).astype("<i2").tobytes()
        stream = io.BytesIO()
        with wave.open(stream, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(samples)
        return stream.getvalue()

    @classmethod
    def fixture(cls):
        rows, samples = [], {}
        for split in ("train", "test"):
            for index in range(8):
                for label, hz in (("pose", 700), ("poles", 2600)):
                    name = f"{split}-{index}-{label}"
                    variation = index*5 + (45 if split == "test" else 0)
                    data = cls.wav(hz, variation)
                    samples[name] = data
                    rows.append({"sampleId": name, "split": split,
                                 "speakerId": f"{split}-speaker-{index}",
                                 "word": label, "wavSha256": digest(data)})
        return rows, samples

    def test_synthetic_perfect_score_still_blocks_real_pronunciation_approval(self):
        rows, samples = self.fixture()
        result = evaluate_blind_reference_pairs(rows, samples, set())
        self.assertEqual(result["status"],
                         "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY", result)
        self.assertEqual(result["heldoutBalancedAccuracy"], 1)
        self.assertEqual(result["declaredTrainSpeakerCount"], 8)
        self.assertEqual(result["declaredHeldoutSpeakerCount"], 8)
        for field in ("mayPublish", "pronunciationVerified", "phonemeIdentityVerified",
                      "wordTimingCalibrated", "calibrationComplete", "originalTargetInferred",
                      "speakerIdentitiesAuthenticated",
                      "referenceAnnotationsAuthenticated",
                      "heldoutPhonemeGroundTruthVerified",
                      "phonemeConfidenceCalibrated"):
            self.assertFalse(result[field], field)
        self.assertIsNone(result["lexicalWinner"])

    def test_banned_target_original_source_or_same_narrator_controls_cannot_enroll(self):
        rows, samples = self.fixture()
        row = rows[3]
        result = evaluate_blind_reference_pairs(
            rows, samples, {row["wavSha256"]})
        self.assertEqual(result["status"], "HOLD")
        self.assertFalse(result["mayPublish"])

    def test_train_test_declared_speaker_leakage_holds(self):
        rows, samples = self.fixture()
        for row in rows:
            if row["speakerId"] == "test-speaker-0":
                row["speakerId"] = "train-speaker-0"
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")

    def test_wrong_label_or_imbalanced_pairs_refused(self):
        rows, samples = self.fixture()
        rows[-1]["word"] = "pose"
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")

    def test_one_wrong_heldout_pair_triggers_classwise_fail_closed(self):
        rows, samples = self.fixture()
        for row in rows:
            if row["speakerId"] == "test-speaker-0":
                row["word"] = "poles" if row["word"] == "pose" else "pose"
        result = evaluate_blind_reference_pairs(rows, samples, set())
        self.assertEqual(result["status"], "HOLD", result)
        self.assertEqual(result["heldoutBalancedAccuracy"], .875)
        self.assertIn("BELOW_90_PERCENT", result["errors"][0])

    def test_audio_sha_edit_is_not_a_valid_reference(self):
        rows, samples = self.fixture()
        sample = rows[0]["sampleId"]
        samples[sample] += b" "
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")

    def test_missing_wav_or_undeclared_extra_wav_refused(self):
        rows, samples = self.fixture()
        samples.pop(rows[0]["sampleId"])
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")
        rows, samples = self.fixture()
        samples["extra"] = self.wav(700, 0)
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")

    @classmethod
    def embedded_reference_fixture(cls):
        """Full-size synthetic target WAV, with an interior 8k-sample reference crop."""
        rows, samples = cls.fixture()
        last = rows[-1]
        with wave.open(io.BytesIO(samples[last["sampleId"]]), "rb") as existing:
            source_pcm = existing.readframes(existing.getnframes())
        assert len(source_pcm) == 9600 * 2
        crop = source_pcm[800 * 2:8800 * 2]
        master_pcm = bytearray(824336 * 2)
        master_pcm[250000 * 2:(250000 + 9600) * 2] = source_pcm
        master = io.BytesIO()
        with wave.open(master, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(bytes(master_pcm))
        excerpt = io.BytesIO()
        with wave.open(excerpt, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(crop)
        raw_excerpt = excerpt.getvalue()
        assert digest(crop) not in ORIGINAL_PCM_EXCERPT_SHA256
        samples[last["sampleId"]] = raw_excerpt + b"JUNK"
        last["wavSha256"] = digest(samples[last["sampleId"]])
        return rows, samples, master.getvalue()

    def test_full_master_containment_rejects_trimmed_original_pcm_without_known_hash(self):
        rows, samples, master = self.embedded_reference_fixture()
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(master)):
            without_master = evaluate_blind_reference_pairs(rows, samples, set())
            with_master = evaluate_blind_reference_pairs(rows, samples, set(), master)
        self.assertEqual(without_master["status"],
                         "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY", without_master)
        self.assertFalse(without_master["originalMasterPcmContainmentScreened"])
        self.assertEqual(with_master["status"], "HOLD", with_master)
        self.assertIn("REFERENCE_EXCERPT_REUSED_FROM_ORIGINAL_MASTER",
                      with_master["errors"])
        self.assertTrue(with_master["originalMasterPcmContainmentScreened"])
        self.assertFalse(with_master["mayPublish"])

    def test_full_master_containment_rejects_unpinned_master(self):
        rows, samples, master = self.embedded_reference_fixture()
        result = evaluate_blind_reference_pairs(rows, samples, set(), master)
        self.assertEqual(result["status"], "HOLD")
        self.assertIn("REFERENCE_TARGET_ORIGINAL_WAV_HASH_INVALID", result["errors"])
        self.assertFalse(result["originalMasterPcmContainmentScreened"])
        self.assertFalse(result["mayPublish"])

    def test_same_exact_audio_disguised_as_separate_reference_rejected(self):
        rows, samples = self.fixture()
        first, last = rows[0], rows[-1]
        last["wavSha256"] = first["wavSha256"]
        samples[last["sampleId"]] = samples[first["sampleId"]]
        self.assertEqual(evaluate_blind_reference_pairs(
            rows, samples, set())["status"], "HOLD")

    def test_source_pcm_exclusion_survives_rewrapped_wav_file_hash(self):
        rows, samples = self.fixture()
        case = rows[-1]
        original = samples[case["sampleId"]]
        with wave.open(io.BytesIO(original), "rb") as audio:
            pcm_hash = digest(audio.readframes(audio.getnframes()))
        self.assertNotIn(pcm_hash, ORIGINAL_PCM_EXCERPT_SHA256)
        repackaged = original + b"JUNK"
        self.assertNotEqual(digest(original), digest(repackaged))
        samples[case["sampleId"]] = repackaged
        case["wavSha256"] = digest(repackaged)
        # Deterministically substitute the banned physical PCM digest without
        # pretending the synthetic sine is the original target recording.
        with patch.object(original_guard, "ORIGINAL_PCM_EXCERPT_SHA256",
                          frozenset({pcm_hash})):
            report = evaluate_blind_reference_pairs(rows, samples, set())
        self.assertEqual(report["status"], "HOLD", report)
        self.assertIn("REFERENCE_ORIGINAL_TARGET_PCM_REUSE", report["errors"])
        self.assertFalse(report["mayPublish"])
        self.assertFalse(report["calibrationComplete"])

    def test_same_pcm_rewrapped_to_new_file_sha_rejected_within_and_across_splits(self):
        for changed_index in (1, -1):
            with self.subTest(changed_index=changed_index):
                rows, samples = self.fixture()
                origin, disguised = rows[0], rows[changed_index]
                original = samples[origin["sampleId"]]
                rewrapped = original + b"JUNK"  # Decoder ignores trailing wrapper bytes.
                self.assertNotEqual(digest(original), digest(rewrapped))
                with wave.open(io.BytesIO(rewrapped), "rb") as audio:
                    self.assertEqual(audio.getnframes(), 9600)
                    self.assertEqual(audio.readframes(9600),
                                     original[44:])  # same decoded PCM as canonical WAV
                samples[disguised["sampleId"]] = rewrapped
                disguised["wavSha256"] = digest(rewrapped)
                result = evaluate_blind_reference_pairs(rows, samples, set())
                self.assertEqual(result["status"], "HOLD", result)
                self.assertIn("REFERENCE_PCM_DUPLICATE_DESPITE_DIFFERENT_WAV_SHA",
                              result["errors"])
                self.assertFalse(result["calibrationComplete"])
                self.assertFalse(result["mayPublish"])


    def test_volume_or_polarity_adjusted_copy_is_not_independent_reference(self):
        # WAV SHA and decoded PCM SHA both change after the following edits.
        # A gain-adjusted or sign-inverted copy must not become a fresh speaker
        # or a held-out recording even when self-declared labels appear balanced.
        for destination in (1, -1):  # within training and across held-out split
            for factor in (2, -1):
                with self.subTest(destination=destination, factor=factor):
                    rows, samples = self.fixture()
                    source_row, cloned_row = rows[0], rows[destination]
                    source_raw = samples[source_row["sampleId"]]
                    with wave.open(io.BytesIO(source_raw), "rb") as audio:
                        pcm = np.frombuffer(
                            audio.readframes(audio.getnframes()),
                            dtype="<i2").astype(np.int32)
                    transformed_pcm = (pcm * factor).astype("<i2").tobytes()
                    with wave.open(io.BytesIO(source_raw), "rb") as original:
                        source_pcm = original.readframes(original.getnframes())
                    self.assertNotEqual(digest(source_pcm), digest(transformed_pcm))
                    cloned_wav = io.BytesIO()
                    with wave.open(cloned_wav, "wb") as copy:
                        copy.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                        copy.writeframes(transformed_pcm)
                    samples[cloned_row["sampleId"]] = cloned_wav.getvalue()
                    cloned_row["wavSha256"] = digest(samples[cloned_row["sampleId"]])
                    self.assertNotEqual(source_row["wavSha256"], cloned_row["wavSha256"])
                    result = evaluate_blind_reference_pairs(rows, samples, set())
                    self.assertEqual(result["status"], "HOLD", result)
                    self.assertIn("REFERENCE_GAIN_OR_POLARITY_REUSED_ACROSS_RECORDINGS",
                                  result["errors"])
                    self.assertFalse(result["calibrationComplete"])
                    self.assertFalse(result["mayPublish"])

    def test_distinct_synthetic_reference_waveforms_remain_eligible_for_research(self):
        rows, samples = self.fixture()
        outcome = evaluate_blind_reference_pairs(rows, samples, set())
        self.assertEqual(outcome["status"],
                         "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY", outcome)
        self.assertFalse(outcome["phonemeIdentityVerified"])
        self.assertFalse(outcome["mayPublish"])


    def test_original_master_scaled_or_inverted_trimmed_excerpt_is_contamination(self):
        # No exact WAV/PCM SHA matches; the excerpt is still the same recording
        # from the authenticated original master after amplitude transformation.
        for gain in (2, -1, -2):
            with self.subTest(gain=gain):
                rows, samples, master = self.embedded_reference_fixture()
                last = rows[-1]
                with wave.open(io.BytesIO(samples[last["sampleId"]]), "rb") as audio:
                    source_excerpt = audio.readframes(audio.getnframes())
                changed = (np.frombuffer(source_excerpt, dtype="<i2")
                           .astype(np.int32) * gain).astype("<i2").tobytes()
                self.assertNotEqual(digest(source_excerpt), digest(changed))
                with wave.open(io.BytesIO(master), "rb") as source:
                    full_pcm = source.readframes(source.getnframes())
                self.assertEqual(full_pcm.find(changed), -1)
                altered_wav = io.BytesIO()
                with wave.open(altered_wav, "wb") as audio:
                    audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                    audio.writeframes(changed)
                samples[last["sampleId"]] = altered_wav.getvalue()
                last["wavSha256"] = digest(samples[last["sampleId"]])
                with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(master)):
                    without_target = evaluate_blind_reference_pairs(rows, samples, set())
                    verified_target = evaluate_blind_reference_pairs(
                        rows, samples, set(), master)
                self.assertEqual(without_target["status"],
                                 "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY",
                                 without_target)
                self.assertFalse(without_target["originalMasterSignTrajectoryScreened"])
                self.assertEqual(verified_target["status"], "HOLD", verified_target)
                self.assertIn("REFERENCE_GAIN_OR_POLARITY_EXCERPT_FROM_ORIGINAL_MASTER",
                              verified_target["errors"])
                self.assertTrue(verified_target["originalMasterSignTrajectoryScreened"])
                self.assertTrue(verified_target["originalMasterPcmContainmentScreened"])
                self.assertFalse(verified_target["calibrationComplete"])
                self.assertFalse(verified_target["mayPublish"])

    def test_unrelated_full_master_allows_unattested_reference_research_only(self):
        # A different exact source identity must not make unrelated case audio
        # look like contamination; this is a test of false-positive boundaries
        # on synthetic noise, not attested speech or calibrated gold labels.
        rows, samples = self.fixture()
        pcm = np.random.default_rng(101).integers(
            -16000, 16000, size=824336, dtype=np.int16).tobytes()
        master = io.BytesIO()
        with wave.open(master, "wb") as audio:
            audio.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            audio.writeframes(pcm)
        with patch.object(original_guard, "SOURCE_WAV_REFERENCE", digest(master.getvalue())):
            result = evaluate_blind_reference_pairs(
                rows, samples, set(), master.getvalue())
        self.assertEqual(result["status"],
                         "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY", result)
        self.assertTrue(result["originalMasterSignTrajectoryScreened"])
        self.assertTrue(result["originalMasterPcmContainmentScreened"])
        self.assertFalse(result["speakerIdentitiesAuthenticated"])
        self.assertFalse(result["phonemeIdentityVerified"])
        self.assertFalse(result["mayPublish"])


    def test_cropped_reference_same_recording_cannot_cross_speaker_or_split(self):
        # A crop changes both length and PCM/WAV hashes. It must not appear
        # as a new recording in train or independently held-out data.
        for destination in (2, -2):  # same label, train vs held-out test
            for invert in (False, True):
                with self.subTest(destination=destination, invert=invert):
                    rows, samples = self.fixture()
                    first, duplicate = rows[0], rows[destination]
                    with wave.open(io.BytesIO(samples[first["sampleId"]]), "rb") as original:
                        full = np.frombuffer(
                            original.readframes(original.getnframes()),
                            dtype="<i2").astype(np.int32)
                    cropped = full[500:9000]
                    if invert:
                        cropped = -cropped
                    cropped_bytes = cropped.astype("<i2").tobytes()
                    self.assertEqual(len(cropped_bytes), 8500 * 2)
                    replacement = io.BytesIO()
                    with wave.open(replacement, "wb") as changed:
                        changed.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
                        changed.writeframes(cropped_bytes)
                    raw = replacement.getvalue()
                    self.assertNotEqual(digest(raw), first["wavSha256"])
                    samples[duplicate["sampleId"]] = raw
                    duplicate["wavSha256"] = digest(raw)
                    result = evaluate_blind_reference_pairs(rows, samples, set())
                    self.assertEqual(result["status"], "HOLD", result)
                    self.assertIn(
                        "REFERENCE_CROPPED_OR_POLARITY_REUSED_ACROSS_RECORDINGS",
                        result["errors"])
                    self.assertFalse(result["calibrationComplete"])
                    self.assertIsNone(result["lexicalWinner"])
                    self.assertFalse(result["mayPublish"])

    def test_distinct_shorter_reference_is_not_a_cropped_source(self):
        # An independent synthetically generated shorter clip is permitted to
        # enter *unattested* research; it remains no proof of gold labels.
        rows, samples = self.fixture()
        target = rows[-2]
        independent = self.wav(810, 31)
        with wave.open(io.BytesIO(independent), "rb") as source:
            pcm = source.readframes(source.getnframes())
        replacement = io.BytesIO()
        with wave.open(replacement, "wb") as changed:
            changed.setparams((1, 2, 24000, 0, "NONE", "not compressed"))
            changed.writeframes(pcm[500*2:9000*2])
        samples[target["sampleId"]] = replacement.getvalue()
        target["wavSha256"] = digest(samples[target["sampleId"]])
        result = evaluate_blind_reference_pairs(rows, samples, set())
        self.assertNotIn("REFERENCE_CROPPED_OR_POLARITY_REUSED_ACROSS_RECORDINGS",
                         result.get("errors", []), result)
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["phonemeIdentityVerified"])


class BlindReferenceArchiveTests(unittest.TestCase):
    @staticmethod
    def make_zip(path, rows, clips, altered=None, add_extra=False):
        with zipfile.ZipFile(path, "w") as z:
            z.writestr("manifest.json", json.dumps({
                "schema": "ths-lane2-blind-contrast-benchmark-v1",
                "mayPublish": False, "cases": rows}, sort_keys=True))
            for row in rows:
                content = clips[row["sampleId"]]
                if row["sampleId"] == altered:
                    content += b"tampered"
                z.writestr("clips/" + row["sampleId"] + ".wav", content)
            if add_extra:
                z.writestr("clips/undeclared.wav", b"unauthorized")

    def test_healthy_synthetic_zip_scores_but_never_certifies_target(self):
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)/"ref.zip"
            self.make_zip(source, rows, samples)
            report = audit_reference_archive(source)
            self.assertEqual(report["status"],
                             "RESEARCH_UNATTESTED_REFERENCE_BENCHMARK_ONLY", report)
            self.assertEqual(report["heldoutBalancedAccuracy"], 1)
            self.assertFalse(report["calibrationComplete"])
            self.assertFalse(report["mayPublish"])
            cmd = subprocess.run([
                sys.executable, str(Path(__file__).with_name("repeated_term_acoustic_guard.py")),
                "--reference-benchmark-zip", str(source)],
                capture_output=True, text=True, timeout=20)
            self.assertEqual(cmd.returncode, 3, cmd.stderr)
            self.assertIn('"originalNarrationJudged": false', cmd.stdout)

    def test_unlisted_zip_clip_is_not_treated_as_gold_reference(self):
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)/"ref.zip"
            self.make_zip(source, rows, samples, add_extra=True)
            report = audit_reference_archive(source)
            self.assertEqual(report["status"], "HOLD")
            self.assertFalse(report["mayPublish"])

    def test_hash_changing_one_wav_fails_zip_benchmark(self):
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)/"ref.zip"
            self.make_zip(source, rows, samples, altered=rows[0]["sampleId"])
            report = audit_reference_archive(source)
            self.assertEqual(report["status"], "HOLD")
            self.assertFalse(report["calibrationComplete"])

    def test_corrupt_deflate_member_fails_closed_as_json_not_traceback(self):
        # A valid ZIP central directory can conceal invalid raw DEFLATE bytes.
        # zipfile.read() raises zlib.error (not zipfile.BadZipFile) in this case.
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        with tempfile.TemporaryDirectory() as td:
            archive = Path(td) / "corrupted-compressed-reference.zip"
            with zipfile.ZipFile(archive, "w", compression=zipfile.ZIP_DEFLATED) as z:
                z.writestr("manifest.json", json.dumps({
                    "schema": "ths-lane2-blind-contrast-benchmark-v1",
                    "mayPublish": False, "cases": rows}, sort_keys=True))
                for row in rows:
                    z.writestr("clips/" + row["sampleId"] + ".wav",
                               samples[row["sampleId"]])
            with zipfile.ZipFile(archive) as z:
                entry = z.getinfo("clips/" + rows[0]["sampleId"] + ".wav")
                self.assertGreater(entry.compress_size, 0)
                offset = (entry.header_offset + 30 +
                          len(entry.filename.encode("utf-8")) + len(entry.extra))
            tampered = bytearray(archive.read_bytes())
            tampered[offset] = 0xff  # Invalid DEFLATE block header, intact ZIP directory.
            archive.write_bytes(tampered)
            report = audit_reference_archive(archive)
            self.assertEqual(report["status"], "HOLD", report)
            self.assertTrue(report["errors"][0].startswith(
                "REFERENCE_BENCHMARK_ZIP_READ_FAILED:"), report)
            self.assertFalse(report["mayPublish"])
            self.assertFalse(report["calibrationComplete"])
            script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
            cli = subprocess.run([sys.executable, script, "--reference-benchmark-zip",
                                  str(archive)], capture_output=True, text=True,
                                 timeout=20)
            self.assertEqual(cli.returncode, 2, cli.stderr)
            self.assertNotIn("Traceback", cli.stderr)
            self.assertIn('"status": "HOLD"', cli.stdout)
            self.assertIn('"mayPublish": false', cli.stdout)


    def test_archive_rejects_cross_split_pcm_duplicate_with_distinct_wav_sha(self):
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        original, target = rows[0], rows[-1]
        disguised = samples[original["sampleId"]] + b"JUNK"
        samples[target["sampleId"]] = disguised
        target["wavSha256"] = digest(disguised)
        with tempfile.TemporaryDirectory() as td:
            source = Path(td)/"spoofed.zip"
            self.make_zip(source, rows, samples)
            report = audit_reference_archive(source)
            self.assertEqual(report["status"], "HOLD", report)
            self.assertIn("REFERENCE_PCM_DUPLICATE_DESPITE_DIFFERENT_WAV_SHA",
                          report["errors"])
            self.assertFalse(report["mayPublish"])
            self.assertFalse(report["calibrationComplete"])

    def test_reference_target_argument_cannot_run_without_benchmark_zip(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        result = subprocess.run([sys.executable, script,
                                 "--reference-target-wav", "/nonexistent/source.wav"],
                                capture_output=True, text=True, timeout=20)
        self.assertEqual(result.returncode, 2, result.stderr)
        self.assertIn("REFERENCE_TARGET_WAV_REQUIRES_REFERENCE_BENCHMARK_ZIP",
                      result.stdout)
        self.assertIn('"mayPublish": false', result.stdout)

    def test_benchmark_archive_requires_actual_target_file_when_requested(self):
        rows, samples = BlindReferenceBenchmarkTests.fixture()
        with tempfile.TemporaryDirectory() as td:
            zipped = Path(td)/"refs.zip"
            self.make_zip(zipped, rows, samples)
            out = audit_reference_archive(zipped, Path(td)/"missing.wav")
            self.assertEqual(out["status"], "HOLD")
            self.assertIn("REFERENCE_TARGET_ORIGINAL_WAV_UNSAFE_OR_MISSING",
                          out["errors"])
            self.assertFalse(out["mayPublish"])

    def test_cli_rejects_mixing_benchmark_with_original_target_mode(self):
        script = str(Path(__file__).with_name("repeated_term_acoustic_guard.py"))
        proc = subprocess.run([
            sys.executable, script, "--reference-benchmark-zip",
            "/nonexistent/ref.zip", "--original-wav", "/nonexistent/original.wav"],
            capture_output=True, text=True, timeout=20)
        self.assertEqual(proc.returncode, 2, proc.stderr)
        self.assertIn("REFERENCE_BENCHMARK_MUST_RUN_IN_EXCLUSIVE_NON_TARGET_MODE",
                      proc.stdout)
        self.assertIn('"mayPublish": false', proc.stdout)


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
        for row in result["sameNarratorSourceBoundControls"]:
            spectral = row["signalOnlySpectralTrace"]
            self.assertGreater(spectral["activeFrames"], 4)
            self.assertEqual(spectral["analysisType"],
                             "RESEARCH_SPECTRAL_ENERGY_ONLY_NOT_PHONEMES")
            self.assertFalse(spectral["phonemeIdentityVerified"])
            self.assertFalse(spectral["lateralPresenceClassified"])
            self.assertEqual(len(spectral["trace"]), spectral["totalFrames"])

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

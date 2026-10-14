"""Actual source WAV -> AAC decode, plus adversarial signal mutations.

Tests verify mechanical audio faults, NOT ASR recognition or pronunciation.
"""
import importlib.util
import math
import shutil
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path
import numpy as np

s=importlib.util.spec_from_file_location("autonomous_voice_signal_audit",
    Path(__file__).with_name("autonomous_voice_signal_audit.py"))
mod=importlib.util.module_from_spec(s)
s.loader.exec_module(mod)


def synthetic_speech():
    rate=mod.RATE
    t=np.arange(rate * 5)/rate
    # Structured speech-like syllable bursts separated by intentional pauses.
    gates=(((t>.2)&(t<1.35))|((t>1.65)&(t<2.9))|((t>3.3)&(t<4.7))).astype(np.float64)
    syllables=.55+.45*np.sin(2*np.pi*3.2*t)**2
    ramp=np.minimum(1.,np.maximum(0.,(t-.18)*10))
    return (.37*gates*syllables*ramp*np.sin(2*np.pi*250*t)).astype(np.float32)


def write_wav(path,samples):
    with wave.open(str(path),"wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(mod.RATE)
        w.writeframes(np.round(np.clip(samples,-1,1)*32767).astype("<i2").tobytes())


class AutonomousActualAudioTests(unittest.TestCase):
    def setUp(self):
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe"):
            self.skipTest("FFmpeg required for actual audio tests")
        self.tmp=tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root=Path(self.tmp.name)
        self.wav=self.root/"speech.wav"
        self.master=self.root/"actual-master.m4a"
        write_wav(self.wav,synthetic_speech())
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error",
            "-nostdin","-y","-i",str(self.wav),"-c:a","aac","-b:a","128k",
            str(self.master)],check=True,timeout=35)

    def test_actual_decoded_AAC_retains_synthetic_source_performance(self):
        x=mod.analyze(self.wav,self.master,mod.sha256(self.wav),mod.sha256(self.master))
        self.assertEqual(x["status"],"MECHANICAL_AUDIO_PASS_SEMANTIC_SPEECH_AWAIT",x)
        self.assertGreater(x["energyEnvelopeCorrelation"],.96)
        self.assertGreater(x["sourceSpeechWindowRetainedFraction"],.96)
        self.assertFalse(x["scientificNamePronunciationVerified"])
        self.assertFalse(x["voiceNaturalnessVerified"])
        self.assertFalse(x["mayPublish"])

    def test_actual_source_identity_change_rejected(self):
        with self.assertRaisesRegex(ValueError,"ACTUAL_MOVIE_CHANGED_FROM_REVIEW_TARGET"):
            mod.analyze(self.wav,self.master,mod.sha256(self.wav),"0"*64)
        with self.assertRaisesRegex(ValueError,"ORIGINAL_VOICE_BYTES_NOT_PINNED"):
            mod.analyze(self.wav,self.master,"0"*64,mod.sha256(self.master))

    def test_missing_spoken_ending_is_an_autonomous_revise(self):
        a=synthetic_speech()
        # A complete 1s spoken window is deliberately silenced, same duration.
        broken=a.copy()
        broken[int(3.35*mod.RATE):int(4.65*mod.RATE)]=0.
        result=mod.compare_decoded_pcm(a,broken)
        self.assertIn("SOURCE_SPOKEN_WINDOWS_MUTED_OR_MISSING",result["issues"])

    def test_extreme_clipping_is_a_reject(self):
        a=synthetic_speech()
        crushed=np.clip(a*7,-1,1)
        result=mod.compare_decoded_pcm(a,crushed)
        self.assertIn("AUDIBLE_PCM_SAMPLES_CLIPPED",result["issues"])

    def test_upstream_clipping_then_attenuation_still_gets_rejected(self):
        original=synthetic_speech()
        # Huge analog/digital clipping occurs *before* output mastering,
        # and the final peak is only 0.19; peak-only checks miss this.
        clipped_then_attenuated=np.clip(original*7,-.19,.19)
        self.assertLess(float(np.max(np.abs(clipped_then_attenuated))),.99)
        result=mod.compare_decoded_pcm(original,clipped_then_attenuated)
        self.assertEqual(result["masteredClippedSampleFraction"],0.)
        self.assertIn("MASTERED_WAVEFORM_NONLINEAR_OR_DISTORTED",result["issues"])

    def test_oversized_master_is_bounded_at_ffmpeg_decode_stage(self):
        long_audio=self.root/"long.aac.m4a"
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error",
            "-nostdin","-y","-f","lavfi","-i",
            "anullsrc=r=24000:cl=mono:d=181.5",
            "-c:a","aac","-b:a","32k",str(long_audio)],
            check=True,timeout=40)
        with self.assertRaisesRegex(ValueError,"MASTERED_AUDIO_DURATION_UNBOUNDED"):
            mod.actual_master_pcm(long_audio)

    def test_missing_audio_after_early_truncation_is_rejected(self):
        a=synthetic_speech()
        result=mod.compare_decoded_pcm(a,a[:int(mod.RATE*3.1)])
        self.assertIn("PERFORMANCE_DURATION_CHANGED_OR_TRUNCATED",result["issues"])

    def test_original_must_be_actual_pinned_pcm_24k_mono(self):
        with self.assertRaisesRegex(ValueError,"ORIGINAL_VOICE_BYTES_NOT_PINNED"):
            mod.source_wav(self.root/"missing.wav","f"*64)
        # A matched SHA does not turn 8kHz into an approved voice source.
        with wave.open(str(self.root/"wrong.wav"),"wb") as w:
            w.setnchannels(1);w.setsampwidth(2);w.setframerate(8000)
            w.writeframes(b"\x00\x00"*20000)
        with self.assertRaisesRegex(ValueError,"ORIGINAL_PCM24K_MONO16_REQUIRED"):
            mod.source_wav(self.root/"wrong.wav",mod.sha256(self.root/"wrong.wav"))

    def test_movie_with_no_audio_track_is_rejected(self):
        movie=self.root/"silent.mp4"
        subprocess.run(["ffmpeg","-hide_banner","-loglevel","error",
            "-nostdin","-y","-f","lavfi","-i",
            "color=c=black:s=180x320:r=8:d=3",
            "-an","-c:v","libx264","-preset","ultrafast","-pix_fmt",
            "yuv420p",str(movie)],check=True,timeout=30)
        with self.assertRaisesRegex(ValueError,"EXACTLY_ONE_REAL_AUDIO_STREAM_REQUIRED"):
            mod.analyze(self.wav,movie,mod.sha256(self.wav),mod.sha256(movie))


if __name__=="__main__":
    unittest.main()

#!/usr/bin/env python3
"""EvidenceMotion autonomous voice signal QA over actual WAV + mastered media.

RESEARCH ONLY. Detects clipping, muted/truncated performance, envelope timing
and source-audio drift with machine-measured audio. Does NOT run ASR/phoneme
alignment, certify a pronunciation or rate whether a voice sounds human.
"""
import argparse
import hashlib
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

RATE = 24000
HOP = 480  # 20 ms; no speech-recognition dependency
MAX_LAG_BINS = 5  # measured up to +/- 100 ms
MAX_ABS_LAG_MS = 35
MIN_ENVELOPE_CORRELATION = .96
MIN_ACTIVE_SOURCE_COVERAGE = .96
MAX_MUTE_RATIO = .45
MAX_PEAK = .99
MAX_CLIPPED_FRACTION = .0001
MIN_DURATION = 1.0
MAX_DURATION = 180.0


def hold(code):
    raise ValueError("AUDIO_SIGNAL_RESEARCH_HOLD: " + code)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            h.update(block)
    return h.hexdigest()


def source_wav(path, expected_sha):
    p = Path(path)
    if not p.is_file() or p.is_symlink() or sha256(p) != expected_sha:
        hold("ORIGINAL_VOICE_BYTES_NOT_PINNED")
    with wave.open(str(p), "rb") as src:
        if (src.getframerate(), src.getnchannels(), src.getsampwidth(), src.getcomptype()) != (RATE, 1, 2, "NONE"):
            hold("ORIGINAL_PCM24K_MONO16_REQUIRED")
        audio = np.frombuffer(src.readframes(src.getnframes()), dtype="<i2").astype(np.float32) / 32768.
    if not MIN_DURATION <= len(audio) / RATE <= MAX_DURATION:
        hold("VOICE_DURATION_OUTSIDE_BOUNDED_RESEARCH")
    return audio


def actual_master_pcm(path):
    p = Path(path)
    if not p.is_file() or p.is_symlink():
        hold("ACTUAL_MASTER_MEDIA_REQUIRED")
    try:
        info = json.loads(subprocess.check_output([
            "ffprobe", "-v", "error", "-show_streams", "-of", "json", str(p)
        ], timeout=25))
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired, ValueError) as exc:
        hold("ACTUAL_AUDIO_PROBE_FAILED:" + type(exc).__name__)
    tracks = [s for s in info.get("streams", []) if s.get("codec_type") == "audio"]
    if len(tracks) != 1:
        hold("EXACTLY_ONE_REAL_AUDIO_STREAM_REQUIRED")
    if tracks[0].get("codec_name") not in ("aac", "pcm_s16le"):
        hold("REVIEWED_AUDIO_CODEC_NOT_SUPPORTED")
    try:
        raw = subprocess.check_output([
            "ffmpeg", "-hide_banner", "-v", "error", "-xerror", "-nostdin",
            "-i", str(p), "-map", "0:a:0", "-ac", "1", "-ar", str(RATE),
            "-t", str(MAX_DURATION + 1), "-acodec", "pcm_s16le", "-f", "s16le", "pipe:1"
        ], timeout=90)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired) as exc:
        hold("ACTUAL_MASTER_AUDIO_DECODE_FAILED:" + type(exc).__name__)
    if not raw or len(raw) % 2:
        hold("INCOMPLETE_PCM_OUTPUT")
    audio = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768.
    if not MIN_DURATION <= len(audio) / RATE <= MAX_DURATION:
        hold("MASTERED_AUDIO_DURATION_UNBOUNDED")
    return audio


def envelope(samples):
    count = len(samples) // HOP
    if count < 50:
        hold("INSUFFICIENT_SPEECH_WINDOW_COVERAGE")
    energy = np.asarray(samples[:count * HOP]).reshape(count, HOP)
    return np.sqrt(np.mean(np.square(energy, dtype=np.float64), axis=1))


def corr(x, y):
    if len(x) < 20 or len(y) < 20:
        return 0.
    a, b = np.asarray(x, dtype=np.float64), np.asarray(y, dtype=np.float64)
    denom = np.linalg.norm(a - a.mean()) * np.linalg.norm(b - b.mean())
    if denom < 1e-12:
        return 0.
    return float(np.dot(a - a.mean(), b - b.mean()) / denom)


def best_envelope_alignment(a, b):
    matches = []
    for lag in range(-MAX_LAG_BINS, MAX_LAG_BINS + 1):
        if lag < 0:
            src, master = a[-lag:], b[:len(a) + lag]
        else:
            src, master = a[:len(b) - lag], b[lag:]
        size = min(len(src), len(master))
        if size > 30:
            matches.append((corr(src[:size], master[:size]), lag))
    if not matches:
        hold("CANNOT_ALIGN_ORIGINAL_PERFORMANCE")
    score, lag = max(matches, key=lambda r: (r[0], -abs(r[1])))
    return score, lag


def matching_waveform_shape(original, mastered, lag_bins):
    """Actual waveform fidelity independent of mastering gain and attenuation.

    FFT searches a 20-ms window around the energy-derived lag in three
    nonadjacent high-energy source fragments. Hard clipping that was later
    attenuated retains obvious nonlinear flat-topping and fails this metric
    even when the mastered PCM peak is below 0.99.
    """
    window = int(.7 * RATE)
    pad = HOP
    n = min(len(original), len(mastered))
    if n <= window + 2 * pad:
        return 0.
    positions = range(0, n - window - pad, window)
    high_energy = sorted(positions, key=lambda k: float(np.dot(
        original[k:k + window], original[k:k + window])), reverse=True)[:3]
    scores = []
    for start in high_energy:
        x = np.asarray(original[start:start + window], dtype=np.float64)
        estimated = start + lag_bins * HOP
        lo = max(0, estimated - pad)
        hi = min(len(mastered), estimated + window + pad)
        y = np.asarray(mastered[lo:hi], dtype=np.float64)
        if len(y) < window or np.linalg.norm(x) < 1.e-5:
            continue
        nfft = 1 << (len(x) + len(y) - 2).bit_length()
        # Cross-correlation by FFT avoids quadratic memory/time on full tracks.
        conv = np.fft.irfft(np.fft.rfft(y, nfft) *
                           np.fft.rfft(x[::-1], nfft), nfft)
        valid = conv[len(x)-1:len(y)]
        offset = int(np.argmax(valid))
        selected = y[offset:offset + window]
        scores.append(corr(x, selected))
    return float(np.median(scores)) if scores else 0.


def compare_decoded_pcm(original, mastered):
    a, b = envelope(original), envelope(mastered)
    source_duration = len(original) / RATE
    master_duration = len(mastered) / RATE
    score, lag = best_envelope_alignment(a, b)
    # Match the original activity shape; gain may change during mastering.
    if lag < 0:
        x, y = a[-lag:], b[:len(a) + lag]
    else:
        x, y = a[:len(b) - lag], b[lag:]
    size = min(len(x), len(y))
    x, y = x[:size], y[:size]
    significant = x >= max(.008, .17 * float(np.quantile(a, .9)))
    gain = float(np.median(y[significant] / np.maximum(x[significant], 1.e-5))) if np.any(significant) else 0.
    # A 20-ms original spoken window is considered retained when the mastered
    # audio contains at least 45% of its expected RMS amplitude.
    retained = y[significant] >= x[significant] * gain * MAX_MUTE_RATIO if gain > 0 else np.zeros(int(np.sum(significant)), dtype=bool)
    retained_fraction = float(np.mean(retained)) if len(retained) else 0.
    abs_peak = float(np.max(np.abs(mastered)))
    clipped_fraction = float(np.mean(np.abs(mastered) >= MAX_PEAK))
    waveform_shape = matching_waveform_shape(original, mastered, lag)
    issues = []
    if abs(source_duration - master_duration) > .15:
        issues.append("PERFORMANCE_DURATION_CHANGED_OR_TRUNCATED")
    if abs(lag * 1000 * HOP / RATE) > MAX_ABS_LAG_MS:
        issues.append("PERFORMANCE_TIMING_SHIFTED")
    if score < MIN_ENVELOPE_CORRELATION:
        issues.append("ORIGINAL_VOICE_ENVELOPE_MISMATCH")
    if retained_fraction < MIN_ACTIVE_SOURCE_COVERAGE:
        issues.append("SOURCE_SPOKEN_WINDOWS_MUTED_OR_MISSING")
    if clipped_fraction > MAX_CLIPPED_FRACTION:
        issues.append("AUDIBLE_PCM_SAMPLES_CLIPPED")
    if waveform_shape < .975:
        issues.append("MASTERED_WAVEFORM_NONLINEAR_OR_DISTORTED")
    if gain < .35:
        issues.append("MASTERED_SPEECH_UNEXPECTEDLY_QUIET_VS_SOURCE")
    return {
        "sourceDurationSeconds": round(source_duration, 5),
        "masteredAudioDurationSeconds": round(master_duration, 5),
        "bestRelativeLagMs": int(lag * 1000 * HOP / RATE),
        "energyEnvelopeCorrelation": round(score, 5),
        "sourceSpeechWindowRetainedFraction": round(retained_fraction, 5),
        "masterToSourceRmsGainMedian": round(gain, 4),
        "masteredPcmPeak": round(abs_peak, 5),
        "masteredClippedSampleFraction": round(clipped_fraction, 8),
        "sourceMatchedWaveformCorrelation": round(waveform_shape, 5),
        "issues": issues,
    }


def analyze(original_wav, actual_movie, expected_wav_sha, expected_movie_sha):
    if not isinstance(expected_wav_sha, str) or len(expected_wav_sha) != 64:
        hold("EXPECTED_SOURCE_SHA_REQUIRED")
    if not isinstance(expected_movie_sha, str) or len(expected_movie_sha) != 64 or sha256(actual_movie) != expected_movie_sha:
        hold("ACTUAL_MOVIE_CHANGED_FROM_REVIEW_TARGET")
    src = source_wav(original_wav, expected_wav_sha)
    output = actual_master_pcm(actual_movie)
    report = compare_decoded_pcm(src, output)
    report.update({
        "schema": "ths-autonomous-audio-signal-research-v1",
        "originalWavSha256": expected_wav_sha,
        "actualMovieSha256": expected_movie_sha,
        "status": "AUTO_REVISE_AUDIO" if report["issues"] else "MECHANICAL_AUDIO_PASS_SEMANTIC_SPEECH_AWAIT",
        "actualSpeechTranscription": "NOT_RUN",
        "wordLevelAlignment": "NOT_RUN",
        "scientificNamePronunciationVerified": False,
        "voiceNaturalnessVerified": False,
        "ownerListeningRequiredForThisMechanicalDecision": False,
        "humanScientificReviewerImpersonated": False,
        "mayPublish": False,
        "creativeCraftApproved": False,
    })
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-wav", required=True)
    parser.add_argument("--master", required=True)
    parser.add_argument("--wav-sha", required=True)
    parser.add_argument("--master-sha", required=True)
    parser.add_argument("--report")
    args = parser.parse_args()
    verdict = analyze(args.source_wav, args.master, args.wav_sha, args.master_sha)
    if args.report:
        Path(args.report).write_text(json.dumps(verdict, indent=2) + "\n")
    print(json.dumps(verdict, indent=2))

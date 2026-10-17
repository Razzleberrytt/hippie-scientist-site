"""Research-only exact-film Gut V10 SRT vs decoded AAC activity screen.

Tests coarse sound presence and silence, never phonetic/word alignment,
caption visibility, science or human-perceived quality. Fail closed.
"""
import hashlib
import json
import re
import subprocess
from pathlib import Path

import numpy as np

GUT_FILM_SHA = "044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2"
GUT_SRT_SHA = "40622b677cd6db8c493eff55727904c5017c4a3d7803b22d4c361e84a1ff9bee"
GUT_AUDIO_ADTS_SHA = "24188032e84974f624093c2193e4216fa2adbea20faebab8ac33770a016c8233"


def digest(data):
    return hashlib.sha256(data).hexdigest()


def hold(reason, **details):
    return {"status": "HOLD", "errors": [reason], "mayPublish": False,
            "phonemeIdentityVerified": False, "wordTimingCalibrated": False,
            "phonePlaybackVerified": False, "scienceApproved": False,
            "spokenWordsConfirmedAgainstCaptions": False, **details}


def parse_srt(raw):
    try:
        text = raw.decode("utf-8-sig")
    except (UnicodeError, AttributeError) as exc:
        raise ValueError("GUT_SRT_TEXT_INVALID") from exc
    blocks = re.split(r"\r?\n\r?\n", text.strip())
    if len(blocks) != 19:
        raise ValueError("GUT_SRT_EXACT_19_CUES_REQUIRED")
    rows = []
    previous_end = 0.0
    for i, block in enumerate(blocks, 1):
        lines = block.splitlines()
        if len(lines) < 3 or lines[0].strip() != str(i):
            raise ValueError("GUT_SRT_INDEX_INVALID")
        pattern = (r"(\d{2}):(\d{2}):(\d{2}),(\d{3}) --> "
                   r"(\d{2}):(\d{2}):(\d{2}),(\d{3})")
        m = re.fullmatch(pattern, lines[1].strip())
        if m is None:
            raise ValueError("GUT_SRT_TIMESTAMP_INVALID")
        v = list(map(int, m.groups()))
        if any(v[j] >= 60 for j in (1, 2, 5, 6)):
            raise ValueError("GUT_SRT_TIMESTAMP_INVALID")
        start = 3600*v[0] + 60*v[1] + v[2] + v[3]/1000
        end = 3600*v[4] + 60*v[5] + v[6] + v[7]/1000
        if not previous_end <= start < end <= 180:
            raise ValueError("GUT_SRT_OVERLAP_OR_RANGE")
        if not all(s.strip() for s in lines[2:]):
            raise ValueError("GUT_SRT_BLANK_CAPTION")
        if any(re.search(r"<[^>]*>|\{[^}]*\}", x) for x in lines[2:]):
            raise ValueError("GUT_SRT_MARKUP_UNEXPECTED")
        rows.append((i, start, end, " ".join(lines[2:])))
        previous_end = end
    return rows


def audit_pcm_cues(stereo_pcm, cues):
    try:
        pcm = np.asarray(stereo_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return hold("GUT_PCM_INVALID")
    if (pcm.ndim != 2 or pcm.shape[1] != 2
            or not 96000 <= len(pcm) <= 48000*180
            or not np.isfinite(pcm).all()
            or np.max(np.abs(pcm)) > 1.5):
        return hold("GUT_PCM_INVALID")
    if len(cues) != 19 or any(not isinstance(c, (tuple, list))
                              or len(c) != 4 for c in cues):
        return hold("GUT_SRT_EXACT_19_CUES_REQUIRED")
    mono = pcm.mean(axis=1)
    count = len(mono)//480
    rms = np.sqrt(np.mean(mono[:count*480].reshape(count, 480)**2, axis=1))
    rows, failures, gap_violations = [], [], []
    previous = 0.
    for idx, start, end, phrase in cues:
        if (not 0 <= previous <= start < end <= len(mono)/48000+.005
                or idx != len(rows)+1 or not isinstance(phrase, str)
                or not phrase.strip()):
            return hold("GUT_SRT_OVERLAP_OR_MEDIA_RANGE")
        if start-previous >= .35:
            gap = rms[round(previous*100):round(start*100)]
            if len(gap) and float(np.mean(gap >= .003)) > .25:
                gap_violations.append({"from": round(previous, 3),
                                       "to": round(start, 3),
                                       "activeShare": round(float(np.mean(
                                           gap >= .003)), 4)})
        window = rms[round(start*100):round(end*100)]
        if len(window) < 20:
            return hold("GUT_CUE_TOO_SHORT_TO_SCREEN")
        fraction = float(np.mean(window >= .003))
        rows.append({"cue": idx, "start": round(start, 3),
                     "end": round(end, 3), "text": phrase,
                     "active10msFraction": round(fraction, 5),
                     "researchActive": bool(fraction >= .65)})
        if fraction < .65:
            failures.append(idx)
        previous = end
    problems = bool(failures or gap_violations)
    return {**(hold("GUT_AUDIO_SRT_ACTIVITY_DISCREPANCY") if problems
               else hold("RESEARCH_ONLY")),
            "status": "HOLD" if problems else "RESEARCH_GUT_AUDIO_SRT_COVERAGE_HOLD",
            "errors": ["GUT_AUDIO_SRT_ACTIVITY_DISCREPANCY"] if problems else [],
            "researchOnlyEnergyThresholdFullScaleRms": .003,
            "researchOnlyMinimumCueActiveFraction": .65,
            "sampleRateHz": 48000, "channels": 2,
            "decodedAudioSampleFrames": len(pcm),
            "matchedSrtCueCount": len(rows), "cueSignalCoverage": rows,
            "lowActivityCueIds": failures,
            "highActivityDeclaredGapIntervals": gap_violations,
            "thisDoesNotProveAcousticWordBoundaries": True}



def audit_pcm_long_pause_boundaries(stereo_pcm, cues):
    """Negative-only, long inter-cue pause edges in 10ms stereo source clock.

    A measured energy onset/offset is not a lexical word boundary or a
    phoneme verdict. Research thresholds are specific to this owner film.
    """
    base = {"mayPublish": False, "wordTimingCalibrated": False,
            "phonemeIdentityVerified": False,
            "independentVoiceQualityApproved": False,
            "spokenWordsConfirmedAgainstCaptions": False}
    def reject(reason, **details):
        return {**base, "status": "HOLD", "errors": [reason], **details}
    try:
        audio = np.asarray(stereo_pcm, dtype=np.float64)
    except (ValueError, TypeError, OverflowError):
        return reject("PAUSE_PCM_INVALID")
    if (audio.ndim != 2 or audio.shape[1] != 2
            or not 96000 <= len(audio) <= 48000*180
            or not np.isfinite(audio).all() or np.max(np.abs(audio)) > 1.5
            or not isinstance(cues, list) or len(cues) != 19):
        return reject("PAUSE_PCM_OR_CUES_INVALID")
    previous = 0.
    for idx, item in enumerate(cues, 1):
        if not isinstance(item, (tuple, list)) or len(item) != 4:
            return reject("PAUSE_CUE_INVENTORY_INVALID")
        num, start, end, caption = item
        if (type(num) is not int or num != idx
                or not isinstance(start, (int, float))
                or not isinstance(end, (int, float))
                or not np.isfinite(start) or not np.isfinite(end)
                or not previous <= start < end <= len(audio)/48000+.005
                or not isinstance(caption, str) or not caption.strip()):
            return reject("PAUSE_CUE_TIMING_INVALID")
        previous = end
    # Screen per-channel RMS, not a stereo downmix: opposite-phase content
    # must not fake silence through phase cancellation.
    frames = len(audio)//480
    chunks = audio[:frames*480].reshape(frames, 480, 2)
    rms = np.max(np.sqrt(np.mean(chunks*chunks, axis=1)), axis=1)
    smooth = rms.copy()
    smooth[1:-1] = np.median(
        np.stack((rms[:-2], rms[1:-1], rms[2:]), axis=1), axis=1)
    active = smooth >= .003
    records, failures = [], []
    for before_cue, after_cue in zip(cues, cues[1:]):
        pause = round(after_cue[1]-before_cue[2], 6)
        if pause < .35:
            continue
        finish = round(before_cue[2]*100)
        resume = round(after_cue[1]*100)
        if not 0 < finish < resume < frames:
            return reject("PAUSE_BIN_RANGE_INVALID")
        look_back = max(round(before_cue[1]*100), finish-30)
        look_forward = min(round(after_cue[2]*100), resume+30, frames)
        last = np.flatnonzero(active[look_back:finish])
        first = np.flatnonzero(active[resume:look_forward])
        if not len(last) or not len(first):
            failures.append({"betweenCueIds":
                [before_cue[0], after_cue[0]],
                "reason": "MISSING_SPEECH_EDGE"})
            continue
        last_time = (look_back+int(last[-1]))/100
        first_time = (resume+int(first[0]))/100
        offsets = [round(1000*(last_time-before_cue[2])),
                   round(1000*(first_time-after_cue[1]))]
        gap_bins = active[finish:resume]
        gap_fraction = float(np.mean(gap_bins))
        consecutive = longest = 0
        for energized in gap_bins:
            consecutive = consecutive+1 if energized else 0
            longest = max(longest, consecutive)
        problems = []
        if min(offsets) < -120 or max(offsets) > 120:
            problems.append("PAUSE_EDGE_OUTSIDE_120MS_TOLERANCE")
        if gap_fraction > .08 or longest >= 6:
            problems.append("AUDIO_IN_DECLARED_PAUSE")
        record = {"betweenCueIds":[before_cue[0], after_cue[0]],
                  "declaredPauseSeconds":pause,
                  "lastAcousticActivitySecond":last_time,
                  "nextAcousticActivitySecond":first_time,
                  "endEdgeOffsetMs":offsets[0],
                  "startEdgeOffsetMs":offsets[1],
                  "declaredPauseActiveFraction":round(gap_fraction,5),
                  "longestActivePauseRunMs":longest*10,
                  "problems":problems}
        records.append(record)
        if problems:
            failures.append(record)
    if len(records)+len([x for x in failures if x.get("reason")]) != 5:
        return reject("PAUSE_EXPECTED_FIVE_GROUPS_UNVERIFIED",
                      measuredGroups=len(records), problems=failures)
    return {**base, "status": "HOLD" if failures
            else "RESEARCH_LONG_PAUSE_EDGES_HOLD",
            "errors": ["GUT_PAUSE_EDGE_OR_LEAK"] if failures else [],
            "pauseGroupsChecked": len(records), "pauseBoundaries": records,
            "failingPauseGroups": failures, "analysisBinMs": 10,
            "medianEnvelopeSpanMs": 30,
            "sourceSpecificActivityThresholdRms": .003,
            "researchEdgeToleranceMs": 120,
            "notLexicalWordTimingOrPronunciationProof": True}


def audit_pinned_film_srt(film_path, srt_path):
    """Exact immutable film+SRT+AAC SHA with real 48k stereo decode."""
    try:
        film = Path(film_path).read_bytes()
        srt = Path(srt_path).read_bytes()
        if digest(film) != GUT_FILM_SHA:
            return hold("GUT_LATEST_FILM_SHA_MISMATCH")
        if digest(srt) != GUT_SRT_SHA:
            return hold("GUT_CAPTION_SOURCE_SHA_MISMATCH")
        cues = parse_srt(srt)

        def run(command, timeout=55):
            return subprocess.run(command, capture_output=True, check=True,
                                  timeout=timeout).stdout

        meta = json.loads(run([
            "ffprobe", "-v", "error", "-select_streams", "a:0",
            "-show_entries", "stream=codec_name,sample_rate,channels",
            "-of", "json", str(film_path)]))
        streams = meta.get("streams", [])
        required = (("codec_name", "aac"), ("sample_rate", "48000"),
                    ("channels", "2"))
        if len(streams) != 1 or any(
                str(streams[0].get(k)) != val for k, val in required):
            return hold("GUT_AAC_CODEC_FORMAT_CHANGED")
        adts = run(["ffmpeg", "-nostdin", "-v", "error", "-xerror",
                    "-i", str(film_path), "-map", "0:a:0", "-c:a", "copy",
                    "-f", "adts", "pipe:1"])
        if digest(adts) != GUT_AUDIO_ADTS_SHA:
            return hold("GUT_AAC_ELEMENTARY_STREAM_CHANGED")
        raw = run(["ffmpeg", "-nostdin", "-v", "error", "-xerror",
                   "-i", str(film_path), "-map", "0:a:0", "-f", "f32le",
                   "-ac", "2", "-ar", "48000", "pipe:1"])
        if len(raw) % 8:
            return hold("GUT_DECODED_AUDIO_LENGTH_INVALID")
        pcm = np.frombuffer(raw, dtype="<f4").reshape(-1, 2)
        result = audit_pcm_cues(pcm, cues)
        pause = audit_pcm_long_pause_boundaries(pcm, cues)
        if pause["status"] != "RESEARCH_LONG_PAUSE_EDGES_HOLD":
            return {**hold("GUT_PAUSE_BOUNDARIES_FAILED"), 
                    "pauseEdgeResearch": pause,
                    "coarseCueActivityResearch": result}
        if result["status"] != "RESEARCH_GUT_AUDIO_SRT_COVERAGE_HOLD":
            return {**result, "pauseEdgeResearch": pause}
        return {**result, "pauseEdgeResearch": pause,
                "latestFilmSha256": GUT_FILM_SHA,
                "sourceSrtSha256": GUT_SRT_SHA,
                "actualAdtsSha256": digest(adts),
                "decodedAudioF32leSha256": digest(raw),
                "physicallyDecodedExactPinnedAAC": True,
                "captionPixelsOrLexicalOnsetReviewed": False}
    except (OSError, KeyError, TypeError, ValueError,
            subprocess.SubprocessError):
        return hold("GUT_PHYSICAL_SOURCE_DECODE_UNAVAILABLE")

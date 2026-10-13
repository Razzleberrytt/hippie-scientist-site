"""Research-only EvidenceMotion final-MP4 QA. Checks actual bytes, not receipts.

Usage: python native_master_audit.py --master final.mp4 --reference-audio previous.mp4 \
    --expected-sha 64HEX --expected-audio-sha 64HEX --expected-frames 1031

Never treats technical success as approval of chemistry, copyright, craft, voice, or posting.
Full CI on refreshed main must remain green; a standalone Python test pass is insufficient.
"""
import argparse
import hashlib
import json
import re
import subprocess
from fractions import Fraction
from decimal import Decimal, InvalidOperation
from pathlib import Path


def sha256_file(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def command(args):
    return subprocess.run(args, capture_output=True, check=True).stdout


def probe(path):
    return json.loads(command(['ffprobe', '-v', 'error', '-show_entries',
       'stream=codec_type,codec_name,width,height,r_frame_rate,avg_frame_rate,nb_frames,duration',
       '-of', 'json', str(path)]))['streams']

def frame_timestamps(path):
    """Read actual decoded presentation timestamps, never trust guessed r_frame_rate."""
    raw = command(['ffprobe', '-v', 'error', '-select_streams', 'v:0',
                   '-show_entries', 'frame=best_effort_timestamp_time',
                   '-of', 'csv=p=0', str(path)])
    return [Decimal(item.strip().split(',', 1)[0]) for item in raw.decode('utf-8').splitlines() if item.strip()]


def audio_hash(path):
    """SHA-256 of actual AAC elementary stream with canonical ADTS framing."""
    raw = command(['ffmpeg', '-hide_banner', '-v', 'error',
                   '-i', str(path), '-map', '0:a:0', '-c:a', 'copy',
                   '-f', 'adts', '-'])
    if not raw:
        raise ValueError('empty audio stream')
    return hashlib.sha256(raw).hexdigest()


def verify(master, reference_audio, expected_sha, expected_audio_sha, expected_frames,
           *, width=1080, height=1920, fps=30, decode_all=True):
    problems = []
    result = {
        'technical': 'HOLD', 'problems': problems, 'releaseApproved': False,
        'craftApproved': False, 'scientificEditorialApproved': False,
        'ownerDevicePlaybackApproved': False, 'fullDecodePerformed': False,
        'frameTimingVerified': False,
        'nativeProvenanceNote': 'Pixel dimensions alone do not prove native source rendering; audit renderer input receipts separately.'
    }
    for label, path in [('MASTER', master), ('REFERENCE_AUDIO', reference_audio)]:
        if not Path(path).is_file():
            problems.append(label + '_MISSING')
    if problems:
        return result
    if not all(isinstance(h, str) and re.fullmatch('[0-9a-fA-F]{64}', h)
               for h in (expected_sha, expected_audio_sha)):
        problems.append('PINNED_HASHES_REQUIRED')
        return result
    if not isinstance(expected_frames, int) or expected_frames <= 0 or not isinstance(fps, int) or fps <= 0:
        problems.append('INVALID_FRAME_CONTRACT')
        return result
    try:
        master_sha = sha256_file(master)
        result['masterSha256'] = master_sha
        if master_sha.lower() != expected_sha.lower():
            problems.append('MASTER_BYTES_CHANGED')
    except OSError:
        problems.append('MASTER_HASH_FAILED')
    try:
        streams = probe(master)
        videos = [s for s in streams if s.get('codec_type') == 'video']
        audios = [s for s in streams if s.get('codec_type') == 'audio']
        if len(videos) != 1 or len(audios) != 1:
            problems.append('EXACTLY_ONE_VIDEO_AND_AUDIO_REQUIRED')
        else:
            video, audio = videos[0], audios[0]
            try:
                rate = Fraction(video.get('r_frame_rate', '0/1'))
                average = Fraction(video.get('avg_frame_rate', '0/1'))
            except (ValueError, ZeroDivisionError):
                rate = average = None
            if ((video.get('width'), video.get('height')) != (width, height)
                    or rate != fps or average != fps):
                problems.append('INCORRECT_NATIVE_FRAME_GEOMETRY')
            if video.get('codec_name') != 'h264' or audio.get('codec_name') != 'aac':
                problems.append('UNSUPPORTED_VIDEO_OR_AUDIO_CODEC')
            try:
                if int(video.get('nb_frames', -1)) != expected_frames:
                    problems.append('FRAME_COUNT_MISMATCH')
            except (ValueError, TypeError):
                problems.append('FRAME_COUNT_MISMATCH')
            try:
                video_duration = Decimal(str(video['duration']))
                audio_duration = Decimal(str(audio['duration']))
                if abs(video_duration - audio_duration) > Decimal('0.10'):
                    problems.append('AUDIO_VIDEO_DURATION_MISMATCH')
                if abs(video_duration - Decimal(expected_frames)/Decimal(fps)) > Decimal('0.002'):
                    problems.append('VIDEO_DURATION_NOT_FIXED_FPS')
            except (KeyError, ValueError, InvalidOperation):
                problems.append('STREAM_DURATION_MISSING')
    except (subprocess.CalledProcessError, OSError, KeyError, ValueError):
        problems.append('MEDIA_PROBE_FAILED')
    # Constant presentation timestamps are required: r_frame_rate alone is a guessed base-rate.
    try:
        stamps = frame_timestamps(master)
        if len(stamps) != expected_frames:
            problems.append('DECODED_FRAME_COUNT_MISMATCH')
        elif not stamps or any(not stamp.is_finite() for stamp in stamps):
            problems.append('VIDEO_FRAME_TIMESTAMPS_INVALID')
        else:
            origin, step = stamps[0], Decimal(1)/Decimal(fps)
            tolerance = Decimal('0.001')
            if (origin < Decimal('-0.001') or origin > step + tolerance or
                any(abs((stamp - origin) - step*i) > tolerance for i,stamp in enumerate(stamps))):
                problems.append('NONCONSTANT_VIDEO_FRAME_TIMING')
            else:
                result['frameTimingVerified'] = True
    except (subprocess.CalledProcessError, OSError, ValueError, InvalidOperation, UnicodeError, KeyError):
        problems.append('FRAME_TIMESTAMP_EXTRACTION_FAILED')
    for label, path in [('MASTER', master), ('REFERENCE', reference_audio)]:
        try:
            observed = audio_hash(path)
            if label == 'MASTER':
                result['audioAdtsSha256'] = observed
            if observed.lower() != expected_audio_sha.lower():
                problems.append('NARRATION_AAC_NOT_EXACTLY_PINNED')
        except (subprocess.CalledProcessError, OSError, ValueError):
            problems.append(label+'_AUDIO_EXTRACTION_FAILED')
    if decode_all:
        try:
            command(['ffmpeg', '-hide_banner', '-v', 'error', '-xerror',
                     '-i', str(master), '-f', 'null', '-'])
            result['fullDecodePerformed'] = True
        except (subprocess.CalledProcessError, OSError):
            problems.append('FULL_MEDIA_DECODE_FAILED')
    result['technical'] = 'PASS' if not problems else 'HOLD'
    return result

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--master', type=Path, required=True)
    parser.add_argument('--reference-audio', type=Path, required=True)
    parser.add_argument('--expected-sha', required=True)
    parser.add_argument('--expected-audio-sha', required=True)
    parser.add_argument('--expected-frames', type=int, required=True)
    parser.add_argument('--no-full-decode', action='store_true')
    args = parser.parse_args()
    receipt = verify(args.master, args.reference_audio, args.expected_sha,
       args.expected_audio_sha, args.expected_frames, decode_all=not args.no_full_decode)
    print(json.dumps(receipt, indent=2))
    raise SystemExit(0 if receipt['technical'] == 'PASS' else 1)

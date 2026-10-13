"""Research-only EvidenceMotion final-MP4 QA. Checks actual bytes, not receipts.

Usage: python native_master_audit.py --master final.mp4 --reference-audio previous.mp4 \
    --expected-sha 64HEX --expected-audio-sha 64HEX --expected-frames 1031

Never treats technical success as approval of chemistry, copyright, craft, voice, or posting.
"""
import argparse
import hashlib
import json
import subprocess
from fractions import Fraction
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
       'stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,duration',
       '-of', 'json', str(path)]))['streams']


def audio_hash(path):
    output = command(['ffmpeg', '-hide_banner', '-v', 'error', '-i', str(path),
        '-map', '0:a:0', '-c:a', 'copy', '-f', 'adts', 'pipe:1'])
    return hashlib.sha256(output).hexdigest()


def verify(master, reference_audio, expected_sha, expected_audio_sha, expected_frames,
           *, width=1080, height=1920, fps=30, decode_all=True):
    problems = []
    for label, path in [('MASTER', master), ('REFERENCE_AUDIO', reference_audio)]:
        if not Path(path).is_file():
            problems.append(label + '_MISSING')
    if problems:
        return {'technical': 'HOLD', 'problems': problems, 'releaseApproved': False}
    if len(expected_sha) != 64 or len(expected_audio_sha) != 64:
        problems.append('PINNED_HASHES_REQUIRED')
    master_sha = sha256_file(master)
    if master_sha != expected_sha:
        problems.append('MASTER_BYTES_CHANGED')
    streams = probe(master)
    videos = [s for s in streams if s.get('codec_type') == 'video']
    audios = [s for s in streams if s.get('codec_type') == 'audio']
    if len(videos) != 1 or len(audios) != 1:
        problems.append('EXACTLY_ONE_VIDEO_AND_AUDIO_REQUIRED')
    else:
        video, audio = videos[0], audios[0]
        try:
            actual_fps = Fraction(video['r_frame_rate'])
        except (ValueError, ZeroDivisionError, KeyError):
            actual_fps = None
        if (video.get('width'), video.get('height')) != (width, height) or actual_fps != fps:
            problems.append('INCORRECT_NATIVE_FRAME_GEOMETRY')
        if video.get('codec_name') != 'h264' or audio.get('codec_name') != 'aac':
            problems.append('UNSUPPORTED_VIDEO_OR_AUDIO_CODEC')
        if int(video.get('nb_frames', -1)) != expected_frames:
            problems.append('FRAME_COUNT_MISMATCH')
        try:
            if abs(float(video['duration']) - float(audio['duration'])) > 0.10:
                problems.append('AUDIO_VIDEO_DURATION_MISMATCH')
        except (KeyError, ValueError):
            problems.append('STREAM_DURATION_MISSING')
    current_audio_sha = audio_hash(master)
    source_audio_sha = audio_hash(reference_audio)
    if current_audio_sha != expected_audio_sha or source_audio_sha != expected_audio_sha:
        problems.append('NARRATION_AAC_NOT_EXACTLY_PINNED')
    if decode_all:
        try:
            command(['ffmpeg', '-hide_banner', '-v', 'error', '-xerror',
                     '-i', str(master), '-f', 'null', '-'])
        except subprocess.CalledProcessError:
            problems.append('FULL_MEDIA_DECODE_FAILED')
    return {
        'technical': 'PASS' if not problems else 'HOLD', 'problems': problems,
        'masterSha256': master_sha, 'audioAdtsSha256': current_audio_sha,
        'fullDecodePerformed': decode_all, 'releaseApproved': False, 'craftApproved': False,
        'scientificEditorialApproved': False, 'ownerDevicePlaybackApproved': False,
        'nativeProvenanceNote': 'Pixel dimensions alone do not prove native source rendering; separately audit renderer inputs and source receipts.',
    }


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

#!/usr/bin/env python3
"""Lane1: independently prove whether a later audio remaster changed science pixels.

An unchanged exact H.264 elementary stream + unchanged video-packet timeline
inherits previously recorded *science HOLDs*, never science approval. Uses
caller-pinned first-party archive and candidate identities, not self-supplied
QA text. Decodes the actual video; does not execute packaged renderer scripts.
"""
import argparse
import hashlib
import json
import re
import subprocess
import tempfile
import zipfile
from pathlib import Path, PurePosixPath

from gut_release_science_guard import (
    BUILD_RECORD, FILM_RECORD, SCIENCE_RECORD, SOURCE_RECORD, VOICE_RECORD,
    hold, inspect, sha256,
)

SCHEMA = 'ths-lane1-gut-followup-video-science-identity-HOLD-v1'
MAX_PACKAGE_BYTES = 75 * 1024 * 1024
MAX_MEMBER_BYTES = 45 * 1024 * 1024
MAX_ARCHIVE_MEMBERS = 128
MAX_TOTAL_UNCOMPRESSED_BYTES = 96 * 1024 * 1024


def _safe_archive(path, expected_sha):
    p = Path(path)
    if not isinstance(expected_sha, str) or not re.fullmatch('[a-f0-9]{64}', expected_sha):
        hold('EXACT_FOLLOWUP_ARCHIVE_SHA_REQUIRED')
    if not p.is_file() or p.is_symlink() or p.stat().st_size > MAX_PACKAGE_BYTES:
        hold('FOLLOWUP_ARCHIVE_MISSING_SYMLINK_OR_TOO_LARGE')
    if sha256(p.read_bytes()) != expected_sha:
        hold('FOLLOWUP_ARCHIVE_SHA_MISMATCH')
    try:
        with zipfile.ZipFile(p) as z:
            infos = z.infolist()
            names = [i.filename for i in infos]
            if (not infos or len(infos) > MAX_ARCHIVE_MEMBERS or
                sum(i.file_size for i in infos) > MAX_TOTAL_UNCOMPRESSED_BYTES or
                len(names) != len(set(names)) or
                any(i.is_dir() or i.file_size < 1 or i.file_size > MAX_MEMBER_BYTES or
                    i.flag_bits & 1 or i.filename.startswith('.') or
                    '\\' in i.filename or len(PurePosixPath(i.filename).parts) != 1 or
                    i.filename in ('.', '..')
                    for i in infos)):
                hold('FOLLOWUP_UNTRUSTED_ZIP_STRUCTURE')
            return {info.filename: z.read(info.filename) for info in infos}
    except (OSError, zipfile.BadZipFile, RuntimeError, EOFError) as exc:
        hold('FOLLOWUP_ZIP_CRC_OR_DECODE_FAILED:' + type(exc).__name__)


def _command(args):
    try:
        result = subprocess.run(args, check=True, capture_output=True, timeout=60)
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired,
            FileNotFoundError, OSError) as exc:
        hold('ACTUAL_FFMPEG_FFPROBE_VIDEO_VERIFICATION_FAILED:' + type(exc).__name__)
    return result.stdout


def _video_proof(movie):
    packets = json.loads(_command([
        'ffprobe', '-v', 'error', '-select_streams', 'v:0',
        '-show_packets', '-show_entries', 'packet=pts,dts,duration,size,flags',
        '-of', 'json', str(movie)
    ]))['packets']
    if len(packets) < 1 or any(
        set(pkt) != {'pts', 'dts', 'duration', 'size', 'flags'} for pkt in packets
    ):
        hold('FOLLOWUP_VIDEO_PACKETS_NOT_FULLY_OBSERVED')
    stream = _command([
        'ffmpeg', '-v', 'error', '-i', str(movie), '-map', '0:v:0',
        '-c:v', 'copy', '-f', 'h264', 'pipe:1'
    ])
    if len(stream) < 128:
        hold('FOLLOWUP_H264_STREAM_MISSING')
    # Full physical decode, no sample-only or metadata-only acceptance.
    _command(['ffmpeg','-v','error','-xerror','-err_detect','explode',
              '-i',str(movie),'-map','0:v:0','-f','null','-'])
    return {'streamSha256':sha256(stream), 'packetTimeline':packets,
            'videoPacketCount':len(packets)}


def inspect_followup(baseline_zip, baseline_sha, candidate_zip, candidate_sha,
                     candidate_member, candidate_film_sha):
    if not isinstance(candidate_member, str) or not re.fullmatch(
        r'[A-Za-z0-9_+.-]+\.mp4', candidate_member
    ):
        hold('EXACT_CANDIDATE_MOVIE_MEMBER_REQUIRED')
    if not isinstance(candidate_film_sha, str) or not re.fullmatch(
        '[a-f0-9]{64}', candidate_film_sha
    ):
        hold('EXACT_CANDIDATE_MOVIE_SHA_REQUIRED')
    # Independently verify the baseline source, voice and archive science HOLD.
    baseline = inspect(baseline_zip, baseline_sha)
    with zipfile.ZipFile(baseline_zip) as z:
        before = z.read(FILM_RECORD)
        base_source = {k:z.read(k) for k in (SOURCE_RECORD, SCIENCE_RECORD, VOICE_RECORD)}
    if sha256(before) != baseline['exactPackagedFilmSha256']:
        hold('BASELINE_FILM_SHA_MISMATCH')
    candidate = _safe_archive(candidate_zip, candidate_sha)
    after = candidate.get(candidate_member)
    if after is None or sha256(after) != candidate_film_sha:
        hold('CANDIDATE_MOVIE_BYTES_NOT_EXTERNALLY_PINNED')
    # Different proposed source text cannot rescue an unchanged encoded picture.
    source_comparison = {
        'rendererTextIdentical':candidate.get(SOURCE_RECORD) == base_source[SOURCE_RECORD],
        'scienceTextIdentical':candidate.get(SCIENCE_RECORD) == base_source[SCIENCE_RECORD],
        'originalNarrationReceiptIdentical':(
            candidate.get(VOICE_RECORD, candidate.get('ORIGINAL_VOICE_RECEIPT.json'))
            == base_source[VOICE_RECORD]),
        'originalBuildDependencyPackaged':BUILD_RECORD in candidate,
    }
    with tempfile.TemporaryDirectory(prefix='em-lane1-gut-visual-') as folder:
        b = Path(folder)/'source.mp4'
        c = Path(folder)/'candidate.mp4'
        b.write_bytes(before)
        c.write_bytes(after)
        before_proof = _video_proof(b)
        after_proof = _video_proof(c)
    same_stream = before_proof['streamSha256'] == after_proof['streamSha256']
    same_timeline = before_proof['packetTimeline'] == after_proof['packetTimeline']
    same_visual = same_stream and same_timeline
    # Changed movie still requires fresh editorial review; no self-approval.
    return {
        'schema':SCHEMA,'task':'L1-GUT-01',
        'baselineArchiveSha256':baseline_sha,
        'candidateArchiveSha256':candidate_sha,
        'baselineFilmSha256':baseline['exactPackagedFilmSha256'],
        'candidateFilmSha256':candidate_film_sha,
        'baselineVideoBitstreamSha256':before_proof['streamSha256'],
        'candidateVideoBitstreamSha256':after_proof['streamSha256'],
        'baselineVideoPackets':before_proof['videoPacketCount'],
        'candidateVideoPackets':after_proof['videoPacketCount'],
        'exactH264ElementaryStreamIdentical':same_stream,
        'exactVideoPacketTimelineIdentical':same_timeline,
        'bothEntireVideosPhysicallyDecoded':True,
        'candidateSourceAndProvenance':source_comparison,
        'baselineEditorialSourceIssues':baseline['sourceContractIssues'],
        'scienceDisposition':(
            'UNCHANGED_VISUAL_SOURCE_DEFECT_REMAINS_HOLD' if same_visual and
            baseline['sourceContractIssues'] else
            'UNCHANGED_VISUAL_SOURCE_SCOPE_RETAINS_RESEARCH_HOLD' if same_visual else
            'CHANGED_VIDEO_REQUIRES_NEW_EXACT_FILM_SCIENCE_AUDIT'),
        'noEditedSciencePixelsInCandidateEstablished':same_visual,
        'claimCorrectedOnActualFilm':False,
        'qualifiedIndependentScienceReviewerApproved':False,
        'sourceScopeOrStoryboardPublicationApproved':False,
        'realPhonePlaybackApproved':False,
        'mayPublish':False,'approvalToMerge':False,
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--baseline-zip',required=True)
    p.add_argument('--baseline-sha',required=True)
    p.add_argument('--candidate-zip',required=True)
    p.add_argument('--candidate-sha',required=True)
    p.add_argument('--candidate-member',required=True)
    p.add_argument('--candidate-film-sha',required=True)
    a = p.parse_args()
    result = inspect_followup(a.baseline_zip,a.baseline_sha,a.candidate_zip,
                              a.candidate_sha,a.candidate_member,a.candidate_film_sha)
    print(json.dumps(result,indent=2))
    return 2  # HOLD is expected. Never a green release command.


if __name__ == '__main__':
    raise SystemExit(main())

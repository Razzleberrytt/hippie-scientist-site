#!/usr/bin/env python3
"""Research-only source-pinned removal of ambiguous opening 'No reaction' label.

The actual re-render was verified against the untouched audio and all decoded
1031 source/candidate frames; no new scientific statement is authored.
"""
import argparse
import hashlib
import json
import os
import tempfile
import subprocess
from pathlib import Path

SOURCE_SHA = "07e808e35a82294fe8e1c0006b227f6d9435885dfd16daeb78d318edde027769"
FIRST, LAST = 0, 104
NATIVE_ROI = (55, 1200, 280, 52)
EXPECTED_FRAMES = 1031
NO_RELEASE = dict(mayPublish=False, scienceApproved=False, voiceApproved=False, phoneApproved=False, craftApproved=False)

class ResearchHold(ValueError):
    pass

def sha(path):
    h = hashlib.sha256()
    with Path(path).open("rb") as stream:
        for block in iter(lambda: stream.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()

def run(command):
    result = subprocess.run(command, capture_output=True)
    if result.returncode:
        raise ResearchHold("MEDIA_COMMAND_FAILED: " + result.stderr[-500:].decode(errors="replace"))
    return result.stdout

def check_native(movie):
    info = json.loads(run(["ffprobe", "-v", "error", "-count_frames",
        "-select_streams", "v:0", "-show_entries",
        "stream=codec_name,width,height,avg_frame_rate,nb_read_frames",
        "-of", "json", str(movie)]))
    streams = info.get("streams", [])
    if len(streams) != 1:
        raise ResearchHold("ONE_H264_STREAM_REQUIRED")
    v = streams[0]
    shape = (v.get("codec_name"), v.get("width"), v.get("height"),
             v.get("avg_frame_rate"), int(v.get("nb_read_frames", -1)))
    if shape != ("h264", 1080, 1920, "30/1", EXPECTED_FRAMES):
        raise ResearchHold("FILM_GRID_MISMATCH")

def source_scoped_filter():
    x, y, w, h = NATIVE_ROI
    return f"delogo=x={x}:y={y}:w={w}:h={h}:enable='between(n,{FIRST},{LAST})'"

def render(source, output):
    source, output = Path(source), Path(output)
    if (not source.is_file() or source.is_symlink() or sha(source) != SOURCE_SHA):
        raise ResearchHold("PINNED_CURRENT_FILM_REQUIRED")
    if (output.exists() or output.resolve() == source.resolve() or
            output.parent.is_symlink()):
        raise ResearchHold("FRESH_NONALIAS_OUTPUT_REQUIRED")
    check_native(source)
    # The destination may be created after the initial freshness check.
    # Encode/validate privately; an atomic hard link publishes without clobbering.
    with tempfile.TemporaryDirectory(prefix='.lane3-intro-', dir=output.parent) as tmp:
        staged = Path(tmp)/'candidate.mp4'
        cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
            "-xerror", "-n", "-i", str(source), "-vf", source_scoped_filter(),
            "-map", "0:v:0", "-map", "0:a:0", "-c:v", "libx264",
            "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
            "-r", "30", "-fps_mode:v", "cfr", "-frames:v", str(EXPECTED_FRAMES),
            "-video_track_timescale", "15360", "-c:a", "copy",
            "-movflags", "+faststart", str(staged)]
        run(cmd)
        check_native(staged)
        run(["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error",
             "-xerror", "-err_detect", "explode", "-i", str(staged),
             "-map", "0:v:0", "-map", "0:a:0", "-f", "null", "-"])
        if sha(source) != SOURCE_SHA:
            raise ResearchHold("SOURCE_CHANGED_DURING_REPLAY")
        candidate_sha = sha(staged)
        try:
            os.link(staged, output)
        except FileExistsError as error:
            raise ResearchHold("FRESH_NONALIAS_OUTPUT_REQUIRED") from error
    return dict(sourceSha256=SOURCE_SHA, candidateFilmSha256=candidate_sha,
                editedFramesInclusive=[FIRST, LAST], targetedRoi=NATIVE_ROI,
                removedAmbiguousLabel="No reaction",
                soundtrackCopiedNotResynthesized=True,
                actualAacPacketEqualityNeedsIndependentVerification=True,
                **NO_RELEASE)

def main():
    p = argparse.ArgumentParser()
    p.add_argument("--film", required=True)
    p.add_argument("--out", required=True)
    args = p.parse_args()
    print(json.dumps(render(args.film, args.out), indent=2))

if __name__ == "__main__":
    main()

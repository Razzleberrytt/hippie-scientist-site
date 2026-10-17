#!/usr/bin/env python3
"""EM-001.04: reject silently GPU-required original-WAV native render workflows.

This check is deliberately narrow: it validates the exact GitHub Actions
original-WAV research job, not all repo workflows or runtime dependencies.
Technical CPU availability is NOT movie quality, science or phone approval.
"""
import hashlib
import json
import re
from pathlib import Path

WORKFLOW = Path(__file__).resolve().parents[2] / ".github/workflows/evidencemotion-actual-asr-research.yml"
JOB_NAME = "actual-original-wav-acoustic-alignment"
SOURCE_WAV_SHA = "9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435"

class MandatoryCpuPathHold(ValueError):
    """A changed mandatory native workflow lacks positive CPU-only evidence."""


def hold(code):
    raise MandatoryCpuPathHold("EM00104_CPU_PATH_HOLD:" + code)


def isolate_job(workflow):
    if not isinstance(workflow, str) or not workflow.strip():
        hold("EMPTY_WORKFLOW")
    lines = workflow.splitlines()
    starts = [i for i, line in enumerate(lines)
              if re.fullmatch(r"  " + JOB_NAME + r":\s*", line)]
    if len(starts) != 1:
        hold("ORIGINAL_WAV_JOB_MISSING_OR_DUPLICATED")
    start = starts[0]
    end = next((i for i in range(start + 1, len(lines))
                if re.fullmatch(r"  [a-z][a-z0-9-]*:\s*", lines[i])), len(lines))
    if end <= start + 3:
        hold("EMPTY_ORIGINAL_WAV_JOB")
    return "\n".join(lines[start:end]) + "\n"


def inspect(workflow):
    job = isolate_job(workflow)
    lines = job.splitlines()
    on = [line.strip() for line in lines if re.match(r"^    runs-on:", line)]
    if on != ["runs-on: ubuntu-latest"]:
        hold("REQUIRED_RUNNER_NOT_STANDARD_HOSTED_CPU")
    if len(re.findall(r"^\s*continue-on-error:\s*true\s*$", job, re.M)):
        hold("CORE_JOB_OR_STEP_MAY_NOT_IGNORE_ERRORS")
    requirements = {
        "PINNED_CPU_KALDI_AND_PYTORCH": r"kaldi=\*=cpu\*\s+pytorch=\*=cpu\*",
        "PINNED_CPU_SOURCE_WAV": re.escape(SOURCE_WAV_SHA),
        "ACTUAL_CPU_RENDER_STAGE": r"^\s*- name: Render two previews and repaired native research candidate on CPU\s*$",
        "ACTUAL_TIMED_VIDEO_STAGE": r"^\s*- name: Render full-HD timed-caption research alternative and independently measure actual output\s*$",
        "ACTUAL_NATIVE_ARTIFACT_UPLOAD": r"^\s*name: evidencemotion-original-wav-mfa-acoustic-candidate\s*$",
        "NATIVE_MP4_IN_ARTIFACT": r"\bspecimen-timed-native/\*\*",
        "ORIGINAL_WAV_RESTORATION": r"^\s*- name: Restore original WAV, brief and immutable official MFA model bytes\s*$",
    }
    for key, pattern in requirements.items():
        if not re.search(pattern, job, re.M):
            hold("MISSING_" + key)
    # Do not infer capability from a misleading comment. Scan actual job
    # commands/arguments; even conditional commands count as dependencies
    # worth holding for human evaluation rather than silently blessing.
    executable = "\n".join(line for line in lines
                           if line.lstrip() and not line.lstrip().startswith("#"))
    disallowed = {
        "NVIDIA_OR_CUDA": r"(?i)(?:nvidia|cuda|nvenc|nvdec|nvcuda|cupy|cudnn)",
        "GPU_OR_TPU_EXECUTOR": r"(?i)(?:\bgpu\b|\btpu\b|rocm|opencl|\bmps\b)",
    }
    for key, pattern in disallowed.items():
        if re.search(pattern, executable):
            hold("UNREVIEWED_GPU_DEPENDENCY_" + key)
    return {
        "status": "PASS_MANDATORY_HOSTED_CPU_PATH_RESEARCH_ONLY",
        "job": JOB_NAME,
        "sha256Workflow": hashlib.sha256(workflow.encode("utf-8")).hexdigest(),
        "sha256JobText": hashlib.sha256(job.encode("utf-8")).hexdigest(),
        "sourceWavSha256": SOURCE_WAV_SHA,
        "cpuKaldiAndPyTorchPinned": True,
        "hostedRunnerCpuCompatible": True,
        "cpuNativeRenderAndArtifactStepsPresent": True,
        "independentRealHandsetOrViewerApproval": False,
        "mayPublish": False,
    }


def main():
    print(json.dumps(inspect(WORKFLOW.read_text(encoding="utf-8")), indent=2))


if __name__ == "__main__":
    main()

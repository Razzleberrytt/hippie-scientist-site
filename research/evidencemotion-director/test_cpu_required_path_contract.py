"""EM-001.04: fail-closed normal CPU render path, not quality approval."""
import unittest
from cpu_required_path_contract import WORKFLOW, JOB_NAME, MandatoryCpuPathHold, inspect


class MandatoryCpuPathTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.actual = WORKFLOW.read_text(encoding="utf-8")

    def test_actual_original_wav_workflow_has_cpu_only_path_and_release_hold(self):
        result = inspect(self.actual)
        self.assertEqual(result["status"], "PASS_MANDATORY_HOSTED_CPU_PATH_RESEARCH_ONLY")
        self.assertEqual(result["job"], JOB_NAME)
        self.assertTrue(result["cpuKaldiAndPyTorchPinned"])
        self.assertTrue(result["cpuNativeRenderAndArtifactStepsPresent"])
        self.assertFalse(result["mayPublish"])
        self.assertFalse(result["independentRealHandsetOrViewerApproval"])
        self.assertEqual(len(result["sha256Workflow"]), 64)
        self.assertEqual(len(result["sha256JobText"]), 64)

    def test_missing_original_cpu_job_and_duplicate_rejected(self):
        anchor = "  " + JOB_NAME + ":"
        for altered in (self.actual.replace(anchor, "  renamed-original-audio-job:", 1),
                        self.actual.replace(anchor, anchor + "\n" + anchor, 1), ""):
            with self.subTest(altered=altered[:30]):
                with self.assertRaises(MandatoryCpuPathHold):
                    inspect(altered)

    def test_non_hosted_or_gpu_runner_rejected(self):
        for value in ("ubuntu-24.04-nvidia", "matrix.runner",
                      "windows-latest", "self-hosted"):
            with self.subTest(runner=value):
                mutated = self.actual.replace("    runs-on: ubuntu-latest",
                                              "    runs-on: " + value, 1)
                with self.assertRaisesRegex(MandatoryCpuPathHold, "REQUIRED_RUNNER"):
                    inspect(mutated)

    def test_missing_cpu_dependency_pins_rejected(self):
        original = "kaldi=*=cpu* pytorch=*=cpu*"
        self.assertIn(original, self.actual)
        for fake in ("kaldi=*=gpu* pytorch=*=cpu*",
                     "kaldi=*=cpu* pytorch=*=gpu*",
                     "kaldi=*=cpu* torch=*=cpu*"):
            with self.subTest(fake=fake):
                with self.assertRaises(MandatoryCpuPathHold):
                    inspect(self.actual.replace(original, fake, 1))

    def test_gpu_reintroduced_in_mandatory_command_is_hold(self):
        marker = "      - name: Render two previews and repaired native research candidate on CPU"
        self.assertIn(marker, self.actual)
        for injected in ("nvidia-smi", "CUDA_VISIBLE_DEVICES=0", "ffmpeg -c:v h264_nvenc",
                         "python -m pip install cupy", "python require-gpu.py",
                         "torch.backends.mps.is_available()"):
            with self.subTest(injected=injected):
                mutated = self.actual.replace(marker, marker + "\n        run: |\n          " + injected, 1)
                with self.assertRaises(MandatoryCpuPathHold):
                    inspect(mutated)

    def test_comments_and_separate_jobs_do_not_demote_actual_cpu_job(self):
        old = "      - name: Render two previews and repaired native research candidate on CPU"
        good = self.actual.replace(old, "      # GPU, CUDA, NVENC in prose only\n" + old, 1)
        self.assertEqual(inspect(good)["job"], JOB_NAME)
        other_job = "  science-source-adversarial-controls:"
        self.assertIn(other_job, self.actual)
        good = self.actual.replace(other_job, other_job + "\n    # optional CUDA experiment", 1)
        self.assertEqual(inspect(good)["sha256JobText"], inspect(self.actual)["sha256JobText"])

    def test_source_identity_native_render_and_archive_are_required(self):
        for original, changed in (
            ("9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435",
             "0000000000000000000000000000000000000000000000000000000000000000"),
            ("      - name: Render full-HD timed-caption research alternative and independently measure actual output",
             "      - name: No render required"),
            ("          name: evidencemotion-original-wav-mfa-acoustic-candidate",
             "          name: phantom-success"),
            ("specimen-timed-native/**", "fake-outputs/**"),
        ):
            with self.subTest(original=original[:35]):
                self.assertIn(original, self.actual)
                with self.assertRaises(MandatoryCpuPathHold):
                    inspect(self.actual.replace(original, changed, 1))

    def test_disabled_error_enforcement_is_hold(self):
        original = "    runs-on: ubuntu-latest"
        mutated = self.actual.replace(original, original + "\n    continue-on-error: true", 1)
        with self.assertRaisesRegex(MandatoryCpuPathHold, "IGNORE_ERRORS"):
            inspect(mutated)


if __name__ == "__main__":
    unittest.main()

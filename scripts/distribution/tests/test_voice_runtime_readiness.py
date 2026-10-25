"""Offline tests for the fail-closed narrator readiness gate (no network needed)."""
import importlib.util
import unittest
from importlib.metadata import PackageNotFoundError
from pathlib import Path

MODULE_PATH = Path(__file__).resolve().parents[1] / "voice-runtime-readiness.py"
spec = importlib.util.spec_from_file_location("voice_runtime_readiness", MODULE_PATH)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class VoiceReadinessTests(unittest.TestCase):
    def check(self, *, versions=None, commands=None, vault_ok=True, python=(3, 11)):
        versions = versions if versions is not None else {
            "kokoro-onnx": "0.6.1", "onnxruntime": "1.31.0"}
        commands = commands if commands is not None else set(module.REQUIRED_COMMANDS)

        def package_version(name):
            if name not in versions:
                raise PackageNotFoundError(name)
            return versions[name]

        return module.check_runtime(Path("/fake/vault"), python_version=python,
                                    package_version=package_version,
                                    which=lambda name: "/usr/bin/" + name if name in commands else None,
                                    verify_vault=lambda _: vault_ok)

    def test_pass_only_with_approved_voice_and_every_dependency(self):
        report = self.check()
        self.assertEqual(report["status"], "PASS")
        self.assertEqual(report["errors"], [])

    def test_missing_speech_package_holds(self):
        report = self.check(versions={"onnxruntime": "1.31.0"})
        self.assertEqual(report["status"], "HOLD")
        self.assertIn("WRONG_PACKAGE_KOKORO_ONNX", report["errors"])

    def test_wrong_onnx_backend_holds(self):
        report = self.check(versions={"kokoro-onnx": "0.6.1", "onnxruntime": "1.21.0"})
        self.assertIn("WRONG_PACKAGE_ONNXRUNTIME", report["errors"])

    def test_wrong_model_hash_holds_even_if_all_deps_exist(self):
        report = self.check(vault_ok=False)
        self.assertIn("VOICE_VAULT_INVALID", report["errors"])

    def test_missing_phonemizer_holds(self):
        report = self.check(commands={"ffmpeg", "ffprobe"})
        self.assertIn("MISSING_ESPEAK_NG", report["errors"])

    def test_unpinned_chat_python_holds(self):
        report = self.check(python=(3, 13))
        self.assertIn("PYTHON_VERSION_UNSUPPORTED", report["errors"])

    def test_no_voice_fallback_is_advertised(self):
        report = self.check(vault_ok=False)
        self.assertIn("do not substitute", report["recovery"])


if __name__ == "__main__":
    unittest.main()

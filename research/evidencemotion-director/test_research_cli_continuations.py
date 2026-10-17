"""Fail-fast gate: research-source CLI arguments must survive YAML shell parsing.

An accidental double trailing backslash (\\\\) produces an escaped literal
backslash, drops the following --arguments, and costs a full native H264 run.
This source-only check runs in the cheap adversarial CI job.
"""
from pathlib import Path
import unittest


WORKFLOW = (Path(__file__).resolve().parents[2]
            / ".github/workflows/evidencemotion-actual-asr-research.yml")
COMMAND_ARGS = {
    "scientific_uncertainty_ledger.py": ("--source-join", "--out"),
    "claim_strength_source_limits.py": (
        "--source-join", "--uncertainty", "--out"),
}


class ResearchCliContinuationTests(unittest.TestCase):
    def test_exact_one_backslash_for_every_multiline_source_cli_line(self):
        source = WORKFLOW.read_text(encoding="utf8").splitlines()
        for filename, args in COMMAND_ARGS.items():
            starts = [i for i, line in enumerate(source)
                      if f"python research/evidencemotion-director/{filename} " in line]
            with self.subTest(command=filename):
                self.assertEqual(len(starts), 1, "missing or duplicated native CLI")
                i = starts[0]
                command_lines = source[i:i + len(args) + 1]
                self.assertEqual(len(command_lines), len(args) + 1)
                for position, line in enumerate(command_lines):
                    trailing = len(line) - len(line.rstrip("\\\\"))
                    self.assertEqual(
                        trailing, 1 if position < len(args) else 0,
                        f"native CLI lost shell arguments at {filename} line {position}: "
                        f"wrong trailing backslash count {trailing}")
                self.assertEqual(
                    [line.strip().split(" ", 1)[0]
                     for line in command_lines[1:]],
                    list(args), "source argument order changed")

    def test_legacy_double_backslash_regression_is_not_accepted(self):
        fixture = (
            "python research/evidencemotion-director/claim_strength_source_limits.py "
            + "\\\\"
        )
        self.assertEqual(len(fixture) - len(fixture.rstrip("\\\\")), 2)
        # The production source must never contain this exact broken command.
        self.assertNotIn(fixture, WORKFLOW.read_text(encoding="utf8"))


if __name__ == "__main__":
    unittest.main()

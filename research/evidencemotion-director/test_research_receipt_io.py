"""Actual-filesystem fail-closed regression for Lane1 research output receipts.

Never points to any production source or real film: all fixtures isolated.
"""
import json
import os
import tempfile
import unittest
from pathlib import Path

from research_receipt_io import prepare_research_output, emit_research_output


class ResearchReceiptInputIdentityTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.source = self.root / "frozen-source.json"
        self.content = b'{"scientificSource":"immutable fixture"}\n'
        self.source.write_bytes(self.content)

    def test_existing_hardlink_to_source_rejected_without_unlinking_either(self):
        alias = self.root / "existing-receipt.json"
        os.link(self.source, alias)
        self.assertTrue(os.path.samefile(self.source, alias))
        with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
            prepare_research_output(alias, (self.source,))
        self.assertTrue(alias.exists())
        self.assertTrue(os.path.samefile(self.source, alias))
        self.assertEqual(self.source.read_bytes(), self.content)
        self.assertEqual(alias.read_bytes(), self.content)

    def test_unrelated_existing_receipt_is_removed_only_before_replay(self):
        output = self.root / "older-receipt.json"
        output.write_bytes(b'{"status":"STALE_PASS"}')
        self.assertEqual(prepare_research_output(output, (self.source,)), output)
        self.assertFalse(output.exists())
        emit_research_output(output, {"status":"HOLD", "mayPublish": False})
        self.assertFalse(json.loads(output.read_text())["mayPublish"])
        self.assertEqual(self.source.read_bytes(), self.content)

    def test_direct_source_output_path_refused_with_bytes_unchanged(self):
        with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
            prepare_research_output(self.source, (self.source,))
        self.assertEqual(self.source.read_bytes(), self.content)

    def test_output_symlink_and_symlink_parent_source_alias_refused(self):
        target = self.root / "symlink.json"
        try:
            target.symlink_to(self.source)
        except (NotImplementedError, OSError) as exc:
            self.skipTest("symlink unsupported: " + str(exc))
        with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
            prepare_research_output(target, (self.source,))
        parent_alias = self.root / "alias-parent"
        parent_alias.symlink_to(self.root, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
            prepare_research_output(parent_alias / self.source.name, (self.source,))
        self.assertEqual(self.source.read_bytes(), self.content)

    def test_nonexistent_research_output_allowed_but_not_nonregular_target(self):
        output = self.root / "nonexistent-receipt.json"
        self.assertEqual(prepare_research_output(output, (self.source,)), output)
        directory = self.root / "existing-directory"
        directory.mkdir()
        with self.assertRaisesRegex(ValueError, "OUTPUT_MUST_BE_REGULAR_FILE"):
            prepare_research_output(directory, (self.source,))
        self.assertTrue(directory.is_dir())

    def test_hardlink_to_any_second_input_refused(self):
        second = self.root / "secondary-source.json"
        second.write_bytes(b"other-verified-data")
        target = self.root / "report.json"
        os.link(second, target)
        with self.assertRaisesRegex(ValueError, "OUTPUT_SYMLINK_OR_INPUT_ALIAS"):
            prepare_research_output(target, (self.source, second))
        self.assertEqual(target.read_bytes(), second.read_bytes())
        self.assertEqual(self.source.read_bytes(), self.content)


if __name__ == "__main__":
    unittest.main()

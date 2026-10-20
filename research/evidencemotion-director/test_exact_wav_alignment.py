import hashlib
import json
import subprocess
import tempfile
import unittest
import wave
from pathlib import Path

from exact_wav_alignment import inspect_alignment, parse_long_textgrid


def textgrid(words=None, phones=None, duration=3):
    words = words or [(0, .2, ""), (.2, .8, "hydroxyl"), (.8, 1, ""), (1, 1.4, "group"), (1.4, 1.6, ""), (1.6, 2, "computed"), (2, 3, "")]
    phones = phones or [(0, .2, ""), (.2, .5, "HH"), (.5, .8, "AY"), (.8, 1, ""), (1, 1.4, "G"), (1.4, 1.6, ""), (1.6, 2, "K"), (2, 3, "")]
    out = ['File type = "ooTextFile"', 'Object class = "TextGrid"', 'xmin = 0', f'xmax = {duration}', 'tiers? <exists>', 'size = 2', 'item []:']
    for idx, (name, entries) in enumerate((("words", words), ("phones", phones)), 1):
        out += [f'item [{idx}]:', 'class = "IntervalTier"', f'name = "{name}"', 'xmin = 0', f'xmax = {duration}', f'intervals: size = {len(entries)}']
        for i, (a, b, label) in enumerate(entries, 1):
            out += [f'intervals [{i}]:', f'xmin = {a}', f'xmax = {b}', f'text = "{label}"']
    return '\n'.join(out)+'\n'


class AlignmentTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        with wave.open(str(self.root / "original.wav"), "wb") as w:
            w.setparams((1, 2, 24000, 72000, "NONE", "not compressed"))
            w.writeframes(b'\x00\x00' * 72000)
        # SILENT synthetic fixture deliberately demonstrates import != acoustic proof.
        values = {"wav": "original.wav", "transcript": "script.txt", "textgrid": "aligned.TextGrid", "dictionary": "lexicon.dict", "acousticModel": "model.zip"}
        contents = {"script.txt": "Hydroxyl group computed.", "aligned.TextGrid": textgrid(), "lexicon.dict": "hydroxyl HH AY\ngroup G\ncomputed K\n", "model.zip": "synthetic-not-a-model"}
        for path, data in contents.items():
            (self.root/path).write_text(data, encoding="utf-8")
        self.manifest = {field: {"path": name, "sha256": hashlib.sha256((self.root/name).read_bytes()).hexdigest()} for field, name in values.items()}

    def change(self, field, data):
        path = self.root/self.manifest[field]["path"]
        path.write_text(data, encoding="utf-8")
        self.manifest[field]["sha256"] = hashlib.sha256(path.read_bytes()).hexdigest()

    def check_hold(self, code):
        with self.assertRaisesRegex(ValueError, code):
            inspect_alignment(self.root, self.manifest)

    def test_candidate_preserves_pauses_and_never_certifies_silent_synthetic_audio(self):
        r = inspect_alignment(self.root, self.manifest)
        self.assertEqual(r["sampleCount"], 72000)
        self.assertEqual([w["startMs"] for w in r["wordAlignment"]], [200, 1000, 1600])
        self.assertFalse(r["timingAccuracyCalibrated"])
        self.assertFalse(r["pronunciationVerified"])
        self.assertFalse(r["mayPublish"])
        self.assertFalse(r["alignmentExecutedByThisImporter"])
        self.assertEqual(r, inspect_alignment(self.root, self.manifest))

    def test_every_changed_input_rejects_old_pin(self):
        for field in self.manifest:
            with self.subTest(field=field):
                path = self.root/self.manifest[field]["path"]
                data = path.read_bytes()
                path.write_bytes(data + b'changed')
                self.check_hold('STALE_OR_CHANGED_INPUT')
                path.write_bytes(data)

    def test_mfa_epsilon_word_is_only_a_fully_covered_silence_interval(self):
        grid = textgrid().replace('text = ""', 'text = "<eps>"', 1)
        # MFA align_one emits <eps> in words and sil in phones for pauses.
        index = grid.index('name = "phones"')
        grid = grid[:index] + grid[index:].replace('text = ""', 'text = "sil"', 1)
        self.change('textgrid', grid)
        result = inspect_alignment(self.root, self.manifest)
        self.assertEqual(len(result['wordAlignment']), 3)
        self.assertEqual(result['wordAlignment'][0]['startMs'], 200)
        self.assertFalse(result['pronunciationVerified'])
        for label in ('HH', 'spn', '<eps>'):
            self.change('textgrid', grid.replace('text = "sil"', f'text = "{label}"', 1))
            self.check_hold('EPSILON_INTERVAL_CONTAINS_NON_SILENCE')

    def test_revised_dictionary_changes_revision_even_with_same_words(self):
        before = inspect_alignment(self.root, self.manifest)
        self.change("dictionary", "hydroxyl HH AY\ngroup G\ncomputed K\n# revised lexicon\n")
        after = inspect_alignment(self.root, self.manifest)
        self.assertNotEqual(before["revisionSha256"], after["revisionSha256"])

    def test_missing_or_changed_word_is_not_spelling_repaired(self):
        for script in ("hydroxyl computed", "hydroxyl group not computed", "hydroxy group computed"):
            self.change("transcript", script)
            self.check_hold('TRANSCRIPT_WORDS_MISSING_CHANGED_OR_OOV')

    def test_unknown_phone_or_missing_dictionary_refused(self):
        self.change("textgrid", textgrid().replace('text = "HH"', 'text = "spn"'))
        self.check_hold('UNKNOWN_WORD_OR_PHONE')
        self.change("textgrid", textgrid())
        self.change("dictionary", "group G\ncomputed K\n")
        self.check_hold('PHONE_SEQUENCE_NOT_IN_PINNED_DICTIONARY')

    def test_duration_and_truncated_interval_refused(self):
        self.change("textgrid", textgrid(duration=4))
        self.check_hold('INCOMPLETE_TIER_COVERAGE')
        self.change("textgrid", textgrid()[:-10])
        self.check_hold('TEXTGRID')

    def test_phone_gap_overlap_and_wrong_tier_refused(self):
        for bad in (textgrid().replace('xmin = 0.5', 'xmin = 0.6'), textgrid().replace('xmax = 0.5', 'xmax = 0.6'), textgrid().replace('name = "phones"', 'name = "other"')):
            self.change("textgrid", bad)
            self.check_hold('INTERVAL|TIERS')

    def test_paths_missing_inputs_and_nonfinite_values_fail_closed(self):
        for path in ("../outside.wav", "C:/private.wav", "sub/../original.wav", "sub\\original.wav"):
            old = self.manifest['wav']['path']
            self.manifest['wav']['path'] = path
            self.check_hold('UNSAFE_INPUT_PATH')
            self.manifest['wav']['path'] = old
        self.change("textgrid", textgrid().replace('xmin = 0.5', 'xmin = 1e999'))
        self.check_hold('NONFINITE_INTERVAL')

    def test_extra_trailing_data_is_never_ignored(self):
        self.change("textgrid", textgrid() + '\nsize = 2')
        self.check_hold('EXTRA_TIERS')

    def test_failed_cli_overwrites_previous_candidate_with_hold(self):
        (self.root/'report.json').write_text(json.dumps(inspect_alignment(self.root, self.manifest)), encoding='utf-8')
        (self.root/'original.wav').write_bytes(b'changed narration')
        (self.root/'manifest.json').write_text(json.dumps(self.manifest), encoding='utf-8')
        import sys
        r = subprocess.run([sys.executable, str(Path(__file__).parent/'exact_wav_alignment.py'), '--root', str(self.root), '--manifest', str(self.root/'manifest.json'), '--out', str(self.root/'report.json')], capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        report = json.loads((self.root/'report.json').read_text())
        self.assertEqual(report['status'], 'HOLD')
        self.assertEqual(report['wordAlignment'], [])

    def test_parent_symlink_rejected_where_supported(self):
        try:
            (self.root/'linked').symlink_to(self.root, target_is_directory=True)
        except OSError:
            self.skipTest('Host does not permit symlink creation')
        self.manifest['wav']['path'] = 'linked/original.wav'
        self.check_hold('MISSING_OR_LINKED_INPUT')

    def test_cli_cannot_overwrite_original_wav_or_any_input(self):
        import sys
        (self.root/'manifest.json').write_text(json.dumps(self.manifest), encoding='utf-8')
        for name in ['manifest.json'] + [spec['path'] for spec in self.manifest.values()]:
            with self.subTest(name=name):
                path = self.root/name
                before = path.read_bytes()
                r = subprocess.run([sys.executable, str(Path(__file__).parent/'exact_wav_alignment.py'), '--root', str(self.root), '--manifest', str(self.root/'manifest.json'), '--out', str(path)], capture_output=True, text=True)
                self.assertEqual(r.returncode, 2)
                self.assertEqual(path.read_bytes(), before)
                self.assertIn('REPORT_PATH_COLLIDES_WITH_INPUT_OR_LINK', r.stdout)

    def test_rehashed_truncated_wav_invalidates_old_cli_candidate(self):
        import sys
        (self.root/'report.json').write_text(json.dumps(inspect_alignment(self.root, self.manifest)), encoding='utf-8')
        (self.root/'original.wav').write_bytes(b'RIFF')
        self.manifest['wav']['sha256'] = hashlib.sha256(b'RIFF').hexdigest()
        (self.root/'manifest.json').write_text(json.dumps(self.manifest), encoding='utf-8')
        r = subprocess.run([sys.executable, str(Path(__file__).parent/'exact_wav_alignment.py'), '--root', str(self.root), '--manifest', str(self.root/'manifest.json'), '--out', str(self.root/'report.json')], capture_output=True, text=True)
        self.assertEqual(r.returncode, 2)
        receipt = json.loads((self.root/'report.json').read_text())
        self.assertEqual(receipt['status'], 'HOLD')
        self.assertEqual(receipt['wordAlignment'], [])

    def test_real_file_import_to_existing_javascript_edl_and_stale_refusal(self):
        report = inspect_alignment(self.root, self.manifest)
        raw = (json.dumps(report, indent=2)+'\n').encode()
        (self.root/'report.json').write_bytes(raw)
        args = {"root": str(self.root), "reportPath": "report.json", "expectedReportSha256": hashlib.sha256(raw).hexdigest(), "expectedInputSha256": report["inputSha256"], "manifest": self.manifest, "scienceManifestSha256": 'a'*64,
                "beats": [{"id": "hook", "role": "hook", "grammar": "G1", "startWordIndex": 0, "endWordIndex": 0, "scientificAssetIDs": ["chem_graph"]}, {"id": "site", "role": "science_site_reveal", "grammar": "G2", "startWordIndex": 1, "endWordIndex": 1, "scientificAssetIDs": ["chem_graph"]}, {"id": "disclosure", "role": "honesty_disclosure", "grammar": "G3", "startWordIndex": 2, "endWordIndex": 2, "scientificAssetIDs": ["chem_graph"]}]}
        module = (Path(__file__).parent/'audio-word-cuts.mjs').resolve().as_uri()
        js = f'import {{proposeFileBoundAudioLockedCuts as plan}} from {json.dumps(module)}; const args=JSON.parse(process.argv[1]); console.log(JSON.stringify(await plan(args)));'

        def run():
            return json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js, json.dumps(args)], text=True))

        r = run()
        self.assertEqual(r['status'], 'PREVIZ_EDL_READY_FOR_INDEPENDENT_MEDIA_QA')
        self.assertEqual([[s['startMs'], s['endMs']] for s in r['shots']], [[0, 1000], [1000, 1600], [1600, 3000]])
        args['previousAlignmentRevisionSha256'] = 'b'*64
        self.assertIn('STALE_CUTS_REALIGNMENT_REQUIRED', run()['errors'])
        del args['previousAlignmentRevisionSha256']
        # Simulate a changed take whose new MFA inputs/report are already valid:
        # a client retaining its old narration SHA must not reuse earlier cuts.
        args['previousNarrationSha256'] = 'b'*64
        self.assertIn('STALE_NARRATION_REVISION_REQUIRES_NEW_CUTS', run()['errors'])
        del args['previousNarrationSha256']
        args['previousNarrationSha256'] = report['inputSha256']['wav']
        self.assertEqual(run()['status'], 'PREVIZ_EDL_READY_FOR_INDEPENDENT_MEDIA_QA')
        del args['previousNarrationSha256']
        args['previousNarrationSha256'] = 'not-a-real-sha'
        self.assertIn('STALE_NARRATION_REVISION_REQUIRES_NEW_CUTS', run()['errors'])
        del args['previousNarrationSha256']

        report['wordAlignment'][0]['startMs'] = 300
        forged = (json.dumps(report)+'\n').encode()
        (self.root/'report.json').write_bytes(forged)
        args['expectedReportSha256'] = hashlib.sha256(forged).hexdigest()
        self.assertIn('ALIGNMENT_REPORT_NOT_DERIVED_FROM_PINNED_INPUTS', run()['errors'])
        (self.root/'report.json').write_bytes(raw)
        args['expectedReportSha256'] = hashlib.sha256(raw).hexdigest()
        (self.root/'original.wav').write_bytes(b'changed narration')
        self.assertIn('ALIGNMENT_INPUT_CHANGED:wav', run()['errors'])


# Existing exact-WAV CI lane runs these source-waveform boundary regressions too.
# Imported test class stays research-only; no new release/publishing authority.
from test_audio_cut_edge_qa import CutEdgeTests  # noqa: F401
from test_voice_revision_invalidation import RevisionInvalidationTests  # noqa: F401

# Compare byte-pinned original-WAV ASR/MFA evidence in the same hosted audio suite.
# This triages word disagreements but never gives pronunciation or release approval.
from test_asr_mfa_disagreement_gate import CrossModelResearchTests  # noqa: F401
from test_caption_word_cue_integrity import CaptionWordCueTests  # noqa: F401
from test_narration_caption_authoring_gate import NarrationCaptionAuthoringTests  # noqa: F401
from test_encoded_caption_transition_gate import EncodedCaptionBandTests  # noqa: F401
# Lane 2 source-specific repeated-terminology acoustic research controls.
# Hosted synthetic negatives run; source clips are SKIPPED unless SHA-pinned and supplied.
from test_repeated_term_acoustic_guard import (  # noqa: F401
    SpectralNegativeTests, ActualArchivedSourceTests, SyntheticMasterLinkTests,
    OriginalDigitalZeroNegativeTests,  # actual original-media negatives stay SKIPPED without source
    OriginalMfaCliContractTests, OriginalMasterMfaTests,
    PoseConflictNegativeTests, ActualPoseConflictTests,
    PoseInternalContrastNegativeTests, ActualPoseInternalContrastTests,
    SpectralTraceSignalOnlyTests,
    BlindReferenceBenchmarkTests,
    BlindReferenceArchiveTests,
    PhysicallyRecoveredOriginalPcmBlacklistTests,
)


class Lane2GuardRegistrationTests(unittest.TestCase):
    def test_all_later_acoustic_test_classes_are_in_actual_hosted_suite(self):
        # The audio workflow discovers this entrypoint, NOT test_repeated_term_*
        # directly. A green workflow previously omitted an entire new class.
        # Fail whenever a future local TestCase class is not imported above.
        import test_repeated_term_acoustic_guard as source_tests
        defined = {
            name: cls for name, cls in vars(source_tests).items()
            if isinstance(cls, type)
            and issubclass(cls, unittest.TestCase)
            and cls.__module__ == source_tests.__name__
        }
        missing = sorted(
            name for name, cls in defined.items()
            if globals().get(name) is not cls
        )
        self.assertTrue(defined, "Acoustic research suite unexpectedly empty")
        self.assertFalse(missing, "Acoustic classes omitted from hosted CI: "
                         + ", ".join(missing))


class Lane2AudioWorkflowTriggerTests(unittest.TestCase):
    """Make new acoustic guard changes activate the hosted audio test workflow."""

    def test_guard_only_pull_requests_are_in_audio_workflow_paths(self):
        workflow = (Path(__file__).resolve().parents[2] / ".github" /
                    "workflows" / "evidencemotion-autonomous-audio-screen.yml")
        yaml_text = workflow.read_text(encoding="utf-8")
        self.assertIn("  pull_request:\n    paths:\n", yaml_text)
        paths_text = yaml_text.split("  pull_request:\n    paths:\n", 1)[1].split(
            "\npermissions:", 1)[0]
        for file_name in (
            "test_exact_wav_alignment.py",
            "repeated_term_acoustic_guard.py",
            "test_repeated_term_acoustic_guard.py",
            "gut_caption_audio_gate.py",
            "narration_caption_authoring_gate.py",
            "test_narration_caption_authoring_gate.py",
        ):
            with self.subTest(file=file_name):
                self.assertIn(
                    "      - 'research/evidencemotion-director/" +
                    file_name + "'",
                    paths_text,
                    "Changes to this Lane 2 file must launch native hosted audio tests",
                )
        self.assertIn(
            "-p 'test_exact_wav_alignment.py'", yaml_text,
            "Hosted workflow must actually run the aggregated test entrypoint",
        )


if __name__ == '__main__':
    unittest.main()

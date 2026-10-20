"""Synthetic fail-closed contract checks; original encoded-film QC is separate."""
import pathlib
import tempfile
import unittest
from unittest.mock import patch
import intro_science_label_research as subject

class IntroScienceLabelTests(unittest.TestCase):
    def test_boundaries_fixed(self):
        self.assertEqual((subject.FIRST, subject.LAST, subject.EXPECTED_FRAMES), (0, 104, 1031))
    def test_crop_neither_molecular_structure_nor_word_captions(self):
        x,y,w,h = subject.NATIVE_ROI
        self.assertEqual((x,y,w,h),(55,1200,280,52))
        self.assertGreater(y,1150)
        self.assertLess(y+h,1310)
    def test_scoped_to_integer_frames_only(self):
        self.assertIn("between(n,0,104)",subject.source_scoped_filter())
    def test_wrong_source_has_no_side_effects(self):
        with tempfile.TemporaryDirectory() as root:
            source=pathlib.Path(root)/"source.mp4"
            output=pathlib.Path(root)/"new.mp4"
            source.write_bytes(b"wrong physical media")
            with self.assertRaisesRegex(subject.ResearchHold,"PINNED_CURRENT_FILM_REQUIRED"):
                subject.render(source, output)
            self.assertFalse(output.exists())
            self.assertEqual(source.read_bytes(),b"wrong physical media")
    def test_failed_render_preserves_concurrently_created_destination(self):
        with tempfile.TemporaryDirectory() as root:
            source, output = pathlib.Path(root)/'source.mp4', pathlib.Path(root)/'new.mp4'
            source.write_bytes(b'synthetic source pin')
            def concurrent_writer(command):
                output.write_bytes(b'unrelated concurrent file')
                raise subject.ResearchHold('MEDIA_COMMAND_FAILED: destination already exists')
            with patch.object(subject, 'SOURCE_SHA', subject.sha(source)), \
                 patch.object(subject, 'check_native'), \
                 patch.object(subject, 'run', side_effect=concurrent_writer):
                with self.assertRaises(subject.ResearchHold):
                    subject.render(source, output)
            self.assertEqual(output.read_bytes(), b'unrelated concurrent file')

    def test_publication_never_clobbers_concurrently_created_destination(self):
        with tempfile.TemporaryDirectory() as root:
            source, output = pathlib.Path(root)/'source.mp4', pathlib.Path(root)/'new.mp4'
            source.write_bytes(b'synthetic source pin')
            def finish_encode(command):
                if command[0] == 'ffmpeg' and '-vf' in command:
                    pathlib.Path(command[-1]).write_bytes(b'synthetic candidate')
                    output.write_bytes(b'unrelated concurrent file')
                return b''
            with patch.object(subject, 'SOURCE_SHA', subject.sha(source)), \
                 patch.object(subject, 'check_native'), \
                 patch.object(subject, 'run', side_effect=finish_encode):
                with self.assertRaisesRegex(subject.ResearchHold, 'FRESH_NONALIAS_OUTPUT_REQUIRED'):
                    subject.render(source, output)
            self.assertEqual(output.read_bytes(), b'unrelated concurrent file')

    def test_private_stage_publishes_fresh_output_and_cleans_owned_files(self):
        with tempfile.TemporaryDirectory() as root:
            source, output = pathlib.Path(root)/'source.mp4', pathlib.Path(root)/'new.mp4'
            source.write_bytes(b'synthetic source pin')
            def finish_encode(command):
                if command[0] == 'ffmpeg' and '-vf' in command:
                    pathlib.Path(command[-1]).write_bytes(b'synthetic candidate')
                return b''
            with patch.object(subject, 'SOURCE_SHA', subject.sha(source)), \
                 patch.object(subject, 'check_native'), \
                 patch.object(subject, 'run', side_effect=finish_encode):
                result = subject.render(source, output)
            self.assertEqual(output.read_bytes(), b'synthetic candidate')
            self.assertEqual(result['candidateFilmSha256'], subject.sha(output))
            self.assertFalse(result['mayPublish'])
            self.assertEqual(set(pathlib.Path(root).iterdir()), {source, output})

    def test_no_publishing_authority(self):
        self.assertFalse(subject.NO_RELEASE["mayPublish"])
        self.assertFalse(subject.NO_RELEASE["scienceApproved"])
    def test_sha_reads_real_bytes(self):
        with tempfile.TemporaryDirectory() as root:
            item=pathlib.Path(root)/"data"
            item.write_bytes(b"hello")
            self.assertEqual(subject.sha(item),
                "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824")

if __name__ == "__main__":
    unittest.main()

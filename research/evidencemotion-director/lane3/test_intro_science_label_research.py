"""Synthetic fail-closed contract checks; original encoded-film QC is separate."""
import pathlib
import tempfile
import unittest
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

"""Research-only Lane 3 molecular inference treatment checks.

Small no-dependency controls must run in hosted CI; actual source media tests
are opt-in because the owner's verified H.264+MOL never enter the repository.
A green suite is NOT source/voice/viewer/craft approval.
"""
from __future__ import annotations
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch

import shot5_inference_visual as craft


def required_media():
    names = ('LANE3_SHOT5_SOURCE','LANE3_SHOT5_MOL','LANE3_SHOT5_OUTPUT','LANE3_SHOT5_RECEIPT')
    values = [os.environ.get(k) for k in names]
    if not all(values):
        raise unittest.SkipTest('Actual source film/MOL/revised H264/receipt opt-in required')
    if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
        raise unittest.SkipTest('ffmpeg and ffprobe required for decoded-film evidence')
    return [Path(x) for x in values]


class ResearchProtocolTests(unittest.TestCase):
    def test_immutable_source_and_frame_grid(self):
        self.assertEqual((craft.W,craft.H,craft.FPS,craft.N),(1080,1920,30,1031))
        self.assertEqual((craft.START,craft.NEGATION,craft.END),(702,772,821))
        self.assertEqual(craft.END-craft.START,119)
        self.assertEqual(craft.N-(craft.END-craft.START),912)
        for sha in (craft.SOURCE_SHA,craft.MOL_SHA,craft.ORIGINAL_WAV_SHA):
            self.assertRegex(sha,r'^[0-9a-f]{64}$')
        self.assertEqual(craft.INCHIKEY,'RYENLSMHLCNXJT-CYXFISRXSA-N')

    def test_cue_and_scene_bounds_have_no_early_negation(self):
        self.assertEqual(craft.NEGATION/craft.FPS,772/30)
        self.assertTrue(craft.START < craft.NEGATION < craft.END < craft.N)
        self.assertFalse(craft.NEGATION <= 771)
        with self.assertRaisesRegex(craft.ResearchHold,'OUTSIDE_EDIT_INTERVAL'):
            craft.sample_treatment(None,None,None,craft.START-1)
        with self.assertRaisesRegex(craft.ResearchHold,'OUTSIDE_EDIT_INTERVAL'):
            craft.sample_treatment(None,None,None,craft.END)

    def test_source_film_forgery_is_refused_before_decoder(self):
        with tempfile.TemporaryDirectory() as d:
            forged=Path(d)/'forged.mp4'
            forged.write_bytes(b'not a pinned source film')
            with self.assertRaisesRegex(craft.ResearchHold,'SOURCE_FILM_SHA_CHANGED'):
                craft.freeze(forged)

    def test_source_molecule_forgery_is_refused_before_rdkit(self):
        with tempfile.TemporaryDirectory() as d:
            forged=Path(d)/'forged.mol'
            forged.write_bytes(b'not a pinned molecular record')
            with self.assertRaisesRegex(craft.ResearchHold,'SOURCE_MOLECULE_SHA_CHANGED'):
                craft.pinned_diagram(forged)

    def test_reject_overwriting_source_or_molecule_even_with_missing_media(self):
        with tempfile.TemporaryDirectory() as d:
            source=Path(d)/'source.mp4';source.write_bytes(b'a')
            molecule=Path(d)/'source.mol';molecule.write_bytes(b'b')
            with self.assertRaisesRegex(craft.ResearchHold,'OUTPUT_OVERWRITES_SOURCE'):
                craft.render(source,molecule,source)
            with self.assertRaisesRegex(craft.ResearchHold,'OUTPUT_OVERWRITES_SOURCE'):
                craft.render(source,molecule,molecule)

    def test_reject_existing_or_symlink_output_without_touching_bytes(self):
        with tempfile.TemporaryDirectory() as d:
            source=Path(d)/'source.mp4';source.write_bytes(b'source')
            molecule=Path(d)/'source.mol';molecule.write_bytes(b'graph')
            existing=Path(d)/'candidate.mp4';existing.write_bytes(b'keep unchanged')
            with self.assertRaisesRegex(craft.ResearchHold,'FRESH_OUTPUT_REQUIRED'):
                craft.render(source,molecule,existing)
            self.assertEqual(existing.read_bytes(),b'keep unchanged')
            link=Path(d)/'symlink.mp4';link.symlink_to(existing)
            with self.assertRaisesRegex(craft.ResearchHold,'FRESH_OUTPUT_REQUIRED'):
                craft.render(source,molecule,link)
            self.assertEqual(existing.read_bytes(),b'keep unchanged')

    def test_transition_interpolation_is_monotonic_and_bounded(self):
        data=[craft.smoothstep(i/20) for i in range(21)]
        self.assertEqual(data[0],0.)
        self.assertEqual(data[-1],1.)
        self.assertTrue(all(0 <= a <= b <= 1 for a,b in zip(data,data[1:])))
        self.assertEqual(craft.smoothstep(-10),0.)
        self.assertEqual(craft.smoothstep(10),1.)


class GenuineOwnerMediaOptIn(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source,cls.mol,cls.output,cls.receipt=required_media()
        cls.r=json.loads(cls.receipt.read_text())

    def test_pinned_real_source_and_molecule(self):
        self.assertTrue(craft.freeze(self.source))
        self.assertEqual(craft.digest(self.mol),craft.MOL_SHA)
        # Check independent stereochemical source via the REAL RDKit backend.
        self.assertEqual(craft.pinned_diagram(self.mol).size,(650,400))

    def test_release_hold_and_source_receipts(self):
        self.assertEqual(craft.digest(self.output),self.r['newFilmSha256'])
        self.assertEqual(craft.digest(self.source),self.r['originalFilmSha256'])
        self.assertEqual(self.r['newFilmSha256'],'e79e44746e8a8581ecc592e41de20bb67ded7e999042234902ed30b0142a0c9a')
        self.assertEqual((self.r['outsideFramesCompared'],self.r['insideFramesChanged']),(912,119))
        self.assertEqual(self.r['negationFirstFrame'],772)
        self.assertFalse(self.r['mayPublish'])
        self.assertFalse(self.r['automaticallyApprovedCraft'])

    def test_encoded_output_audio_is_identical(self):
        def aac(path):
            return hashlib.sha256(subprocess.check_output([
                'ffmpeg','-v','error','-i',str(path),'-map','0:a:0',
                '-c:a','copy','-f','adts','-'])).hexdigest()
        self.assertEqual(aac(self.source),aac(self.output))
        self.assertEqual(aac(self.output),self.r['aacAdtsSha256'])

    def test_original_exact_molecule_and_cue_disclosure_pixels(self):
        try:
            from PIL import ImageChops
        except ImportError:
            self.skipTest('Pillow optional for genuine media cue-image test')
        image=craft.one_source_frame(self.source,771)
        diagram=craft.pinned_diagram(self.mol)
        bg=craft.palette_background()
        before=craft.sample_treatment(image,diagram,bg,771)
        after=craft.sample_treatment(image,diagram,bg,788)
        for region in [(0,0,1080,390),(0,1120,1080,1920)]:
            self.assertIsNone(ImageChops.difference(image.crop(region),before.crop(region)).getbbox())
        risk=(710,585,950,890)
        self.assertIsNotNone(ImageChops.difference(before.crop(risk),after.crop(risk)).getbbox())

if __name__=='__main__':
    unittest.main()

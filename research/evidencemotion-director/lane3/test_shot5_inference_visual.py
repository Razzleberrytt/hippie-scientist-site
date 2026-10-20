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

    def test_full_muted_claim_after_exact_spoken_onset(self):
        self.assertIsNone(craft.complete_negation_after_spoken_not(771))
        for frame in (772,773,778,794,820):
            self.assertEqual(craft.complete_negation_after_spoken_not(frame),
                             'STRUCTURE ≠ HUMAN EXPERIENCE')
        for frame in (701,821):
            with self.assertRaisesRegex(craft.ResearchHold,'OUTSIDE_EDIT_INTERVAL'):
                craft.complete_negation_after_spoken_not(frame)

    def test_declared_silent_negation_fits_phone_type_floor(self):
        # Geometry/wording contract, NOT physical OCR or audience comprehension.
        self.assertEqual(craft.FULL_SILENT_NEGATION,'STRUCTURE ≠ HUMAN EXPERIENCE')
        self.assertGreaterEqual(craft.FULL_NEGATION_FONT_SIZE * 375/1080,14)
        self.assertEqual(craft.NEGATION,772)
        self.assertLess(craft.NEGATION,craft.END)

    def test_actual_pillow_stage_full_proposition_on_exact_cue_frame(self):
        try:
            from PIL import Image, ImageChops, ImageFont
        except ImportError:
            self.skipTest('Pillow not available in this research runner')
        face=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
                                craft.FULL_NEGATION_FONT_SIZE)
        self.assertLessEqual(face.getbbox(craft.FULL_SILENT_NEGATION)[2],874)
        base=Image.new('RGB',(craft.W,craft.H),(2,7,13))
        science=Image.new('RGB',(craft.W,730),(4,12,20))
        graph=Image.new('RGBA',(650,400),(255,255,255,0))
        before=craft.sample_treatment(base,graph,science,771)
        at=craft.sample_treatment(base,graph,science,772)
        later=craft.sample_treatment(base,graph,science,796)
        negation_box=(92,963,1000,1041)
        self.assertIsNotNone(ImageChops.difference(before.crop(negation_box),
                                                    at.crop(negation_box)).getbbox())
        self.assertIsNotNone(ImageChops.difference(at.crop(negation_box),
                                                    later.crop(negation_box)).getbbox()
                             if at.crop(negation_box).tobytes()!=later.crop(negation_box).tobytes()
                             else ImageChops.difference(before.crop(negation_box),
                                                        later.crop(negation_box)).getbbox())
        for image in (before,at,later):
            # Protected original header/caption fields stay byte-identical in
            # the pre-encode Pillow surface, NOT necessarily final H264 pixels.
            self.assertEqual(image.crop((0,0,craft.W,390)).tobytes(),
                             base.crop((0,0,craft.W,390)).tobytes())
            self.assertEqual(image.crop((0,1120,craft.W,craft.H)).tobytes(),
                             base.crop((0,1120,craft.W,craft.H)).tobytes())

    def test_native_encoded_readback_with_actual_tiny_h264_and_negative_frames(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native FFmpeg required for physical encoded-clip regression')
        with tempfile.TemporaryDirectory() as d:
            tiny=Path(d)/'tiny.mp4'
            subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
                '-i','color=c=black:s=64x96:r=30','-frames:v','3',
                '-an','-c:v','libx264','-pix_fmt','yuv420p',str(tiny)],
                check=True,capture_output=True)
            self.assertTrue(craft.verify_native_silent_clip(
                tiny,width=64,height=96,fps=30,frames=3))
            with self.assertRaisesRegex(craft.ResearchHold,'FRAME_GRID_CHANGED'):
                craft.verify_native_silent_clip(tiny,width=64,height=96,fps=30,frames=4)
            with self.assertRaisesRegex(craft.ResearchHold,'FRAME_GRID_CHANGED'):
                craft.verify_native_silent_clip(tiny,width=65,height=96,fps=30,frames=3)

    def test_native_encoded_readback_rejects_nonmovie_empty_and_audio_stream(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native FFmpeg required for physical encoded-clip regression')
        with tempfile.TemporaryDirectory() as d:
            empty=Path(d)/'empty.mp4'
            empty.write_bytes(b'')
            with self.assertRaisesRegex(craft.ResearchHold,'MISSING_OR_EMPTY'):
                craft.verify_native_silent_clip(empty,width=64,height=96,frames=3)
            corrupt=Path(d)/'corrupt.mp4'
            corrupt.write_bytes(b'not H264')
            with self.assertRaisesRegex(craft.ResearchHold,'DECODE_OR_PROBE_FAILED'):
                craft.verify_native_silent_clip(corrupt,width=64,height=96,frames=3)
            mixed=Path(d)/'with-audio.mp4'
            subprocess.run(['ffmpeg','-nostdin','-v','error',
                '-f','lavfi','-i','color=c=black:s=64x96:r=30',
                '-f','lavfi','-i','anullsrc=r=24000:cl=mono',
                '-frames:v','3','-shortest','-c:v','libx264','-pix_fmt','yuv420p',
                '-c:a','aac',str(mixed)],check=True,capture_output=True)
            with self.assertRaisesRegex(craft.ResearchHold,'STREAMS_CHANGED'):
                craft.verify_native_silent_clip(mixed,width=64,height=96,frames=3)

    def test_decoded_native_pts_contract_and_adversarial_grid(self):
        good=[{'best_effort_timestamp':x} for x in (0,512,1024)]
        self.assertTrue(craft.verify_decoded_presentation_grid(
            good,'1/15360',fps=30,expected_frames=3))
        bad=[
            (good[:2],'TIMESTAMP_COUNT_CHANGED'),
            ([{'best_effort_timestamp':0},{'best_effort_timestamp':512},
              {'best_effort_timestamp':512}],'NOT_STRICTLY_INCREASING'),
            ([{'best_effort_timestamp':0},{'best_effort_timestamp':1024},
              {'best_effort_timestamp':512}],'NOT_STRICTLY_INCREASING'),
            ([{'best_effort_timestamp':512},{'best_effort_timestamp':1024},
              {'best_effort_timestamp':1536}],'PRESENTATION_GRID_CHANGED'),
            ([{'best_effort_timestamp':0},{'best_effort_timestamp':513},
              {'best_effort_timestamp':1024}],'PRESENTATION_GRID_CHANGED'),
            ([{'best_effort_timestamp':0},{'best_effort_timestamp':True},
              {'best_effort_timestamp':1024}],'MISSING_OR_INVALID'),
            ([{'best_effort_timestamp':0},{'best_effort_timestamp':None},
              {'best_effort_timestamp':1024}],'MISSING_OR_INVALID'),
        ]
        for samples,reason in bad:
            with self.subTest(reason=reason,samples=samples):
                with self.assertRaisesRegex(craft.ResearchHold,reason):
                    craft.verify_decoded_presentation_grid(
                        samples,'1/15360',fps=30,expected_frames=3)
        for time_base in ('0/1','1/0','garbage',None):
            with self.subTest(time_base=time_base):
                with self.assertRaisesRegex(craft.ResearchHold,'TIME_BASE_INVALID'):
                    craft.verify_decoded_presentation_grid(
                        good,time_base,fps=30,expected_frames=3)

    def test_atomic_verified_scene_publish_never_replaces_existing_file(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native FFmpeg required for physical publish regression')
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            stage=root/'staged.mp4'
            subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
                '-i','color=c=black:s=64x96:r=30','-frames:v','3','-an',
                '-c:v','libx264','-pix_fmt','yuv420p',str(stage)],
                check=True,capture_output=True)
            pinned=craft.digest(stage)
            existing=root/'already-there.mp4'
            existing.write_bytes(b'untouchable original')
            with self.assertRaisesRegex(craft.ResearchHold,'OUTPUT_APPEARED_AFTER_PREFLIGHT'):
                craft.commit_verified_silent_scene(stage,existing,
                    width=64,height=96,frames=3)
            self.assertEqual(existing.read_bytes(),b'untouchable original')
            self.assertEqual(craft.digest(stage),pinned)
            target=root/'fresh.mp4'
            self.assertEqual(craft.commit_verified_silent_scene(stage,target,
                width=64,height=96,frames=3),pinned)
            self.assertEqual(craft.digest(target),pinned)
            self.assertEqual(stage.stat().st_ino,target.stat().st_ino)
            self.assertEqual(stage.stat().st_dev,target.stat().st_dev)
            self.assertRaisesRegex(craft.ResearchHold,'STAGE_CANNOT_BE_OUTPUT',
                craft.commit_verified_silent_scene,stage,stage,
                width=64,height=96,frames=3)
            self.assertFalse((root/'not-produced.mp4').exists())

    def test_atomic_scene_publish_refuses_symlink_and_invalid_staged_film(self):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native FFmpeg required for physical publish regression')
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            stage=root/'valid.mp4'
            subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
                '-i','color=c=black:s=64x96:r=30','-frames:v','3','-an',
                '-c:v','libx264','-pix_fmt','yuv420p',str(stage)],
                check=True,capture_output=True)
            protected=root/'protected.mp4'
            protected.write_bytes(b'never change')
            alias=root/'raced-destination.mp4'
            alias.symlink_to(protected)
            with self.assertRaisesRegex(craft.ResearchHold,'OUTPUT_APPEARED_AFTER_PREFLIGHT'):
                craft.commit_verified_silent_scene(stage,alias,
                    width=64,height=96,frames=3)
            self.assertTrue(alias.is_symlink())
            self.assertEqual(protected.read_bytes(),b'never change')
            corrupt=root/'bad.mp4';corrupt.write_bytes(b'not a video')
            dest=root/'unwritten.mp4'
            with self.assertRaisesRegex(craft.ResearchHold,'DECODE_OR_PROBE_FAILED'):
                craft.commit_verified_silent_scene(corrupt,dest,
                    width=64,height=96,frames=3)
            self.assertFalse(dest.exists())

    def test_real_ffmpeg_end_to_end_scene_render_stages_and_preserves_source(self):
        """Physical 10-frame H264 source -> selected 4-frame H264 preview.

        This substitutes only the unavailable 7-OH asset/chemistry rendering,
        not the FFmpeg decoder, encoder, staged publication, or final readback.
        It cannot certify scientific correctness or original-film visual craft.
        """
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            self.skipTest('Native FFmpeg required for complete physical stage test')
        try:
            from PIL import Image
        except ImportError:
            self.skipTest('Pinned Pillow required for complete physical stage test')
        with tempfile.TemporaryDirectory() as d:
            root=Path(d)
            film=root/'source.mp4'
            mol=root/'source.mol'
            mol.write_bytes(b'synthetic non-science molecule fixture')
            subprocess.run(['ffmpeg','-nostdin','-v','error','-f','lavfi',
                '-i','testsrc2=s=64x96:r=30','-frames:v','10','-an',
                '-c:v','libx264','-pix_fmt','yuv420p',str(film)],
                check=True,capture_output=True)
            before_sha=craft.digest(film)
            molecule_sha=craft.digest(mol)
            output=root/'new-scene.mp4'
            # Patch the science-specific image treatment and fixed archived
            # source identity ONLY; real FFmpeg executes the complete render.
            with patch.multiple(craft, W=64,H=96,N=10,START=2,END=6,
                                NEGATION=4,FRAME_SIZE=64*96*3,
                                SOURCE_SHA=before_sha,MOL_SHA=molecule_sha):
                with (
                    patch.object(craft,'pinned_diagram',return_value=None),
                    patch.object(craft,'palette_background',return_value=None),
                    patch.object(craft,'sample_treatment',
                                 side_effect=lambda frame,graph,bg,n:frame.copy()),
                ):
                    receipt=craft.render(film,mol,output)
                self.assertTrue(craft.verify_native_silent_clip(
                    output,width=64,height=96,fps=30,frames=4))
            self.assertEqual(craft.digest(film),before_sha)
            self.assertEqual(craft.digest(mol),molecule_sha)
            self.assertEqual(craft.digest(output),receipt['silentSceneSha256'])
            self.assertEqual((receipt['startFrame'],receipt['endFrameExclusive']),
                             (2,6))
            self.assertFalse(receipt['mayPublish'])
            self.assertFalse(receipt['excellentCertified'])
            self.assertEqual(sorted(p.name for p in root.iterdir()),
                ['new-scene.mp4','source.mol','source.mp4'])
            self.assertFalse(list(root.glob('.lane3-scene-*')))

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

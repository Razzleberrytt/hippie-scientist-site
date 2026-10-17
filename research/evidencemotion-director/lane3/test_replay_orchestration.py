"""Hosted low-cost tests of positive one-command handoff and negative fail-closed paths.

These tests mock native rendering to check controller behavior, not 7-OH image quality.
The separate archived-media kit contains actual decoded tests.
"""
import json
import tempfile
from pathlib import Path
from unittest import TestCase
from unittest.mock import patch

import replay_native_research as R
import source_locked_craft_splice as S
REAL_DIGEST=S.digest

ROOT=Path(__file__).resolve().parent
MANIFEST=ROOT/'scene4-github-native-render-20261016.json'
PIN='728451fe3ed11f115953d43416be9ed911afaede450a7eb21f8475c6bc0601a8'


class OneCommandControlFlow(TestCase):
    def invoke(self, out, *, source=None, mol=None, manifest=MANIFEST):
        return R.run(source=source or ROOT/'specimen_NEW_RESEARCH_CANDIDATE.mp4',
                     mol=mol or ROOT/'source-7oh-computed.mol',
                     manifest=manifest, external_manifest_sha=PIN, output=out)

    def test_positive_renderer_to_splicer_handoff_and_research_only_result(self):
        m=json.loads(MANIFEST.read_text())
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'source.mp4'; source.write_bytes(b'synthetic film')
            mol=Path(tmp)/'science.mol'; mol.write_bytes(b'synthetic molecule')
            output=Path(tmp)/'result.mp4'
            calls=[]
            def fake_render(film, chemical, scene, *, expected_film_sha, treatment="baseline"):
                calls.append(('render',film,chemical,scene,expected_film_sha))
                scene.write_bytes(b'synthetic clip')
                return {'clipSha256':m['craftSceneSha256'],'mayPublish':False}
            def fake_splice(film,scene,destination,manifest):
                self.assertTrue(scene.is_file())
                calls.append(('splice',film,scene,destination,manifest))
                return {'mayPublish':False,'scienceApproved':False,'craftApproved':False,
                        'frames':1031}
            real_digest=REAL_DIGEST
            def fake_digest(p):return real_digest(p) if Path(p).resolve()==MANIFEST.resolve() else m['sourceFilmSha256']
            with patch.object(R.splice,'digest',side_effect=fake_digest), \
                 patch.object(R.render,'sha',return_value=R.render.MOL_SHA), \
                 patch.object(R.render,'render',side_effect=fake_render), \
                 patch.object(R.splice,'splice',side_effect=fake_splice):
                result=R.run(source=source,mol=mol,manifest=MANIFEST,
                             external_manifest_sha=PIN,output=output)
            self.assertEqual([c[0] for c in calls],['render','splice'])
            self.assertEqual(calls[0][-1],m['sourceFilmSha256'])
            self.assertEqual(calls[1][3],output)
            self.assertFalse(result['publishPermitted'])
            self.assertEqual(result['film']['frames'],1031)
            self.assertFalse(calls[0][3].exists(), 'temporary scene must be cleaned')

    def test_renderer_hash_change_blocks_splicer_entirely(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'source.mp4';source.write_bytes(b'synthetic film')
            mol=Path(tmp)/'science.mol';mol.write_bytes(b'synthetic molecule')
            with patch.object(R.splice,'digest',side_effect=lambda p: REAL_DIGEST(p) if Path(p).resolve()==MANIFEST.resolve() else json.loads(MANIFEST.read_text())['sourceFilmSha256']), \
                 patch.object(R.render,'sha',return_value=R.render.MOL_SHA), \
                 patch.object(R.render,'render',return_value={'clipSha256':'a'*64}), \
                 patch.object(R.splice,'splice') as downstream:
                with self.assertRaisesRegex(R.ReplayHold,'RENDERED_SCENE_DIFFERS_FROM_EXTERNAL_PIN'):
                    self.invoke(Path(tmp)/'out.mp4',source=source,mol=mol)
                downstream.assert_not_called()

    def test_source_manifest_and_receipt_aliases_are_rejected(self):
        with self.assertRaisesRegex(R.ReplayHold,'INVALID_OUTPUT_DESTINATION'):
            self.invoke(MANIFEST)
        # A destination can be safe for the film and still overwrite the pinned receipt manifest.
        with tempfile.TemporaryDirectory() as tmp:
            manifest=Path(tmp)/'clip.receipt.json'
            manifest.write_bytes(MANIFEST.read_bytes())
            with self.assertRaisesRegex(R.ReplayHold,'INVALID_RECEIPT_DESTINATION'):
                self.invoke(Path(tmp)/'clip.mp4',manifest=manifest)
            with self.assertRaisesRegex(R.ReplayHold,'INVALID_OUTPUT_DESTINATION'):
                self.invoke(manifest,manifest=manifest)

    def test_unknown_source_rejected_before_renderer_or_splicer(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'source.mp4';source.write_bytes(b'a fake source')
            mol=Path(tmp)/'science.mol';mol.write_bytes(b'source molecule')
            with patch.object(R.render,'render') as render,patch.object(R.splice,'splice') as splice:
                with self.assertRaisesRegex(R.ReplayHold,'SOURCE_FILM_REVISION_MISMATCH'):
                    self.invoke(Path(tmp)/'out.mp4',source=source,mol=mol)
                render.assert_not_called();splice.assert_not_called()

    def test_renderer_cannot_supply_publication_authority(self):
        with tempfile.TemporaryDirectory() as tmp:
            source=Path(tmp)/'source.mp4';source.write_bytes(b'film')
            mol=Path(tmp)/'science.mol';mol.write_bytes(b'mol')
            m=json.loads(MANIFEST.read_text())
            with patch.object(R.splice,'digest',side_effect=lambda p: REAL_DIGEST(p) if Path(p).resolve()==MANIFEST.resolve() else m['sourceFilmSha256']), \
                 patch.object(R.render,'sha',return_value=R.render.MOL_SHA), \
                 patch.object(R.render,'render',return_value={'clipSha256':m['craftSceneSha256']}), \
                 patch.object(R.splice,'splice',return_value={'mayPublish':True,'scienceApproved':False,'craftApproved':False}):
                with self.assertRaisesRegex(R.ReplayHold,'UNAUTHORIZED_PROMOTION'):
                    self.invoke(Path(tmp)/'out.mp4',source=source,mol=mol)

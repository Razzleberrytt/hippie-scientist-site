"""Synthetic protocol tests with real FFmpeg encoding/decoding; no film credit."""
import copy
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import zipfile

from artifact_intake import FLAGS, digest, intake, relative


def write(path, value):
    path.write_text(json.dumps(value, indent=2)+'\n', encoding='utf-8')


class IntakeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.shared = tempfile.TemporaryDirectory()
        cls.fixture = Path(cls.shared.name)
        # Deliberately tiny, visibly synthetic; never substitute for original Kokoro.
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                        'sine=frequency=440:sample_rate=48000:duration=1',
                        str(cls.fixture/'voice.wav')], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-f', 'lavfi', '-i',
                        'color=c=blue:s=64x96:r=30:d=1', '-i', str(cls.fixture/'voice.wav'),
                        '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac',
                        str(cls.fixture/'film.mp4')], check=True)
        from native_master_audit import audio_hash
        cls.audio_sha = audio_hash(cls.fixture/'film.mp4')

    @classmethod
    def tearDownClass(cls):
        cls.shared.cleanup()

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.bundle = self.root/'bundle'
        self.bundle.mkdir()
        for name in ('voice.wav', 'film.mp4'):
            shutil.copyfile(self.fixture/name, self.bundle/name)
        self.roles = dict(video='film.mp4', wav='voice.wav', captions='captions.json',
                          shotPlan='plan.json', sourceManifest='sources.json',
                          lineage='lineage.json', reviewEvidence='review.json')
        write(self.bundle/'captions.json', [{'text': 'synthetic test only', 'startSec': 0, 'endSec': 1}])
        write(self.bundle/'plan.json', {'expectedVideoSha256': digest(self.bundle/'film.mp4'),
                                      'shots': [{'id': 'synthetic', 'startSec': 0, 'endSec': 1}]})
        self.lineage = {'schema': 'em-lane6-lineage-1', 'voiceIdentity': 'original-kokoro',
                        **{flag: False for flag in FLAGS}}
        for role in ('video', 'wav', 'captions', 'shotPlan'):
            self.lineage[role+'Sha256'] = digest(self.bundle/self.roles[role])
        write(self.bundle/'lineage.json', self.lineage)
        self.review = {'schema': 'em-lane6-review-handoff-1', 'scope': 'pending-lane4-exact-film-review',
                       'status': 'HOLD', 'videoSha256': self.lineage['videoSha256'],
                       'shotPlanSha256': self.lineage['shotPlanSha256']}
        write(self.bundle/'review.json', self.review)
        self.pin = {'schema': 'em-lane6-trusted-pin-1', 'state': 'COMPLETE',
                    'media': {'width': 64, 'height': 96, 'fps': 30, 'frames': 30,
                              'audioAdtsSha256': self.audio_sha}}
        self.repin()

    def repin(self):
        write(self.bundle/'sources.json', {
            'finalNativeMasterPath': 'film.mp4', 'originalFinalSha256': digest(self.bundle/'film.mp4'),
            'notReleasableWithoutFinalQualityReview': True,
            'sourceInputs': {name: digest(self.bundle/name) for role, name in self.roles.items()
                             if role not in ('video', 'sourceManifest')}})
        self.pin['roles'] = {role: {'path': name, 'sha256': digest(self.bundle/name)}
                             for role, name in self.roles.items()}
        self.pinfile = self.root/'trusted-pin.json'
        write(self.pinfile, self.pin)

    def run_intake(self, source=None, destination=None, pin_sha=None):
        return intake(source or self.bundle, self.pinfile, pin_sha or digest(self.pinfile), destination)

    def rejected(self, code, **kwargs):
        result = self.run_intake(**kwargs)
        self.assertNotEqual(result['status'], 'PASS', result)
        self.assertIn(code, ' '.join(result['errors']))
        self.assertTrue(all(result[f] is False for f in FLAGS))

    def test_directory_transfer_decodes_and_preserves_every_byte(self):
        dest = self.root/'lane4'
        r = self.run_intake(destination=dest)
        self.assertEqual(r['status'], 'PASS', r)
        self.assertTrue(r['media']['fullDecodePerformed'])
        self.assertTrue(r['media']['frameTimingVerified'])
        for name, hashed in r['files'].items():
            self.assertEqual(digest(dest/name), hashed)
        again = self.run_intake(source=dest)
        self.assertEqual(again['status'], 'PASS', again)
        self.assertEqual(again['files'], r['files'])
        self.assertEqual(r['newAtomicCards'], 0)

    def make_zip(self):
        archive = self.root/'delivery.zip'
        with zipfile.ZipFile(archive, 'w') as z:
            for item in self.bundle.iterdir():
                z.write(item, item.name)
        return archive

    def test_zip_transfer(self):
        r = self.run_intake(source=self.make_zip(), destination=self.root/'lane4')
        self.assertEqual(r['status'], 'PASS', r)

    def test_missing_real_bundle_is_hold(self):
        r = self.run_intake(source=self.root/'unavailable-real-film.zip')
        self.assertEqual(r['status'], 'HOLD')
        self.assertIn('MISSING_INPUT', r['errors'][0])

    def test_wrong_trust_pin_hash(self):
        self.rejected('PIN_HASH_MISMATCH', pin_sha='0'*64)

    def test_missing_each_required_input(self):
        for role, name in self.roles.items():
            with self.subTest(role=role):
                data = (self.bundle/name).read_bytes()
                (self.bundle/name).unlink()
                self.rejected('MISSING_INPUT:'+role)
                (self.bundle/name).write_bytes(data)

    def test_swapped_film(self):
        shutil.copyfile(self.bundle/'voice.wav', self.bundle/'film.mp4')
        self.rejected('HASH_MISMATCH:video')

    def test_bad_hash(self):
        self.pin['roles']['video']['sha256'] = 'f'*64
        write(self.pinfile, self.pin)
        self.rejected('HASH_MISMATCH:video')

    def test_stale_lineage_despite_rehashed_manifest(self):
        self.lineage['captionsSha256'] = '0'*64
        write(self.bundle/'lineage.json', self.lineage)
        self.repin()
        self.rejected('STALE_LINEAGE:captions')

    def test_stale_review(self):
        self.review['videoSha256'] = '0'*64
        write(self.bundle/'review.json', self.review)
        self.repin()
        self.rejected('STALE_OR_FORGED_REVIEW')

    def test_stale_shot_plan(self):
        plan = json.loads((self.bundle/'plan.json').read_text())
        plan['expectedVideoSha256'] = '0'*64
        write(self.bundle/'plan.json', plan)
        self.lineage['shotPlanSha256'] = digest(self.bundle/'plan.json')
        write(self.bundle/'lineage.json', self.lineage)
        self.review['shotPlanSha256'] = self.lineage['shotPlanSha256']
        write(self.bundle/'review.json', self.review)
        self.repin()
        self.rejected('STALE_SHOT_PLAN')

    def test_stale_source_manifest(self):
        source = json.loads((self.bundle/'sources.json').read_text())
        source['originalFinalSha256'] = '0'*64
        write(self.bundle/'sources.json', source)
        self.pin['roles']['sourceManifest']['sha256'] = digest(self.bundle/'sources.json')
        write(self.pinfile, self.pin)
        self.rejected('STALE_SOURCE_MANIFEST')

    def test_forged_each_approval(self):
        for flag in FLAGS:
            with self.subTest(flag=flag):
                forged = copy.deepcopy(self.lineage)
                forged[flag] = True
                write(self.bundle/'lineage.json', forged)
                self.repin()
                self.rejected('APPROVAL_FLAG_REQUIRED:'+flag)

    def test_hidden_forged_approval(self):
        write(self.bundle/'extra.json', {'nested': {'publicationApproved': True}})
        self.rejected('FORGED_APPROVAL:publicationApproved')

    def test_fake_review_pass(self):
        self.review['status'] = 'PASS'
        write(self.bundle/'review.json', self.review)
        self.repin()
        self.rejected('STALE_OR_FORGED_REVIEW')

    def test_duplicate_json_keys(self):
        (self.bundle/'extra.json').write_text('{"status":"HOLD","status":"PASS"}')
        self.rejected('DUPLICATE_JSON_KEY')

    def test_nonfinite_json(self):
        (self.bundle/'extra.json').write_text('{"seconds":NaN}')
        self.rejected('NONFINITE_JSON')

    def test_unsafe_portable_paths(self):
        for name in ('../escape', '/root', 'C:/escape', 'a\\b', 'a//b', 'a/./b',
                     'CON.txt', 'x:stream', 'foo.', 'NUL', 'a/../../b'):
            with self.subTest(name=name), self.assertRaises(ValueError):
                relative(name)

    def test_zip_traversal(self):
        z = self.make_zip()
        with zipfile.ZipFile(z, 'a') as archive:
            archive.writestr('../escape', 'bad')
        self.rejected('UNSAFE_PATH', source=z)
        self.assertFalse((self.root/'escape').exists())

    def test_zip_symlink(self):
        z = self.make_zip()
        info = zipfile.ZipInfo('link')
        info.create_system = 3
        info.external_attr = 0o120777 << 16
        with zipfile.ZipFile(z, 'a') as archive:
            archive.writestr(info, 'film.mp4')
        self.rejected('ZIP_LINK_OR_SPECIAL_FILE', source=z)

    def test_zip_case_alias(self):
        z = self.make_zip()
        with zipfile.ZipFile(z, 'a') as archive:
            archive.writestr('FILM.mp4', 'bad')
        self.rejected('DUPLICATE_OR_CASE_ALIAS', source=z)

    def test_zip_member_limit(self):
        z = self.make_zip()
        with zipfile.ZipFile(z, 'a') as archive:
            for index in range(257):
                archive.writestr('extra-'+str(index), '')
        self.rejected('BUNDLE_LIMIT', source=z)

    def test_missing_role_cannot_be_waived(self):
        del self.pin['roles']['captions']
        write(self.pinfile, self.pin)
        self.rejected('MISSING_ROLES')

    def test_uppercase_json_cannot_hide_approval(self):
        write(self.bundle/'EXTRA.JSON', {'ownerApproved': True})
        self.rejected('FORGED_APPROVAL:ownerApproved')

    def test_malformed_source_receipt(self):
        write(self.bundle/'sources.json', [])
        self.pin['roles']['sourceManifest']['sha256'] = digest(self.bundle/'sources.json')
        write(self.pinfile, self.pin)
        self.rejected('SOURCE_SCHEMA')

    def test_pin_itself_cannot_award_approval(self):
        self.pin['scienceApproved'] = True
        write(self.pinfile, self.pin)
        self.rejected('FORGED_APPROVAL:scienceApproved')

    def test_unbound_source_input(self):
        source = json.loads((self.bundle/'sources.json').read_text())
        del source['sourceInputs']['voice.wav']
        write(self.bundle/'sources.json', source)
        self.pin['roles']['sourceManifest']['sha256'] = digest(self.bundle/'sources.json')
        write(self.pinfile, self.pin)
        self.rejected('UNBOUND_SOURCE:wav')

    def test_no_overwrite(self):
        dest = self.root/'existing'
        dest.mkdir()
        (dest/'keep').write_text('untouched')
        self.rejected('DESTINATION_EXISTS', destination=dest)
        self.assertEqual((dest/'keep').read_text(), 'untouched')
        self.assertEqual(len(list(dest.iterdir())), 1)

    def test_directory_symlink(self):
        target = self.bundle/'alias'
        # Windows directory junctions are available without symlink privilege.
        if __import__('os').name == 'nt':
            subprocess.run(['cmd', '/c', 'mklink', '/J', str(target), str(self.fixture)],
                           capture_output=True, check=True)
            self.addCleanup(lambda: target.rmdir())
        else:
            target.symlink_to(self.fixture, target_is_directory=True)
        self.rejected('LINK_OR_REPARSE_PATH')

    def test_incomplete_pin(self):
        self.pin['state'] = 'INCOMPLETE'
        write(self.pinfile, self.pin)
        self.rejected('PIN_INCOMPLETE')

    def test_wrong_decoded_geometry(self):
        self.pin['media']['width'] = 1080
        write(self.pinfile, self.pin)
        self.rejected('INCORRECT_NATIVE_FRAME_GEOMETRY')

    def test_wrong_encoded_voice(self):
        self.pin['media']['audioAdtsSha256'] = '0'*64
        write(self.pinfile, self.pin)
        self.rejected('NARRATION_AAC_NOT_EXACTLY_PINNED')

    def test_invalid_movie_with_matching_hash_is_not_media_proof(self):
        (self.bundle/'film.mp4').write_bytes(b'not an encoded movie')
        self.lineage['videoSha256'] = digest(self.bundle/'film.mp4')
        plan = json.loads((self.bundle/'plan.json').read_text())
        plan['expectedVideoSha256'] = self.lineage['videoSha256']
        write(self.bundle/'plan.json', plan)
        self.lineage['shotPlanSha256'] = digest(self.bundle/'plan.json')
        write(self.bundle/'lineage.json', self.lineage)
        self.review.update(videoSha256=self.lineage['videoSha256'],
                           shotPlanSha256=self.lineage['shotPlanSha256'])
        write(self.bundle/'review.json', self.review)
        self.repin()
        self.rejected('MEDIA_PROBE_FAILED')


if __name__ == '__main__':
    unittest.main()

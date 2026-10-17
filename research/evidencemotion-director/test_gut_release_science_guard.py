"""L1-GUT-01 synthetic rehashed attacks plus opt-in real-owner-archive replay."""
import ast
import hashlib
import io
import json
import os
import re
import stat
import tempfile
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

from gut_release_science_guard import (
    FDA_GUIDANCE, ORIGINAL_NARRATION, inspect, read_pinned_package,
    static_scenes, review_release_scene, sha256,
)

ORIGINAL_SCENES = '''STAGES=[dict(id='hook',title='DOSE',subtitle='SWALLOWED',text='Context',source='NIDDK'),
 dict(id='dissolve',title='FIRST: DISSOLVE',subtitle='IN THE GUT',text='Many tablets or capsules release contents before uptake.',source='NIDDK digestive system'),
 dict(id='intestine',title='INTESTINE',subtitle='LINING',text='Context',source='NIDDK'),
 dict(id='vitamind',title='VITAMIN D',subtitle='FAT',text='Context',source='ODS'),
 dict(id='iron',title='IRON',subtitle='CONTEXT',text='Context',source='ODS'),
 dict(id='takeaway',title='TAKEAWAY',subtitle='CONTEXT',text='Context',source='NIDDK')]
'''
IDS = ('hook', 'dissolve', 'intestine', 'vitamind', 'iron', 'takeaway')
VOICE = {'mayPublish': False, 'master_sha256': 'e'*64,
         'scenes': [{'id': i, 'text': ORIGINAL_NARRATION if i == 'dissolve' else 'fixture'}
                    for i in IDS]}
NAMES = ('REPRODUCE_SOURCE_RENDERER.py', 'ORIGINAL_KOKORO_VOICE_RECEIPT.json',
         'SCIENCE_CLAIM_REVIEW.md', 'THS_Gut_Absorption_V8.mp4', 'REPRODUCE_VOICE_LOCKED_VIDEO.py')


def archive(source=ORIGINAL_SCENES, science='# The Hippie Scientist\n', voice=None,
            extra=None, corrupt=None, duplicate=False):
    values = {'REPRODUCE_SOURCE_RENDERER.py': source.encode(),
              'ORIGINAL_KOKORO_VOICE_RECEIPT.json': json.dumps(voice or VOICE).encode(),
              'SCIENCE_CLAIM_REVIEW.md': science.encode(),
              'THS_Gut_Absorption_V8.mp4': b'SYNTHETIC_FAKE_FILM_NOT_PROOF',
              'REPRODUCE_VOICE_LOCKED_VIDEO.py': b"source=Path('/mnt/data/embedded_current_renderer.py')\n"}
    values.update(extra or {})
    manifest = {'schema':'ths.gut_absorption.delivery_review.v8', 'mayPublish':False,
                'files':{n:{'sha256':sha256(v),'bytes':len(v)} for n,v in values.items()}}
    if corrupt:
        manifest['files']['REPRODUCE_SOURCE_RENDERER.py']['sha256'] = '1'*64
    result = io.BytesIO()
    with zipfile.ZipFile(result, 'w', compression=zipfile.ZIP_STORED) as z:
        for n,v in values.items(): z.writestr(n,v)
        if duplicate: z.writestr('SCIENCE_CLAIM_REVIEW.md', b'duplicate')
        z.writestr('DELIVERY_SHA_MANIFEST.json', json.dumps(manifest))
    return result.getvalue()


class GutReleaseScienceTests(unittest.TestCase):
    def run_zip(self, raw, expected_sha=None):
        with tempfile.TemporaryDirectory() as folder:
            path=Path(folder)/'candidate.zip';path.write_bytes(raw)
            return inspect(path, expected_sha or sha256(raw))

    def test_original_archived_scene_synthetic_reconstruction_fails_two_axes(self):
        report=self.run_zip(archive())
        self.assertEqual(report['result'],'SOURCE_CORRECTION_REQUIRED')
        self.assertIn('UNQUALIFIED_FIRST_DISSOLVE_HEADLINE',report['sourceContractIssues'])
        self.assertIn('NIDDK_DIGESTION_SOURCE_INSUFFICIENT_FOR_DOSAGE_FORM_CLAIM',report['sourceContractIssues'])
        self.assertFalse(report['mayPublish'])

    def test_title_change_only_keeps_source_scope_hold(self):
        source=ORIGINAL_SCENES.replace('FIRST: DISSOLVE','RELEASE IS NOT').replace('IN THE GUT','ABSORPTION')
        result=self.run_zip(archive(source=source))
        self.assertNotIn('UNQUALIFIED_FIRST_DISSOLVE_HEADLINE',result['sourceContractIssues'])
        self.assertIn('NIDDK_DIGESTION_SOURCE_INSUFFICIENT_FOR_DOSAGE_FORM_CLAIM',result['sourceContractIssues'])

    def test_properly_scoped_proposed_source_never_approves_encoded_film(self):
        source=ORIGINAL_SCENES.replace('FIRST: DISSOLVE','RELEASE IS NOT').replace('IN THE GUT','ABSORPTION').replace("source='NIDDK digestive system'","source='FDA immediate-release oral dosage guidance'")
        science=FDA_GUIDANCE+'\nFDA applies to immediate-release drug formulations, not universal supplement effects.\n'
        result=self.run_zip(archive(source=source,science=science))
        self.assertEqual(result['sourceContractIssues'],[])
        self.assertIn('ENCODED_FILM_STILL_HOLD',result['result'])
        self.assertIn('EXTERNAL_RENDERER_SOURCE_NOT_IN_ARCHIVE:embedded_current_renderer.py',result['reproducibilityIssues'])
        self.assertFalse(result['encodedFilmPixelsIndependentlyCheckedByThisTool'])
        self.assertFalse(result['mayPublish'])

    def test_tampering_original_archive_sha_holds(self):
        with self.assertRaisesRegex(ValueError,'ARCHIVE_IDENTITY_MISMATCH'):
            self.run_zip(archive(), expected_sha='0'*64)

    def test_rehashed_archive_with_inner_member_hash_not_updated_holds(self):
        with self.assertRaisesRegex(ValueError,'MEMBER_HASH_OR_LENGTH_MISMATCH'):
            self.run_zip(archive(corrupt=True))

    def test_extra_unmanifested_archive_item_holds(self):
        raw=archive(extra={'bad.py': b'not a science proof'}, corrupt=False)
        with self.assertRaisesRegex(ValueError,'SOURCE_MANIFEST_SCOPE_OR_RELEASE_DRIFT|MEMBER_HASH_OR_LENGTH_MISMATCH'):
            self.run_zip(_add_unlisted(raw))

    def test_duplicate_zip_names_fail_before_code_execution(self):
        with self.assertRaisesRegex(ValueError,'UNTRUSTED_ARCHIVE_STRUCTURE'):
            self.run_zip(archive(duplicate=True))

    def test_dynamic_scene_source_refuses_instead_of_exec(self):
        source=ORIGINAL_SCENES.replace("source='NIDDK digestive system'","source=some_dynamic_function()")
        with self.assertRaisesRegex(ValueError,'DYNAMIC_SCENE_NOT_VERIFIABLE'):
            self.run_zip(archive(source=source))

    def test_voice_narration_swapped_and_rehashed_holds(self):
        voice=json.loads(json.dumps(VOICE))
        voice['scenes'][1]['text']='All supplements dissolve first in the gut.'
        with self.assertRaisesRegex(ValueError,'FROZEN_NARRATION_REWRITTEN'):
            self.run_zip(archive(voice=voice))

    def test_untrusted_release_flag_holds(self):
        raw=archive()
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            files={n:z.read(n) for n in z.namelist()}
        manifest=json.loads(files['DELIVERY_SHA_MANIFEST.json']);manifest['mayPublish']=True
        files['DELIVERY_SHA_MANIFEST.json']=json.dumps(manifest).encode()
        with self.assertRaisesRegex(ValueError,'SOURCE_MANIFEST_SCOPE_OR_RELEASE_DRIFT'):
            self.run_zip(_repack(files))

    def test_exact_sha_does_not_override_package_size_limit(self):
        raw = archive()
        with patch('gut_release_science_guard.MAX_PACKAGE_BYTES',len(raw)-1):
            with self.assertRaisesRegex(ValueError,'ARCHIVE_IDENTITY_OR_SIZE_INVALID'):
                self.run_zip(raw)

    def test_member_count_and_inflation_budget_fail_before_decompression(self):
        raw = archive()
        with patch('gut_release_science_guard.MAX_ARCHIVE_MEMBERS',len(NAMES)):
            with self.assertRaisesRegex(ValueError,'UNTRUSTED_ARCHIVE_STRUCTURE'):
                self.run_zip(raw)
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            advertised = sum(info.file_size for info in z.infolist())
        with patch('gut_release_science_guard.MAX_TOTAL_UNCOMPRESSED_BYTES',advertised-1):
            with self.assertRaisesRegex(ValueError,'ARCHIVE_RESOURCE_LIMIT_OR_ENCRYPTION'):
                self.run_zip(raw)

    def test_compressed_oversize_member_refused_despite_matching_repacked_sha(self):
        raw = archive(extra={'COMPRESSED_BOMB.bin':b'A'*10000})
        with zipfile.ZipFile(io.BytesIO(raw)) as original:
            entries = [(info.filename,original.read(info.filename)) for info in original.infolist()]
        buf=io.BytesIO()
        with zipfile.ZipFile(buf,'w',compression=zipfile.ZIP_DEFLATED) as z:
            for name,data in entries:z.writestr(name,data)
        with patch('gut_release_science_guard.MAX_MEMBER_BYTES',9999):
            with self.assertRaisesRegex(ValueError,'ARCHIVE_RESOURCE_LIMIT_OR_ENCRYPTION'):
                self.run_zip(buf.getvalue())

    def test_manifest_cap_and_manifest_type_fail_closed(self):
        raw=archive()
        with patch('gut_release_science_guard.MAX_MANIFEST_BYTES',5):
            with self.assertRaisesRegex(ValueError,'MANIFEST_RESOURCE_LIMIT'):
                self.run_zip(raw)
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            entries={name:z.read(name) for name in z.namelist()}
        entries['DELIVERY_SHA_MANIFEST.json']=b'[]'
        with self.assertRaisesRegex(ValueError,'MANIFEST_NOT_OBJECT'):
            self.run_zip(_repack(entries))

    def test_zipped_symlink_is_not_trusted_as_source(self):
        raw=archive()
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            entries={name:z.read(name) for name in z.namelist()}
        buf=io.BytesIO()
        with zipfile.ZipFile(buf,'w') as z:
            for name,data in entries.items():
                info=zipfile.ZipInfo(name)
                info.create_system=3
                if name=='REPRODUCE_SOURCE_RENDERER.py':
                    info.external_attr=(stat.S_IFLNK|0o777)<<16
                z.writestr(info,data)
        with self.assertRaisesRegex(ValueError,'UNTRUSTED_ARCHIVE_STRUCTURE'):
            self.run_zip(buf.getvalue())

    def test_malformed_member_sha_and_false_claimed_size_are_rejected(self):
        raw=archive()
        with zipfile.ZipFile(io.BytesIO(raw)) as z:
            entries={name:z.read(name) for name in z.namelist()}
        manifest=json.loads(entries['DELIVERY_SHA_MANIFEST.json'])
        manifest['files']['REPRODUCE_SOURCE_RENDERER.py']['sha256']=2026
        entries['DELIVERY_SHA_MANIFEST.json']=json.dumps(manifest).encode()
        with self.assertRaisesRegex(ValueError,'MALFORMED_FILE_IDENTITY'):
            self.run_zip(_repack(entries))
        manifest['files']['REPRODUCE_SOURCE_RENDERER.py']['sha256']=sha256(entries['REPRODUCE_SOURCE_RENDERER.py'])
        manifest['files']['REPRODUCE_SOURCE_RENDERER.py']['bytes']+=1
        entries['DELIVERY_SHA_MANIFEST.json']=json.dumps(manifest).encode()
        with self.assertRaisesRegex(ValueError,'MALFORMED_FILE_IDENTITY'):
            self.run_zip(_repack(entries))

    @unittest.skipUnless(os.environ.get('THS_GUT_ORIGINAL_V8_ARCHIVE'),'Owner original archive not mounted on hosted CI')
    def test_real_owner_v8_archive_is_physically_read_and_known_defect_detected(self):
        path=Path(os.environ['THS_GUT_ORIGINAL_V8_ARCHIVE'])
        expected='c7b12d671eab01ca08d1949a959d725248a378c06ad5e1e542bd1979e8724494'
        result=inspect(path,expected)
        self.assertEqual(result['exactPackagedFilmSha256'],
            'a54f28d76de559ecb099f0c3ce5261825e9287ac09eb4863052c66d6ad0bb70b')
        self.assertEqual(result['result'],'SOURCE_CORRECTION_REQUIRED')
        self.assertIn('UNQUALIFIED_FIRST_DISSOLVE_HEADLINE',result['sourceContractIssues'])
        self.assertFalse(result['mayPublish'])
        self.assertIn('EXTERNAL_RENDERER_SOURCE_NOT_IN_ARCHIVE:reproduce_gut_v6_quality_patch.py', result['reproducibilityIssues'])


def _repack(files):
    b=io.BytesIO()
    with zipfile.ZipFile(b,'w') as z:
        for n,v in files.items(): z.writestr(n,v)
    return b.getvalue()


def _add_unlisted(raw):
    with zipfile.ZipFile(io.BytesIO(raw)) as z:
        files={n:z.read(n) for n in z.namelist()}
    files['EXTRA_UNLISTED.bin']=b'evil'
    return _repack(files)

if __name__=='__main__': unittest.main()
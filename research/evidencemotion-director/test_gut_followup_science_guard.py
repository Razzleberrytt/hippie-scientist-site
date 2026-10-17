"""Lane1 physically decoded source-continuity tests; synthetic media never grants approval."""
import io
import json
import os
import shutil
import subprocess
import tempfile
import unittest
import warnings
import zipfile
from pathlib import Path

from gut_followup_science_guard import inspect_followup, sha256
from gut_release_science_guard import ORIGINAL_NARRATION

ORIGINAL_SCENES = """STAGES=[dict(id='hook',title='DOSE',subtitle='SWALLOWED',text='Context',source='NIDDK'),
 dict(id='dissolve',title='FIRST: DISSOLVE',subtitle='IN THE GUT',text='Many tablets or capsules release contents before uptake.',source='NIDDK digestive system'),
 dict(id='intestine',title='INTESTINE',subtitle='LINING',text='Context',source='NIDDK'),
 dict(id='vitamind',title='VITAMIN D',subtitle='FAT',text='Context',source='ODS'),
 dict(id='iron',title='IRON',subtitle='CONTEXT',text='Context',source='ODS'),
 dict(id='takeaway',title='TAKEAWAY',subtitle='CONTEXT',text='Context',source='NIDDK')]
"""


def archive(extra=None):
    voice={'mayPublish':False,'master_sha256':'e'*64,
           'scenes':[{'id':i,'text':ORIGINAL_NARRATION if i=='dissolve' else 'fixture'}
                     for i in ('hook','dissolve','intestine','vitamind','iron','takeaway')]}
    files={'REPRODUCE_SOURCE_RENDERER.py':ORIGINAL_SCENES.encode(),
           'ORIGINAL_KOKORO_VOICE_RECEIPT.json':json.dumps(voice).encode(),
           'SCIENCE_CLAIM_REVIEW.md':b'Research-only fixture',
           'THS_Gut_Absorption_V8.mp4':b'FAKE_FILM',
           'REPRODUCE_VOICE_LOCKED_VIDEO.py':b"source=Path('/mnt/data/fixture_renderer.py')"}
    files.update(extra or {})
    manifest={'schema':'ths.gut_absorption.delivery_review.v8','mayPublish':False,
              'files':{n:{'sha256':sha256(v),'bytes':len(v)} for n,v in files.items()}}
    buf=io.BytesIO()
    with zipfile.ZipFile(buf,'w',zipfile.ZIP_STORED) as z:
        for n,v in files.items():z.writestr(n,v)
        z.writestr('DELIVERY_SHA_MANIFEST.json',json.dumps(manifest))
    return buf.getvalue()


PINNED_REAL_V8 = 'c7b12d671eab01ca08d1949a959d725248a378c06ad5e1e542bd1979e8724494'
PINNED_REAL_V10 = 'b5863c81dd073bf49bc9c3889eee48ff13f96f8a494c9aadaf8a1c6c9126b0bd'
PINNED_REAL_V10_FILM = 'c7ce323c59546e994aba7bcac8331630854e452f4f405232064695b19dce89d4'
MEMBER = 'THS_Gut_Absorption_V10_BALANCED_POSTING_MASTER.mp4'


def create_candidate(movie, changed_source=False, forged_qa=False, duplicate=False):
    old_source = ORIGINAL_SCENES
    if changed_source:
        old_source = old_source.replace('FIRST: DISSOLVE', 'RELEASE IS NOT').replace('IN THE GUT', 'ABSORPTION')
    files = {
        MEMBER:movie,
        'REPRODUCE_SOURCE_RENDERER.py':old_source.encode(),
        'SCIENCE_CLAIM_REVIEW.md':b'RESEARCH ONLY',
        'ORIGINAL_VOICE_RECEIPT.json':json.dumps({'mayPublish':False}).encode(),
        'V10_AUTOMATED_QA.json':json.dumps({'mayPublish':True, 'scienceApproved':True}
                                        if forged_qa else {'mayPublish':False}).encode(),
    }
    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer,'w',zipfile.ZIP_DEFLATED) as z:
        for n,v in files.items(): z.writestr(n,v)
        if duplicate:
            with warnings.catch_warnings():
                warnings.simplefilter('ignore', UserWarning)
                z.writestr(MEMBER,movie)
    return buffer.getvalue()


@unittest.skipUnless(shutil.which('ffmpeg') and shutil.which('ffprobe'),
                     'FFmpeg/FFprobe unavailable; physical-media regression must run where installed')
class FollowupFilmPhysicalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.base = cls.root/'base.mp4'
        cls.audio_new = cls.root/'audio-remastered.mp4'
        cls.video_new = cls.root/'edited-visuals.mp4'
        cls.retimed = cls.root/'retimed.mp4'
        def ffmpeg(*args):
            subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-y',*args],
                           check=True,timeout=40,capture_output=True)
        ffmpeg('-f','lavfi','-i','testsrc2=size=96x160:rate=10',
               '-f','lavfi','-i','sine=frequency=450:sample_rate=24000',
               '-t','0.8','-c:v','libx264','-preset','ultrafast',
               '-pix_fmt','yuv420p','-c:a','aac',str(cls.base))
        ffmpeg('-i',str(cls.base),'-c:v','copy','-af','volume=1.25',
               '-c:a','aac',str(cls.audio_new))
        ffmpeg('-i',str(cls.base),'-vf','hue=s=0','-c:v','libx264',
               '-preset','ultrafast','-c:a','copy',str(cls.video_new))
        ffmpeg('-itsoffset','0.2','-i',str(cls.base),'-c','copy',str(cls.retimed))
        cls.base_package = cls.root/'original-source.zip'
        cls.base_package.write_bytes(archive(extra={'THS_Gut_Absorption_V8.mp4':cls.base.read_bytes()}))
        cls.base_sha = sha256(cls.base_package.read_bytes())

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def inspect_movie(self, path, changed_source=False, forged_qa=False, duplicate=False,
                      override_candidate_sha=None, override_film_sha=None):
        payload = create_candidate(path.read_bytes(), changed_source, forged_qa, duplicate)
        movie_package = self.root/'candidate.zip'
        movie_package.write_bytes(payload)
        return inspect_followup(self.base_package,self.base_sha,movie_package,
                                override_candidate_sha or sha256(payload),
                                MEMBER,override_film_sha or sha256(path.read_bytes()))

    def test_real_audio_only_remaster_inherits_known_science_hold(self):
        result=self.inspect_movie(self.audio_new)
        self.assertTrue(result['exactH264ElementaryStreamIdentical'])
        self.assertTrue(result['exactVideoPacketTimelineIdentical'])
        self.assertTrue(result['bothEntireVideosPhysicallyDecoded'])
        self.assertEqual(result['baselineVideoPackets'],8)
        self.assertEqual(result['scienceDisposition'],
                         'UNCHANGED_VISUAL_SOURCE_DEFECT_REMAINS_HOLD')
        self.assertFalse(result['claimCorrectedOnActualFilm'])
        self.assertFalse(result['mayPublish'])

    def test_rehashed_misleading_modified_source_does_not_fix_old_picture(self):
        result=self.inspect_movie(self.audio_new,changed_source=True)
        self.assertFalse(result['candidateSourceAndProvenance']['rendererTextIdentical'])
        self.assertTrue(result['noEditedSciencePixelsInCandidateEstablished'])
        self.assertEqual(result['scienceDisposition'],
                         'UNCHANGED_VISUAL_SOURCE_DEFECT_REMAINS_HOLD')

    def test_rehashed_forged_science_approval_in_candidate_qa_is_not_trusted(self):
        result=self.inspect_movie(self.audio_new,forged_qa=True)
        self.assertFalse(result['qualifiedIndependentScienceReviewerApproved'])
        self.assertFalse(result['mayPublish'])
        self.assertIn('HOLD',result['scienceDisposition'])

    def test_changed_actual_encoded_pixels_requires_a_new_science_review(self):
        result=self.inspect_movie(self.video_new)
        self.assertFalse(result['exactH264ElementaryStreamIdentical'])
        self.assertEqual(result['scienceDisposition'],
                         'CHANGED_VIDEO_REQUIRES_NEW_EXACT_FILM_SCIENCE_AUDIT')
        self.assertFalse(result['claimCorrectedOnActualFilm'])

    def test_even_unchanged_h264_with_shifted_video_packet_times_cannot_inherit(self):
        result=self.inspect_movie(self.retimed)
        self.assertTrue(result['exactH264ElementaryStreamIdentical'])
        self.assertFalse(result['exactVideoPacketTimelineIdentical'])
        self.assertEqual(result['scienceDisposition'],
                         'CHANGED_VIDEO_REQUIRES_NEW_EXACT_FILM_SCIENCE_AUDIT')

    def test_rehashed_swapped_or_unpinned_candidate_rejected(self):
        with self.assertRaisesRegex(ValueError, 'FOLLOWUP_ARCHIVE_SHA_MISMATCH'):
            self.inspect_movie(self.audio_new, override_candidate_sha='f'*64)
        with self.assertRaisesRegex(ValueError, 'CANDIDATE_MOVIE_BYTES_NOT_EXTERNALLY_PINNED'):
            self.inspect_movie(self.audio_new, override_film_sha='a'*64)

    def test_duplicate_movie_entries_are_rejected(self):
        with self.assertRaisesRegex(ValueError, 'FOLLOWUP_UNTRUSTED_ZIP_STRUCTURE'):
            self.inspect_movie(self.audio_new,duplicate=True)


@unittest.skipUnless(os.environ.get('THS_GUT_V10_ARCHIVE') and
                     os.environ.get('THS_GUT_ORIGINAL_V8_ARCHIVE'),
                     'Requires both real owner archives; no synthetic claim about their pixels')
class OwnerArchivesExactFilmTest(unittest.TestCase):
    def test_owner_v10_visuals_provably_unchanged_from_v8(self):
        report=inspect_followup(os.environ['THS_GUT_ORIGINAL_V8_ARCHIVE'],
                                PINNED_REAL_V8,os.environ['THS_GUT_V10_ARCHIVE'],
                                PINNED_REAL_V10,MEMBER,PINNED_REAL_V10_FILM)
        self.assertEqual(report['baselineVideoPackets'],845)
        self.assertEqual(report['candidateVideoPackets'],845)
        self.assertTrue(report['exactH264ElementaryStreamIdentical'])
        self.assertTrue(report['exactVideoPacketTimelineIdentical'])
        self.assertEqual(report['scienceDisposition'],
                         'UNCHANGED_VISUAL_SOURCE_DEFECT_REMAINS_HOLD')
        self.assertTrue(report['candidateSourceAndProvenance']['rendererTextIdentical'])
        self.assertTrue(report['candidateSourceAndProvenance']['scienceTextIdentical'])
        self.assertFalse(report['mayPublish'])



class FollowupArchiveResourceCaps(unittest.TestCase):
    """Small adversaries for archive preflight; no media release claims."""

    def test_physical_zip_with_excessive_entries_rejected_before_extraction(self):
        from gut_followup_science_guard import _safe_archive, MAX_ARCHIVE_MEMBERS
        with tempfile.TemporaryDirectory() as folder:
            target=Path(folder)/'many-members.zip'
            with zipfile.ZipFile(target, 'w', zipfile.ZIP_STORED) as z:
                for i in range(MAX_ARCHIVE_MEMBERS + 1):
                    z.writestr(f'valid_{i:03d}.txt', b'x')
            with self.assertRaisesRegex(ValueError, 'FOLLOWUP_UNTRUSTED_ZIP_STRUCTURE'):
                _safe_archive(target, sha256(target.read_bytes()))

    def test_large_total_declared_uncompressed_bytes_rejected_without_inflating(self):
        from unittest.mock import patch
        from gut_followup_science_guard import (
            _safe_archive, MAX_ARCHIVE_MEMBERS, MAX_MEMBER_BYTES,
            MAX_TOTAL_UNCOMPRESSED_BYTES,
        )
        self.assertGreater(MAX_ARCHIVE_MEMBERS, 3)
        with tempfile.TemporaryDirectory() as folder:
            target=Path(folder)/'tiny.zip'
            with zipfile.ZipFile(target, 'w') as z:
                z.writestr('fixture.txt', b'safe')
            with patch('gut_followup_science_guard.zipfile.ZipFile') as factory:
                fake=factory.return_value.__enter__.return_value
                rows=[zipfile.ZipInfo(f'large_{i}.txt') for i in range(3)]
                for row in rows:
                    row.file_size=MAX_MEMBER_BYTES - 1
                self.assertGreater(sum(row.file_size for row in rows),
                                   MAX_TOTAL_UNCOMPRESSED_BYTES)
                fake.infolist.return_value=rows
                with self.assertRaisesRegex(ValueError,
                                            'FOLLOWUP_UNTRUSTED_ZIP_STRUCTURE'):
                    _safe_archive(target, sha256(target.read_bytes()))
                fake.read.assert_not_called()


if __name__ == '__main__': unittest.main()

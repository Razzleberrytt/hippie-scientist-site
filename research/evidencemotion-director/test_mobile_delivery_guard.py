"""Lane4 720p compatibility guard: real FFmpeg fixtures, no external services."""
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from mobile_delivery_guard import audit,Hold,sha_file


def ff(*a):
    r=subprocess.run(['ffmpeg','-nostdin','-loglevel','error','-y',*map(str,a)],stdout=subprocess.PIPE,stderr=subprocess.PIPE)
    if r.returncode:raise RuntimeError(r.stderr.decode(errors='replace'))

class MobileDeliveryGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        if not shutil.which('ffmpeg') or not shutil.which('ffprobe'):
            raise RuntimeError('Real FFmpeg + FFprobe mandatory, do not skip')
        cls.temp=tempfile.TemporaryDirectory();cls.root=Path(cls.temp.name)
        cls.source=cls.root/'source.mp4';cls.mobile=cls.root/'mobile.mp4'
        ff('-f','lavfi','-i','color=c=0x123047:s=320x568:r=30:d=0.8',
           '-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=0.8',
           '-filter:v','null',
           '-c:v','libx264','-profile:v','high','-pix_fmt','yuv420p','-crf','16',
           '-c:a','aac','-ar','48000','-ac','2','-b:a','160k','-movflags','+faststart',
           '-t','0.8',cls.source)
        cls.mkphone(cls.mobile)
    @classmethod
    def tearDownClass(cls):cls.temp.cleanup()
    @classmethod
    def mkphone(cls,dst,*extra,fast=True):
        ff('-i',cls.source,'-vf','scale=160:284:flags=bicubic','-c:v','libx264',
           '-profile:v','baseline','-level:v','3.1','-pix_fmt','yuv420p','-crf','16',
           '-c:a','aac','-b:a','160k','-ar','48000','-ac','2',
           '-movflags','+faststart' if fast else '-faststart',*extra,dst)
    @classmethod
    def run_pair(cls,source=None,phone=None,*,source_hash=None,phone_hash=None,visual=True):
        s=source or cls.source;p=phone or cls.mobile
        return audit(s,p,source_hash or sha_file(s),phone_hash or sha_file(p),
                     source_size=(320,568),mobile_size=(160,284),expected_frames=24,do_visual=visual)
    def test_real_24_frame_mobile_reencode_research_only(self):
        v=self.run_pair()
        self.assertEqual(v['framesChecked'],24)
        self.assertEqual(v['decodedVisualComparison']['decodedPairFrames'],24)
        self.assertGreater(v['decodedAudioComparison']['normalizedCorrelation'],.995)
        for k in ('realIPhonePlaybackVerified','captionOCRVerified','scienceOrSourceReviewApproved','fontReadabilityApproved','mayPublish'):
            self.assertIs(v[k],False)
    def test_source_hash_tamper_rejected(self):
        with self.assertRaisesRegex(Hold,'FILM_SHA256_DOES_NOT_MATCH_PIN'):
            self.run_pair(source_hash='0'*64)
    def test_mobile_hash_tamper_rejected(self):
        with self.assertRaisesRegex(Hold,'FILM_SHA256_DOES_NOT_MATCH_PIN'):
            self.run_pair(phone_hash='0'*64)
    def test_original_high_profile_is_not_forged_phone_compatible(self):
        with self.assertRaisesRegex(Hold,'WRONG_SOURCE_OR_MOBILE_GEOMETRY'):
            self.run_pair(phone=self.source,visual=False)
    def test_mismatched_audio_amplitude_fails_reencode(self):
        p=self.root/'too_quiet.mp4';self.mkphone(p,'-af','volume=0.15')
        with self.assertRaisesRegex(Hold,'AUDIO_REENCODE_NOT_SOURCE_EQUIVALENT'):
            self.run_pair(phone=p,visual=False)
    def test_missing_frames_fails_closed(self):
        p=self.root/'short.mp4';self.mkphone(p,'-t','0.4')
        with self.assertRaisesRegex(Hold,'DROPPED_OR_MISMATCHED_VIDEO_FRAME_COUNT'):
            self.run_pair(phone=p,visual=False)
    def test_no_faststart_fails_closed(self):
        p=self.root/'not_progressive.mp4';self.mkphone(p,fast=False)
        with self.assertRaisesRegex(Hold,'MOBILE_MP4_NOT_PROGRESSIVE_FASTSTART'):
            self.run_pair(phone=p,visual=False)
    def test_large_unauthorized_visual_patch_fails(self):
        p=self.root/'changed_scene.mp4'
        ff('-i',self.source,'-vf','scale=160:284:flags=bicubic,drawbox=x=0:y=0:w=160:h=160:color=white:t=fill',
           '-c:v','libx264','-profile:v','baseline','-level:v','3.1','-pix_fmt','yuv420p',
           '-c:a','aac','-ar','48000','-ac','2','-movflags','+faststart',p)
        with self.assertRaisesRegex(Hold,'MATERIAL_VISUAL_DIFFERENCE_AT_PHONE_WIDTH'):
            self.run_pair(phone=p)
    def test_no_real_iphone_claim_when_all_thresholds_pass(self):
        v=self.run_pair()
        self.assertFalse(v['realIPhonePlaybackVerified']);self.assertFalse(v['mayPublish'])

if __name__=='__main__': unittest.main(verbosity=2)
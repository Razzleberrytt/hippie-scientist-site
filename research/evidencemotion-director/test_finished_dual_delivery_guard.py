"""Physical FFmpeg 1080/720 source-bundle consistency and false-approval negatives."""
import hashlib
import json
import subprocess
import tempfile
import unittest
import zipfile
from pathlib import Path
from finished_dual_delivery_guard import inspect, sha_file

class DualDeliveryTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp=tempfile.TemporaryDirectory()
        cls.root=Path(cls.temp.name)
        cls.master=cls.root/'THS_Phenibut_EvidenceMotion_CLEAN_V4.mp4'
        cls.mobile=cls.root/'THS_Phenibut_CLEAN_V4_iPhone.mp4'
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                        '-f','lavfi','-i','color=c=blue:size=1080x1920:rate=30:duration=1.2',
                        '-f','lavfi','-i','sine=frequency=440:sample_rate=48000:duration=1.2',
                        '-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','ultrafast',
                        '-pix_fmt','yuv420p','-c:a','aac','-ar','48000',
                        '-y',str(cls.master)],check=True,timeout=30)
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                        '-i',str(cls.master),'-map','0:v:0','-map','0:a:0',
                        '-vf','scale=720:1280','-c:v','libx264','-preset','ultrafast',
                        '-pix_fmt','yuv420p','-c:a','aac','-ar','44100',
                        '-y',str(cls.mobile)],check=True,timeout=30)
        cls.qa={'schema':'ths.phenibut.physical_layout_patch.v1','mayPublish':False,
                'videoSHA256':sha_file(cls.master),'mobileSHA256':sha_file(cls.mobile),
                'frames':36,'fps':30,'canvas':[1080,1920],'sourceWavSHA256':'a'*64}
        cls.voice={'schema':'ths.phenibut.original_voice.r1','wav_sha256':'a'*64,
                   'master_name':'Phenibut_ORIGINAL_KOKORO.wav','mayPublish':False}

    @classmethod
    def tearDownClass(cls): cls.temp.cleanup()

    def package(self, qa=None, voice=None, deletions=(), additions=None, mobile_override=None):
        names={
         'THS_Phenibut_EvidenceMotion_CLEAN_V4.mp4':self.master.read_bytes(),
         'THS_Phenibut_CLEAN_V4_iPhone.mp4':(mobile_override or self.mobile).read_bytes(),
         'LAYOUT_AND_ENCODED_QA.json':json.dumps(qa or self.qa).encode(),
         'ORIGINAL_VOICE_PROVENANCE.json':json.dumps(voice or self.voice).encode(),
         'Phenibut_REAL_MFA_WORD_CAPTIONS.srt':b'1\n00:00:00,100 --> 00:00:00,800\nHello there\n',
         'REPRODUCIBLE_SOURCE/fix_phenibut_visuals.py':b'print("research")',
         'REPRODUCIBLE_SOURCE/build_phenibut_evidencemotion.py':b'print("source")',
        }
        for name in deletions: names.pop(name,None)
        names.update(additions or {})
        f=self.root/('bundle-'+str(len(list(self.root.glob('bundle-*.zip'))))+'.zip')
        with zipfile.ZipFile(f,'w',zipfile.ZIP_DEFLATED) as z:
            for n,body in names.items():z.writestr(n,body)
        return f

    def check(self, archive, archive_sha=None, master=None, master_sha=None,
              mobile=None, mobile_sha=None):
        master=master or self.master
        mobile=mobile or self.mobile
        return inspect(archive=archive,archive_sha=archive_sha or sha_file(archive),
             master=master,master_sha=master_sha or sha_file(master),
             mobile=mobile,mobile_sha=mobile_sha or sha_file(mobile))

    def test_identical_truncated_audio_on_both_deliveries_is_not_full_film_coverage(self):
        short_master, short_mobile = self.root/'short-master.mp4', self.root/'short-mobile.mp4'
        subprocess.run(['ffmpeg','-v','error','-i',str(self.master),
                        '-map','0:v:0','-map','0:a:0','-c:v','copy',
                        '-af','atrim=duration=0.15','-c:a','aac',
                        '-y',str(short_master)],check=True,timeout=30)
        subprocess.run(['ffmpeg','-v','error','-i',str(short_master),
                        '-map','0:v:0','-map','0:a:0','-vf','scale=720:1280',
                        '-c:v','libx264','-preset','ultrafast','-c:a','copy',
                        '-y',str(short_mobile)],check=True,timeout=30)
        qa={**self.qa,'videoSHA256':sha_file(short_master),
            'mobileSHA256':sha_file(short_mobile)}
        archive=self.package(qa=qa,mobile_override=short_mobile,
            additions={'THS_Phenibut_EvidenceMotion_CLEAN_V4.mp4':short_master.read_bytes()})
        with self.assertRaisesRegex(ValueError,'AUDIO_TRACK_DOES_NOT_COVER_VIDEO'):
            self.check(archive,master=short_master,mobile=short_mobile)

    def test_physical_both_full_movies_verify_but_release_never(self):
        result=self.check(self.package())
        self.assertEqual(result['fullVideoFramesEach'],36)
        self.assertTrue(result['identicalPresentedFrameClock'])
        self.assertGreater(result['decodedAudioCosineSimilarity'],.98)
        self.assertFalse(result['currentMasterEncodedCaptionQAPhysicallyVerified'])
        self.assertFalse(result['standaloneOriginalSourceBundleComplete'])
        self.assertFalse(result['mayPublish'])
        self.assertFalse(result['fiveRenderStreakAccepted'])

    def test_forged_archive_film_or_mobile_hash_is_rejected(self):
        b=self.package()
        wrong=hashlib.sha256(b'fake').hexdigest()
        for k in ('archive_sha','master_sha','mobile_sha'):
            with self.subTest(k=k), self.assertRaisesRegex(ValueError,'EXTERNAL_INPUT_SHA_MISMATCH'):
                self.check(b,**{k:wrong})

    def test_wrong_video_metadata_with_correct_archive_hash_rejected(self):
        for key in ('videoSHA256','mobileSHA256','frames'):
            altered={**self.qa,key:'b'*64 if key!='frames' else 999}
            with self.subTest(key=key),self.assertRaisesRegex(
              ValueError,'WRONG_CURRENT_FILM_QA_OR_FALSE_APPROVAL|ACTUAL_MEDIA_GEOMETRY_OR_FRAME_COUNT_DRIFT'):
                self.check(self.package(qa=altered))

    def test_forged_publication_claim_rejected(self):
        with self.assertRaisesRegex(ValueError,'WRONG_CURRENT_FILM_QA_OR_FALSE_APPROVAL'):
            self.check(self.package(qa={**self.qa,'mayPublish':True}))
        with self.assertRaisesRegex(ValueError,'WRONG_CURRENT_FILM_QA_OR_FALSE_APPROVAL'):
            self.check(self.package(voice={**self.voice,'mayPublish':True}))

    def test_current_self_declared_caption_file_does_not_create_independent_pass(self):
        f=self.package(additions={'CURRENT_ENCODED_CAPTION_QA.json':json.dumps({
           'masterSha256':sha_file(self.master),'mobileSha256':sha_file(self.mobile),
           'allFramesReviewed':True,'mayPublish':True}).encode()})
        result=self.check(f)
        self.assertTrue(result['captionQAFilesPresentInPackage'])
        self.assertFalse(result['currentMasterEncodedCaptionQAPhysicallyVerified'])
        self.assertFalse(result['currentMobileEncodedCaptionQAPhysicallyVerified'])
        self.assertFalse(result['mayPublish'])

    def test_different_visuals_even_with_correctly_repinned_package_are_held(self):
        changed=self.root/'visually_changed.mp4'
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                        '-i',str(self.mobile),'-vf','negate', '-c:v','libx264',
                        '-preset','ultrafast','-c:a','copy','-y',str(changed)],check=True,timeout=30)
        forged_qa={**self.qa,'mobileSHA256':sha_file(changed)}
        archive=self.package(qa=forged_qa,mobile_override=changed)
        with self.assertRaisesRegex(ValueError,'DUAL_DISTRIBUTION_VISUAL_DRIFT'):
            self.check(archive,mobile=changed)

    def test_silent_mobile_soundtrack_even_with_correctly_repinned_package_is_held(self):
        silent=self.root/'silent_mobile.mp4'
        subprocess.run(['ffmpeg','-nostdin','-hide_banner','-loglevel','error',
                        '-i',str(self.mobile),'-map','0:v:0','-map','0:a:0',
                        '-c:v','copy','-af','volume=0','-c:a','aac','-ar','44100',
                        '-y',str(silent)],check=True,timeout=30)
        forged_qa={**self.qa,'mobileSHA256':sha_file(silent)}
        archive=self.package(qa=forged_qa,mobile_override=silent)
        with self.assertRaisesRegex(ValueError,'DISTRIBUTION_AUDIO_CORRELATION_TOO_LOW'):
            self.check(archive,mobile=silent)

    def test_missing_audio_source_or_reproducer_does_not_pass(self):
        f=self.package(deletions=['REPRODUCIBLE_SOURCE/fix_phenibut_visuals.py'])
        with self.assertRaisesRegex(ValueError,'REQUIRED_SOURCE_OR_QA_MEMBERS_MISSING'):
            self.check(f)

    def test_missing_source_voice_and_manifest_always_recorded_as_missing(self):
        result=self.check(self.package())
        self.assertFalse(result['originalVoiceWavPresent'])
        self.assertFalse(result['voiceReceiptPresent'])
        self.assertFalse(result['sceneManifestPresent'])

if __name__=='__main__':unittest.main()

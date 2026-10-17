"""Lane4 720p compatibility guard: real FFmpeg fixtures, no external services."""
import shutil
import subprocess
import sys
import tempfile
import unittest
import json
import math
from unittest.mock import patch
from array import array
from pathlib import Path
from mobile_delivery_guard import audit,Hold,sha_file,audio_compare,screen_local_audio_energy,frame_pts,validate_report_target,require_undistorted_portrait


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
        local=v['decodedAudioComparison']['localAudioEnergyScreen']
        self.assertGreater(local['materialSourceWindowCount'],0)
        self.assertGreaterEqual(local['minimumMobileToSourceWindowEnergyRatio'],.25)
        self.assertIs(local['phonemeIdentityVerified'],False)
        self.assertIs(local['humanAudibilityVerified'],False)
        self.assertNotIn('codecTailExtraNonSpeechVerified',v['decodedAudioComparison'])
        self.assertIs(v['decodedAudioComparison']['codecTailSpeechIdentityVerified'],False)
        for k in ('realIPhonePlaybackVerified','captionOCRVerified','scienceOrSourceReviewApproved','fontReadabilityApproved','mayPublish'):
            self.assertIs(v[k],False)
    def test_skipped_visual_replay_never_returns_positive_receipt(self):
        # A valid, physically encoded pair is not eligible for a positive
        # compatibility report when callers explicitly skip pixel replay.
        with self.assertRaisesRegex(Hold,'FULL_VIDEO_COMPARISON_REQUIRED_FOR_POSITIVE_RECEIPT'):
            self.run_pair(visual=False)

    def test_exact_presented_pts_happy_path(self):
        with patch('mobile_delivery_guard.cmd',return_value=b'0.000000\n0.033333\n0.066667\n'):
            self.assertEqual(frame_pts('source.mp4'),[0.0,0.033333,0.066667])

    def test_nonfinite_actual_frame_pts_rejected(self):
        for bad in (b'nan',b'NaN',b'inf',b'-inf',b'1e999'):
            with self.subTest(pts=bad):
                with patch('mobile_delivery_guard.cmd',return_value=b'0.000000\n'+bad+b'\n'):
                    with self.assertRaisesRegex(Hold,'INVALID_ACTUAL_FRAME_PTS'):
                        frame_pts('source.mp4')

    def test_repeated_reversed_and_negative_actual_pts_rejected(self):
        for raw in (b'0\n0',b'0.066667\n0.033333',
                    b'-0.033333\n0',b'0.000000\n0.0000003'):
            with self.subTest(stamps=raw):
                with patch('mobile_delivery_guard.cmd',return_value=raw+b'\n'):
                    with self.assertRaisesRegex(Hold,'INVALID_ACTUAL_FRAME_PTS'):
                        frame_pts('source.mp4')

    def test_identical_but_non_30fps_timestamps_fail(self):
        # Agreement between source and phone does not prove true CFR30.
        for raw in (b'0\n0.040000\n0.080000\n',
                    b'0.500000\n0.533333\n0.566667\n',
                    b'0.000000\n0.033333\n0.100000\n'):
            with self.subTest(pts=raw):
                with patch('mobile_delivery_guard.cmd',return_value=raw):
                    with self.assertRaisesRegex(Hold,'NON_30FPS_PRESENTATION_TIMESTAMP_GRID'):
                        frame_pts('source.mp4')

    def test_bad_ffprobe_utf8_fails_closed(self):
        with patch('mobile_delivery_guard.cmd',return_value=b'\xff\xfe\xfe'):
            with self.assertRaisesRegex(Hold,'INVALID_ACTUAL_FRAME_PTS'):
                frame_pts('source.mp4')

    def test_empty_actual_pts_rejected(self):
        with patch('mobile_delivery_guard.cmd',return_value=b''):
            with self.assertRaisesRegex(Hold,'INVALID_ACTUAL_FRAME_PTS'):
                frame_pts('source.mp4')

    def test_report_never_aliases_original_or_mobile(self):
        before=(sha_file(self.source),sha_file(self.mobile))
        for source in (self.source,self.mobile):
            with self.subTest(path=source):
                with self.assertRaisesRegex(Hold,'REPORT_OUTPUT_ALIASES_SOURCE_MEDIA'):
                    validate_report_target(source,self.source,self.mobile)
        self.assertEqual(before,(sha_file(self.source),sha_file(self.mobile)))

    def test_report_symlink_to_mobile_is_rejected(self):
        link=self.root/'alias_mobile_output.json'
        try:
            link.symlink_to(self.mobile)
        except (OSError,NotImplementedError):
            self.skipTest('host does not allow symlinks')
        h=sha_file(self.mobile)
        with self.assertRaisesRegex(Hold,'REPORT_OUTPUT_ALIASES_SOURCE_MEDIA'):
            validate_report_target(link,self.source,self.mobile)
        self.assertEqual(sha_file(self.mobile),h)

    def test_report_hardlink_to_original_is_rejected(self):
        link=self.root/'alias_original_output.json'
        try:
            link.hardlink_to(self.source)
        except (OSError,NotImplementedError):
            self.skipTest('host does not allow hard links')
        h=sha_file(self.source)
        with self.assertRaisesRegex(Hold,'REPORT_OUTPUT_ALIASES_SOURCE_MEDIA'):
            validate_report_target(link,self.source,self.mobile)
        self.assertEqual(sha_file(self.source),h)

    def test_unrelated_fresh_report_target_is_allowed(self):
        out=self.root/'new_mobile_research_output.json'
        self.assertFalse(out.exists())
        validate_report_target(out,self.source,self.mobile)
        self.assertFalse(out.exists())  # preflight never creates the report

    def test_real_non_square_phone_sar_is_rejected(self):
        # Physically encode non-square SAR: coded dimensions still 160x284,
        # but display geometry is stretched and must never be accepted.
        phone=self.root/'stretched_sar.mp4'
        ff('-i',self.source,'-vf','scale=160:284,setsar=2/1',
           '-c:v','libx264','-profile:v','baseline','-level:v','3.1',
           '-pix_fmt','yuv420p','-crf','16',
           '-c:a','aac','-b:a','160k','-ar','48000','-ac','2',
           '-movflags','+faststart',phone)
        with self.assertRaisesRegex(Hold,'NON_SQUARE_PIXEL_PORTRAIT'):
            self.run_pair(phone=phone,visual=False)

    def test_source_hash_tamper_rejected(self):
        with self.assertRaisesRegex(Hold,'FILM_SHA256_DOES_NOT_MATCH_PIN'):
            self.run_pair(source_hash='0'*64)
    def test_mobile_hash_tamper_rejected(self):
        with self.assertRaisesRegex(Hold,'FILM_SHA256_DOES_NOT_MATCH_PIN'):
            self.run_pair(phone_hash='0'*64)
    def test_actual_anamorphic_phone_video_rejected(self):
        phone=self.root/'anamorphic_phone.mp4'
        self.mkphone(phone,'-aspect','3:2')
        with self.assertRaisesRegex(Hold,'NON_SQUARE_PIXEL_PORTRAIT'):
            self.run_pair(phone=phone,visual=False)

    def test_rotated_display_matrix_and_nan_angle_rejected(self):
        base={'sample_aspect_ratio':'1:1','display_aspect_ratio':'9:16'}
        require_undistorted_portrait(base,(1080,1920))
        for angle in ('90','-90','nan','inf','invalid'):
            with self.subTest(angle=angle):
                probe=dict(base,side_data_list=[{'rotation':angle}])
                with self.assertRaisesRegex(Hold,
                        'ROTATED_DISPLAY_METADATA_NOT_ALLOWED|INVALID_DISPLAY_ROTATION_METADATA'):
                    require_undistorted_portrait(probe,(1080,1920))
        with self.assertRaisesRegex(Hold,'ROTATED_DISPLAY_METADATA_NOT_ALLOWED'):
            require_undistorted_portrait(dict(base,tags={'rotate':'180'}),(1080,1920))

    def test_reduced_resolution_fixture_preserves_true_ratio(self):
        # 160x284 is 40:71, not exactly 9:16; its sample pixels are
        # square and its declared ratio must match real dimensions.
        require_undistorted_portrait(
            {'sample_aspect_ratio':'1:1','display_aspect_ratio':'40:71'},
            (160,284))
        with self.assertRaisesRegex(Hold,'NON_SQUARE_PIXEL_PORTRAIT'):
            require_undistorted_portrait(
                {'sample_aspect_ratio':'1:1','display_aspect_ratio':'9:16'},
                (160,284))

    def test_missing_pixel_shape_metadata_fails_closed(self):
        with self.assertRaisesRegex(Hold,'NON_SQUARE_PIXEL_PORTRAIT'):
            require_undistorted_portrait({'sample_aspect_ratio':'1:1'},(1080,1920))
        with self.assertRaisesRegex(Hold,'NON_SQUARE_PIXEL_PORTRAIT'):
            require_undistorted_portrait({'display_aspect_ratio':'9:16'},(1080,1920))

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

    def test_main_44k1_aac_valid_under_source_equivalence(self):
        phone=self.root/'main_44k1.mp4'
        self.mkphone(phone,'-profile:v','main','-ar','44100')
        v=self.run_pair(phone=phone)
        self.assertEqual(v['mobileAACSampleRateHz'],44100)
        self.assertEqual(v['h264TargetProfile'],'Main')
        self.assertGreaterEqual(v['decodedAudioComparison']['codecTailDeltaStereoFrames'],0)
        self.assertGreater(v['decodedAudioComparison']['localAudioEnergyScreen']['materialSourceWindowCount'],0)
        self.assertGreaterEqual(v['decodedAudioComparison']['localAudioEnergyScreen']['minimumMobileToSourceWindowEnergyRatio'],.25)
        self.assertIs(v['decodedAudioComparison']['codecTailSpeechIdentityVerified'],False)
        self.assertFalse(v['mayPublish'])
        # No JSON NaN or Infinity from FFmpeg's legitimate identical-frame PSNR.
        json.dumps(v,allow_nan=False)

    def test_main_level_four_not_silently_accepted(self):
        phone=self.root/'main_level4.mp4'
        self.mkphone(phone,'-profile:v','main','-level:v','4.0','-ar','44100')
        with self.assertRaisesRegex(Hold,'PHONE_H264_LEVEL_ABOVE_31'):
            self.run_pair(phone=phone,visual=False)

    def test_extra_aac_tail_more_than_six_ms_fails(self):
        phone=self.root/'long_audio_tail.mp4'
        self.mkphone(phone,'-af','apad=pad_dur=0.03', '-ar','44100','-profile:v','main')
        with self.assertRaisesRegex(Hold,'DECODED_AUDIO_SAMPLE_COUNT_DIFFERENT'):
            self.run_pair(phone=phone,visual=False)

    def test_audible_tail_cannot_be_hidden_by_six_ms_pad(self):
        baseline=array('f',[.01]*8000)
        incoming=array('f',list(baseline)+[.1]*480)
        with patch('mobile_delivery_guard.decoded_audio',side_effect=[baseline,incoming]):
            with self.assertRaisesRegex(Hold,'AUDIBLE_AUDIO_TAIL_MISMATCH'):
                audio_compare('original','reencoded')

    def test_nonfinite_decoded_pcm_never_emits_positive_fidelity(self):
        for corrupt in (float('nan'),float('inf'),float('-inf')):
            for position in ('source_middle','mobile_middle','source_tail','mobile_tail'):
                with self.subTest(corrupt=str(corrupt),position=position):
                    original=array('f',[0.02]*8000)
                    mobile=array('f',[0.02]*8000)
                    selected=original if position.startswith('source') else mobile
                    selected[4000 if position.endswith('middle') else -1]=corrupt
                    with patch('mobile_delivery_guard.decoded_audio',
                               side_effect=[original,mobile]):
                        with self.assertRaisesRegex(Hold,'NONFINITE_DECODED_AUDIO_SAMPLES'):
                            audio_compare('original.mp4','phone.mp4')

    def test_truncated_audible_source_tail_not_exempt(self):
        original=array('f',[.02]*8000)
        cut=array('f',[.02]*7520)
        with patch('mobile_delivery_guard.decoded_audio',side_effect=[original,cut]):
            with self.assertRaisesRegex(Hold,'AUDIBLE_AUDIO_TAIL_MISMATCH'):
                audio_compare('original','short')


    def test_six_ms_source_active_dropout_rejected_even_when_global_snr_would_pass(self):
        # A four-second voiced-like physical PCM sequence with 6ms zeroed can
        # keep global SNR >25dB and correlation >0.995. Segment audit MUST
        # catch the missing high-energy chunk independently of these averages.
        rate=48000; seconds=4
        source=array('f',(0.12*math.sin(2*math.pi*440*(i//2)/rate)
                          for i in range(rate*seconds*2)))
        mobile=array('f',source)
        start=rate*2*2
        for i in range(start,start+int(.006*rate)*2):
            mobile[i]=0.
        full=sum(float(x*x) for x in source)
        error=sum(float((x-y)**2) for x,y in zip(source,mobile))
        self.assertGreater(10*math.log10(full/error),25.)
        with patch('mobile_delivery_guard.decoded_audio',
                   side_effect=[source,mobile]):
            with self.assertRaisesRegex(Hold,'LOCAL_AUDIO_ENERGY_DROPOUT'):
                audio_compare('original','dropped')

    def test_phase_shifted_full_window_dropouts_are_rejected(self):
        # A 120-stereo-frame zero interval starting between fixed bins
        # previously passed because each original 2.5ms bin kept enough
        # energy. Check every phase, including the half-bin bypass.
        source=array('f',[.12]*8000)
        for offset_frames in (15,30,45,60,75,90,105):
            with self.subTest(offset_frames=offset_frames):
                phone=array('f',source)
                start=(240+offset_frames)*2
                for i in range(start,start+120*2):
                    phone[i]=0.
                with self.assertRaisesRegex(Hold,'LOCAL_AUDIO_ENERGY_DROPOUT'):
                    screen_local_audio_energy(source,phone,len(source))
        ok=screen_local_audio_energy(source,array('f',source),len(source))
        self.assertEqual(ok['minimumMobileToSourceWindowEnergyRatio'],1.)
        self.assertEqual(ok['windowStrideMs'],0.625)

    def test_source_silent_intervals_are_not_speech_dropouts(self):
        rate=48000; seconds=4
        source=array('f',(0.12*math.sin(2*math.pi*440*(i//2)/rate)
                          if i < 2*rate*2 else 0.
                          for i in range(rate*seconds*2)))
        target=array('f',source)
        with patch('mobile_delivery_guard.decoded_audio',
                   side_effect=[source,target]):
            receipt=audio_compare('source','mobile')
        screen=receipt['localAudioEnergyScreen']
        self.assertGreater(screen['materialSourceWindowCount'],0)
        self.assertLess(screen['materialSourceWindowCount'],seconds*rate/30)
        self.assertEqual(screen['minimumMobileToSourceWindowEnergyRatio'],1.)
        self.assertFalse(screen['phonemeIdentityVerified'])
        self.assertFalse(receipt['codecTailAmplitudeScreened'])
        self.assertFalse(receipt['codecTailSpeechIdentityVerified'])

    def test_unmeasurably_quiet_master_cannot_fake_local_energy_pass(self):
        # A fully matching but inaudibly low-energy sine can satisfy global
        # SNR and correlation while providing zero source-active windows.
        source=array('f',(0.001*math.sin(2*math.pi*440*(i//2)/48000)
                          for i in range(8000)))
        target=array('f',source)
        with patch('mobile_delivery_guard.decoded_audio',
                   side_effect=[source,target]):
            with self.assertRaisesRegex(
                    Hold,'LOCAL_AUDIO_MATERIAL_SOURCE_ENERGY_NOT_OBSERVED'):
                audio_compare('source','mobile')

if __name__=='__main__': unittest.main(verbosity=2)
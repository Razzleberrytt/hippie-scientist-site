"""Negative contract tests: this runner's mock files are NOT scientific/media proof."""
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

s=importlib.util.spec_from_file_location("native_media_research_gate",Path(__file__).with_name("native_media_research_gate.py"))
m=importlib.util.module_from_spec(s);s.loader.exec_module(m)

def receipt():
    return {"status":"RESEARCH_NOT_FINAL","nativeCanvas":True,
            "mayPublish":False,"ownerApproved":False,"scienceApproved":False,
            "craftApproved":False,"voiceAuditioned":False,"phonePlaybackApproved":False,
            "resolution":[1080,1920],"fps":30,"frames":1031,"fullFilm":True,
            "sourceInchiKey":m.INCHIKEY,"sourceWavSha256":m.WAV_SHA,
            "reviewVideoSha256":m.MASTER_SHA,
            "note":"lower-resolution source-verified computed 3D illustration in a labeled inset"}

def fake_audit(technical="PASS",audio=None,problems=None):
    return {"technical":technical,"problems":problems or [],
            "frameTimingVerified":technical=="PASS",
            "fullDecodePerformed":technical=="PASS",
            "audioAdtsSha256":audio or m.AAC_ADTS_SHA}

class NativeMediaReviewTests(unittest.TestCase):
    def test_synthetic_good_receipt_is_not_an_owner_approval(self):
        a=m.validate_receipt(receipt())
        self.assertFalse(a["mayPublish"])
        self.assertTrue(a["requiresActualTimestampAndAdtsDecode"])
    def test_caller_cannot_swap_master_by_repinning_own_receipt(self):
        r=receipt();r["reviewVideoSha256"]="a"*64
        with self.assertRaisesRegex(ValueError,"UNREVIEWED_NEW_MASTER_SHA"):
            m.validate_receipt(r)
    def test_original_voice_and_chemical_source_must_match(self):
        for key,wrong in [("sourceWavSha256","b"*64),("sourceInchiKey","WRONG")]:
            r=receipt();r[key]=wrong
            with self.assertRaisesRegex(ValueError,"PINNED_SCIENCE_OR_VOICE_IDENTITY_DRIFT"):
                m.validate_receipt(r)
    def test_approval_bypass_never_allowed(self):
        for flag in ("mayPublish","ownerApproved","scienceApproved","craftApproved",
                     "voiceAuditioned","phonePlaybackApproved"):
            r=receipt();r[flag]=True
            with self.subTest(flag=flag),self.assertRaisesRegex(ValueError,"NO_SELF_APPROVAL"):
                m.validate_receipt(r)
    def test_no_claim_of_native_3d_from_lower_res_inset(self):
        r=receipt();r["note"]="All source pixels native"
        with self.assertRaisesRegex(ValueError,"COMPUTED_3D_INSET_DISCLOSURE_REQUIRED"):
            m.validate_receipt(r)
    def test_fake_native_frame_count_is_rejected(self):
        r=receipt();r["frames"]=1000
        with self.assertRaisesRegex(ValueError,"EXPECTED_NATIVE_FILM_BOUNDS"):
            m.validate_receipt(r)
    def test_mismatched_pcm_bytes_fail_before_any_media_decode(self):
        with tempfile.TemporaryDirectory() as tmp:
            rp=Path(tmp)/"receipt.json";rp.write_text(json.dumps(receipt()))
            with patch.object(m,"digest",return_value="0"*64),patch.object(m,"strict_native_master_verify") as strict:
                with self.assertRaisesRegex(ValueError,"WRONG_LOCKED_ORIGINAL_PCM"):
                    m.audit("video.mp4","voice.wav",rp)
                strict.assert_not_called()
    def test_exact_existing_strict_gate_rejects_variable_frame_timing(self):
        with tempfile.TemporaryDirectory() as tmp:
            rp=Path(tmp)/"receipt.json";rp.write_text(json.dumps(receipt()))
            with patch.object(m,"digest",side_effect=[m.WAV_SHA,m.MASTER_SHA]),patch.object(m,"strict_native_master_verify",return_value=fake_audit("HOLD",problems=["NONCONSTANT_VIDEO_FRAME_TIMING"])) as strict:
                with self.assertRaisesRegex(ValueError,"EXISTING_STRICT_NATIVE_AUDIT_REJECTED_NONCONSTANT_VIDEO_FRAME_TIMING"):
                    m.audit("video.mp4","voice.wav",rp)
                strict.assert_called_once()
                self.assertTrue(strict.call_args.kwargs["decode_all"])
    def test_audio_aac_is_immutably_pinned_outside_receipt(self):
        with tempfile.TemporaryDirectory() as tmp:
            rp=Path(tmp)/"receipt.json";rp.write_text(json.dumps(receipt()))
            with patch.object(m,"digest",side_effect=[m.WAV_SHA,m.MASTER_SHA]),patch.object(m,"strict_native_master_verify",return_value=fake_audit(audio="f"*64)):
                with self.assertRaisesRegex(ValueError,"PINNED_AAC_NARRATION_CHANGED"):
                    m.audit("video.mp4","voice.wav",rp)
    def test_pass_still_ineligible_for_publishing_or_craft(self):
        with tempfile.TemporaryDirectory() as tmp:
            rp=Path(tmp)/"receipt.json";rp.write_text(json.dumps(receipt()))
            with patch.object(m,"digest",side_effect=[m.WAV_SHA,m.MASTER_SHA]),patch.object(m,"strict_native_master_verify",return_value=fake_audit()) as strict:
                result=m.audit("video.mp4","voice.wav",rp)
                self.assertFalse(result["mayPublish"])
                self.assertFalse(result["craftApproved"])
                self.assertEqual(result["wordLevelAcousticAlignment"],"NOT_PROVEN")
                self.assertEqual(strict.call_args.args[3],m.AAC_ADTS_SHA)

if __name__=="__main__":unittest.main()

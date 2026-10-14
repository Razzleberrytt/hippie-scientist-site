"""Fail-closed native media research gates; synthetic fixtures are NOT review proof."""
import copy
import importlib.util
import tempfile
import unittest
from pathlib import Path

s=importlib.util.spec_from_file_location("native_media_research_gate",
    Path(__file__).with_name("native_media_research_gate.py"))
m=importlib.util.module_from_spec(s)
s.loader.exec_module(m)
def good_receipt():
    return {"status":"RESEARCH_NOT_FINAL","nativeCanvas":True,
            "ownerApproved":False,"voiceAuditioned":False,"scienceApproved":False,
            "craftApproved":False,"phonePlaybackApproved":False,"mayPublish":False,
            "resolution":[1080,1920],"fps":30,"frames":1031,"fullFilm":True,
            "sourceWavSha256":m.ORIGINAL_WAV,"sourceInchiKey":m.INCHIKEY,
            "note":"The computed 3D is a lower-resolution source-verified inset, not native render",
            "reviewVideoSha256":"a"*64}
def good_probe():
    return {"streams":[
        {"codec_type":"video","codec_name":"h264","width":1080,"height":1920,
         "avg_frame_rate":"30/1","nb_read_frames":"1031","duration":"34.366667"},
        {"codec_type":"audio","codec_name":"aac","duration":"34.319"}],
        "format":{"duration":"34.366667"}}
class NativeResearchMediaContract(unittest.TestCase):
    def test_receipt_is_inert_not_an_owner_approval(self):
        self.assertFalse(m.validate_receipt(good_receipt())["publishAllowed"])
        self.assertFalse(m.validate_probe(good_probe())["mayPublish"])
    def test_bypass_of_any_approval_is_rejected(self):
        for flag in ("ownerApproved","voiceAuditioned","scienceApproved",
                     "craftApproved","phonePlaybackApproved","mayPublish"):
            r=good_receipt();r[flag]=True
            with self.subTest(flag=flag),self.assertRaisesRegex(ValueError,"NO_SELF_APPROVAL"):
                m.validate_receipt(r)
    def test_reject_wrong_voice_hash(self):
        r=good_receipt();r["sourceWavSha256"]="0"*64
        with self.assertRaisesRegex(ValueError,"PINNED_SOURCE_IDENTITY_CHANGED"):
            m.validate_receipt(r)
    def test_reject_fake_native_upscaled_claim(self):
        r=good_receipt();r["nativeCanvas"]=False
        with self.assertRaisesRegex(ValueError,"NATIVE_CANVAS_PROVENANCE_REQUIRED"):
            m.validate_receipt(r)
    def test_reject_low_resolution_movie(self):
        p=good_probe();p["streams"][0]["width"]=540
        with self.assertRaisesRegex(ValueError,"NOT_NATIVE_HD_H264_ENCODE"):
            m.validate_probe(p)
    def test_reject_truncated_video(self):
        p=good_probe();p["streams"][0]["nb_read_frames"]="1000"
        with self.assertRaisesRegex(ValueError,"WRONG_FRAME_GRID_OR_TRUNCATED_FILM"):
            m.validate_probe(p)
    def test_reject_clipped_aac(self):
        p=good_probe();p["streams"][1]["duration"]="30.0"
        with self.assertRaisesRegex(ValueError,"AUDIO_TOO_SHORT_OR_OVERLONG"):
            m.validate_probe(p)
    def test_reject_unexpected_voice_stream_and_wrong_audio_codec(self):
        p=good_probe();p["streams"].append({"codec_type":"audio","codec_name":"aac"})
        with self.assertRaisesRegex(ValueError,"EXACTLY_ONE_VIDEO_AND_AUDIO_STREAM"):
            m.validate_probe(p)
        p=good_probe();p["streams"][1]["codec_name"]="mp3"
        with self.assertRaisesRegex(ValueError,"LOCKED_AAC_MASTER_REQUIRED"):
            m.validate_probe(p)
    def test_computed_low_res_inset_cannot_be_disguised_as_native_3d(self):
        r=good_receipt();r["note"]="ALL NATIVE 3D"
        with self.assertRaisesRegex(ValueError,"LOW_RES_COMPUTED_INSET_DISCLOSURE_REQUIRED"):
            m.validate_receipt(r)
    def test_invalid_review_sha_rejected(self):
        r=good_receipt();r["reviewVideoSha256"]="not-a-sha"
        with self.assertRaisesRegex(ValueError,"EXACT_REVIEW_VIDEO_SHA_REQUIRED"):
            m.validate_receipt(r)
    def test_real_bytes_override_clean_metadata(self):
        with tempfile.TemporaryDirectory() as temp:
            source=Path(temp)/"data";source.write_bytes(b"intentional source drift")
            self.assertNotEqual(m.digest(source),good_receipt()["reviewVideoSha256"])

if __name__=="__main__":unittest.main()

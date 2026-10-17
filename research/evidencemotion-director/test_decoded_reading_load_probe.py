"""Physical FFmpeg/H.264 + Tesseract adversarial EM-034 research regressions."""
import copy
import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from decoded_reading_load_probe import SCHEMA, digest, inspect

class DecodedReadingLoadTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        cls.film = cls.root / "actual-encoded.mp4"
        if not shutil.which("ffmpeg") or not shutil.which("ffprobe") or not shutil.which("tesseract"):
            raise RuntimeError("PHYSICAL_TEST_DEPENDENCIES_MISSING_NO_FALSE_PASS")
        font = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        if not Path(font).exists():
            raise RuntimeError("PINNED_TEST_FONT_MISSING_NO_FALSE_PASS")
        filt = (f"drawtext=fontfile={font}:text='STRUCTURE NOT EFFECTS':"
                "fontcolor=white:fontsize=56:x=100:y=780:enable='lt(n,30)',"
                f"drawtext=fontfile={font}:text='SOURCE 2040 VERIFIED':"
                "fontcolor=white:fontsize=56:x=100:y=780:enable='gte(n,30)'")
        subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error", "-f","lavfi",
                        "-i","color=c=black:s=1080x1920:r=30:d=2", "-vf",filt,
                        "-c:v","libx264","-preset","ultrafast","-crf","22","-pix_fmt","yuv420p",
                        "-y",str(cls.film)], check=True,timeout=45)
        cls.manifest_data = {"schema":SCHEMA,"status":"RESEARCH_ONLY","mayPublish":False,
                  "filmSha256":digest(cls.film),"scenes":[
                   {"id":"science","startFrame":0,"endFrameExclusive":30,
                    "cropPx":[50,700,980,250],"requiredTokens":["STRUCTURE","NOT","EFFECTS"]},
                   {"id":"citation","startFrame":30,"endFrameExclusive":60,
                    "cropPx":[50,700,980,250],"requiredTokens":["SOURCE","2040","VERIFIED"]}]}

    @classmethod
    def tearDownClass(cls):
        cls.temp.cleanup()

    def run_guard(self, data=None, *, output=None):
        manifest=self.root/"test-manifest.json"
        manifest.write_text(json.dumps(self.manifest_data if data is None else data))
        return inspect(self.film,manifest,output or self.root/"report.json")

    def test_actual_60_frame_h264_three_distinct_samples_per_scene(self):
        result=self.run_guard()
        self.assertEqual(result["physicalCropsChecked"],6)
        self.assertEqual(result["nativeDecodedFrames"],60)
        self.assertEqual([r["frameIndex"] for r in result["observations"]],
                         [7,15,22,37,45,52])
        self.assertFalse(result["everyFrameIndependentlyTextAudited"])
        self.assertFalse(result["mayPublish"])

    def test_critical_word_must_appear_in_actual_scene_not_next_scene(self):
        data=copy.deepcopy(self.manifest_data)
        data["scenes"][0]["requiredTokens"]= ["SOURCE"]
        with self.assertRaisesRegex(ValueError,"REQUIRED_WORD_NOT_IN_SAME_DECODED_CROP"):
            self.run_guard(data)

    def test_false_science_word_is_not_promoted_from_source_manifest(self):
        data=copy.deepcopy(self.manifest_data)
        data["scenes"][1]["requiredTokens"]=["TREATMENT"]
        with self.assertRaisesRegex(ValueError,"REQUIRED_WORD_NOT_IN_SAME_DECODED_CROP"):
            self.run_guard(data)

    def test_mutated_film_identity_rejected(self):
        data=copy.deepcopy(self.manifest_data)
        data["filmSha256"]="0"*64
        with self.assertRaisesRegex(ValueError,"EXACT_ENCODED_FILM_SHA_MISMATCH"):
            self.run_guard(data)

    def test_gap_in_declared_scene_coverage_rejected(self):
        data=copy.deepcopy(self.manifest_data)
        data["scenes"][1]["startFrame"]=31
        with self.assertRaisesRegex(ValueError,"NONCONTIGUOUS_OR_TOO_SHORT_SCENE"):
            self.run_guard(data)

    def test_manifest_cannot_claim_approved_phone_or_publish(self):
        data=copy.deepcopy(self.manifest_data)
        data["realHandsetApproved"]=True
        with self.assertRaisesRegex(ValueError,"RESEARCH_ONLY_EXACT_MANIFEST_REQUIRED"):
            self.run_guard(data)

    def test_duplicate_manifest_keys_fail_closed(self):
        path=self.root/"duplicate.json"
        s=json.dumps(self.manifest_data)
        path.write_text(s.replace('"mayPublish": false', '"mayPublish": true, "mayPublish": false'))
        with self.assertRaisesRegex(ValueError,"DUPLICATE_MANIFEST_KEY"):
            inspect(self.film,path,self.root/"report.json")

    def test_output_must_not_overwrite_original_film(self):
        before=digest(self.film)
        with self.assertRaisesRegex(ValueError,"OUTPUT_ALIASES_SOURCE"):
            self.run_guard(output=self.film)
        self.assertEqual(digest(self.film),before)

    def test_new_failure_clears_stale_previous_positive_receipt(self):
        path=self.root/"stale-report.json"
        self.run_guard(output=path)
        self.assertTrue(path.exists())
        data=copy.deepcopy(self.manifest_data)
        data["scenes"][0]["requiredTokens"]=["NEVER"]
        with self.assertRaisesRegex(ValueError,"REQUIRED_WORD_NOT_IN_SAME_DECODED_CROP"):
            self.run_guard(data,output=path)
        self.assertFalse(path.exists())

    def test_output_symlink_to_source_rejected(self):
        path=self.root/"alias.json"
        path.unlink(missing_ok=True)
        path.symlink_to(self.film)
        with self.assertRaisesRegex(ValueError,"OUTPUT_ALIASES_SOURCE"):
            self.run_guard(output=path)

    def test_physically_encoded_overcrowded_text_is_rejected(self):
        crowded=self.root/"crowded.mp4"
        font="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        one="ONE TWO THREE FOUR FIVE SIX SEVEN EIGHT"
        two="NINE TEN ELEVEN TWELVE THIRTEEN FOURTEEN FIFTEEN SIXTEEN"
        filt=(f"drawtext=fontfile={font}:text='{one}':fontcolor=white:"
              "fontsize=35:x=10:y=780,"
              f"drawtext=fontfile={font}:text='{two}':fontcolor=white:"
              "fontsize=35:x=10:y=840")
        subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error",
                        "-f","lavfi","-i","color=c=black:s=1080x1920:r=30:d=2",
                        "-vf",filt,"-c:v","libx264","-preset","ultrafast",
                        "-crf","22","-pix_fmt","yuv420p","-y",str(crowded)],
                       check=True,timeout=45)
        data=copy.deepcopy(self.manifest_data)
        data["filmSha256"]=digest(crowded)
        data["scenes"][0]["requiredTokens"]=["ONE"]
        data["scenes"][1]["requiredTokens"]=["ONE"]
        for scene in data["scenes"]:
            scene["cropPx"]=[0,700,1080,250]
        manifest=self.root/"crowded.json"
        manifest.write_text(json.dumps(data))
        with self.assertRaisesRegex(ValueError,"SAMPLED_VISIBLE_TEXT_OVERLOAD"):
            inspect(crowded,manifest,self.root/"crowded-report.json")

if __name__=="__main__":
    unittest.main()

"""Physical FFmpeg/H.264 + Tesseract adversarial EM-034 research regressions."""
import copy
import json
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path
from decoded_reading_load_probe import SCHEMA, digest, inspect, verify_native_frame_timestamps

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
        self.assertTrue(result["nativeFrameTimestampIntegrityVerified"])
        self.assertTrue(result["everyFrameIndependentlyTimestampChecked"])
        self.assertEqual(result["firstDecodedFramePtsSec"],0)
        self.assertAlmostEqual(result["lastDecodedFramePtsSec"],59/30,places=5)
        self.assertEqual([r["frameIndex"] for r in result["observations"]],
                         [7,15,22,37,45,52])
        self.assertFalse(result["everyFrameIndependentlyTextAudited"])
        self.assertFalse(result["mayPublish"])

    def test_nominal_30fps_h264_with_dropped_presentation_times_holds(self):
        # Real encoded negative: nominal r_frame_rate stays 30/1 while
        # physical video presentation times contain a 100 ms jump.
        vfr=self.root/"nominal-30-with-pts-gap.mp4"
        vf=r"setpts=if(eq(N\,15)\,PTS+0.1/TB\,PTS)"
        subprocess.run(["ffmpeg","-nostdin","-hide_banner","-loglevel","error",
                        "-i",str(self.film),"-vf",vf,"-fps_mode","vfr",
                        "-c:v","libx264","-preset","ultrafast","-crf","22",
                        "-pix_fmt","yuv420p","-y",str(vfr)],
                       check=True,timeout=45)
        probe=json.loads(subprocess.check_output([
            "ffprobe","-v","error","-select_streams","v:0",
            "-count_frames","-show_entries",
            "stream=r_frame_rate,nb_read_frames","-of","json",str(vfr)
        ]))["streams"][0]
        self.assertEqual(probe["r_frame_rate"],"30/1")
        data=copy.deepcopy(self.manifest_data)
        data["filmSha256"]=digest(vfr)
        data["scenes"]=[{"id":"nominal-gap","startFrame":0,
                         "endFrameExclusive":int(probe["nb_read_frames"]),
                         "cropPx":[50,700,980,250],
                         "requiredTokens":["STRUCTURE"]}]
        manifest=self.root/"nominal-gap-manifest.json"
        manifest.write_text(json.dumps(data))
        report=self.root/"nominal-gap-report.json"
        with self.assertRaisesRegex(ValueError,"NATIVE_FRAME_PTS_NOT_30FPS_CFR"):
            inspect(vfr,manifest,report)
        self.assertFalse(report.exists())

    def test_missing_raw_pts_holds_even_if_best_effort_is_perfect(self):
        # Simulate an actual ffprobe metadata omission at one decoded frame.
        # The DTS-derived best-effort timeline is deliberately still valid.
        timeline=[{"pts_time":str(n/30), "best_effort_timestamp_time":str(n/30)}
                  for n in range(60)]
        timeline[9].pop("pts_time")
        with patch("decoded_reading_load_probe.run",
                   return_value=json.dumps({"frames":timeline})):
            with self.assertRaisesRegex(ValueError,"NATIVE_FRAME_RAW_PTS_MISSING:9"):
                verify_native_frame_timestamps(self.film,60)

    def test_raw_pts_jump_holds_even_if_best_effort_is_regular(self):
        timeline=[{"pts_time":str(n/30), "best_effort_timestamp_time":str(n/30)}
                  for n in range(60)]
        timeline[9]["pts_time"]=str(9/30 + 0.1)
        with patch("decoded_reading_load_probe.run",
                   return_value=json.dumps({"frames":timeline})):
            with self.assertRaisesRegex(ValueError,"NATIVE_FRAME_PTS_NOT_30FPS_CFR:9"):
                verify_native_frame_timestamps(self.film,60)

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

    def test_unrelated_existing_output_is_preserved_not_deleted(self):
        output=self.root/"unrelated-report.json"
        output.write_text('{"unrelated":"critical data"}')
        before=output.read_bytes()
        with self.assertRaisesRegex(ValueError,"EXISTING_OUTPUT_NOT_OWNED_RECEIPT"):
            self.run_guard(output=output)
        self.assertEqual(output.read_bytes(),before)

    def test_manually_forged_prior_receipt_not_deleted(self):
        output=self.root/"fake-approved.json"
        output.write_text(json.dumps({"schema":SCHEMA,
            "status":"SAMPLED_NEGATIVE_SCREEN_NO_HOLD_REVIEW_REQUIRED",
            "mayPublish":True,"filmSha256":"0"*64,"manifestSha256":"0"*64}))
        before=output.read_bytes()
        with self.assertRaisesRegex(ValueError,"EXISTING_OUTPUT_NOT_OWNED_RECEIPT"):
            self.run_guard(output=output)
        self.assertEqual(output.read_bytes(),before)

    def test_manifest_root_array_holds_not_python_attribute_error(self):
        with self.assertRaisesRegex(ValueError,"INVALID_OR_CHANGED_RESEARCH_MANIFEST"):
            self.run_guard(data=["invalid"])

    def test_movie_modification_detected_between_hash_and_last_frame(self):
        from decoded_reading_load_probe import digest as actual_digest
        count={"film":0}
        def moving_source(path):
            value=actual_digest(path)
            if Path(path)==self.film:
                count["film"]+=1
                if count["film"]>1:
                    return "f"*64
            return value
        with patch("decoded_reading_load_probe.digest",side_effect=moving_source):
            with self.assertRaisesRegex(ValueError,"ENCODED_INPUT_CHANGED_DURING_AUDIT"):
                self.run_guard(output=self.root/"input-drift-report.json")
        self.assertFalse((self.root/"input-drift-report.json").exists())

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

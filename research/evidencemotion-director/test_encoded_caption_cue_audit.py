"""Fault-injectable tests for pixel-only, source-locked critical caption cues."""
import unittest
from encoded_caption_cue_audit import (
    TARGETS,REVEALS,recognized,evaluate_ocr_rows,
    exact_frame_timestamp,ensure_frozen_scenes,cue_lookup,verify_source_record_pixels)
from autonomous_script_asr_research import LINES


class ActualEncodedCaptionTests(unittest.TestCase):
    def test_caption_layout_uses_actual_ink_for_single_and_wrapped_lines(self):
        import tempfile
        from pathlib import Path
        from PIL import Image,ImageDraw
        from encoded_caption_cue_audit import caption_pixel_layout
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'decoded.png'
            for lines,expected_mode in ((1,7),(2,6)):
                image=Image.new('RGB',(1800,560),(13,35,44))
                draw=ImageDraw.Draw(image)
                for line in range(lines):
                    draw.text((100,40+line*100),'visible caption glyphs',fill='white')
                image.save(p)
                layout=caption_pixel_layout(p)
                self.assertEqual(layout['detectedInkLines'],lines)
                self.assertEqual(layout['pageSegmentation'],expected_mode)

    def test_blank_pixels_remain_blank_after_uniform_ocr_mask(self):
        import tempfile
        from pathlib import Path
        from PIL import Image
        from unittest.mock import patch
        from encoded_caption_cue_audit import ocr_caption_crop
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'blank.png'
            Image.new('RGB',(1800,560),(13,35,44)).save(p)
            def inspect_mask(mask,*,psm):
                with Image.open(mask) as image:
                    self.assertEqual(image.convert('L').getextrema(),(255,255))
                return ''
            with patch('encoded_caption_cue_audit.ocr_image',side_effect=inspect_mask):
                text,layout=ocr_caption_crop(p)
            self.assertEqual(text,'')
            self.assertEqual(layout['detectedInkLines'],0)
            self.assertFalse(recognized(text,'not'))
            self.assertFalse(recognized(text,'hydroxyl'))

    def test_wrong_caption_geometry_and_unsupported_ocr_mode_fail_closed(self):
        import tempfile
        from pathlib import Path
        from PIL import Image
        from encoded_caption_cue_audit import caption_pixel_layout
        from actual_pixel_text_recovery import ocr_image
        with tempfile.TemporaryDirectory() as td:
            p=Path(td)/'wrong.png';Image.new('RGB',(50,50)).save(p)
            with self.assertRaisesRegex(ValueError,'CROP_GEOMETRY'):
                caption_pixel_layout(p)
            for mode in (True,7.0,'7',0,13):
                with self.assertRaisesRegex(ValueError,'UNSUPPORTED_OCR_PAGE_SEGMENTATION'):
                    ocr_image(p,psm=mode)

    def test_critical_words_are_selected_from_real_frozen_script(self):
        ids=["sentence_1","sentence_2","sentence_3","sentence_4",
             "sentence_5","source_hold","sentence_6"]
        scenes=[]
        lines=[*LINES[:5],"",LINES[5]]
        for idx,(sid,line) in enumerate(zip(ids,lines)):
            cues=[{"text":w,"startSec":idx*5+.05+i*.11,
                   "endSec":idx*5+.14+i*.11}
                  for i,w in enumerate(line.split())]
            scenes.append({"id":sid,"line":line,"captionWords":cues})
        # Exercise real renderer convention: the silent PubChem card has no
        # captionWords property at all, while every spoken scene is locked.
        scenes[5].pop("captionWords")
        exact=ensure_frozen_scenes({"scenes":scenes})
        self.assertEqual(exact["source_hold"]["line"],"")
        invalid=[dict(item) for item in scenes]
        invalid[0].pop("captionWords")
        with self.assertRaisesRegex(ValueError,"ORIGINAL_WORD_CUE_DRIFT"):
            ensure_frozen_scenes({"scenes":invalid})
        for scene,term in set(TARGETS)|set(REVEALS):
            cue=cue_lookup(exact,scene,term)
            self.assertEqual(cue["text"].casefold().strip(".,!?"),term)

    def test_recovered_protected_terms_must_come_from_actual_ocr(self):
        rows=[{"scene":s,"term":w,"phase":"during","ocrText":"visible "+w}
              for s,w in TARGETS]
        rows.extend({"scene":s,"term":w,"phase":"before",
                     "ocrText":"other unrelated earlier caption"}
                    for s,w in REVEALS)
        self.assertTrue(evaluate_ocr_rows(rows,TARGETS,REVEALS))
        deleted=[dict(x) for x in rows]
        deleted[0]["ocrText"]="garbled unreadable ink"
        with self.assertRaisesRegex(ValueError,"CRITICAL_WORD_NOT_READABLE"):
            evaluate_ocr_rows(deleted,TARGETS,REVEALS)
        spoiled=[dict(x) for x in rows]
        spoiled[-1]["ocrText"]="not what its effects"
        with self.assertRaisesRegex(ValueError,"PREMATURE_PROTECTED_WORD"):
            evaluate_ocr_rows(spoiled,TARGETS,REVEALS)

    def test_source_cid_mapping_requires_correct_encoded_ocr_lines(self):
        good=("SOURCE\nMitragynine * CID 3034396\nPubChem\n"
              "7-OH * CID 44301524\nCID = compound record number")
        wrong=good.replace("3034396","other")
        unpaired=good.replace("7-OH * CID 44301524","CID 44301524")
        swapped=good.replace("3034396","TEMP").replace("44301524","3034396").replace("TEMP","44301524")
        self.assertTrue(verify_source_record_pixels(good))
        for bad in (wrong,unpaired,swapped,good.replace("compound record number","")):
            with self.assertRaisesRegex(ValueError,"CID_JOIN"):
                verify_source_record_pixels(bad)

    def test_token_boundaries_refuse_partial_false_positives(self):
        self.assertTrue(recognized("Not what its effects","not"))
        self.assertFalse(recognized("notation", "not"))
        self.assertFalse(recognized("undifferent", "different"))
        self.assertFalse(recognized("notion", "not"))
        self.assertTrue(recognized("computed.", "computed"))

    def test_critical_time_lands_inside_acoustic_cue_not_before(self):
        cue={"startSec":1.612,"endSec":1.812}
        t=exact_frame_timestamp(cue)
        self.assertGreaterEqual(t,cue["startSec"])
        self.assertLess(t,cue["endSec"])
        with self.assertRaisesRegex(ValueError,"NO_ENCODED_FRAME"):
            exact_frame_timestamp({"startSec":1.616,"endSec":1.625})

    def test_duplicate_or_missing_rows_do_not_certify_ocr(self):
        positive=[{"scene":s,"term":w,"phase":"during","ocrText":w}
                  for s,w in TARGETS]
        negative=[{"scene":s,"term":w,"phase":"before","ocrText":"other"}
                  for s,w in REVEALS]
        with self.assertRaisesRegex(ValueError,"CRITICAL_SAMPLE_COUNT"):
            evaluate_ocr_rows(positive,TARGETS,REVEALS)
        with self.assertRaisesRegex(ValueError,"DUPLICATED_OCR_SAMPLE"):
            evaluate_ocr_rows(positive+[positive[0],*negative[1:]],TARGETS,REVEALS)


if __name__=="__main__":
    unittest.main()

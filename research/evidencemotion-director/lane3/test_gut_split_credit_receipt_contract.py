"""Portable consistency negative controls; owner video not present on CI runner."""
import copy
import unittest
from gut_split_credit_receipt_contract import (
    CANDIDATE_SHA, SOURCE_SHA, SRT_SHA, AUDIO_ADTS_SHA,
    SCENES, ReceiptHold, validate_split_receipt,
)

VISIBLE_COUNTS = (98, 120, 111, 136, 155, 118)

def report():
    rows = []
    for sid, (lo, hi, number_body_rows, bottom) in enumerate(SCENES, 1):
        for n, f in enumerate(range(lo, hi + 1)):
            visible = n < VISIBLE_COUNTS[sid - 1]
            native_y = (1590 if sid == 6 else 1597) if visible else None
            bodies = [56] * number_body_rows
            if sid == 2 and n == 0:
                bodies[1] = 49
            rows.append({
                "f": f, "scene": sid, "bodyNativeInkRows": bodies,
                "creditNativeInkRows": 52,
                "kineticTopNativeY": native_y,
                "bodyKineticGapPx320": (
                    round((native_y - bottom) * 320 / 1080, 3)
                    if visible else None),
            })
    gaps = [r["bodyKineticGapPx320"] for r in rows
            if r["bodyKineticGapPx320"] is not None]
    return {
        "status": "RESEARCH_NEGATIVE_SCREENS_PASSED_REVIEW_STILL_HOLD",
        "sourceSha256": SOURCE_SHA,
        "candidateSha256": CANDIDATE_SHA,
        "trueNativeFramesDecoded": 845,
        "bodyAndCreditPixelObservations": 2956,
        "minActualNativeInkRows": 49,
        "minPhoneInkPx320": round(49 * 320 / 1080, 3),
        "kineticCaptionFrameSamples": 738,
        "minimumGapToBodyInkPx320": min(gaps),
        "aacPacketTuplesPreserved": 1323,
        "fullAACAdtsSha256": AUDIO_ADTS_SHA,
        "perFrame": rows,
        "mayPublish": False, "newAcceptedAtomicCards": 0,
        "externalCraftAndPhoneReviewApproved": False,
        "independentSourceApproved": False,
    }

class PhysicalReceiptClaimGuards(unittest.TestCase):
    def test_positive_synthetic_receipt_is_still_release_hold(self):
        z = validate_split_receipt(report(), source_srt_sha=SRT_SHA)
        self.assertEqual(z["opticalTextObservations"], 2956)
        self.assertEqual(z["observedKineticFrames"], 738)
        self.assertFalse(z["mayPublish"])
        self.assertTrue(z["realFilmWasNotDecodedByThisContract"])

    def test_wrong_movie_sha_cannot_inherit_valid_frames(self):
        for field in ("sourceSha256", "candidateSha256"):
            d = report()
            d[field] = "0" * 64
            with self.subTest(field=field), self.assertRaises(ReceiptHold):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_wrong_srt_sha_cannot_claim_acoustic_lock(self):
        with self.assertRaisesRegex(ReceiptHold, "FROZEN_WORD"):
            validate_split_receipt(report(), source_srt_sha="0" * 64)

    def test_frame_drop_or_reordering_does_not_succeed(self):
        for kind in ("drop", "swap", "rename"):
            d = report()
            if kind == "drop":
                d["perFrame"].pop(400)
            elif kind == "swap":
                d["perFrame"][4], d["perFrame"][5] = d["perFrame"][5], d["perFrame"][4]
            else:
                d["perFrame"][119]["f"] = 900
            with self.subTest(kind=kind), self.assertRaises(ReceiptHold):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_missing_body_row_cannot_pass_through_mean_glyph_size(self):
        d = report()
        d["perFrame"][119]["bodyNativeInkRows"].pop()
        with self.assertRaisesRegex(ReceiptHold, "HIDDEN_EXPLANATORY_LINE"):
            validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_single_undersized_physical_line_blocks_all_845_frames(self):
        d = report()
        d["perFrame"][200]["creditNativeInkRows"] = 47
        with self.assertRaisesRegex(ReceiptHold, "INK_UNDERSIZED"):
            validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_forged_gap_cannot_hide_caption_crowding(self):
        d = report()
        d["perFrame"][119]["bodyKineticGapPx320"] = 100.
        with self.assertRaisesRegex(ReceiptHold, "CROWDING"):
            validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_kinetic_on_off_cue_cannot_be_changed_silently(self):
        d = report()
        d["perFrame"][150]["kineticTopNativeY"] = None
        d["perFrame"][150]["bodyKineticGapPx320"] = None
        with self.assertRaisesRegex(ReceiptHold, "MISSING_PIXELS_OR_CAPTION_FRAMES"):
            validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_original_complete_aac_and_packet_count_locked(self):
        for field, value in (("fullAACAdtsSha256", "0" * 64), ("aacPacketTuplesPreserved", 1322)):
            d = report()
            d[field] = value
            with self.subTest(field=field), self.assertRaisesRegex(ReceiptHold, "AUDIO"):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_fake_release_or_atomic_progress_denied(self):
        for field, value in (("mayPublish", True), ("newAcceptedAtomicCards", 1)):
            d = report()
            d[field] = value
            with self.subTest(field=field), self.assertRaisesRegex(ReceiptHold, "FALSE_RELEASE"):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_fake_external_reviewer_denied(self):
        for field in ("externalCraftAndPhoneReviewApproved", "independentSourceApproved"):
            d = report()
            d[field] = True
            with self.subTest(field=field), self.assertRaisesRegex(ReceiptHold, "FORGED_EXTERNAL"):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

    def test_golden_status_and_aggregate_must_match_all_frames(self):
        for field, value in (("status", "PUBLISH_APPROVED"),
                             ("bodyAndCreditPixelObservations", 3000),
                             ("minPhoneInkPx320", 20.0),
                             ("minimumGapToBodyInkPx320", 50.0)):
            d = report()
            d[field] = value
            with self.subTest(field=field), self.assertRaises(ReceiptHold):
                validate_split_receipt(d, source_srt_sha=SRT_SHA)

if __name__ == "__main__":
    unittest.main()

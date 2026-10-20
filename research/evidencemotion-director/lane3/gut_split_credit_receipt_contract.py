"""Lane3 actual 845f Gut split-credit optical receipt contract, research HOLD.

Validates consistency of reported independently decoded native-frame observations.
It does NOT decode video, certify semantic words, real devices, craft, or publication.
"""
SOURCE_SHA = "044c1f0573f01d3fe850cbd74f270c90019cc3e37b364a0fa627d56e7ecb39f2"
CANDIDATE_SHA = "198126df23b35a2200ff066af521ebd959f73937c90a031745a0f03c2ada681c"
SRT_SHA = "40622b677cd6db8c493eff55727904c5017c4a3d7803b22d4c361e84a1ff9bee"
AUDIO_ADTS_SHA = "24188032e84974f624093c2193e4216fa2adbea20faebab8ac33770a016c8233"
SCENES = ((0, 118, 2, 1493), (119, 257, 3, 1518), (258, 391, 2, 1485),
          (392, 546, 3, 1514), (547, 717, 2, 1491), (718, 844, 3, 1510))
PIXEL_FLOOR = 14.0
GAP_FLOOR = 12.0
EXPECTED_OBSERVATIONS = 2956
EXPECTED_KINETIC = 738

class ReceiptHold(ValueError):
    pass

def _must(ok, reason):
    if not ok:
        raise ReceiptHold(reason)

def validate_split_receipt(data, *, source_srt_sha):
    _must(isinstance(data, dict), "REPORT_NOT_OBJECT")
    _must(source_srt_sha == SRT_SHA, "FROZEN_WORD_CUES_NOT_VERIFIED")
    _must(data.get("sourceSha256") == SOURCE_SHA and
          data.get("candidateSha256") == CANDIDATE_SHA, "EXACT_FULL_MOVIE_SHA_NOT_BOUND")
    _must(data.get("mayPublish") is False and data.get("newAcceptedAtomicCards") == 0,
          "FALSE_RELEASE_OR_EARNED_WORKCARDS")
    _must(data.get("externalCraftAndPhoneReviewApproved") is False and
          data.get("independentSourceApproved") is False, "FORGED_EXTERNAL_REVIEW")
    _must(data.get("trueNativeFramesDecoded") == 845 and
          data.get("aacPacketTuplesPreserved") == 1323 and
          data.get("fullAACAdtsSha256") == AUDIO_ADTS_SHA,
          "INCOMPLETE_SOURCE_OR_AUDIO")
    rows = data.get("perFrame")
    _must(isinstance(rows, list) and len(rows) == 845, "NOT_ALL_REAL_FRAMES_REPORTED")
    obs = 0
    kinetic = 0
    smallest = 999
    min_gap = 999.
    for frame, row in enumerate(rows):
        _must(isinstance(row, dict) and row.get("f") == frame, "FRAME_ORDER_TAMPER")
        matching = [(j, s) for j, s in enumerate(SCENES, 1)
                    if s[0] <= frame <= s[1]]
        _must(len(matching) == 1, "FRAME_OUTSIDE_AUTHORED_SCENES")
        sid, scene = matching[0]
        _must(row.get("scene") == sid, "SCENE_ID_TAMPER")
        body = row.get("bodyNativeInkRows")
        credit = row.get("creditNativeInkRows")
        _must(isinstance(body, list) and len(body) == scene[2],
              "HIDDEN_EXPLANATORY_LINE")
        for height in body + [credit]:
            _must(type(height) is int and height >= 48 and
                  height * 320 / 1080 >= PIXEL_FLOOR,
                  "ACTUAL_ENCODED_INK_UNDERSIZED")
            smallest = min(smallest, height)
            obs += 1
        native_y = row.get("kineticTopNativeY")
        gap = row.get("bodyKineticGapPx320")
        if native_y is None:
            _must(gap is None, "OFF_CUE_SPACING_FORGED")
            continue
        _must(type(native_y) is int and 1588 <= native_y < 1798,
              "KINETIC_PIXEL_OUTSIDE_NATIVE_VIEWPORT")
        expected_gap = round((native_y - scene[3]) * 320 / 1080, 3)
        _must(type(gap) in (int, float) and gap == expected_gap and gap >= GAP_FLOOR,
              "KINETIC_CAPTION_BODY_CROWDING")
        kinetic += 1
        min_gap = min(min_gap, gap)
    _must(obs == EXPECTED_OBSERVATIONS and kinetic == EXPECTED_KINETIC,
          "MISSING_PIXELS_OR_CAPTION_FRAMES")
    _must(data.get("bodyAndCreditPixelObservations") == obs and
          data.get("kineticCaptionFrameSamples") == kinetic and
          data.get("minActualNativeInkRows") == smallest and
          data.get("minPhoneInkPx320") == round(smallest * 320 / 1080, 3) and
          data.get("minimumGapToBodyInkPx320") == min_gap,
          "AGGREGATE_WAS_NOT_DERIVED_FROM_FRAMES")
    _must(data.get("status") == "RESEARCH_NEGATIVE_SCREENS_PASSED_REVIEW_STILL_HOLD",
          "GREEN_PUBLICATION_STATUS_FORGED")
    return {"receiptStructurallyConsistent": True,
            "observedNativeVideoFrames": 845, "opticalTextObservations": obs,
            "observedKineticFrames": kinetic, "minimumProjectedInkPx320":
            data["minPhoneInkPx320"], "minimumKineticClearancePx320": min_gap,
            "mayPublish": False, "newAcceptedAtomicCards": 0,
            "realFilmWasNotDecodedByThisContract": True}

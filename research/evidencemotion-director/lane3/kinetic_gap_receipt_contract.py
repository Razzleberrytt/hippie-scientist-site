"""Research-only fail-closed receipt validation; *not* a video decoder or approval.

Physical whole-film FFmpeg source and exact 845-frame pixel evidence are archived
in the owner ZIP. This contract proves that synthetic/received reports cannot
convert measured caption crowding into a green gate or publishing permission.
"""
FILM_SHA = "dd308ae64cc77edda5202e28da758ba031de1f065980c736fd147e3a60624b1b"
SCENES = ((0,118),(119,257),(258,391),(392,546),(547,717),(718,844))
N_FRAMES=845
CREDIT_BOTTOM=1587
THRESHOLD_PHONE_PX=12.0

class GapHold(ValueError):
    pass

def classify_gap(first_kinetic_native_y):
    if type(first_kinetic_native_y) is not int or not 1588<=first_kinetic_native_y<1798:
        raise GapHold("NATIVE_FILM_GLYPH_ANCHOR_INVALID")
    projected=round((first_kinetic_native_y-CREDIT_BOTTOM)*320/1080,3)
    return projected,projected>=THRESHOLD_PHONE_PX

def validate_receipt(data):
    if not isinstance(data,dict) or data.get("movieSha256")!=FILM_SHA:
        raise GapHold("SOURCE_IDENTITY_NOT_CURRENT_FILM")
    if data.get("mayPublish") is not False or data.get("newAcceptedAtomicCards")!=0:
        raise GapHold("FALSE_PUBLICATION_OR_ATOMIC_CREDIT")
    if data.get("totalNativeFilmFramesVisited")!=N_FRAMES or data.get("experimentMinClearancePx320")!=THRESHOLD_PHONE_PX or data.get("sourceCreditInkBottomNativeY")!=CREDIT_BOTTOM:
        raise GapHold("INCOMPLETE_OR_RELAXED_MOBILE_REVIEW")
    rows=data.get("perFrame")
    if not isinstance(rows,list) or len(rows)!=N_FRAMES:
        raise GapHold("MISSING_PHYSICAL_FRAME_GRID")
    scenes=data.get("scenes")
    if not isinstance(scenes,list) or len(scenes)!=6:
        raise GapHold("INCOMPLETE_SCENE_CONTRACT")
    visible=[[] for _ in range(6)]
    for i,row in enumerate(rows):
        sid=next(j+1 for j,(start,end) in enumerate(SCENES) if start<=i<=end)
        if not isinstance(row,dict) or row.get("f")!=i or row.get("scene")!=sid:
            raise GapHold("FRAME_ID_OR_SCENE_TAMPER")
        y=row.get("kineticTopNativeY")
        if y is None:
            if row.get("gapProjectedPx320") is not None or row.get("passesExperimentalGap") is not None:
                raise GapHold("INVENTED_OFF_CUE_CAPTION")
            continue
        px,passed=classify_gap(y)
        if row.get("gapProjectedPx320")!=px or row.get("passesExperimentalGap") is not passed:
            raise GapHold("INCONSISTENT_NATIVE_PIXEL_REPORT")
        visible[sid-1].append((i,px,passed))
    if data.get("kineticVisibleFrameSamples")!=sum(map(len,visible)) or any(not x for x in visible):
        raise GapHold("HIDDEN_REAL_CAPTION_FRAMES")
    total_fail=0
    for idx,(entry,frames) in enumerate(zip(scenes,visible),1):
        first=min(frames,key=lambda z:z[1])
        nfail=sum(not x[2] for x in frames)
        total_fail+=nfail
        if (entry.get("scene")!=idx or entry.get("framesWithPhysicalWhiteKineticForeground")!=len(frames)
            or entry.get("worstFrame")!=first[0] or entry.get("minObservedGapProjectedPx320")!=first[1]
            or entry.get("negativeGateFailures")!=nfail):
            raise GapHold("FORGED_SCENE_SUMMARY")
    wanted=("FAIL_RESEARCH_EDITORIAL_SPACING_NEGATIVE_GATE" if total_fail else "RESEARCH_GAP_NEGATIVE_SCREEN_ONLY")
    if data.get("status")!=wanted:raise GapHold("FALSE_GREEN_EDITORIAL_GATE")
    return {"receiptConsistent":True,"failedKineticFrames":total_fail,"mayPublish":False,"newAcceptedAtomicCards":0}


def preflight_raised_credit_from_pinned_receipt(data, proposed_credit_bottom_native):
    """Recalculate a proposed six-scene source/caption gap BEFORE rerender.

    Source data must pass the exact prior 845-frame research receipt contract.
    This predicts ONE geometric separation improvement only. It does NOT
    verify that the proposed artwork was rendered, preserves claims/audio,
    avoids art collisions, or passes phone/craft/clinical/release gates.
    """
    validate_receipt(data)
    if (type(proposed_credit_bottom_native) is not int or
            not 1200 <= proposed_credit_bottom_native <= CREDIT_BOTTOM):
        raise GapHold("PROPOSED_CREDIT_NATIVE_ANCHOR_INVALID")
    visible = [[] for _ in SCENES]
    for row in data["perFrame"]:
        y = row["kineticTopNativeY"]
        if y is not None:
            px = round((y - proposed_credit_bottom_native)*320/1080, 3)
            visible[row["scene"]-1].append((row["f"],px))
    if any(not entries for entries in visible):
        raise GapHold("PROPOSED_SCENE_HAS_NO_TIMED_INK")
    report = []
    for i,entries in enumerate(visible,1):
        worst=min(entries,key=lambda x:x[1])
        report.append({
            "scene":i,"kineticFrames":len(entries),
            "worstSourceFrame":worst[0],
            "predictedMinGapPx320":worst[1],
            "predictedBelow12PxCount":sum(v<THRESHOLD_PHONE_PX for _,v in entries),
        })
    return {
        "status":("PREFLIGHT_GAP_ONLY" if all(x["predictedBelow12PxCount"]==0 for x in report)
                  else "HOLD_PROPOSED_CREDIT_TOO_CLOSE_TO_KINETIC"),
        "sourceFilmSha256":FILM_SHA,
        "proposedCreditBottomNativeY":proposed_credit_bottom_native,
        "scenes":report,
        "framesRecomputed":sum(len(x) for x in visible),
        "sourceReceiptOnlyNotReencodedProof":True,
        "newFilmIndependentlyDecoded":False,
        "sourceScienceVerified":False,
        "phoneHardwareApproved":False,
        "excellentCertified":False,
        "mayPublish":False,
        "newAcceptedAtomicCards":0,
    }

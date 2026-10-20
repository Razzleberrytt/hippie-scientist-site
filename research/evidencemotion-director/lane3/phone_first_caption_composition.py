#!/usr/bin/env python3
"""Lane 3 research-only source-preserving phone-first caption composition.

A layout candidate is never decoded-video QA or permission to publish. Independent
Lane 4 must verify every actual film frame after any authorized renderer changes.
"""
import hashlib
import math
from pathlib import Path
try:
    from PIL import Image, ImageDraw, ImageFont
except ModuleNotFoundError:
    Image = ImageDraw = ImageFont = None

NATIVE_W = 1080
PROXY_W = 320
RESEARCH_MIN_INK_PX = 14

class CraftHold(ValueError):
    pass

def source_words(text):
    if not isinstance(text, str) or not text.strip() or '\n' in text or '\r' in text:
        raise CraftHold('CAPTION_SOURCE_INVALID')
    if len(text) > 500:
        raise CraftHold('CAPTION_SOURCE_TOO_LONG')
    return text.split()

def _measure_ink(line, font):
    box = font.getbbox(line)
    canvas = Image.new('L', (max(1,box[2]-box[0]+8),max(1,box[3]-box[1]+8)),0)
    ImageDraw.Draw(canvas).text((4-box[0],4-box[1]),line,font=font,fill=255)
    bounds = canvas.point(lambda x: 255 if x > 110 else 0).getbbox()
    if bounds is None:
        raise CraftHold('CAPTION_INK_EMPTY')
    return bounds[2]-bounds[0], bounds[3]-bounds[1]

def _wrap(text, font, max_width, max_lines):
    rows, current = [], ''
    for word in source_words(text):
        attempted = (current+' '+word).strip()
        if _measure_ink(attempted,font)[0] <= max_width:
            current = attempted
        else:
            if not current or len(rows) >= max_lines-1:
                return None
            rows.append(current)
            current=word
            if _measure_ink(current,font)[0] > max_width:
                return None
    rows.append(current)
    return rows if len(rows) <= max_lines else None

def plan_caption(text, font_path, *, canvas=(1080,1920), area=(100,1285,844,1495),
                 source_top=1519, protected_art_bottom=1150, max_lines=3,
                 threshold_px=RESEARCH_MIN_INK_PX):
    words=source_words(text)
    if Image is None:
        raise CraftHold('PILLOW_REQUIRED_FOR_RASTER_INK_PLAN')
    if canvas != (1080,1920):
        raise CraftHold('NATIVE_CANVAS_REQUIRED')
    if not isinstance(area,tuple) or len(area)!=4 or not all(type(x) is int for x in area):
        raise CraftHold('CAPTION_AREA_INVALID')
    x0,y0,x1,y1=area
    # Gut-preview anchors: artwork is present through y1128 and source-credit
    # ink begins y1519 in the exact source-bound Lane4 frame. Defaults add
    # provisional margins; other scenes MUST supply their own prequalified
    # art/source bounds rather than reusing the gut viewport blindly.
    if (type(source_top) is not int or type(protected_art_bottom) is not int or
            not (0<=x0<x1<=864 and 0<=protected_art_bottom+24<y0<y1+24<=source_top<1600)):
        raise CraftHold('SOURCE_OR_PHONE_SAFE_ZONE_CONFLICT')
    if type(max_lines) is not int or not 1<=max_lines<=3:
        raise CraftHold('CAPTION_LINES_INVALID')
    if type(threshold_px) not in (float,int) or not 0<threshold_px<=24:
        raise CraftHold('CAPTION_THRESHOLD_INVALID')
    font_path=Path(font_path)
    if not font_path.is_file() or font_path.is_symlink():
        raise CraftHold('PINNED_FONT_REQUIRED')
    font_sha=hashlib.sha256(font_path.read_bytes()).hexdigest()
    target_native=math.ceil(threshold_px*NATIVE_W/PROXY_W)
    for font_size in range(106,41,-1):
        font=ImageFont.truetype(str(font_path),font_size)
        rows=_wrap(text,font,x1-x0-24,max_lines)
        if not rows:
            continue
        metrics=[_measure_ink(row,font) for row in rows]
        if min(height for width,height in metrics)<target_native:
            continue
        pitch=max(height for width,height in metrics)+16
        total=(len(rows)-1)*pitch+max(height for width,height in metrics)
        if total>y1-y0-20:
            continue
        positions=[(x0+12,y0+10+i*pitch) for i in range(len(rows))]
        if source_words(' '.join(rows)) != words:
            raise CraftHold('CAPTION_REWRITTEN')
        # Verify the full raster ink extent, not the nominal text box, is
        # inside the declared source/artwork-free caption viewport.
        if positions[0][1]<protected_art_bottom+24 or positions[-1][1]+metrics[-1][1]>y1:
            raise CraftHold('CAPTION_RASTER_OUTSIDE_ART_FREE_VIEWPORT')
        return {'status':'RESEARCH_LAYOUT_CANDIDATE','captionSource':text,
                'rows':rows,'positions':positions,'nativeFontPx':font_size,
                'minNativeGlyphInkPx':min(height for width,height in metrics),
                'minProjectedInkPx320':round(min(height for width,height in metrics)*320/1080,2),
                'fontSha256':font_sha,'fontPathName':font_path.name,
                'captionArea':list(area),'sourceCreditStartsAtNativeY':source_top,
                'protectedSceneArtBottomNativeY':protected_art_bottom,
                'sceneBoundsExternallyCalibrated':False,
                'claimedNativeCanvas':[1080,1920],'mayPublish':False,
                'sourceClaimReviewed':False,'actualMovieDecoded':False,
                'realPhoneApproved':False,'externalCraftApproved':False,
                'newAcceptedAtomicCards':0}
    raise CraftHold('CAPTION_NEEDS_RECOMPOSITION_NOT_FONT_SHRINK')

#!/usr/bin/env python3
"""One-step *research-only* native craft-render -> exact source splice.

No production/publisher import. Never auto-refreshes SHA pin files. This entry
point intentionally fails on any unexpected codec/scene/master revision.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
import tempfile
import native_scene4 as render
import source_locked_craft_splice as splice

class ReplayHold(ValueError):pass

def run(*,source,mol,manifest,external_manifest_sha,output,treatment="baseline"):
    if treatment not in ("baseline","depth_study"):raise ReplayHold("UNREVIEWED_CRAFT_TREATMENT")
    rule=splice.trusted_manifest(manifest,external_manifest_sha)
    if rule['sourceFilmSha256'] not in render.KNOWN_SOURCE_FILMS:
        raise ReplayHold('UNKNOWN_APPROVED_NARRATION_FILM')
    if rule['originalNarrationSha256']!=render.NARRATION_SHA:
        raise ReplayHold('ORIGINAL_NARRATION_IDENTITY_CHANGED')
    if (rule['startFrame'],rule['endFrameExclusive'],rule['width'],rule['height'],rule['fps']) != (
       render.START_FRAME,render.END_FRAME,render.W,render.H,render.FPS):
        raise ReplayHold('AUTHORED_SCENE_OR_NATIVE_TIMELINE_MISMATCH')
    if (rule['computedSpokenOnsetSec'],rule['negationSpokenOnsetSec'])!=(render.COMPUTED_AT,render.NOT_AT):
        raise ReplayHold('SCENE_AUDIO_CUE_REVISION_MISMATCH')
    protected_paths=(Path(source),Path(mol),Path(manifest))
    if output is None or Path(output).resolve() in tuple(p.resolve() for p in protected_paths):
        raise ReplayHold('INVALID_OUTPUT_DESTINATION')
    if Path(output).with_suffix('.receipt.json').resolve() in tuple(p.resolve() for p in protected_paths):
        raise ReplayHold('INVALID_RECEIPT_DESTINATION')
    # Preflight only from externally anchored video+MOL, *before* any rendering.
    if splice.digest(source)!=rule['sourceFilmSha256']:
        raise ReplayHold('SOURCE_FILM_REVISION_MISMATCH')
    if render.sha(mol)!=render.MOL_SHA:
        raise ReplayHold('MOLECULAR_SOURCE_REVISION_MISMATCH')
    with tempfile.TemporaryDirectory(prefix='ths-lane3-craft-') as temp:
        scene=Path(temp)/'native-verified-scene.mp4'
        scene_receipt=render.render(source,mol,scene,expected_film_sha=rule['sourceFilmSha256'],treatment=treatment)
        if scene_receipt['clipSha256']!=rule['craftSceneSha256']:
            raise ReplayHold('RENDERED_SCENE_DIFFERS_FROM_EXTERNAL_PIN')
        result=splice.splice(source,scene,output,rule)
        if result['mayPublish'] or result['scienceApproved'] or result['craftApproved']:
            raise ReplayHold('UNAUTHORIZED_PROMOTION')
        return {'schema':'ths-native-scene4-end-to-end-replay-research-v1',
                'scene':scene_receipt,'film':result,'treatment':treatment,'publishPermitted':False}

if __name__=='__main__':
    p=argparse.ArgumentParser()
    p.add_argument('--source-film',type=Path,required=True)
    p.add_argument('--mol',type=Path,required=True)
    p.add_argument('--manifest',type=Path,required=True)
    p.add_argument('--external-manifest-sha256',required=True)
    p.add_argument('--output',type=Path,required=True)
    p.add_argument('--treatment',choices=['baseline','depth_study'],default='baseline')
    a=p.parse_args()
    print(json.dumps(run(source=a.source_film,mol=a.mol,manifest=a.manifest,
                        external_manifest_sha=a.external_manifest_sha256,output=a.output,treatment=a.treatment),indent=2))

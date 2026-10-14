# EvidenceMotion — actual decoded-frame mobile UI audit (2026-10-14)

**Scope:** Under existing director research issue #6743, no new production admission. This is partial engineering for Section A illustration disclosure and Section D TikTok/Shorts-safe placement. Neither earns checkbox credit from this PR; authoritative count stays **25/46 verified, 21 open**.

## Actual evidence this code can generate

The research-only phone_ui_audit.py accepts an MP4, an externally authored JSON shot/annotation manifest and an output directory. It compares the file's actual SHA-256 with the manifest's expected SHA, measures actual width/height/30fps/duration with FFprobe, checks continuously covered shot times, declared opening hook times <=2s, essential text/diagram rectangles and minimum font sizes, then uses FFmpeg to decode one real frame from near the midpoint of each shot.

PNG screenshots have **red research UI exclusion areas** and **green supplied annotation rectangles**. The SHA-256 hashes of the movie, manifest and each decoded PNG are saved in research-report.json. Each research receipt has publicationVerdict: HOLD and mayPublish: false.

* UI reserved areas (1080x1920 output): top 10%, right 20%, bottom 18%; reject any annotated critical content intruding on the reserves.
* Hook/caption/disclosure font declaration: >=36px; source/diagram labels >=28px.
* If a shot is marked nonfactual_illustration, require a disclosure annotation containing the literal notions **illustration** and **not proof**, such as "Illustration; not proof of 7-OH content."
* A declarative first-two-second hook must include early text, spoken opening and a hero visual. This does not prove that pixels contain the words or meaningful motion.

## Example annotation data

{
  "status": "RESEARCH_ONLY",
  "releaseApproved": false,
  "expectedVideoSha256": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "platforms": ["tiktok", "shorts"],
  "hook": {"textVisibleAtSec": 0.2, "spokenOpeningAtSec": 0.3, "heroVisualStartsAtSec": 0.1},
  "shots": [{
    "id": "opening",
    "startSec": 0.0,
    "endSec": 3.0,
    "assetKind": "deterministic_science",
    "annotations": [{
      "role": "hook", "text": "Why is this molecule different?",
      "fontPx": 48, "boxPx": [100, 250, 750, 350]
    }]
  }]
}

Replace the example hash with the exact video SHA-256 and extend the shot ledger through the entire measured movie. Invoke Python with --movie <actual.mp4> --manifest <actual.json> --output <review-folder>. It does not modify the original movie.

## Exact limitations

The rectangles, role labels, font sizes and opening timings are caller-provided, **not machine detection or OCR of the rendered words**. The decoded frames need independent visual comparison with the annotations. One sampled frame per shot can miss errors between frames. The exclusion fractions are conservative research proxies, **not measurements of current apps on actual iPhones**. A 1080x1920 container may still contain upscaled low-resolution source graphics. No phone session, source-asset nativeness, phoneme correctness, real muted comprehension, scientific truth, creative quality or publishing permission is established.

A synthetic H.264/FFmpeg actual decoded-frame regression is run alongside negative cases for manipulated SHA, incomplete/duplicate shots, out-of-frame/NaN boxes, tiny text, top/right/bottom obstruction, wrong geometry, missing hook, missing platform, generative botanical art without disclosure and false release status.

## What would actually close the checklist gates

1. Obtain and SHA-lock the existing complete exact final master, currently conversation-held rather than in the repository.
2. Run the audit on those real bytes and manually or independently calibrate all annotations against the actual visible frame content, including transients between midpoints and contrast at smartphone scale.
3. Demonstrate a real handset / TikTok-Shorts-like UI session with sound/scrubbing, first-two-second understanding, muted captions and evidence/illustration disclosures, preserving exact media and session identities.
4. Independently establish original voice/pronunciation, claim-level scientific fidelity, professional craft and release authorization. Passing this runner does not tick A or D, and does not earn the first excellent video or streak goals.

No laptop, GPU, paid inference, production import, new version freeze, automatic platform post or human-review impersonation.

# EM-008.03 — actual encoded 375px-scale illustrated-caption contrast research

**Scope: research-only generated illustration, not authentic footage or licensed film release.** This proof tests one clearly **synthetic** leaf illustration from the existing EM-008.05 deterministic source, not any original 7-OH native-film botanical frame. It does not claim valid botanical species, clinical evidence, chemical alkaloid measurement, independent OCR, human caption understanding or real iPhone playback.

## Exact source identity and actual hosted execution

- [Actual hosted Actions run **#38989558880, job #117268682131**](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38989558880) **SUCCESS**, **11/11 Python tests** on implementation head **54c14136f1af1db74edff17c1b92de747bbcc370**. Earlier source-specific [run #38989313864](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38989313864) had **FAILED** on accurate glyph-width safety: “NOT PROOF OF 7-OH CONTENT” extended past the safe banner. Repair replaced the second line with **“NOT A 7-OH PLANT ASSAY”** and added a regression test that computes native PIL glyph widths; guard was not disabled.
- Self-authored nonfactual pictogram produced deterministically by `em00805_botanical_video_probes.py`, image SHA256 **4c1573cc3d3ea32fd6170323941b5d00296c7d44dd990cd4f11eda8fa111df7d**; exact first-party generated research fixture is the source of truth **only for this test**, not biology. Reuse of external art requires explicit exact expected SHA and refuses a source swap. Script `em00803_real_mobile_contrast.py` owns the intentionally conservative research assertion (minimum **7.0:1 contrast** and minimum **16 nominal px at 375px phone width**, both lines, all sampled frames).
- **Four real 1080 × 1920, 30 fps H264** research videos, each **60 frames (2s)**, were rendered without audio and decoded directly at native frames **0, 30 and 59**. Encoded RGB24 resized via **Pillow LANCZOS 375×667** (simulated phone width only); per-line foreground and background sampled by an authored font rasterization mask applied to **independently decoded** video pixels; sRGB luminance is IEC/WCAG 2.2 style linearized, then contrasted. This is actual pixel inspection, but **not independent OCR**, real handset UI, human perceptual study, or audited practical font rendering across phones.
- Hosted [receipt artifact **#12084386853**](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38989558880/artifacts/12084386853) was downloaded and inspected independently: ZIP size **1,968 bytes**, SHA256 **8bbdcb09cad7ce56cf6f0f6c03d83e7c9099e9bb8802832b29be60a92637f367**; JSON size **22,088 bytes**, SHA256 **e47140c727e36e1966a78c5195d8b2fe14528094ef4de7828bc1dea3f8d9d560**. Upload contains only source/decoded pixel metadata; it does not export unlabeled misleading or unreadable video clips.

## Verified measured on-film results

| H264 case | Exact original encode SHA256 | Native decoded frames checked | Actual measured 375px-line pixel contrast at frame 30 | Gate |
|---|---|---|---|---|
| High-contrast illustration disclosure | 46d88a7aa58b871adbb286818a8e3d61ec5de9ba6929d546204bf760cc0ec09e | 0, 30, 59 | **18.2945:1 / 18.5569:1** | DECODED_PHONE_WIDTH_PIXEL_RESEARCH_ONLY |
| Deliberately faint type | 3fe6374c61618411306eb56831a36479ff3fd0f2d011c7d168121bf7356ee3c2 | 0, 30, 59 | **2.1854:1 / 2.1602:1** | HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING |
| Missing disclosure entirely | b71d1a047d6ca9e35d82a115a9b7343a1bc6124ffebcd848e4835b622a4f86e9 | 0, 30, 59 | **1.0:1 / 1.0:1** | HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING |
| Deliberately undersized type | a07bc5e3c2e9f24afd5a216c3b51c2d4d349e4fbb8ae8ee155396014761f6877 | 0, 30, 59 | **1.0:1 / 1.0:1 at expected large-glyph masks** | HOLD_MOBILE_DISCLOSURE_UNREADABLE_OR_MISSING |

The undersized control also fails the separate 25px native-authored font ≈ 8.68px 375-width projection, well below the 16px research threshold; there is no claim that the tiny ink was entirely absent elsewhere. The positive source image and film are distinct from the prior EM00805 recorded video data. The real test rejects bad content **locally**, not a validated semantic face-reading/vision-OCR pipeline.

## Atomic workcards: seven evidence-bounded research-only units

| Atomic workcard | State | Distinct bounded receipt |
|---|---|---|
| `EM-008.03.U` | VERIFIED_MACHINE_RESEARCH | one uniquely identified synthetic botanical test frame #30 at t=1s, not original narrated film |
| `EM-008.03.S` | VERIFIED_MACHINE_RESEARCH | deterministic first-party leaf source PNG SHA, SHA-guarded external-image input, exact H264 and source revision; no scientific botanical authentication |
| `EM-008.03.O` | VERIFIED_MACHINE_RESEARCH | predeclared 7.0:1 decoded pixel contrast plus native glyph safety and 16 nominal px projection at 375px phone width, both lines, three frame probes |
| `EM-008.03.X` | VERIFIED_MACHINE_RESEARCH | four real CPU H264 encodes of one nonfactual illustrative asset and 12 actual decoded full native-frame samples, without production effects |
| `EM-008.03.T` | VERIFIED_MACHINE_RESEARCH | hosted 11/11 real RGB24 sampled 375px contrast and title overflow regression tests PASS with exact per-case SHA identity |
| `EM-008.03.N` | VERIFIED_MACHINE_RESEARCH | three physical H264 negative conditions (faint, missing, tiny) correctly HOLD; swapped external image/clip and unknown mode also rejected |
| `EM-008.03.R` | VERIFIED_MACHINE_RESEARCH | source/clip and original pixel SHA-bound receipt #12084386853, ZIP+JSON SHA, limitations and no-release result archived |

## Unfulfilled requirements (HOLD)

No exact botanically authenticated original-film frame or physical handset was tested; actual small-phone viewing and independent qualitative comprehension are still required. No scientific 7-OH plant-content validity, empirical clinical claim, camera-quality/premium first master or automated placement inside the full voice-first EvidenceMotion pipeline follows. All false variants stay on the ephemeral runner and were not published. EM-007.07 qualified science review and canonical parent EM-008 remain OPEN, creative first accepted 0/1 and varied five first-renders 0/5, mayPublish=false and no merge/deploy/post. The seven receipts are **machine engineering evidence only**, not final film/device or science acceptance.

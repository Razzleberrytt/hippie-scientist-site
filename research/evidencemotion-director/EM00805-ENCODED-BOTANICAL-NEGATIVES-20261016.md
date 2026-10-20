# EM-008.05 — actual-encoded botanical caption deception negative controls

**Scope (2026-10-16): research-only Lane 1 machine evidence, not an actual original 7-OH film.** The selected 7-OH native film inspected under EM-008.01 has no declared botanical-art shots, so this **different test** builds a new self-authored botanical illustration solely to establish that disclosure removal and a false chemical-measurement caption produce HOLD. It never authenticates a botanical species, validates plant 7-OH contents, verifies treatment effects or approves a publication.

## Real source and hosted receipts

- Reproducible first-party source: em00805_botanical_video_probes.py, authored graphical leaf pictogram PNG SHA-256 **4c1573cc3d3ea32fd6170323941b5d00296c7d44dd990cd4f11eda8fa111df7d**. The exact synthetic artwork is explicitly **not authenticated Mitragyna speciosa** or a photo; negative-example claim ID is negative-probe-fabricated_measurement. No primary scientific study is implicated or inferred. Source script and workflow changes on implementation commit **c8a8fb3c71c4d9239bf470d0d018509742ba4628**.
- Actual hosted [Actions run #38988299834 / job #117264767992](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38988299834): **SUCCESS**, **10/10 Python adversarial and positive tests PASS**, using CPU FFmpeg/FFprobe and Pillow 12.0.0. Three distinct actually encoded **H264 1080×1920 / 30fps / 60-frame clips** were independently sampled at native decoded frame 30 / 1.000 s. The pixel region was compared against the authored ink and decoded no-caption baseline, with glyph-width/14.24px projected 375px-screen type assertions. This was **not optical character recognition, actual phone playback, full movie review, or independent clinical review**.
- [Hosted narrow artifact #12084620101](https://github.com/Razzleberrytt/hippie-scientist-site/actions/runs/38988299834/artifacts/12084620101): only a 3,803-byte JSON research receipt, not the unsafe negative MP4s. Artifact ZIP 1,339 bytes SHA-256 **cd812a4ec6e4880c5a6070b471d2bc504b49916bdafddd1305fd2614ceda2dba**; JSON SHA-256 **fe56062b0fcc9bdd770bb84d4a6615f70da3c474dc3b54c7efd7f16fbe51dfd2**. Recovered separately, parsed and matched all three source, decoded-frame and film hashes.

| Actual test film | Encoded H264 SHA-256 | Decoded frame-30 RGB24 SHA-256 | Pixel region change vs bare illustration | Exact decision |
|---|---|---|---:|---|
| Disclosed illustrative art | cec9b550656c4f02cd1350a0122e40acfb8e230fed40fd5b91550563770fc28a | 88274d6ef1dc687d74c2f2b40068d224eb03db1d7f8902c089275f7c536cf829 | 0.485737 | CAPTION_REGION_OBSERVED_RESEARCH_ONLY |
| Disclosure deleted | 2d4d0edcb0b3f48e119b1de5111e140c9d7faf995f3bf570d261680315e2b1be | 7403b11fa4766b16a917630ced2591a37e0dbf8666c3df2ed7dbe07e542d3641 | 0.000000 | HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE |
| Invented measured 7-OH caption | 186742785c6cdf73d77f524b3209c697f821637a988eff1de75a9c7e7ed185ba | 17571032b6fc70972bea2da31c5955813b20d3e68ff6b7ce2fc8eb3c8985866a | 0.464112 | HOLD_MISSING_OR_DECEPTIVE_BOTANICAL_DISCLOSURE |

The hidden/incorrect caption tests were genuine new H264 encodes but were not shipped or exported from GitHub; the retained record is only the receipt. Other real negative controls: forged clip digest, decoded caption region inconsistent with declared source text, oversize glyphs, undersized projected type, unknown intent. The positive research caption does **not** grant clinical correctness, OCR, source-image authenticity, phone readability, craft or publishing.

## Seven uniquely earned machine-research atom receipts

| Atomic workcard | Disposition | Narrow primary evidence |
|---|---|---|
| `EM-008.05.U` | VERIFIED_MACHINE_RESEARCH | Exactly one real decoded illustrated botanical video frame, selected frame 30 at t=1.0s from a synthetic openly nonfactual clip, no original film implied |
| `EM-008.05.S` | VERIFIED_MACHINE_RESEARCH | First-party authored pictogram source SHA, exact hosted code/run, three H264 SHA and decoded pixel SHA identities, not a real botanical species |
| `EM-008.05.O` | VERIFIED_MACHINE_RESEARCH | Both disclosure deletion and ambiguous fake measured-plant 7-OH caption must produce HOLD even if caption ink exists |
| `EM-008.05.X` | VERIFIED_MACHINE_RESEARCH | Three genuinely encoded native H264 versions from a single explicitly artificial botanical visual, no production or original source changed |
| `EM-008.05.T` | VERIFIED_MACHINE_RESEARCH | Hosted 10/10 actual decoded-frame, film identity, caption pixel comparison and glyph-fitting tests PASS |
| `EM-008.05.N` | VERIFIED_MACHINE_RESEARCH | Actual source-bounded two adversarial H264 clips rejected; additional source-swapping, modified ink, clipping and unsafe typing controls rejected |
| `EM-008.05.R` | VERIFIED_MACHINE_RESEARCH | Exact hosted job, 3,803-byte receipt and retained ZIP/JSON SHA with explicit 0/1, 0/5, science/device/release limitations |

## Gates still OPEN

This is **synthetic-fixture engineering research**, not an authenticated plant clip or full approved EvidenceMotion film. No original 7-OH film/source art was changed. Independent qualified science reviewer EM-007.07 remains HOLD. Actual mobile-display, OCR/semantic caption inspection, species/content verification, independent craft, one premium first-render **0/1**, five varied consecutive premium first renders **0/5** remain blocked. Parent EM-008 acceptance is OPEN; mayPublish=false, releaseAuthorized=false. Existing Lane 1 PR #6840 must stay DRAFT pending protected coordination and review. These seven machine-only research workcards cannot be interpreted as commercial or scientific approval.

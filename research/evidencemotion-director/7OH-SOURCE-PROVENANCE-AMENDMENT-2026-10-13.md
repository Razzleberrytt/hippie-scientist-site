# EvidenceMotion full-HD manifest correction and source-byte gate — 2026-10-13

**Research-only.** No new shipped version, workflow, model, publishing integration, clinical claim or permission to lift the production freeze. Tracks issue #6743 and follows merged research director foundation #6736.

## Actual incident, not a hypothetical improvement
After the completed native 1080×1920/30fps 7-OH master was preserved, its `MANIFEST.json` claimed all bundled files were byte-pinned. A fresh independent check found **one mismatched source-file hash**:

- `fullhd_master/make_contact.py` recorded SHA-256: `22c13ab9c9b12c26aee6327759dec0fb7e74fe1e0d4ab26cc6b6fb6d46544d8b`
- Same actual file's SHA-256 in stored package: `762f8f4b516c53ca...` (full SHA retained in portable amendment receipt).
- All five other manifest source inputs, including original Kokoro WAV, rendered source-audio MP4, native VTK model and full-HD compositor, matched their declared hashes.
- The selected finished 7-OH MP4 also matched its SHA **`130857e331d40e452edd38a1d112d88e552b56009c4aa0e57cd1e15559581b86`**. This is a **contact-sheet helper provenance discrepancy**, not evidence the encoded film changed.

The previous manifest is retained unchanged as `MANIFEST_ORIGINAL.json`, along with a machine-readable amendment identifying both source hashes and the reason for change. The corrected `MANIFEST.json` pins the *actual* contact generator file while leaving every other expected hash and selected full-HD master unchanged. No retroactive claim is made that the previous manifest was fully correct.

## Reusable fail-closed validator
`native_source_provenance.py` uses standard-library SHA-256 on **actual source-file bytes**, compared against `sourceInputs`, and on the actual selected MP4 against `originalFinalSha256`. It rejects absent/malformed hashes, missing inputs, path escape, symlinks, tampered source bytes, tampered master, or absent `notReleasableWithoutFinalQualityReview` gate.

The paired `test_native_source_provenance.py` covers **12 PASS/HOLD cases** (including noncanonical `./` master/source aliases). Both exact files have Git blob hashes equal to those used in independent local tests (`356a895d93fc840ae348d5edc590020782a59ea5` and `1f0a21525bdfaa63b163f0b0a50709652f4a1b30`).

Actual original package audit: **HOLD**, `SOURCE_HASH_MISMATCH:fullhd_master/make_contact.py`.

Actual corrected standalone package audit: **PASS**, no mismatches, all listed file hashes matched. Portable package `EvidenceMotion_7OH_Corrected_Provenance_RESEARCH.zip`, SHA-256 `a38ed8544afdcff306388492d8ee2bdf600c68d67f702fbe465b7b0cbe524092`, is linked as a conversation artifact. It contains the verified selected master, exact six source files, both manifests, amendment, validator and tests; the binaries stay out of GitHub production.

## Limits
**Hash equality alone is not proof of native pixels or chemistry review.** Exact-source clean native re-render was separately demonstrated for the same MP4, and #6742's `native_master_audit.py` independently confirms the actual H.264 CFR timestamps, frame count, AAC bytes and full media decode. Still not established: qualified complete-script chemical/editorial approval, independently validated acoustic word timestamps, user-tested exact master on iPhone, cinematic reference-shelf quality, and the first-then-five owner-excellent first-render milestone.

Therefore `releaseApproved=false`, `craftApproved=false`, `scienceReviewApproved=false`, `nativeSourceProof=false` remain explicit, and the production freeze remains ON. The existing master checklist stays at **16/46 verified, 30 open** until new audited governance entries and acceptance are merged; this research PR does not self-credit an unapproved system release.


## P2 review-hardening: canonical path ownership
The initial validator compared literal manifest path strings and would have accepted `./final.mp4` as a distinct source spelling of the same master. It now rejects noncanonical `./`, repeated separators, traversal and symlink paths before any source/master ownership check. Two additional automated tests require `HOLD` for the master or a source supplied through `./` aliases. All **12/12** exact-local-blob tests pass, and the actual corrected source+master package still returns PASS. The superseding user-facing research package is `EvidenceMotion_7OH_Provenance_V3_Validated.zip` with SHA-256 `8135a396b2dfb32213e71ca112691b8929e0b1ffd36f060e9fb9df43584fddf2`. Prior packages remain historical.

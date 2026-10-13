# 7-OH V11 phone-audition and canonical audio-QA research — 2026-10-13

**Status: RESEARCH ONLY / CRAFT HOLD / NO PRODUCTION ADOPTION.** Owner's phone-first setup and EvidenceMotion version freeze unchanged. This is a candidate preview for human review, not a finished release or an exceptional first-render milestone.

## What was repaired from V10

1. **Critical loudness preflight.** Independent EBU R128 measurement: original Kokoro AAC was **−27.79 LUFS**, true peak **−8.24 dBTP**—too quiet for a social-video audition. The *original pinned Kokoro `am_michael` performance* was gain/mastering processed to **−17.52 LUFS**, true peak **−1.49 dBTP**, without regenerating, rephrasing, time stretching, or changing the narrator. Independently decoded PCM comparison: **0.0 ms relative time shift**, correlation **0.99836** (first four seconds after one-second offset). This confirms preservation of acoustic performance/timing, **not** perceived naturalness or correct pronunciation.
2. **Source-card readability.** The exact `pubchem.ncbi.nlm.nih.gov/compound/44301524` source is placed in larger type within a deliberate 26.635–29.835-second static hold, above lower phone controls, with tiny original source text covered instead of doubled. Do not animate an actual citation just to improve pixel-motion scores.
3. **Meaningful ending.** 29.835–33.133-second close uses 47 pre-existing VTK frames of the same source-verified RDKit molecule. The camera physically moves towards the hydroxyl-bearing region without morphing any atoms, making a medical effect claim, or inventing chemical geometry.
4. **Fact source refreshed independently.** PubChem CID **44301524**, formula **C23H30N2O5**, and InChIKey **RYENLSMHLCNXJT-CYXFISRXSA-N** independently match the pinned RDKit graph; FDA and UNODC offer additional context. The voice phrase "position seven" needs a *qualified editorial reading* against PubChem's systematic IUPAC label **7a-hydroxy** versus the common 7-hydroxymitragynine name; no casual silent rewrite is authorized before a corrected WAV.

## Exactly reproduced local media / checks

- Output: `7OH_KOKORO_V11_PHONE_AUDITION_RESEARCH_PREVIEW.mp4`; SHA-256 `3cb1811e4d7053bf21f883e43e83236970cb5feb79b9313f5597e1bce8f06e22`.
- Source V10 MP4 SHA-256 `1a90ca70e76a80e313574181f363803904bf63f3b6c72b83af42a5544dd060e9`.
- Original voice WAV SHA-256 `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34`.
- Input phone-loudness mastered V10 AAC is **bit-identical** to V11 output AAC after editing. Original performance was not sped/slowed or regenerated.
- Independent FFmpeg full decode **497/497 frames**, H.264 Constrained Baseline 540×960 @15fps, AAC-LC 48 kHz, 33.13s video / 33.20s padded AAC container (approximately 67ms end padding; PCM analysis of both versions exactly 795,648 samples / 33.152s with 0ms relative lag).
- The author's `verify_v11.py` checks **actual decoded media** for source chemistry, original WAV SHA, exact mastered audio stream hash, lag/correlation, loudness and true peak, all real frames/codec. It reports technical success while correctly returning **CRAFT/SCIENCE/OWNER HOLD**.
- Fresh temporary directory copy of only source V10 video, mastered narration video, 47 VTK hydroxyl frames, and `build_v11.py` reproduced the output **byte-for-byte** with identical MP4 SHA.
- Contact: `V11_CONTACT_SHEET.jpg`. A portable 58-file package with the exact source videos, original WAV, frames, scripts, QA receipts and output exists as conversation artifact `EvidenceMotion_7OH_V11_phone_audition_RESEARCH.zip`; bundle SHA-256 `58ec29263efaaf99bedfdbe1d595c8292b16dee76575df11fa4d3085212e42ec`. The MP4, full scripts and binaries are **not** in this GitHub PR; no CI reproduction falsely claimed.

### Same-method video motion negative proxy
Central ROI x55:485,y215:645 with gray resized to 96×106, pixel change >=9 and near-static cutoff <2% changed.

| Metric | V10 | V11 |
| --- | ---: | ---: |
| Whole-cut near-static frame share | 29.839% | **28.831%** |
| Final 29.835–33.133-second near-static share | 10.204% | **8.163%** |
| PubChem 26.635–29.835-second source hold near-static share | 97.917% | **97.917%** (intentional) |

Improved motion is not visual taste; footage still resembles a polished explainer/CGI model rather than owner-accepted best-in-niche filmmaking. The research freeze does not lift.

## Blocks before claiming 100% complete
- **Owner** listens on real phone to V11 louder narrator, especially 7-OH / mitragynine / hydroxyl, and checks actual encoded playback/visual attractiveness.
- **Science** independently reviews exact emitted copy and model graphics, especially naming/numbering distinction (the common "7-hydroxy" vs systematic `7a-hydroxy` nomenclature), caption spelling and implied plant context. Altered copy invalidates prior voice/alignment.
- **Acoustic** real independently validated word/phoneme timing; these captions remain exact **beat aligned**, not genuine MFA.
- **Craft** reviewer assesses a 3–5 item flagship science-explainer reference shelf. The clip contains repeated molecular representations and has not yet met the high-bar aesthetic gate.
- **Native final** first 1080×1920/30fps master (not an upscaled preview), exact-file technical QA and phone speaker playback **only after** the concept/voice/science gates pass.
- **System canonical** pin true golden master and improve general-purpose generator, then five consecutive accepted excellent first-final renders across varied topics; no auto-publish and no production freeze lifting in this PR.

## Reusable prevention
The new research-only `audio-mastering-gate.mjs` enforces objective voice loudness, peak, original-voice identity and non-stretched timing, while explicitly refusing to certify pronunciation or owner review. Targeted Node test cases commit beside it, not automatically counted as executed unless they were actually run.


## Native 1080×1920 feasibility smoke (separate research operation)
Eight real software-VTK **1080×1920 native frames** from the same pinned RDKit graph were rendered with physically moved camera/atom geometry, not an upscale. Measured cumulative frame-render/write time **0.976 seconds** on the current local CPU environment, about **480,468 KiB** peak resident memory. Exact individual PNG hashes and process metadata are in the downloadable conversation bundle's `native_1080_smoke/receipt.json`. This is a limited feasibility test: not a 30fps/full narration-composited film, not the 1080p first final, not deployment. The sample deliberately crops the molecule in macro, which would require a visible **DETAIL VIEW** label in a finished film; uncropped source-authoritative 2D graph remains mandatory.

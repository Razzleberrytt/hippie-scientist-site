# SR-15099 EvidenceMotion: V6 voice-recovery checkpoint (2026-10-13)

**Status: VOICE AUDIO AUDITION READY / VISUAL CRAFT HOLD / NOT PUBLISHED / NOT V_VERIFIED.** Research-only; leave the current EvidenceMotion canonical version and quality milestones unchanged.

## Scientific identity and sources
- **2020 mouse hot-plate assay — SR-17018, NOT SR-15099:** Both the SR-17018-substitution group **and the no-replacement control group** recovered sensitivity to morphine after three days. SR-17018 suppressed signs of withdrawal during substitution, while the control group experienced withdrawal. Primary paper: Grim et al., [PMID 31443104](https://pubmed.ncbi.nlm.nih.gov/31443104/).
- **2021 mouse warm-water tail-immersion assay — SR-17018, NOT SR-15099:** SR-17018 substitution did **not** reverse existing morphine tolerance; the same study observed tolerance developing with chronic SR-17018 on this test. Pantouli et al., [PMID 33345829](https://pubmed.ncbi.nlm.nih.gov/33345829/).
- **SR-15099** belongs to a related preclinical mu-opioid agonist series, Schmid et al., [PMID 29149605](https://pubmed.ncbi.nlm.nih.gov/29149605/). These studies do NOT establish a safe human SR-15099 tolerance-reset treatment.

## Verified original voice archive: RESOLVED
The two original backup ZIP archives were found in Google Drive folder **THS Voice Model Vault — original Kokoro weights** and materialized into the working container. Both unzipped binaries independently passed exact SHA-256 checks:
- `kokoro-v1.0.int8.onnx`, **114,119,327 bytes**, SHA-256 `ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c`.
- `voices-v1.0.bin`, **28,214,398 bytes**, SHA-256 `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`.

Matches the repo's durable voice-model vault `ths-kokoro-onnx-am-michael-int8-v1`. A **59.608-second** house-voice audition artifact with a voice-derived beat timeline and full narration receipt was already in the working container. Audition source ID `sr15099-tolerance-audition-grim2020`; source WAV SHA-256 `4692456c3d976135c1f46928636c585adaace6118d3355f43d67f90550f102ac`. The receipt declares `kokoro-onnx==0.6.1`, speaker `am_michael`, natural speed 1.0, 24-kHz PCM16. Its model hashes agree with the **independently verified original binaries**.

**Important limitation:** the 59.6s audition is a **short-form companion** (roughly six narrated scenes + source hold). It is not the full beginner-level 2–3min V4 deep-dive script. The spoken track has NOT been human ear-approved; no genuine MFA word alignment or final release-grade MP4 exists. Preserve both scripts without calling the short take a complete replacement.

## Visual work
- An earlier 16s 1080x1920 silent mouse control-group proof illustrates that both groups regained morphine sensitivity, with a distinct withdrawal-sign contrast.
- New 11s 1080x1920/30fps silent hot-plate versus tail-immersion teaching sequence rendered and decoded all 330 frames. Schematic apparatus, **not experimental footage**. Remains too flat and graphic-like for flagship craft. Local research-only 7/7 scene-claim regression checks passed; **not CI, not human science/craft approval**.
- A portable V5 checkpoint ZIP and scene files were supplied in the conversation; the binary videos/audio are **not** committed to this PR.

## Next honest sequence
1. Owner ear audition of exact Kokoro clip, especially SR-15099 / SR-17018 reading, intelligibility, phrasing and naturalness. Never infer approval from matching model hashes.
2. If audition acceptable: make full long-form narration with pinned Kokoro and natural timings; do not arbitrarily squeeze into a 60-second short-video envelope.
3. Produce genuine MFA word timings from final original WAV, then 2.5D/3D art/semantic action directed to that voice.
4. Encode final native 1080x1920/30fps with correctly timed captions and source text. Decode and inspect all key frames, audio levels, phone playback.
5. Separate scientific/craft and owner approval; no publication until both pass.

**Creative hold remains.** No production imports, version bumps, autonomous posting, claim that V independently verified anything, or fabricated science/dosage advice.
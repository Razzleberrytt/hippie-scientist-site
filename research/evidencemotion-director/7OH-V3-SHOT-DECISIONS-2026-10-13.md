# 7-OH native V3 — exact cut-by-cut director decisions (2026-10-13)

**Research only / version freeze ON / no publication / no craft certification.** The following maps the actual V3 research renderer `build_fullhd_matchcut.py:draw_scene(t)`, not an imagined cinematic final. Current V3 MP4 SHA-256 `9259b639d607baf131c26cd8d0f09935e03cbd7c9107f8e6d8d4747565ad9c22` (1080×1920, 30 fps, 1031 frames). Original Kokoro WAV SHA-256 `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435`. Exact appearance is governed by this film hash; re-render/approval cannot be inherited after edits.

## Source identifiers and semantics

- **M**: mitragynine PubChem CID 3034396, formula C23H30N2O4, InChIKey `LELBFTMXCIIKKX-QVRQZEMUSA-N`.
- **H**: 7-hydroxymitragynine PubChem CID 44301524, formula C23H30N2O5, InChIKey `RYENLSMHLCNXJT-CYXFISRXSA-N`.
- **3D(H)**: a seeded RDKit ETKDG/MMFF *computed* conformer of H, not observed geometry, receptor interaction, drug action, or measured pose.
- **S**: reviewed spelling/wording in `original_creative_brief.json` and **T**: actual original-WAV beat windows in `original_beat_timeline.json`. Captions are **beat-aligned**, not MFA word-aligned. Individual shots may cut within a narrated beat only for visual explanation; speech pace does not change.
- Director grammar names G1–G6 reuse `previz-director.mjs`; the grammar labels below are planning classifications, not proof that any shot has earned approval.

| Time (s) | Hero / source | Grammar, camera, cut | Viewer job and intended response | Abort / reject if |
|---|---|---|---|---|
| 0–3.4267 | 3D(H), S hook | G1 object→mechanism; computed-model reveal; opening cut | Recognize a specific chemical question immediately | molecule clipped, illegible first-frame question, fake effects |
| 3.4267–6.25 | 2D(M), H comparison context | G4 two-world; stationary complete structure; hard cut | Establish an accurate reference molecule | cropped atom/bond, incorrect M source metadata |
| 6.25–8.85 | 2D(H), highlighted verified –OH | G3 under-the-lens; fixed diagram; hard cut | See the structural distinction | mislocated OH, image makes reaction claim |
| 8.85–9.78 | complete 2D(M) | G4 fair comparison; hard-matched static frame, hard cut | Identify *first* source clearly | a caption obstructs graph; M/H identities swapped |
| 9.78–10.694 | complete 2D(H), OH highlighted | G4 fair comparison; same framing, hard editorial cut | Compare *second* source without implied conversion | metamorph/morph, incorrect OH, caption obstruction |
| 10.694–13.63 | complete 2D(H) | G3 source evidence; fixed source graph, hard cut | Understand bonds come from an external chemical record | implied experimentally filmed chemistry or fabricated atoms |
| 13.63–16.496 | 3D(H) ball-stick | G1 model reveal; source-locked computed camera sprite | Recognize correspondence between graph and illustration | untagged measured/docking pose, disconnected bonds |
| 16.496–18.48 | 2D(H) | G5 uncertainty; complete fixed graph, hard cut | Separate known atom connectivity from unknown geometry | model inference portrayed as measured evidence |
| 18.48–19.76 | complete 2D(H) | G3 source-to-model; locked diagram, **hard** editorial cut | Read authoritative connectivity before 3D | diagram cropped, premature model claim |
| 19.76–22.04 | 3D(H) calculated model | G5 computed-geometry contrast; model orbit, hard cut | Understand 3D as one mathematical possibility | any simulated transformation, false binding footage, basic/cheap CGI |
| 22.04–23.298 | 3D(H) space-fill | G5 uncertainty; computed close, hard cut | Hear the explicit limitation with matching picture | visual claims receptor data, caption hides qualifier |
| 23.298–25.55 | 3D(H) | G5 structural-effects firewall; camera eases backward from source-bound computed-model close-up, then a **hard cut at 25.55 s**; never depicts receptor effects | Understand structure ≠ human experience | any visual bridge falsely suggesting clinical effect |
| 25.55–27.89 | complete 2D(H) | G3 source evidence; stable documentation view, hard cut | Retain the source's identity and limits | incorrect CID, tiny source copy |
| 27.89–31.09 | exact H PubChem citation | G3 source ledger; **locked, orthogonal/full-frame text-card camera** with no push or pan; **hard cut in at 27.89 s and out at 31.09 s** to protect the 3.2 s reading interval | Have enough time to locate/read CID/source | moving-poster detector penalizes *source-reading hold*, source illegible |
| 31.09–34.3667 | 3D(H) and THS identity | G6 consequence/CTA; **centered three-quarter, fixed camera** on the computed model with legible THS outro overlay; **hard cut in at 31.09 s and terminal picture cut at 34.3667 s**; no gratuitous movement | Recall “follow the evidence,” not a medical benefit | unsupported implication, abrupt audio crop, branded outro obscures conclusion |

## Mandatory inspection and rejection rules

1. Look at the **actual decoded 1080p frame** in every row (not a storyboard) and confirm captions do not touch bonded atoms or source labels. Explicit V3 corrected comparison samples at 9.5 s and 10.0 s replace the prior obstructed overlay. The 20 s model sample remains visually conventional and is a **craft HOLD**.
2. Preserve the direct source CID, model-source caveat, voice WAV hash, final-media hash, hard M→H comparison cut, and the deliberate silent 3.2 s PubChem hold. A static reading hold is not equivalent to an accidentally static 3D hero; do not “fix” it with pointless confetti or camera movement.
3. Distinguish mechanical QA from taste. Fail objectively for crop/misaligned chemical annotation, false chemistry, misplaced captions, missing audio, nonconstant PTS and changed hashes. Independently review visual wow/pacing; no self-awarded craft score.
4. **Freeze:** proposed future film edits must be prepared as bounded preview alternatives, followed by a new MP4 hash and a completely new technical, scientific, device, and craft review. Never overwrite the V3 binary or transfer an approval.

**Disposition:** Full shot-by-shot *director decision plan* is documented with source ID, visual thesis, grammar/camera, cut, intended reaction, and abort condition. A selected shot list is not a reference-shelf PASS, word-level alignment, device approval, or final first-render acceptance.

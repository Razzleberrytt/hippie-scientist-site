# Lane 1 / EM-007.07 — physically inspected current revised 7-OH film: source-science redlines (HOLD)

**2026-10-17; internal machine + assistant visual science audit, not independent qualified scientific review.** Existing research-only Lane 1 PR #6840, coordination #6743 and Lane 3 craft owner PR #6831. No merge/release/film edit/renderer change, no human reviewer impersonation, no version/atomic-card credit. `mayPublish=false`.

## Exact physically received candidate and inspection

- **Movie:** user Library `EvidenceMotion_Lane3_Sequential_Research_Video.mp4`, SHA-256 **`45f86dad98f82dbe0e7e21f831529a8bc4256a8a053bd74a94c5666d03a5e122`**, identical byte SHA to the embedded `films/new_Sequential2D_3D_Shot5_safe_research.mp4` from Lane3 package.
- **Package:** `EvidenceMotion_Lane3_Scene4_Sequential_Safe_Research_20261017.zip`, ZIP SHA-256 `81ac8b662e5f270e0c78370b1992b6e620f12cbc14ad98347459fb64a2bed381`. Independent ZIP CRC and **all 14 declared payload SHA-256 manifest entries** match; narration WAV hash `9dca049ee2d4c827b1283e4816fd6047187f39449de0441fea420b036f959435` remains source metadata, not a phonetic ear verdict.
- **Native media:** independently probed H264 1080×1920 at 30fps, 1,031 frames, 34.3667 s; separately ran FFmpeg `-xerror -err_detect explode` through the complete decoded VIDEO stream with a null sink, exit 0. Film is not a newly approved production render.
- **Review strategy:** visually inspected actual decoded original-resolution frames from all nine original storyboard shots (native frames 8, 35, 55, 85, 112, 160, 209, 244, 310, 360, 405, 445, 480, 500, 530, 554, 555, 575, 595, 610, 630, 660, 700, 705, 743, 775, 795, 821, 845, 880, 925, 950, 975, 1000, 1025), with additional actual native-still captures at 35, 55, 160, 360, 530, 555, 595, 630, 795, 880, 950. This is a bounded **internal** scientific-content inspection; 1,031-frame decoder coverage is *not* 1,031-frame visual/text semantic classification or qualified external viewing.

## Claim/asset/source pass and HOLD boundary

Primary chemical-record cross-check:
- [PubChem 3034396 — mitragynine](https://pubchem.ncbi.nlm.nih.gov/compound/3034396): molecular formula **C23H30N2O4**.
- [PubChem 44301524 — 7-hydroxymitragynine](https://pubchem.ncbi.nlm.nih.gov/compound/44301524): molecular formula **C23H30N2O5** and source stereochemical structure. Parsed actual ZIP `original/7OH_source.mol` with RDKit. Its canonical **isomeric** SMILES exactly equals canonicalized primary PubChem 7-OH SMILES and differs from independently parsed mitragynine PubChem SMILES. Formula computed independently from source mol **C23H30N2O5**. This is a genuine source-molecule identity match **only**: it does not establish actual live 3D pose, effect, receptor occupancy, botanical assay or human benefit.
- **Actual film source slide, native f880 (29.333 s):** visually inspected both correct CIDs, chemical formula C23H30N2O5 and PubChem attribution. Source identity **matches** primary records. Legibility on a real app/device and all-frame text completeness are still unverified.
- **Actual f530 (17.67 s) and f555/f630 (18.50/21.00 s):** current Scene4 visibly separates `VERIFIED 2D RECORD` from `CALCULATED 3D VIEW`. From f595 (19.833 s), `Not a receptor recording` and `NOT FILMED • no receptor binding shown` are visible. This correctly **distinguishes animation from observation**, not scientific validation of physiological mechanism. Film/research sidecar says source/phone plan `phonePlanSha256=null`; no inheritance of an old phone, qualified-review or film acceptance.
- **Actual f795 (26.50 s):** the negation `NOT SHOWN` and `≠ HUMAN EXPERIENCE` visually limit inference about subjective effects. This is appropriate source-strength restraint in sampled frames, not proof viewers understand it.

## L1-R01 — NEWEST film still contains a **semantic ambiguity / editorial HOLD**

**Affected native frames 0–104, 0.000–3.4667 s; both mitragynine and 7-OH source identity stages.** Independently opened actual decoded frames **35** (1.167 s, `MITRAGYNINE`) and **55** (1.833 s, `7-OH`) and directly read the same separate annotation **`No reaction`** under each. The narration asks what differentiates the compounds. Phrase might intend *no chemical conversion in this illustration*, but could be read as *no physiological/drug reaction*. That is ambiguous scientific communication and not a demonstrated absence of biological effects.

**Full opening pixel continuity, actual media not synthetic:** FFmpeg/OpenCV decoded 106 contiguous native frames (0–105). For every **0–104**, compare native BGR pixels in declared lower-annotation ROI **x60–469, y1190–1249** with frame 5: maximum full-ROI mean absolute difference **0.173944 / 255** (allowing lossy H264 quantization). At frame **105**, a real scene change yields **25.981 / 255**. Frame 35 and frame 55 visual readings establish the annotation text in the ROI; the pixel continuity check establishes image persistence, not independent OCR of all 105 frames or viewer meaning. Both opening shots are covered; this is not an isolated one-frame flash.

**Concrete correction owned by Lane 3:** on this exact candidate's opening shots, replace/remove `No reaction` with an unambiguous label of the illustrated **structure comparison only**, e.g. `Not a chemical-reaction animation` if it genuinely fits the intended visuals; do **not** imply a claim about no physiological response. Retain **both chemically distinct source identities**, both correct structures, source cue order, captions, original narration and proven PubChem provenance. Reflow legibly inside mobile safe region—do not shrink type or alter scientific molecules to mask it. Re-encode **one actual full revised MP4**, obtain a *new* whole-movie SHA and matching claim/story/phone source sidecars, and request **fresh** independent Lane 1 semantic plus Lane 4 mobile/actual-pixel audit through Lane 6. Prior SHA's success must not transfer.

## Explicit internal adversarial tests (no original movie mutation)

Five **research-only negative assertions** were intentionally run against the independently pinned inputs: substitute source 7-OH graph with PubChem mitragynine graph; change 7-OH formula to C23H30N2O4; substitute the mitragynine CID 3034396 for 7-OH CID 44301524; substitute a foreign movie SHA; and overwrite the original caption evidence ROI in an in-memory copy. All five were correctly **rejected** by the *bounded independent comparison*. They do **not** prove a general natural-language semantic classifier, film-wide OCR or automation gate exists. Source movie/WAV/ZIP never modified.

## Disposition / cross-lane ownership

- **Lane 1 science-content verdict:** `MACHINE_INTERNAL_SOURCE_IDENTITY_MATCH / EDITORIAL_SEMANTIC_HOLD`. The new Scene4 proof is meaningfully clearer and backed by the exact physical movie; opening claim ambiguity remains unsolved.
- **Lane 3:** fix only L1-R01 in owned craft/film paths, retain source chemical structure; do not solicit Will as quality tester.
- **Lane 4:** independent source-exact text/glyph/mobile safe-zone audit on newly revised whole movie.
- **Lane 6:** pin same actual corrected MP4/WAV/claim/phone bundle for everyone.
- **Lane 2/5:** independently preserve narration and track real first-render status; no inherited audio-quality or premium success.
- **Separate legally/ethically honest gate:** qualified independent medical/scientific reviewer still **NOT RECEIVED**. Assistant machine checks are internal, not V_VERIFIED or clinical conclusions. Source-based high-confidence structural facts never justify claims of opioid effects/safety/plant quantity. No real iPhone/app-native audit or viewer calibration exists from this Lane 1 check.
- **Atomic accounting:** machine-audited research cards **165** + inherited provisional **707** = **872/1590 provisional**; **+0** newly accepted, canonical milestones unchanged. `mayPublish=false`, `approvalToMerge=false`, no platform publication or protected merge authorization.

Owner-conversation independent local machine JSON receipt SHA256 **`2dccde52f529f7a0f029f4fa4a935e0adc2b519a30e674b13292a5cd4f5e6617`** records exact individual PNG byte/pixel SHA, source trace and negative controls; the binary PNGs/MP4 remain in owner Library/conversation storage, not committed to GitHub.

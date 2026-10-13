# Native CPU 3D 7-OH research — continued owner phone-first proof

**October 13, 2026. Research-only.** The production version freeze still applies. There are no new R versions, production imports, publishing jobs, paid models or laptop dependencies. No owner/iPhone auditory acceptance. Quality milestone remains 0/1 then 0/5.

## Why this treatment exists
The prior voiced V5.3 MP4 reused a small source-rendered molecular clip: contrast and precision were poor, many frames hardly changed, and the overall result looked like slides. Simply adding motion effects or more science labels did not address the artistic failure.

## Native geometry and camera treatment
- Same PubChem CID 44301524 source-pinned `7-hydroxymitragynine` molecular graph; RDKit validates C23H30N2O5, InChIKey RYENLSMHLCNXJT-CYXFISRXSA-N. Chiral chemistry and bonds are **never generated**.
- A fixed-seed RDKit ETKDGv3/MMFF *computed conformer*, reoriented using principal axes for legibility, provides all atom coordinates. This is not an experimentally determined geometry or binding pose.
- VTK software offscreen CPU lighting produces **three** source-accurate native shot materials: (1) metallic-lit ball-and-stick where bonds are visible, (2) tracked hydroxyl oxygen macro based on real atom index, (3) space-filling atom-volume interpretation on the identical atom coordinates. Changes of representation are shown as separate shots; they do not imply chemical conversion.
- The **latest opening is one physically continuous camera pullback**, from the actual hydroxyl-bearing oxygen to the complete source-verified structure. It replaces an abrupt 1.6-second edit and avoids a generated fake-receptor transition.
- Entire deterministic RDKit 2D molecular diagram is shown **contained**, never cropped. A botanical source image is approved **illustrative atmosphere only**, not evidence of 7OH abundance in a photographed leaf.
- Voice remains exact Kokoro ONNX 0.6.1 `am_michael` original WAV SHA `434fca399f1ab74a12a5beb3da44373fe1117696b045ffd8026179df7bf14b34`, duration 33.1353 s. Cuts use pinned **beat-level** original-WAV boundaries, not invented MFA word times. No voice stretching or replacement.

## Encoded proof and quantitative negative filters
All MP4s are research-only portrait 540x960, 15fps, H.264 Constrained Baseline, AAC audio. Full independent decode of 497 video frames, video/audio timing and stream types succeeded on the new continuous-reveal candidate.

| Experiment | Exact MP4 SHA-256 | ROI low-motion share | Longest low-motion stretch |
| --- | --- | --- | --- |
| V5.3 prior | `2b0567329d0f4bd773393f44c97cbd5f1c18511645a6c0c833db26fc8462db81` | 62.50% | 5.733 s |
| Native OH close-up + hard cut | `38673f325005040d6f36c8471a210ec729b588cbf7f801b676c589a4d06dc7cb` | 76.01% | 3.600 s |
| Native continuous pullback | `41c4f0807b26ded16c86341363ba613391c7ff6525eaf3d8745a24f1f86bb919` | 71.77% | 3.600 s |

Audit ROI x=70..460, y=190..640, 96x110 downsampled grayscale; changed pixel threshold 9/255; near-static frame change <2%. These metrics are **negative filters only**. They do not certify frame quality or compare fairly across new model styles because geometry size and masking affect pixel sensitivity. Static time improved, but the share of minimally changing frames remains high. This is **not** cinematic acceptance.

## Source portability and honest limitations
- Self-contained Linux CPU reproduction bundle is supplied as a conversation artifact. It contains original voice WAV/receipt/brief/timeline, immutable illustrative source PNG, native VTK/RDKit script, compositing code, and encoded MP4. It does not configure a scheduled renderer, GitHub Action, production dependency, or automatic publish.
- The bundle is **not** an in-repo binary asset. Native model preview frame arrays are recreated from checked model code; provenance is documented by SHA manifest.
- A clean-room rerender caught and repaired a subtle camera-scale expression drift in the packaged source. After repair, the entire clean-room encode completed: **497/497 frames** and exact MP4 SHA **41c4f0807b26ded16c86341363ba613391c7ff6525eaf3d8745a24f1f86bb919** matched the prior master **byte for byte**. This establishes repeatability in the same CPU/software environment, not cross-platform reproducibility, visual excellence or measured biological truth. The bundle's ZIP archive itself passed CRC integrity and its nine SHA-manifest file hashes were independently checked; archive SHA **a7ea484c6f66ff5e6628eee1c8548b1ffcf4b3a90d26e157299add8a8c2677e4**.
- No final 1080x1920/30fps render has been approved. Owner ear-check (especially 7-OH and mitragynine), independent scientific editorial review, iPhone playback and human comparative craft review are **PENDING**. Generated botanical textures are to remain clearly illustrative.

**Craft verdict: HOLD.** The hydroxyl-to-whole-molecule shot is a more intentional, explanatory hook, and the rendered representations are chemically governed, but the visual materials are still below the user's cinematic benchmark. Do not count this preview as the first of six accepted excellent masters.

# 7-OH verified molecular hero — research only

**2026-10-12 · Phone-first · production version/capability freeze.** This is a source-locked scientific *geometry study* for the EvidenceMotion director, not a finished voiced video, medical claim, final 1080p renderer, product visual, receptor docking, experimental crystal structure, or publication approval.

## Scientific identity — independently cross-checkable
- Compound: 7-hydroxymitragynine. PubChem CID **44301524**. Formula **C23H30N2O5**.
- Verified InChIKey: **RYENLSMHLCNXJT-CYXFISRXSA-N**; PubChem isomeric SMILES pinned in `validated_7oh_chemistry.py`.
- Primary structural source: https://pubchem.ncbi.nlm.nih.gov/compound/44301524
- Cross-check: https://precision.fda.gov/ginas/app/ui/substances/c50748a1-8231-42ad-a263-6abc6bc49005
- Python RDKit validated exact InChIKey, formula, 30 heavy atoms, a connected molecular graph, four defined chiral centers and one free hydroxyl oxygen: **3/3 local chemistry tests passed**.
- Computed ETKDGv3 / MMFF conformation is an **illustration of a possible 3D geometry**, NOT a measured structure, docking configuration, binding study, receptor model, or depiction of drug effects.
- Atom positions derive solely from the pinned molecular graph. Bond tubes connect actual atom centers. An earlier experiment had visually detached bond cylinders; that render was rejected and rebuilt with tube geometry.

## Rendering trial — local verification
- CPU software VTK/Pillow/FFmpeg with a pinned **illustrative-only botanical PNG** (SHA-256 `4516b902806630ba97941636fbe11a5db8859b8c19a5089adaedbde6d497090e`), never the rejected synthetic chemical diagrams.
- 480 × 854, 12 fps, 72 frames / 6 seconds; H.264 Baseline Level 3.1, `yuv420p`, `faststart`, deliberately silent.
- Local tested prototype output SHA-256: `9308dc188b708001b2cd53d550d811c51385ed9779aa59e1659941d219aaa8a1`. **Do not claim the repository's adapted renderer produces an identical SHA until it has been independently run**.
- The pinned botanical source is **not committed or downloaded automatically**. Portable research script takes `--source` (must match SHA) and `--out`; Windows laptop is not needed.
- The repo source uses the same verified stereochemical graph and fixed conformer seed, but this Python renderer requires manual dependency installation on an isolated test runner; no CI, cloud GPU or paid inference is triggered.

## Status and next acceptance
- Source-identity/correctness gate: **local tests passed**, PubChem/FDA identity checked. This does not mean a full scientific or legal video review occurred.
- Rendering: **usable source-derived molecular asset**, but visual style is early research; not declared top-of-niche excellence.
- Narration: **ABSENT**. Phone playback: **NOT CONFIRMED**. Independent V verification: **NOT CLAIMED**. Craft: **HOLD**. Milestone: **0/1**, then 0/5.
- Next should be two director treatments based on a verified science script and *original auditioned Kokoro narration*, with exact word anchors driving a meaningful hydroxyl-site reveal; no fake binding animation. Compare cinematic readability at phone size before any final high-resolution render.

## Execute manually in an isolated prepared environment
```bash
cd research/evidencemotion-director
python -m unittest test_validated_7oh_chemistry.py -v
python render-verified-7oh.py --source /path/to/approved_botanical_crop.png --out /tmp/evidencemotion-7oh-previz
```
Requirements for this research-only CPU path: Python 3.12 or compatible, RDKit, NumPy, VTK, OpenCV, Pillow, FFmpeg, and DejaVu Sans fonts. No packages or model weights are installed by the script. The source is not a license to make any therapeutic claims or representations of measured molecular poses. There are no mutations to production scripts, CI or content.

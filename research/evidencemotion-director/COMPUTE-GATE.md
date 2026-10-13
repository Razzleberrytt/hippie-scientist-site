# EvidenceMotion research lane — compute reality gate (2026-10-12)

**Status:** RESEARCH-ONLY. Owner-approved exploration; NOT a production release. Version freeze remains in force: no new R-numbers, capability flags, production dependencies, publishing privileges, or changes to shipping scripts until one excellent first-render MP4 and five consecutive excellent first renders, each independently reviewed and accepted.

## Observed in this repository (not a machine-inventory claim)
- `.github/workflows/evidencemotion-r818-physical-smoke.yml`: `ubuntu-latest` CPU-hosted job, Mesa software OpenGL via Xvfb, Python 3.12, VTK 9.6.2, Pillow 12.3.0, NumPy 2.3.5 and FFmpeg. The job specifies a **20-minute timeout** and 285 native 1080x1920 30-fps test frames; that is a configured test, not a benchmark of a full excellent voiced video.
- `scripts/distribution/r818-physical-cinema.py`: actual offscreen VTK/Pillow native 3D and 2D frame producer for limited semantic verbs; do not call this a general-purpose cinematic director.
- `scripts/distribution/r814-cinematic-director.mjs`: deterministic hash-based scene styling with four compositions and four camera choices; hash diversity is not purposeful composition selection.
- `.devcontainer/Dockerfile`: Node 20 slim, Python and build tools; no configured CUDA, GPU allocation, generative inference weights or paid provider.
- `.github/workflows/evidencemotion-r819-quality.yml`: CPU `ubuntu-latest` test workflow with 12-minute timeout. No proof of access to a GPU anywhere else.
- Actual billable GitHub minutes, local GPU inventory, paid inference account balance and cost per full video: **UNKNOWN**, not "$0".

## Admission matrix — no new inference integrations at this phase
| Candidate | Documented requirement / execution path | Project capacity status | Decision |
| --- | --- | --- | --- |
| VTK / Pillow / FFmpeg / JS storyboard | Existing CPU runner; exact workflow exists | EXISTING TOOLCHAIN; render duration must be measured | ALLOW research previz, reuse without production edits |
| Depth Anything V2 Small | 24.8M parameters; upstream offers CPU fallback | Local latency / memory NOT BENCHMARKED | DEFER inference; can be researched |
| FLUX.1 schnell | Official pipeline supports CUDA and CPU offload; no reliable fixed minimum across variants | GPU availability unknown; commercial rights for chosen model/version must be validated | BLOCK integration |
| TRELLIS | Upstream states Linux + NVIDIA GPU at least 16 GB VRAM | No provisioned GPU verified | BLOCK integration |
| Wan 2.2 TI2V-5B | Upstream documents a 24 GB VRAM example with model offloading for 720p/24fps | No provisioned GPU verified | BLOCK integration |
| LTX-2 family | Upstream advises high-end GPUs; requirements vary by release and inference mode | No provisioned GPU verified; no paid-API terms evaluated | BLOCK integration |
| SAM 2 | Segmentation model; actual deployment hardware/path unmeasured | No provisioned GPU verified | BLOCK integration |

References: https://github.com/Wan-Video/Wan2.2 ; https://github.com/microsoft/TRELLIS ; https://github.com/DepthAnything/Depth-Anything-V2 ; https://github.com/black-forest-labs/flux ; https://support.ltx.studio/hc/en-us/articles/32485308551570-Is-the-LTX-model-open-source ; https://ai.meta.com/research/sam2/

## Research expenditure gate
- **Paid model spending authorized: $0** (a forward-looking limit, NOT an assertion existing CI, electricity or render time is free).
- No API key or credential additions, model downloads, inference packages, auto-triggered GPU jobs, external provider actions, or quota consumption without a separately approved, written budget and licensing review.
- Inventory required before each proposed model integration: provider/runner, CPU type and cores, physical RAM, GPU model, verified free VRAM, CUDA/driver, persistent disk, model/weight license, known hourly and token/credit rate, existing minutes/credits, actual access permissions and rollback path.
- First perform one isolated representative previz benchmark with wall-clock duration, maximum RAM/VRAM, disk use, output resolution and render hash. Estimate `fullVideoCost = startupCost + ceil(shots/outputsPerRun) * billedUnitsPerRun * rate`. Report low/median/high based on *measured* units and real provider price. If any variable is unknown, display `UNKNOWN — NOT ADMITTED`, not an invented price.
- Budget-per-video and maximum render-minutes remain TBD until a verified account/infrastructure report; no aspirational costs or assumed CI free-tier coverage.

## Hard isolation
All research files reside under `research/evidencemotion-director/`. They are not imported by production, have no run-on-push workflow, do not alter current R8.18/R8.19 packages, and are **never** evidence of an accepted video. External generation may only produce nonfactual atmosphere with artwork provenance; factual graphs, molecules, statistics, captions, sources, qualifiers and mechanism claims remain governed/deterministic.

## Owner laptop: confirmed Windows GPU inventory (2026-10-12)

Owner-supplied Windows Task Manager screenshots and **actual `nvidia-smi` output** confirm:
- GPU 1: **NVIDIA GeForce RTX 3050** (remaining suffix truncated in terminal; laptop form factor observed), **4096 MiB / 4.0 GB dedicated VRAM**, GPU power display **9W / 30W** at idle; 30W is the displayed cap at the observed performance state, not verified sustained render TGP.
- Driver **610.60**, `nvidia-smi` reports **CUDA Version 13.3** (maximum driver-supported CUDA API, NOT evidence of installed CUDA Toolkit/PyTorch).
- GPU 0 is AMD Radeon integrated graphics. The 3.6 GB shared GPU memory is borrowed system RAM, not VRAM.
- Windows reports **7.2 GB usable system memory**, about **5.9 GB / 82% in use** at observation; NVMe SSD detected, capacity/free disk space **UNKNOWN**.
- GPU compute runs have **not been benchmarked**; quality, throughput, installed CUDA runtime, PyTorch device access, sustained thermals, and upgradeability are **UNKNOWN**.

**Updated admission result:** Local NVIDIA CUDA path exists with 4 GB VRAM. Admit **research-only benchmarks** for deterministic 2D/3D FFmpeg/VTK/Blender rendering, small CUDA depth or segmentation networks, and optionally tightly constrained/quantized low-resolution image generation if memory-safe and genuinely useful. Do not admit full native FLUX, TRELLIS, Wan 2.2, or LTX high-end video generation on this hardware. Low system RAM is a strong additional constraint; shared memory is slower and does not satisfy dedicated VRAM requirements. No installs, model weights, auto-jobs, production feature changes, or paid inference authorized by this finding.

**Next zero-cost local validation:** verify NVIDIA device via `nvidia-smi` (complete), check RAM free and disk free, check `python -c "import torch; print(torch.cuda.is_available()); print(torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU')" ` *only if torch is installed*, then benchmark a small 512px previz under observation; log wall time, peak VRAM, RAM and render-quality comparison. No new system requirements before a measured benefit is shown.

## Owner operating decision: PHONE-FIRST, laptop optional (2026-10-12)
- **ACTIVE PATH:** The owner operates and reviews from an iPhone. Existing remote CPU GitHub/cloud runners execute builds and previews; do not imply that an iPhone runs VTK, Blender, FFmpeg, NVIDIA CUDA models, or full video encodes itself.
- **PARKED ALTERNATE:** RTX 3050 4-GB VRAM laptop inventory above is saved for a future local workstation experiment, but it is **not required, scheduled or integrated**. No laptop setup requests or RAM upgrades are a prerequisite for this research track.
- Continue **CPU-first, no paid model downloads/inference, no production changes**. The absence of a locally active PC must never block planning, shot selection, preview critique, cloud-rendered QA, or owner iPhone MP4 audition.
- **Decision trigger to revisit laptop:** a concrete measurable need (e.g., remote rendering time or quotas repeatedly block approved preview tests, or an evaluated small model materially improves visually) plus separate owner approval. Compare actual quality/time/cost first. Local GPU availability does not, by itself, increase the realism or factual correctness of a shot.

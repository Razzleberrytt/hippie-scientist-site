# EvidenceMotion World Engine — Level 2 Master Checklist

**Program:** Simulated Reality / Cinematic Documentary Worlds  
**Date opened:** 2026-10-29  
**Owner intent:** Build reusable, visibly coherent, scientifically qualified physical worlds for EvidenceMotion to film.  
**Scope:** Molecules, neurons, organs, liquids, celestial mechanics, materials, lighting, and virtual cinematography.  
**Status:** **0/64 Level 2 tasks verified**; Level 1 research prototype exists separately. All checkboxes below begin open. Do not credit a task without linked code, an executed test/asset, and its acceptance evidence.

## Starting point (not counted toward 64)

Existing local Level 1 `em_world_engine.py` implements a deterministic five-body Newtonian velocity-Verlet simulator, 3D pinhole projection, and an H.264 review video. Seven unit/integration tests are defined in `test_world_engine.py`. `first-light.mp4` is a **540×960, 75-frame, 30 fps research preview**, accompanied by a hash/physics receipt. It is not a production renderer, physical molecular simulator, biological model, or verified scientific dataset. Integrate cautiously with existing `scripts/distribution/r818-physical-cinema-provider.mjs`, `r818-native-frame-sequence.mjs`, and `r818-telemetry-qa.mjs`; never relax the first-pass or release gates.

## Completion rules

1. Every checked task requires a code or artifact reference, a reproducible command, and an actual result (PASS/HOLD/FAIL); design documents alone do not establish functioning simulation.
2. Distinguish **simulated** (numerical model and documented equations), **scientific visualization** (sourced measured/structural data), **illustrative** (art-direction analogy), and **procedural animation** (no physical dynamics). Never mislabel symbolic receptor docking, neural signals, organ flows, or planet scale.
3. Every simulation scene has pinned units, initial state, integration method, time scale, assumptions, input provenance, seed, source hash, geometry hash, and render receipt.
4. Preview must stay isolated from production until source/craft/phone/voice/technical gates pass. Do not silently introduce new scientific claims, change approved narration, or mark owner/V approval on its behalf.
5. Daily progress displays `verified/64`, IDs closed, exact test artifacts, and blockers; no fabricated percent jumps. First Level 2 demonstration = selected P0 cards completed, **not** the entire Level 2 program.

## A — World specification & reproducibility (8 tasks)

- [ ] **W2-001 [P0] — Scene recipe JSON schema.** Enforce world type, objects, physical units, timeline, camera, lighting, and output options with schema validation.
- [ ] **W2-002 [P0] — Seeded scene reproducibility.** Two executions with identical recipe and environment reproduce the same simulation state hashes.
- [ ] **W2-003 [P0] — Physical units and scale registry.** AU/day/solar-mass and SI conversions are explicit and mismatched domains are rejected.
- [ ] **W2-004 [P0] — Independent simulation clock.** Fixed physics timestep, presentation frame timestep, time dilation, and exact start/end snapshots are separated.
- [ ] **W2-005 [P0] — Entity/component inventory.** Typed bodies, forces, geometry, materials, and annotations have stable IDs; unknown components fail closed.
- [ ] **W2-006 [P1] — Scene-state save/resume.** Checkpoint/restart leads to identical final state as an uninterrupted run.
- [ ] **W2-007 [P1] — Versioned feature gates.** Research-only providers remain opt-in; the default production path does not change.
- [ ] **W2-008 [P1] — Recipe fixtures.** Pin minimal solar, molecular, neural, fluid, and organ examples with documented assumptions.

**Gate A:** A deterministic, validated recipe fully describes one complete simulated shot.

## B — General physics and particles (8 tasks)

- [ ] **W2-009 [P0] — Extract reusable physics API.** Gravity integrator is callable without the film renderer or global state.
- [ ] **W2-010 [P0] — Collision and bounds policy.** Explicit choices (reject, bounce, merge, absorb) with conservation/error tests for supported types.
- [ ] **W2-011 [P0] — Generic particle actor.** Stable particle IDs, positions, velocities, and time-indexed trajectory recording.
- [ ] **W2-012 [P0] — Boundary conditions.** Periodic, reflecting, and absorbing box boundaries are independently tested.
- [ ] **W2-013 [P1] — Brownian motion model.** Source and noise scale specified; seeded trajectory statistics match a documented reference tolerance.
- [ ] **W2-014 [P1] — Numerical stability watchdog.** Detect nonfinite state, excessive step size, unbounded energy drift, and unsupported solvers.
- [ ] **W2-015 [P1] — Scale-aware simulation adapters.** N-body gravity, particle diffusion, and simplified flow share an interface, never one false universal equation.
- [ ] **W2-016 [P2] — Performance baselines.** Benchmark CPU runtime/memory versus actor count and publish sensible scene budgets.

**Gate B:** At least two physically distinct solvers run from the same recipe/timeline system with passing invariant tests.

## C — Molecular worlds (8 tasks)

- [ ] **W2-017 [P0] — Exact source-grounded molecule importer.** Import atom types, bonds, stereochemistry, units, and source provenance from a verified molecular representation; no fabricated bonds.
- [ ] **W2-018 [P0] — Atom/bond geometry model.** Properly indexed, connected atom/bond mesh; supports source coordinates with explicit measured vs computed labeling.
- [ ] **W2-019 [P0] — Cinematic molecule camera.** Orbit, macro push, clipping-safe framing, and legible atom annotations over a rotating actual 3D structure.
- [ ] **W2-020 [P1] — Molecular trajectory classification.** Clearly distinguish a static conformer, arbitrary rotation, diffusion, and actual MD trajectory.
- [ ] **W2-021 [P1] — Imported trajectory playback.** Read time-stamped external motion safely; verify frame count, atom order, coordinates, and units.
- [ ] **W2-022 [P1] — No fake docking QA.** Reject implied binding pose/effect without source geometry and reviewed mechanism; symbolic models get visible caveats.
- [ ] **W2-023 [P2] — Solvent visualization prototype.** Particle diffusion around a molecule, not a claim of accurate force-field molecular dynamics.
- [ ] **W2-024 [P1] — Molecular documentary pilot.** A reviewed 5–10 s source-grounded molecule shot renders to actual video with source/geometry receipts.

**Gate C:** Molecules are structurally sourced and filmable; dynamics claims precisely match implemented or imported data.

## D — Neural and cell-scale worlds (8 tasks)

- [ ] **W2-025 [P0] — Neuron geometry primitives.** Soma, axon, dendrites, and synapse have distinct shapes and deterministic scene IDs.
- [ ] **W2-026 [P0] — Propagation model.** Define a bounded stylized spike/conduction model with controlled timing and explicit scientific scope.
- [ ] **W2-027 [P0] — Event-to-visual binding.** Highlighted signals/vesicles follow model events—not decorative unrelated glowing dots.
- [ ] **W2-028 [P1] — Synaptic transmission demo.** Show release/diffusion/reception as an *illustrative* sequence with a visible label; no invented pharmacology.
- [ ] **W2-029 [P1] — Network topology recipes.** Small connected networks with stable nodes, edges, and repeatable stimulus propagation.
- [ ] **W2-030 [P1] — Measurement-mode overlay.** Expose what variable drives each signal and distinguish conceptual from quantitative readouts.
- [ ] **W2-031 [P2] — Alternative model comparison.** Optional documented integrate-and-fire or validated published model comparison; record assumptions and error.
- [ ] **W2-032 [P1] — Neural documentary pilot.** Render 5–10 s showing an understandable cause → signal → response with narration-safe composition.

**Gate D:** A visible neural event is driven by a documented model; no unsupported health or drug mechanism is implied.

## E — Fluids, organs, and environments (8 tasks)

- [ ] **W2-033 [P0] — Procedural organ geometry baseline.** At least one recognizable, clearly illustrative organ scene with stable anatomy labels and source review.
- [ ] **W2-034 [P0] — Basic fluid solver.** Choose and document a bounded particle or grid solver; validate mass/volume behavior in a canonical toy test.
- [ ] **W2-035 [P1] — Flow path and obstacles.** Show a tube/channel with reproducible flow around an obstruction; document simplified assumptions.
- [ ] **W2-036 [P1] — Environmental material library.** Reuse coherent water, tissue, glass, metal, and atmosphere materials without random color schemes.
- [ ] **W2-037 [P1] — Scale transition grammar.** Camera can transition molecule → cell → organ without presenting different scales as literal co-located views.
- [ ] **W2-038 [P1] — Organs are anatomically qualified.** Verify orientation/terminology with a named reference; reject misleading precise physiology claims.
- [ ] **W2-039 [P2] — Soft-body/tissue motion study.** Bounded procedural deformation explicitly distinct from validated biomechanical simulation.
- [ ] **W2-040 [P1] — Flow/organ documentary pilot.** Render 5–10 s with a clearly labeled simulated flow and no invented clinical causation.

**Gate E:** An understandable flow scene exists, with explicit numerical and anatomical limitations.

## F — Cinema and visual cohesion (8 tasks)

- [ ] **W2-041 [P0] — One restrained visual system.** Global color/material/exposure rules prevent mixed dark/light scenes and neon overload.
- [ ] **W2-042 [P0] — Virtual camera rig.** Perspective, focal length/FOV, camera orbit, dolly, focus target, and safe zoom constraints.
- [ ] **W2-043 [P0] — Consistent lighting engine.** Key/fill/rim/ambient settings, physically plausible shading cues, and reproducible brightness tests.
- [ ] **W2-044 [P1] — Depth and occlusion.** Visible objects sort correctly in depth; avoid clipping, object pass-through, and fake perspective.
- [ ] **W2-045 [P1] — Shot-language recipes.** Macro reveal, lateral track, orbital survey, cutaway, and scale bridge tied to teaching intent.
- [ ] **W2-046 [P1] — Temporal continuity.** Persist object positions, lighting, material identity, and camera geography between related shots.
- [ ] **W2-047 [P1] — Mobile legibility and safety bounds.** 9:16 captions, important labels, depth-of-field, and motion remain readable on actual phone frames.
- [ ] **W2-048 [P2] — Render look-dev comparison.** Human-selected approved reference frames and contact sheets guide refinements, not arbitrary palette randomization.

**Gate F:** Different worlds are recognizably from one film, with readable visuals and intentional camera actions.

## G — EvidenceMotion integration (8 tasks)

- [ ] **W2-049 [P0] — Producer adapter.** Export deterministic, frame-indexed scenes to a clearly versioned `world-engine` research provider.
- [ ] **W2-050 [P0] — Authentic render telemetry.** Emit projected object bounds and state from the same rendering execution, not invented storyboard metadata.
- [ ] **W2-051 [P0] — Exact native output profiles.** 1080×1920 at 30 fps for official candidate production; allow 540×960 labeled research preview.
- [ ] **W2-052 [P0] — Frame integrity manifest.** Per-frame hashes, sequencing, scene duration, and media decoding checked against the actual bytes.
- [ ] **W2-053 [P1] — Adapter compatibility tests.** Confirm R8.18 native-frame, telemetry, and first-pass receipts remain intact; fail closed on unsupported art.
- [ ] **W2-054 [P1] — Narration-first synchronization.** Camera/physics sampled at approved spoken beat times; no made-up word-level alignment.
- [ ] **W2-055 [P1] — Render cost and recovery.** CPU/GPU choice, budgeted preview mode, resumable frame generation, and crashed-job recovery.
- [ ] **W2-056 [P1] — Provider isolation review.** Existing site builds, unrelated EM exports, and publishing are byte-for-byte unaffected by the new opt-in provider.

**Gate G:** A new world scene can become a *candidate* EM beat without bypassing release/safety/asset proof.

## H — Testing, demos, and acceptance (8 tasks)

- [ ] **W2-057 [P0] — Determinism and hash suite.** Validate recipe, scene state, frame bytes, and selected encoded outputs across repeat runs.
- [ ] **W2-058 [P0] — Physical/structural validation suite.** Independent conservation checks, solver-specific reference tests, coordinate/unit checks, and source geometry assertions.
- [ ] **W2-059 [P0] — Three domain demonstration films.** Produce **molecule, neuron, and fluid/organ** candidate clips (≥5 s each), plus a gravitational scene for continuity.
- [ ] **W2-060 [P0] — Experience QA on actual rendered pixels.** Check first 3 s, contrast, motion, object comprehension, clipping, strobing, captions and contact sheets.
- [ ] **W2-061 [P1] — Editorial/biomedical red-team pass.** Review illustrative vs simulated claims, caveats, causal interpretation, and downstream narration.
- [ ] **W2-062 [P1] — First-pass craftsmanship challenge.** Owner evaluates one fully encoded candidate on phone; defects become upstream tests, not repeated cosmetic patches.
- [ ] **W2-063 [P2] — Reliability milestone.** Five *consecutive* first-pass candidates meet agreed technical + owner visual acceptance, independently documented.
- [ ] **W2-064 [P1] — Release governance handoff.** Document what shipped, known limits, commands, failure behavior, and explicit approval decision before production activation.

**Gate H / Level 2 definition of done:** Four representative simulation domains available; 3 source-qualified newly rendered demonstrations plus a gravity baseline; deterministic recipes and genuine scene telemetry; honest modeling caveats; reproducible actual media; R8.18 compatibility; independent scientific/artistic/editorial and owner phone review. A prototype with passing tests does **not** automatically equal production approval.

## Delivery sequencing

- **Sprint 1 — World Core [P0]:** W2-001–005, 009–012, 041–043, 049–052, 057–058. Establish recipes, multiple physics types, cinema, and trustworthy output first.
- **Sprint 2 — Science Worlds [P0 + selected P1]:** W2-017–019, 024–027, 032–034, 040 and related source/caveat tasks. Render working molecules, neural signals, and fluid/organ pilots.
- **Sprint 3 — Studio Integration:** remainder of A–G; EM adapter, coherent shots, phone QA, speed and reliability.
- **Sprint 4 — Acceptance:** W2-059–064 and independent approvals. Keep research previews distinct from approved release masters.

## Progress ledger

| Date | Verified Level 2 tasks | Evidence | Open blockers |
|---|---:|---|---|
| 2026-10-29 | 0/64 | Planning checklist only; Level 1 first-light research preview exists | No Level 2 code yet; integration and domain-specific validators unbuilt |

**Progress accounting rule:** Update a checkbox only after the corresponding runnable artifact/test is verified. The user can say **"continue"** to execute the next unblocked tasks; do not describe planned tasks as completed.
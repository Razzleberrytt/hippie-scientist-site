# EvidenceMotion Atomic Workcards — Decoded media, mobile, scientific and publication gates

> **Planning templates, not tested results.** Source: [243-subtask register](../GRANULAR-46-EXECUTION-REGISTER.md); [canonical 46 milestone authority](../COMPLETION-CHECKLIST.md). Each `EM-###.##` source item is decomposed into six or seven narrowly scoped checkpoints below. **All boxes are NOT_AUDITED**, not necessarily missing implementation. Never infer parent acceptance from checked planning cards.

## Atomicity contract

- `U` = identify **one** real unit (one claim, word, scene, encoded film, fixture, permission, etc.); `S` = lock one source/input identity; `O` = define **one** measurable decision rule; `X` = perform/replay **one** bounded change/probe; `T` = run **one** positive observation; optional `N` = run **one** adversarial/negative case; `R` = file one hash-bound decision/receipt.
- Expand repeated units as `EM-###.##.X@<stable-unit-id>` and test cases as `EM-###.##.N@<case-id>` **only after enumerating real underlying objects**; do not fabricate counts or premark them PASS. A task with five claims is five independently linked instance results, not one blanket checkbox. Failed instances stay visible.
- The template `.X` is **not** completed just because source code exists: it requires actual output for the chosen unit; `.T` is **not** completed from a synthetic fixture when the gate requires genuine media, human calibration, primary-source science, or device playback.
- Inputs must be independently reproducible or explicit `BLOCKED` with the missing external/owner dependency. Never use generic ASR, pixel scores, or self-made human-review JSON to award phonetic, audience, craft, clinical, or posting authority.
- Finish actual implementations under existing admitted issue/PR and workstream; these checkboxes are checkpoints, **not** hundreds of new GitHub tickets or PRs.

### EM-029.01 — Decode original H.264 preview and report complete frame count, rate and dimensions

**Required deliverable from 243-subtask register:** ffprobe receipt. **Unit of work:** one decoded media stream. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-029.01.U** — Register exactly **one decoded media stream** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-029.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-029.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **ffprobe receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-029.01.X** — For that **one decoded media stream**, perform or independently replay this bounded operation: **Decode original H.264 preview and report complete frame count, rate and dimensions**. **Receipt:** a single output artifact corresponding to **ffprobe receipt**.
- [ ] **EM-029.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-029.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-029.02 — Verify AAC stream and copied original audio identity

**Required deliverable from 243-subtask register:** checksum/audio stream receipt. **Unit of work:** one decoded media stream. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-029.02.U** — Register exactly **one decoded media stream** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-029.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-029.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **checksum/audio stream receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-029.02.X** — For that **one decoded media stream**, perform or independently replay this bounded operation: **Verify AAC stream and copied original audio identity**. **Receipt:** a single output artifact corresponding to **checksum/audio stream receipt**.
- [ ] **EM-029.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-029.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-029.03 — Test frame gap, truncated stream and invalid codec cases

**Required deliverable from 243-subtask register:** failure evidence. **Unit of work:** one decoded media stream. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-029.03.U** — Register exactly **one decoded media stream** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-029.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-029.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **failure evidence**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-029.03.X** — For that **one decoded media stream**, perform or independently replay this bounded operation: **Test frame gap, truncated stream and invalid codec cases**. **Receipt:** a single output artifact corresponding to **failure evidence**.
- [ ] **EM-029.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-029.03.N** — Exercise one realistic failing or adversarial case for **Test frame gap, truncated stream and invalid codec cases**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-029.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-029.04 — Label preview only, never native release-ready

**Required deliverable from 243-subtask register:** status test. **Unit of work:** one decoded media stream. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-029.04.U** — Register exactly **one decoded media stream** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-029.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-029.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **status test**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-029.04.X** — For that **one decoded media stream**, perform or independently replay this bounded operation: **Label preview only, never native release-ready**. **Receipt:** a single output artifact corresponding to **status test**.
- [ ] **EM-029.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-029.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-030.01 — Create baseline clips for static poster, weak hero motion and missing artifact

**Required deliverable from 243-subtask register:** inputs. **Unit of work:** one known failure fixture. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-030.01.U** — Register exactly **one known failure fixture** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-030.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-030.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **inputs**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-030.01.X** — For that **one known failure fixture**, perform or independently replay this bounded operation: **Create baseline clips for static poster, weak hero motion and missing artifact**. **Receipt:** a single output artifact corresponding to **inputs**.
- [ ] **EM-030.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-030.01.N** — Exercise one realistic failing or adversarial case for **Create baseline clips for static poster, weak hero motion and missing artifact**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-030.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-030.02 — Create cases for stretched audio, source drift and falsely documentary images

**Required deliverable from 243-subtask register:** inputs. **Unit of work:** one known failure fixture. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-030.02.U** — Register exactly **one known failure fixture** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-030.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-030.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **inputs**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-030.02.X** — For that **one known failure fixture**, perform or independently replay this bounded operation: **Create cases for stretched audio, source drift and falsely documentary images**. **Receipt:** a single output artifact corresponding to **inputs**.
- [ ] **EM-030.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-030.02.N** — Exercise one realistic failing or adversarial case for **Create cases for stretched audio, source drift and falsely documentary images**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-030.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-030.03 — Run validators to verify every failure is rejected independently

**Required deliverable from 243-subtask register:** test matrix. **Unit of work:** one known failure fixture. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-030.03.U** — Register exactly **one known failure fixture** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-030.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-030.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **test matrix**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-030.03.X** — For that **one known failure fixture**, perform or independently replay this bounded operation: **Run validators to verify every failure is rejected independently**. **Receipt:** a single output artifact corresponding to **test matrix**.
- [ ] **EM-030.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-030.03.N** — Exercise one realistic failing or adversarial case for **Run validators to verify every failure is rejected independently**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-030.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-030.04 — Keep regression suite in bounded offline/CI automation

**Required deliverable from 243-subtask register:** repeatable run evidence. **Unit of work:** one known failure fixture. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-030.04.U** — Register exactly **one known failure fixture** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-030.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-030.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **repeatable run evidence**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-030.04.X** — For that **one known failure fixture**, perform or independently replay this bounded operation: **Keep regression suite in bounded offline/CI automation**. **Receipt:** a single output artifact corresponding to **repeatable run evidence**.
- [ ] **EM-030.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-030.04.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-030.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-031.01 — Create manifest enumerating intermediate images, scripts, source IDs, voice, captions and exact MP4

**Required deliverable from 243-subtask register:** file list. **Unit of work:** one source/intermediate file. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-031.01.U** — Register exactly **one source/intermediate file** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-031.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-031.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **file list**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-031.01.X** — For that **one source/intermediate file**, perform or independently replay this bounded operation: **Create manifest enumerating intermediate images, scripts, source IDs, voice, captions and exact MP4**. **Receipt:** a single output artifact corresponding to **file list**.
- [ ] **EM-031.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-031.01.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-031.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-031.02 — Rebuild sources twice in clean directories with pinned tools

**Required deliverable from 243-subtask register:** per-file SHA comparison. **Unit of work:** one source/intermediate file. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-031.02.U** — Register exactly **one source/intermediate file** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-031.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-031.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **per-file SHA comparison**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-031.02.X** — For that **one source/intermediate file**, perform or independently replay this bounded operation: **Rebuild sources twice in clean directories with pinned tools**. **Receipt:** a single output artifact corresponding to **per-file SHA comparison**.
- [ ] **EM-031.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-031.02.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-031.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-031.03 — Perform safe path, symlink and injected byte corruption tests

**Required deliverable from 243-subtask register:** manifest guard failures. **Unit of work:** one source/intermediate file. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-031.03.U** — Register exactly **one source/intermediate file** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-031.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-031.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **manifest guard failures**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-031.03.X** — For that **one source/intermediate file**, perform or independently replay this bounded operation: **Perform safe path, symlink and injected byte corruption tests**. **Receipt:** a single output artifact corresponding to **manifest guard failures**.
- [ ] **EM-031.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-031.03.N** — Exercise one realistic failing or adversarial case for **Perform safe path, symlink and injected byte corruption tests**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-031.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-031.04 — Check final stream and frames; record encoder nondeterminism if observed

**Required deliverable from 243-subtask register:** qualified proof. **Unit of work:** one source/intermediate file. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-031.04.U** — Register exactly **one source/intermediate file** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-031.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-031.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **qualified proof**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-031.04.X** — For that **one source/intermediate file**, perform or independently replay this bounded operation: **Check final stream and frames; record encoder nondeterminism if observed**. **Receipt:** a single output artifact corresponding to **qualified proof**.
- [ ] **EM-031.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-031.04.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-031.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-031.05 — Never infer scientific correctness or art quality from successful hash replay

**Required deliverable from 243-subtask register:** separate gate. **Unit of work:** one source/intermediate file. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-031.05.U** — Register exactly **one source/intermediate file** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-031.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-031.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **separate gate**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-031.05.X** — For that **one source/intermediate file**, perform or independently replay this bounded operation: **Never infer scientific correctness or art quality from successful hash replay**. **Receipt:** a single output artifact corresponding to **separate gate**.
- [ ] **EM-031.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-031.05.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-031.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-032.01 — Freeze approved claim ledger, exact voice and source revision; abort when any approval missing

**Required deliverable from 243-subtask register:** signed manifest. **Unit of work:** one native render job. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-032.01.U** — Register exactly **one native render job** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-032.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-032.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **signed manifest**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-032.01.X** — For that **one native render job**, perform or independently replay this bounded operation: **Freeze approved claim ledger, exact voice and source revision; abort when any approval missing**. **Receipt:** a single output artifact corresponding to **signed manifest**.
- [ ] **EM-032.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-032.01.N** — Exercise one realistic failing or adversarial case for **Freeze approved claim ledger, exact voice and source revision; abort when any approval missing**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-032.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-032.02 — Run actual native 1080×1920 at 30fps from full-size source assets, not upscaled 540×960

**Required deliverable from 243-subtask register:** render metadata. **Unit of work:** one native render job. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-032.02.U** — Register exactly **one native render job** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-032.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-032.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **render metadata**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-032.02.X** — For that **one native render job**, perform or independently replay this bounded operation: **Run actual native 1080×1920 at 30fps from full-size source assets, not upscaled 540×960**. **Receipt:** a single output artifact corresponding to **render metadata**.
- [ ] **EM-032.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-032.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-032.03 — Verify decoded final duration, frames, timestamps, aspect and full audio

**Required deliverable from 243-subtask register:** technical receipt. **Unit of work:** one native render job. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-032.03.U** — Register exactly **one native render job** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-032.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-032.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **technical receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-032.03.X** — For that **one native render job**, perform or independently replay this bounded operation: **Verify decoded final duration, frames, timestamps, aspect and full audio**. **Receipt:** a single output artifact corresponding to **technical receipt**.
- [ ] **EM-032.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-032.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-032.04 — Measure elapsed runner CPU/memory and actual compute cost if available, otherwise Unknown

**Required deliverable from 243-subtask register:** budget report. **Unit of work:** one native render job. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-032.04.U** — Register exactly **one native render job** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-032.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-032.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **budget report**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-032.04.X** — For that **one native render job**, perform or independently replay this bounded operation: **Measure elapsed runner CPU/memory and actual compute cost if available, otherwise Unknown**. **Receipt:** a single output artifact corresponding to **budget report**.
- [ ] **EM-032.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-032.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-032.05 — Tie finished MP4 SHA to accepted full-film science/craft/phonetic receipts

**Required deliverable from 243-subtask register:** release-hold until complete. **Unit of work:** one native render job. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-032.05.U** — Register exactly **one native render job** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-032.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-032.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **release-hold until complete**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-032.05.X** — For that **one native render job**, perform or independently replay this bounded operation: **Tie finished MP4 SHA to accepted full-film science/craft/phonetic receipts**. **Receipt:** a single output artifact corresponding to **release-hold until complete**.
- [ ] **EM-032.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-032.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-033.01 — Perform full frame decode of native final H.264/AAC with exact PTS checks

**Required deliverable from 243-subtask register:** technical log. **Unit of work:** one decoded output interval. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-033.01.U** — Register exactly **one decoded output interval** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-033.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-033.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **technical log**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-033.01.X** — For that **one decoded output interval**, perform or independently replay this bounded operation: **Perform full frame decode of native final H.264/AAC with exact PTS checks**. **Receipt:** a single output artifact corresponding to **technical log**.
- [ ] **EM-033.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-033.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-033.02 — Verify voice stream against source with measured alignment/correlation

**Required deliverable from 243-subtask register:** audio proof. **Unit of work:** one decoded output interval. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-033.02.U** — Register exactly **one decoded output interval** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-033.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-033.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **audio proof**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-033.02.X** — For that **one decoded output interval**, perform or independently replay this bounded operation: **Verify voice stream against source with measured alignment/correlation**. **Receipt:** a single output artifact corresponding to **audio proof**.
- [ ] **EM-033.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-033.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-033.03 — Measure all visible captions inside conservative pixel safe boxes

**Required deliverable from 243-subtask register:** frame ledger. **Unit of work:** one decoded output interval. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-033.03.U** — Register exactly **one decoded output interval** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-033.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-033.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **frame ledger**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-033.03.X** — For that **one decoded output interval**, perform or independently replay this bounded operation: **Measure all visible captions inside conservative pixel safe boxes**. **Receipt:** a single output artifact corresponding to **frame ledger**.
- [ ] **EM-033.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-033.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-033.04 — Check speech-to-frame beats and intentional silence without rewriting words

**Required deliverable from 243-subtask register:** time proof. **Unit of work:** one decoded output interval. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-033.04.U** — Register exactly **one decoded output interval** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-033.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-033.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **time proof**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-033.04.X** — For that **one decoded output interval**, perform or independently replay this bounded operation: **Check speech-to-frame beats and intentional silence without rewriting words**. **Receipt:** a single output artifact corresponding to **time proof**.
- [ ] **EM-033.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-033.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-033.05 — Keep TikTok-specific UI, real handset and teaching-quality verdict separate

**Required deliverable from 243-subtask register:** status split. **Unit of work:** one decoded output interval. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-033.05.U** — Register exactly **one decoded output interval** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-033.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-033.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **status split**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-033.05.X** — For that **one decoded output interval**, perform or independently replay this bounded operation: **Keep TikTok-specific UI, real handset and teaching-quality verdict separate**. **Receipt:** a single output artifact corresponding to **status split**.
- [ ] **EM-033.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-033.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.01 — Retrieve dated real TikTok and YouTube Shorts portrait-player overlay examples from permitted sources

**Required deliverable from 243-subtask register:** two platform templates with URLs and date. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.01.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **two platform templates with URLs and date**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.01.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Retrieve dated real TikTok and YouTube Shorts portrait-player overlay examples from permitted sources**. **Receipt:** a single output artifact corresponding to **two platform templates with URLs and date**.
- [ ] **EM-034.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.01.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.02 — Pin the exact current master MP4, encoded audio, source claim ledger and annotation revision

**Required deliverable from 243-subtask register:** hash-bound audit manifest. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.02.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **hash-bound audit manifest**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.02.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Pin the exact current master MP4, encoded audio, source claim ledger and annotation revision**. **Receipt:** a single output artifact corresponding to **hash-bound audit manifest**.
- [ ] **EM-034.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.02.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.03 — Extract *all* emitted captions plus separate non-caption text from each decoded shot

**Required deliverable from 243-subtask register:** merged per-frame/on-screen text inventory. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.03.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **merged per-frame/on-screen text inventory**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.03.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Extract *all* emitted captions plus separate non-caption text from each decoded shot**. **Receipt:** a single output artifact corresponding to **merged per-frame/on-screen text inventory**.
- [ ] **EM-034.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.03.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.04 — Calculate combined visible-text count, duration and words-per-second for every scene

**Required deliverable from 243-subtask register:** reproducible full-film load table. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.04.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **reproducible full-film load table**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.04.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Calculate combined visible-text count, duration and words-per-second for every scene**. **Receipt:** a single output artifact corresponding to **reproducible full-film load table**.
- [ ] **EM-034.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.04.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.05 — Identify precisely which original shots exceed the predeclared combined reading-load ceiling

**Required deliverable from 243-subtask register:** failing scene IDs and measurements. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.05.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **failing scene IDs and measurements**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.05.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Identify precisely which original shots exceed the predeclared combined reading-load ceiling**. **Receipt:** a single output artifact corresponding to **failing scene IDs and measurements**.
- [ ] **EM-034.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.05.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.06 — Rewrite or relocate only overloaded overlays without erasing source IDs, science qualifiers or exact voice

**Required deliverable from 243-subtask register:** before/after frame plan. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.06.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.06.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.06.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **before/after frame plan**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.06.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Rewrite or relocate only overloaded overlays without erasing source IDs, science qualifiers or exact voice**. **Receipt:** a single output artifact corresponding to **before/after frame plan**.
- [ ] **EM-034.06.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.06.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.06.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.07 — Regenerate native film and muted cut after text repairs, retaining locked narration and source hashes

**Required deliverable from 243-subtask register:** new full H.264/AAC and mute MP4 SHAs. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.07.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.07.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.07.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **new full H.264/AAC and mute MP4 SHAs**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.07.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Regenerate native film and muted cut after text repairs, retaining locked narration and source hashes**. **Receipt:** a single output artifact corresponding to **new full H.264/AAC and mute MP4 SHAs**.
- [ ] **EM-034.07.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.07.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.07.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.08 — Recompute combined text budget from *actual new decoded frames*, not storyboard annotation

**Required deliverable from 243-subtask register:** full-scene PASS or explicit remaining failures. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-034.08.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.08.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.08.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **full-scene PASS or explicit remaining failures**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.08.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Recompute combined text budget from *actual new decoded frames*, not storyboard annotation**. **Receipt:** a single output artifact corresponding to **full-scene PASS or explicit remaining failures**.
- [ ] **EM-034.08.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.08.N** — Exercise one realistic failing or adversarial case for **Recompute combined text budget from *actual new decoded frames*, not storyboard annotation**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-034.08.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.09 — Compare platform UI occlusion, text contrast, font size and timing on real output at screen resolution

**Required deliverable from 243-subtask register:** shot-by-shot screenshot/contrast audit. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.09.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.09.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.09.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **shot-by-shot screenshot/contrast audit**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.09.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Compare platform UI occlusion, text contrast, font size and timing on real output at screen resolution**. **Receipt:** a single output artifact corresponding to **shot-by-shot screenshot/contrast audit**.
- [ ] **EM-034.09.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.09.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.09.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.10 — Prove first two seconds supply a meaningful understandable hook, not just unexplained chemical labels

**Required deliverable from 243-subtask register:** timestamped rubric and negative counterexample. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-034.10.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.10.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.10.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **timestamped rubric and negative counterexample**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.10.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Prove first two seconds supply a meaningful understandable hook, not just unexplained chemical labels**. **Receipt:** a single output artifact corresponding to **timestamped rubric and negative counterexample**.
- [ ] **EM-034.10.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.10.N** — Exercise one realistic failing or adversarial case for **Prove first two seconds supply a meaningful understandable hook, not just unexplained chemical labels**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-034.10.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.11 — Verify onscreen compound labels, CID associations, visual disclaimers and spoken timing still agree

**Required deliverable from 243-subtask register:** source/voice/caption semantic diff. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.11.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.11.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.11.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **source/voice/caption semantic diff**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.11.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Verify onscreen compound labels, CID associations, visual disclaimers and spoken timing still agree**. **Receipt:** a single output artifact corresponding to **source/voice/caption semantic diff**.
- [ ] **EM-034.11.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.11.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.11.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.12 — Pre-register silent-viewer comprehension questions covering 7-OH versus mitragynine, what visuals do/do not show, uncertainty and source provenance

**Required deliverable from 243-subtask register:** dated scored quiz and rubric. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.12.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.12.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.12.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **dated scored quiz and rubric**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.12.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Pre-register silent-viewer comprehension questions covering 7-OH versus mitragynine, what visuals do/do not show, uncertainty and source provenance**. **Receipt:** a single output artifact corresponding to **dated scored quiz and rubric**.
- [ ] **EM-034.12.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.12.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.12.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.13 — Calibrate evaluator or obtain genuine independent muted-viewer answers on the exact full film

**Required deliverable from 243-subtask register:** reviewer/participant method plus observed answer-level results. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.13.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.13.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.13.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **reviewer/participant method plus observed answer-level results**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.13.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Calibrate evaluator or obtain genuine independent muted-viewer answers on the exact full film**. **Receipt:** a single output artifact corresponding to **reviewer/participant method plus observed answer-level results**.
- [ ] **EM-034.13.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.13.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.13.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.14 — Test the same quiz against misleading swapped-label, missing-caveat and off-timing counterfactual clips

**Required deliverable from 243-subtask register:** correct negative verdicts without false PASS. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-034.14.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.14.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.14.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **correct negative verdicts without false PASS**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.14.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Test the same quiz against misleading swapped-label, missing-caveat and off-timing counterfactual clips**. **Receipt:** a single output artifact corresponding to **correct negative verdicts without false PASS**.
- [ ] **EM-034.14.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.14.N** — Exercise one realistic failing or adversarial case for **Test the same quiz against misleading swapped-label, missing-caveat and off-timing counterfactual clips**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-034.14.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.15 — Invalidate old V1/V2 research receipts after any film/audio/caption hash change and rerun exact-head native, science, OCR, audio and full build checks

**Required deliverable from 243-subtask register:** new reproducible execution/run links. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-034.15.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.15.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.15.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **new reproducible execution/run links**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.15.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Invalidate old V1/V2 research receipts after any film/audio/caption hash change and rerun exact-head native, science, OCR, audio and full build checks**. **Receipt:** a single output artifact corresponding to **new reproducible execution/run links**.
- [ ] **EM-034.15.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.15.N** — Exercise one realistic failing or adversarial case for **Invalidate old V1/V2 research receipts after any film/audio/caption hash change and rerun exact-head native, science, OCR, audio and full build checks**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-034.15.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-034.16 — Record final criterion verdict without conflating layout, machine QA, real viewer comprehension, handset, science or publishing approval

**Required deliverable from 243-subtask register:** per-gate ACCEPTED/HOLD and canonical-source update only on earned proof. **Unit of work:** one native short-form scene. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-034.16.U** — Register exactly **one native short-form scene** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-034.16.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-034.16.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **per-gate ACCEPTED/HOLD and canonical-source update only on earned proof**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-034.16.X** — For that **one native short-form scene**, perform or independently replay this bounded operation: **Record final criterion verdict without conflating layout, machine QA, real viewer comprehension, handset, science or publishing approval**. **Receipt:** a single output artifact corresponding to **per-gate ACCEPTED/HOLD and canonical-source update only on earned proof**.
- [ ] **EM-034.16.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-034.16.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-034.16.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.01 — Obtain actual authorized handset/session or legitimate remote-device test execution

**Required deliverable from 243-subtask register:** environment receipt. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-035.01.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **environment receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.01.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Obtain actual authorized handset/session or legitimate remote-device test execution**. **Receipt:** a single output artifact corresponding to **environment receipt**.
- [ ] **EM-035.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.01.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-035.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.02 — Verify exact MP4 SHA transferred to handset and app/display conditions

**Required deliverable from 243-subtask register:** provenance. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-035.02.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **provenance**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.02.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Verify exact MP4 SHA transferred to handset and app/display conditions**. **Receipt:** a single output artifact corresponding to **provenance**.
- [ ] **EM-035.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.02.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-035.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.03 — Play at 1×, pause, seek/scrub and test both speaker and earphone audibility

**Required deliverable from 243-subtask register:** timed observations. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-035.03.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **timed observations**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.03.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Play at 1×, pause, seek/scrub and test both speaker and earphone audibility**. **Receipt:** a single output artifact corresponding to **timed observations**.
- [ ] **EM-035.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.03.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-035.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.04 — Inspect native TikTok/Shorts overlays, dynamic caption safe zones and readability

**Required deliverable from 243-subtask register:** captured device artifacts. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-035.04.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **captured device artifacts**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.04.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Inspect native TikTok/Shorts overlays, dynamic caption safe zones and readability**. **Receipt:** a single output artifact corresponding to **captured device artifacts**.
- [ ] **EM-035.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.04.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-035.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.05 — Verify no crash, desync, blank frame, clipping or hidden qualifier

**Required deliverable from 243-subtask register:** documented pass/fail. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-035.05.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **documented pass/fail**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.05.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Verify no crash, desync, blank frame, clipping or hidden qualifier**. **Receipt:** a single output artifact corresponding to **documented pass/fail**.
- [ ] **EM-035.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.05.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-035.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-035.06 — Invalidate handset result after any audio/video SHA change

**Required deliverable from 243-subtask register:** stale-device receipt test. **Unit of work:** one real handset session/action. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-035.06.U** — Register exactly **one real handset session/action** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-035.06.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-035.06.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **stale-device receipt test**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-035.06.X** — For that **one real handset session/action**, perform or independently replay this bounded operation: **Invalidate handset result after any audio/video SHA change**. **Receipt:** a single output artifact corresponding to **stale-device receipt test**.
- [ ] **EM-035.06.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-035.06.N** — Exercise one realistic failing or adversarial case for **Invalidate handset result after any audio/video SHA change**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-035.06.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.01 — Freeze exact master/source/voice/script hashes and reviewer model/workflow versions

**Required deliverable from 243-subtask register:** review request. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-036.01.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.01.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **review request**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.01.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Freeze exact master/source/voice/script hashes and reviewer model/workflow versions**. **Receipt:** a single output artifact corresponding to **review request**.
- [ ] **EM-036.01.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.01.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-036.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.02 — Run independent science claim checks with calibrated sources, keeping separate disagreements

**Required deliverable from 243-subtask register:** science receipt. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-036.02.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.02.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **science receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.02.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Run independent science claim checks with calibrated sources, keeping separate disagreements**. **Receipt:** a single output artifact corresponding to **science receipt**.
- [ ] **EM-036.02.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.02.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-036.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.03 — Run calibrated acoustic/pronunciation checks on decoded final audio

**Required deliverable from 243-subtask register:** voice receipt. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-036.03.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.03.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **voice receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.03.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Run calibrated acoustic/pronunciation checks on decoded final audio**. **Receipt:** a single output artifact corresponding to **voice receipt**.
- [ ] **EM-036.03.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.03.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-036.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.04 — Run calibrated full-film craft/teaching scoring against real niche reference clips

**Required deliverable from 243-subtask register:** film receipt. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-036.04.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.04.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **film receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.04.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Run calibrated full-film craft/teaching scoring against real niche reference clips**. **Receipt:** a single output artifact corresponding to **film receipt**.
- [ ] **EM-036.04.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.04.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-036.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.05 — Reject forged reviewer identity, changed assets, uncalibrated model and contradictory reviews

**Required deliverable from 243-subtask register:** adversarial suite. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-036.05.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.05.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **adversarial suite**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.05.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Reject forged reviewer identity, changed assets, uncalibrated model and contradictory reviews**. **Receipt:** a single output artifact corresponding to **adversarial suite**.
- [ ] **EM-036.05.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.05.N** — Exercise one realistic failing or adversarial case for **Reject forged reviewer identity, changed assets, uncalibrated model and contradictory reviews**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-036.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-036.06 — Require reconciled signed-by-process PASS across all three categories; otherwise HOLD

**Required deliverable from 243-subtask register:** final decision. **Unit of work:** one independent review domain. **Domain:** media. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-036.06.U** — Register exactly **one independent review domain** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-036.06.S** — Pin the exact exact H.264/AAC or muted MP4 hash, decoded timestamp/frame identity and test-run configuration for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-036.06.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **final decision**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-036.06.X** — For that **one independent review domain**, perform or independently replay this bounded operation: **Require reconciled signed-by-process PASS across all three categories; otherwise HOLD**. **Receipt:** a single output artifact corresponding to **final decision**.
- [ ] **EM-036.06.T** — Check the actual output against the predeclared assertion using real encoded frame/audio measurements, UI-safe and stale-artifact rejection criteria. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-036.06.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-036.06.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-037.01 — Document owner-account/platform scope and exact media SHA being authorized

**Required deliverable from 243-subtask register:** posting request. **Unit of work:** one specific platform authorization. **Domain:** operations. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-037.01.U** — Register exactly **one specific platform authorization** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-037.01.S** — Pin the exact exact commit/run ID, admitted owner, immutable artifact identities and permitted action scope for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-037.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **posting request**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-037.01.X** — For that **one specific platform authorization**, perform or independently replay this bounded operation: **Document owner-account/platform scope and exact media SHA being authorized**. **Receipt:** a single output artifact corresponding to **posting request**.
- [ ] **EM-037.01.T** — Check the actual output against the predeclared assertion using governed state/permissions, actual test logs, exact-head CI or authorized execution receipts. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-037.01.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-037.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-037.02 — Confirm owner approved platform, caption and selected original MP4 explicitly

**Required deliverable from 243-subtask register:** dated record. **Unit of work:** one specific platform authorization. **Domain:** operations. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-037.02.U** — Register exactly **one specific platform authorization** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-037.02.S** — Pin the exact exact commit/run ID, admitted owner, immutable artifact identities and permitted action scope for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-037.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **dated record**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-037.02.X** — For that **one specific platform authorization**, perform or independently replay this bounded operation: **Confirm owner approved platform, caption and selected original MP4 explicitly**. **Receipt:** a single output artifact corresponding to **dated record**.
- [ ] **EM-037.02.T** — Check the actual output against the predeclared assertion using governed state/permissions, actual test logs, exact-head CI or authorized execution receipts. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-037.02.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-037.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-037.03 — Verify no automatic post or integration change occurs before authorization

**Required deliverable from 243-subtask register:** permission test. **Unit of work:** one specific platform authorization. **Domain:** operations. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-037.03.U** — Register exactly **one specific platform authorization** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-037.03.S** — Pin the exact exact commit/run ID, admitted owner, immutable artifact identities and permitted action scope for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-037.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **permission test**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-037.03.X** — For that **one specific platform authorization**, perform or independently replay this bounded operation: **Verify no automatic post or integration change occurs before authorization**. **Receipt:** a single output artifact corresponding to **permission test**.
- [ ] **EM-037.03.T** — Check the actual output against the predeclared assertion using governed state/permissions, actual test logs, exact-head CI or authorized execution receipts. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-037.03.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-037.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-037.04 — Record posting/publication job and receipt only after permitted execution

**Required deliverable from 243-subtask register:** public-ID evidence. **Unit of work:** one specific platform authorization. **Domain:** operations. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-037.04.U** — Register exactly **one specific platform authorization** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-037.04.S** — Pin the exact exact commit/run ID, admitted owner, immutable artifact identities and permitted action scope for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-037.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **public-ID evidence**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-037.04.X** — For that **one specific platform authorization**, perform or independently replay this bounded operation: **Record posting/publication job and receipt only after permitted execution**. **Receipt:** a single output artifact corresponding to **public-ID evidence**.
- [ ] **EM-037.04.T** — Check the actual output against the predeclared assertion using governed state/permissions, actual test logs, exact-head CI or authorized execution receipts. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-037.04.N** — Construct one independent negative case that violates this exact release/quality/permission acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-037.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

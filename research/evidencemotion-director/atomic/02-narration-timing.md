# EvidenceMotion Atomic Workcards — Narration, pronunciation and true word timing

> **Planning templates, not tested results.** Source: [243-subtask register](../GRANULAR-46-EXECUTION-REGISTER.md); [canonical 46 milestone authority](../COMPLETION-CHECKLIST.md). Each `EM-###.##` source item is decomposed into six or seven narrowly scoped checkpoints below. **All boxes are NOT_AUDITED**, not necessarily missing implementation. Never infer parent acceptance from checked planning cards.

## Atomicity contract

- `U` = identify **one** real unit (one claim, word, scene, encoded film, fixture, permission, etc.); `S` = lock one source/input identity; `O` = define **one** measurable decision rule; `X` = perform/replay **one** bounded change/probe; `T` = run **one** positive observation; optional `N` = run **one** adversarial/negative case; `R` = file one hash-bound decision/receipt.
- Expand repeated units as `EM-###.##.X@<stable-unit-id>` and test cases as `EM-###.##.N@<case-id>` **only after enumerating real underlying objects**; do not fabricate counts or premark them PASS. A task with five claims is five independently linked instance results, not one blanket checkbox. Failed instances stay visible.
- The template `.X` is **not** completed just because source code exists: it requires actual output for the chosen unit; `.T` is **not** completed from a synthetic fixture when the gate requires genuine media, human calibration, primary-source science, or device playback.
- Inputs must be independently reproducible or explicit `BLOCKED` with the missing external/owner dependency. Never use generic ASR, pixel scores, or self-made human-review JSON to award phonetic, audience, craft, clinical, or posting authority.
- Finish actual implementations under existing admitted issue/PR and workstream; these checkboxes are checkpoints, **not** hundreds of new GitHub tickets or PRs.

### EM-009.01 — Pin voice engine model/version, license, voice ID, seed/input text

**Required deliverable from 243-subtask register:** provenance JSON. **Unit of work:** one voice-generating run. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-009.01.U** — Register exactly **one voice-generating run** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-009.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-009.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **provenance JSON**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-009.01.X** — For that **one voice-generating run**, perform or independently replay this bounded operation: **Pin voice engine model/version, license, voice ID, seed/input text**. **Receipt:** a single output artifact corresponding to **provenance JSON**.
- [ ] **EM-009.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-009.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-009.02 — Generate original waveform in a clean reproducible workflow

**Required deliverable from 243-subtask register:** WAV SHA and workflow receipt. **Unit of work:** one voice-generating run. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-009.02.U** — Register exactly **one voice-generating run** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-009.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-009.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **WAV SHA and workflow receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-009.02.X** — For that **one voice-generating run**, perform or independently replay this bounded operation: **Generate original waveform in a clean reproducible workflow**. **Receipt:** a single output artifact corresponding to **WAV SHA and workflow receipt**.
- [ ] **EM-009.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-009.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-009.03 — Verify master source WAV and downstream encode link

**Required deliverable from 243-subtask register:** byte identities recorded. **Unit of work:** one voice-generating run. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-009.03.U** — Register exactly **one voice-generating run** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-009.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-009.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **byte identities recorded**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-009.03.X** — For that **one voice-generating run**, perform or independently replay this bounded operation: **Verify master source WAV and downstream encode link**. **Receipt:** a single output artifact corresponding to **byte identities recorded**.
- [ ] **EM-009.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-009.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-009.04 — Reject missing voice provenance or changed script hash

**Required deliverable from 243-subtask register:** negative tests. **Unit of work:** one voice-generating run. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-009.04.U** — Register exactly **one voice-generating run** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-009.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-009.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **negative tests**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-009.04.X** — For that **one voice-generating run**, perform or independently replay this bounded operation: **Reject missing voice provenance or changed script hash**. **Receipt:** a single output artifact corresponding to **negative tests**.
- [ ] **EM-009.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-009.04.N** — Exercise one realistic failing or adversarial case for **Reject missing voice provenance or changed script hash**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-009.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-010.01 — Measure original source WAV and decoded AAC time spans

**Required deliverable from 243-subtask register:** timestamp ledger. **Unit of work:** one spoken beat. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-010.01.U** — Register exactly **one spoken beat** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-010.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-010.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **timestamp ledger**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-010.01.X** — For that **one spoken beat**, perform or independently replay this bounded operation: **Measure original source WAV and decoded AAC time spans**. **Receipt:** a single output artifact corresponding to **timestamp ledger**.
- [ ] **EM-010.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-010.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-010.02 — Place story beats from audio boundaries, not storyboard guesses

**Required deliverable from 243-subtask register:** beat-to-shot mapping. **Unit of work:** one spoken beat. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-010.02.U** — Register exactly **one spoken beat** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-010.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-010.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **beat-to-shot mapping**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-010.02.X** — For that **one spoken beat**, perform or independently replay this bounded operation: **Place story beats from audio boundaries, not storyboard guesses**. **Receipt:** a single output artifact corresponding to **beat-to-shot mapping**.
- [ ] **EM-010.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-010.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-010.03 — Verify AAC stream-copy/no time stretch via frame-level/source signal checks

**Required deliverable from 243-subtask register:** technical receipt. **Unit of work:** one spoken beat. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-010.03.U** — Register exactly **one spoken beat** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-010.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-010.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **technical receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-010.03.X** — For that **one spoken beat**, perform or independently replay this bounded operation: **Verify AAC stream-copy/no time stretch via frame-level/source signal checks**. **Receipt:** a single output artifact corresponding to **technical receipt**.
- [ ] **EM-010.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-010.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-010.04 — Inject shifted or time-stretched audio

**Required deliverable from 243-subtask register:** pipeline rejection. **Unit of work:** one spoken beat. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-010.04.U** — Register exactly **one spoken beat** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-010.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-010.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **pipeline rejection**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-010.04.X** — For that **one spoken beat**, perform or independently replay this bounded operation: **Inject shifted or time-stretched audio**. **Receipt:** a single output artifact corresponding to **pipeline rejection**.
- [ ] **EM-010.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-010.04.N** — Exercise one realistic failing or adversarial case for **Inject shifted or time-stretched audio**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-010.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-011.01 — Measure true encoded loudness and peak on the original quiet master

**Required deliverable from 243-subtask register:** baseline receipt. **Unit of work:** one audio mastering segment. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-011.01.U** — Register exactly **one audio mastering segment** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-011.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-011.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **baseline receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-011.01.X** — For that **one audio mastering segment**, perform or independently replay this bounded operation: **Measure true encoded loudness and peak on the original quiet master**. **Receipt:** a single output artifact corresponding to **baseline receipt**.
- [ ] **EM-011.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-011.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-011.02 — Produce mastered audio without stretching/sentence substitution

**Required deliverable from 243-subtask register:** audio output SHA. **Unit of work:** one audio mastering segment. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-011.02.U** — Register exactly **one audio mastering segment** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-011.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-011.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **audio output SHA**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-011.02.X** — For that **one audio mastering segment**, perform or independently replay this bounded operation: **Produce mastered audio without stretching/sentence substitution**. **Receipt:** a single output artifact corresponding to **audio output SHA**.
- [ ] **EM-011.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-011.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-011.03 — Compare duration, delay and waveform correlation against original

**Required deliverable from 243-subtask register:** drift PASS. **Unit of work:** one audio mastering segment. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-011.03.U** — Register exactly **one audio mastering segment** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-011.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-011.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **drift PASS**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-011.03.X** — For that **one audio mastering segment**, perform or independently replay this bounded operation: **Compare duration, delay and waveform correlation against original**. **Receipt:** a single output artifact corresponding to **drift PASS**.
- [ ] **EM-011.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-011.03.N** — Exercise one realistic failing or adversarial case for **Compare duration, delay and waveform correlation against original**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-011.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-011.04 — Decode entire audio and video for pops/clips/silence anomalies

**Required deliverable from 243-subtask register:** issue log. **Unit of work:** one audio mastering segment. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-011.04.U** — Register exactly **one audio mastering segment** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-011.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-011.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **issue log**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-011.04.X** — For that **one audio mastering segment**, perform or independently replay this bounded operation: **Decode entire audio and video for pops/clips/silence anomalies**. **Receipt:** a single output artifact corresponding to **issue log**.
- [ ] **EM-011.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-011.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-011.05 — Verify that loudness PASS does not count as human phonetic/naturalness approval

**Required deliverable from 243-subtask register:** separate gate. **Unit of work:** one audio mastering segment. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-011.05.U** — Register exactly **one audio mastering segment** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-011.05.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-011.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **separate gate**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-011.05.X** — For that **one audio mastering segment**, perform or independently replay this bounded operation: **Verify that loudness PASS does not count as human phonetic/naturalness approval**. **Receipt:** a single output artifact corresponding to **separate gate**.
- [ ] **EM-011.05.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-011.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-012.01 — Rewrite ambiguous locant speech into plain, scientifically accurate words

**Required deliverable from 243-subtask register:** script diff. **Unit of work:** one narrator utterance. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-012.01.U** — Register exactly **one narrator utterance** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-012.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-012.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **script diff**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-012.01.X** — For that **one narrator utterance**, perform or independently replay this bounded operation: **Rewrite ambiguous locant speech into plain, scientifically accurate words**. **Receipt:** a single output artifact corresponding to **script diff**.
- [ ] **EM-012.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-012.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-012.02 — Regenerate only with pinned original Kokoro voice/model

**Required deliverable from 243-subtask register:** new WAV/source SHA. **Unit of work:** one narrator utterance. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-012.02.U** — Register exactly **one narrator utterance** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-012.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-012.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **new WAV/source SHA**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-012.02.X** — For that **one narrator utterance**, perform or independently replay this bounded operation: **Regenerate only with pinned original Kokoro voice/model**. **Receipt:** a single output artifact corresponding to **new WAV/source SHA**.
- [ ] **EM-012.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-012.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-012.03 — Cut low-resolution narrator-first hybrid based on real measured beats

**Required deliverable from 243-subtask register:** previz video/hash. **Unit of work:** one narrator utterance. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-012.03.U** — Register exactly **one narrator utterance** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-012.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-012.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **previz video/hash**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-012.03.X** — For that **one narrator utterance**, perform or independently replay this bounded operation: **Cut low-resolution narrator-first hybrid based on real measured beats**. **Receipt:** a single output artifact corresponding to **previz video/hash**.
- [ ] **EM-012.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-012.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-012.04 — Full-decode and compare audio length/loudness/timing in rendered video

**Required deliverable from 243-subtask register:** receipt. **Unit of work:** one narrator utterance. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-012.04.U** — Register exactly **one narrator utterance** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-012.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-012.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-012.04.X** — For that **one narrator utterance**, perform or independently replay this bounded operation: **Full-decode and compare audio length/loudness/timing in rendered video**. **Receipt:** a single output artifact corresponding to **receipt**.
- [ ] **EM-012.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-012.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-012.05 — Leave pronunciation, final film and release statuses HOLD without verified ear evidence

**Required deliverable from 243-subtask register:** three explicit release-gate HOLDs bound to exact voice and film hashes. **Unit of work:** one narrator utterance. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-012.05.U** — Register exactly **one narrator utterance** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-012.05.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-012.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **three explicit release-gate HOLDs bound to exact voice and film hashes**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-012.05.X** — For that **one narrator utterance**, perform or independently replay this bounded operation: **Leave pronunciation, final film and release statuses HOLD without verified ear evidence**. **Receipt:** a single output artifact corresponding to **three explicit release-gate HOLDs bound to exact voice and film hashes**.
- [ ] **EM-012.05.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-012.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-013.01 — Link exact V11 candidate played and dated owner feedback

**Required deliverable from 243-subtask register:** original conversation/receipt. **Unit of work:** one owner feedback observation. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-013.01.U** — Register exactly **one owner feedback observation** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-013.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-013.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **original conversation/receipt**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-013.01.X** — For that **one owner feedback observation**, perform or independently replay this bounded operation: **Link exact V11 candidate played and dated owner feedback**. **Receipt:** a single output artifact corresponding to **original conversation/receipt**.
- [ ] **EM-013.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-013.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-013.02 — Classify feedback only as provisional voice/loudness

**Required deliverable from 243-subtask register:** verdict scope note. **Unit of work:** one owner feedback observation. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-013.02.U** — Register exactly **one owner feedback observation** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-013.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-013.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **verdict scope note**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-013.02.X** — For that **one owner feedback observation**, perform or independently replay this bounded operation: **Classify feedback only as provisional voice/loudness**. **Receipt:** a single output artifact corresponding to **verdict scope note**.
- [ ] **EM-013.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-013.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-013.03 — Bind provisional feedback to exact WAV/MP4 hashes

**Required deliverable from 243-subtask register:** no transplant after voice edits. **Unit of work:** one owner feedback observation. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-013.03.U** — Register exactly **one owner feedback observation** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-013.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-013.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **no transplant after voice edits**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-013.03.X** — For that **one owner feedback observation**, perform or independently replay this bounded operation: **Bind provisional feedback to exact WAV/MP4 hashes**. **Receipt:** a single output artifact corresponding to **no transplant after voice edits**.
- [ ] **EM-013.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-013.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-013.04 — Keep individual scientific terms and full-film approvals visibly unearned

**Required deliverable from 243-subtask register:** status assertions. **Unit of work:** one owner feedback observation. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-013.04.U** — Register exactly **one owner feedback observation** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-013.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-013.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **status assertions**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-013.04.X** — For that **one owner feedback observation**, perform or independently replay this bounded operation: **Keep individual scientific terms and full-film approvals visibly unearned**. **Receipt:** a single output artifact corresponding to **status assertions**.
- [ ] **EM-013.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-013.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.01 — Isolate all 7-OH/hydroxyl/mitragynine instances in the exact WAV

**Required deliverable from 243-subtask register:** timed target list. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-014.01.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **timed target list**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.01.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Isolate all 7-OH/hydroxyl/mitragynine instances in the exact WAV**. **Receipt:** a single output artifact corresponding to **timed target list**.
- [ ] **EM-014.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.01.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-014.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.02 — Construct phoneme and stress reference dictionary with sourced or listen-confirmed anchors

**Required deliverable from 243-subtask register:** lexicon. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-014.02.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **lexicon**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.02.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Construct phoneme and stress reference dictionary with sourced or listen-confirmed anchors**. **Receipt:** a single output artifact corresponding to **lexicon**.
- [ ] **EM-014.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.02.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-014.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.03 — Run an actual acoustic/phonetic evaluator rather than text-only ASR

**Required deliverable from 243-subtask register:** term-level observations. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-014.03.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **term-level observations**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.03.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Run an actual acoustic/phonetic evaluator rather than text-only ASR**. **Receipt:** a single output artifact corresponding to **term-level observations**.
- [ ] **EM-014.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.03.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-014.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.04 — Calibrate against real listening ground truth and negative pronunciations

**Required deliverable from 243-subtask register:** measured error/confusion table. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-014.04.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **measured error/confusion table**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.04.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Calibrate against real listening ground truth and negative pronunciations**. **Receipt:** a single output artifact corresponding to **measured error/confusion table**.
- [ ] **EM-014.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.04.N** — Exercise one realistic failing or adversarial case for **Calibrate against real listening ground truth and negative pronunciations**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-014.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.05 — Inspect pace, clipped endings, natural pauses and cadence

**Required deliverable from 243-subtask register:** separate timestamped results. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-014.05.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.05.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **separate timestamped results**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.05.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Inspect pace, clipped endings, natural pauses and cadence**. **Receipt:** a single output artifact corresponding to **separate timestamped results**.
- [ ] **EM-014.05.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.05.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-014.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-014.06 — Record every term PASS/HOLD with exact WAV SHA; unresolved terms block voice approval

**Required deliverable from 243-subtask register:** term-level verdict ledger and enforced nonapproval on any HOLD. **Unit of work:** one specialized spoken occurrence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-014.06.U** — Register exactly **one specialized spoken occurrence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-014.06.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-014.06.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **term-level verdict ledger and enforced nonapproval on any HOLD**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-014.06.X** — For that **one specialized spoken occurrence**, perform or independently replay this bounded operation: **Record every term PASS/HOLD with exact WAV SHA; unresolved terms block voice approval**. **Receipt:** a single output artifact corresponding to **term-level verdict ledger and enforced nonapproval on any HOLD**.
- [ ] **EM-014.06.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-014.06.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-014.06.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-015.01 — Record a justified failure on an identified spoken sentence/word

**Required deliverable from 243-subtask register:** exact timestamps and reason. **Unit of work:** one rejected spoken sentence. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-015.01.U** — Register exactly **one rejected spoken sentence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-015.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-015.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **exact timestamps and reason**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-015.01.X** — For that **one rejected spoken sentence**, perform or independently replay this bounded operation: **Record a justified failure on an identified spoken sentence/word**. **Receipt:** a single output artifact corresponding to **exact timestamps and reason**.
- [ ] **EM-015.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-015.01.N** — Exercise one realistic failing or adversarial case for **Record a justified failure on an identified spoken sentence/word**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-015.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-015.02 — Regenerate the smallest full natural sentence chunk in the original pinned voice

**Required deliverable from 243-subtask register:** candidate WAV. **Unit of work:** one rejected spoken sentence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-015.02.U** — Register exactly **one rejected spoken sentence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-015.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-015.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **candidate WAV**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-015.02.X** — For that **one rejected spoken sentence**, perform or independently replay this bounded operation: **Regenerate the smallest full natural sentence chunk in the original pinned voice**. **Receipt:** a single output artifact corresponding to **candidate WAV**.
- [ ] **EM-015.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-015.02.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-015.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-015.03 — Join chunks without time stretching and test audible seams

**Required deliverable from 243-subtask register:** waveform/ear QA. **Unit of work:** one rejected spoken sentence. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-015.03.U** — Register exactly **one rejected spoken sentence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-015.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-015.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **waveform/ear QA**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-015.03.X** — For that **one rejected spoken sentence**, perform or independently replay this bounded operation: **Join chunks without time stretching and test audible seams**. **Receipt:** a single output artifact corresponding to **waveform/ear QA**.
- [ ] **EM-015.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-015.03.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-015.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-015.04 — Invalidate all old word timings, caption cuts, hash approvals and render assets

**Required deliverable from 243-subtask register:** stale-input tests. **Unit of work:** one rejected spoken sentence. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-015.04.U** — Register exactly **one rejected spoken sentence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-015.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-015.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **stale-input tests**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-015.04.X** — For that **one rejected spoken sentence**, perform or independently replay this bounded operation: **Invalidate all old word timings, caption cuts, hash approvals and render assets**. **Receipt:** a single output artifact corresponding to **stale-input tests**.
- [ ] **EM-015.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-015.04.N** — Exercise one realistic failing or adversarial case for **Invalidate all old word timings, caption cuts, hash approvals and render assets**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-015.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-015.05 — Rebuild alignment and video against new SHA; rerun science and phone gates

**Required deliverable from 243-subtask register:** no stale acceptance reuse. **Unit of work:** one rejected spoken sentence. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-015.05.U** — Register exactly **one rejected spoken sentence** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-015.05.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-015.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **no stale acceptance reuse**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-015.05.X** — For that **one rejected spoken sentence**, perform or independently replay this bounded operation: **Rebuild alignment and video against new SHA; rerun science and phone gates**. **Receipt:** a single output artifact corresponding to **no stale acceptance reuse**.
- [ ] **EM-015.05.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-015.05.N** — Exercise one realistic failing or adversarial case for **Rebuild alignment and video against new SHA; rerun science and phone gates**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-015.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.01 — Freeze original WAV/hash, transcript, pronunciation dictionary and MFA model

**Required deliverable from 243-subtask register:** input manifest. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-016.01.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.01.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **input manifest**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.01.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Freeze original WAV/hash, transcript, pronunciation dictionary and MFA model**. **Receipt:** a single output artifact corresponding to **input manifest**.
- [ ] **EM-016.01.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.01.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-016.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.02 — Run genuine original-speech forced alignment for every emitted word

**Required deliverable from 243-subtask register:** word-boundary TextGrid. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-016.02.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.02.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **word-boundary TextGrid**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.02.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Run genuine original-speech forced alignment for every emitted word**. **Receipt:** a single output artifact corresponding to **word-boundary TextGrid**.
- [ ] **EM-016.02.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.02.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-016.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.03 — Independently validate boundary tolerances on real acoustics/annotated words

**Required deliverable from 243-subtask register:** calibration report. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-016.03.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.03.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **calibration report**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.03.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Independently validate boundary tolerances on real acoustics/annotated words**. **Receipt:** a single output artifact corresponding to **calibration report**.
- [ ] **EM-016.03.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.03.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-016.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.04 — Match word highlights, 7-OH cue and captions to accepted boundaries

**Required deliverable from 243-subtask register:** sampled frame-times. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-016.04.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.04.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **sampled frame-times**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.04.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Match word highlights, 7-OH cue and captions to accepted boundaries**. **Receipt:** a single output artifact corresponding to **sampled frame-times**.
- [ ] **EM-016.04.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.04.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-016.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.05 — Reject altered WAV, incorrect lexicon, missing words and offset drift

**Required deliverable from 243-subtask register:** negative suite. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-016.05.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.05.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **negative suite**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.05.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Reject altered WAV, incorrect lexicon, missing words and offset drift**. **Receipt:** a single output artifact corresponding to **negative suite**.
- [ ] **EM-016.05.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.05.N** — Exercise one realistic failing or adversarial case for **Reject altered WAV, incorrect lexicon, missing words and offset drift**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-016.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-016.06 — Bind approved alignment to the exact final narration and visual plan

**Required deliverable from 243-subtask register:** no cross-voice reuse. **Unit of work:** one acoustically aligned word. **Domain:** audio. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-016.06.U** — Register exactly **one acoustically aligned word** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-016.06.S** — Pin the exact original decoded WAV hash, transcript revision, voice/model ID and time window for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-016.06.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **no cross-voice reuse**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-016.06.X** — For that **one acoustically aligned word**, perform or independently replay this bounded operation: **Bind approved alignment to the exact final narration and visual plan**. **Receipt:** a single output artifact corresponding to **no cross-voice reuse**.
- [ ] **EM-016.06.T** — Check the actual output against the predeclared assertion using actual decoded waveform/phoneme/timing measurement and no-unauthorized-substitution checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-016.06.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-016.06.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-017.01 — Generate exact transcript from locked authored narration and align to encoded speech

**Required deliverable from 243-subtask register:** two-source comparison. **Unit of work:** one caption/voice/source claim. **Domain:** science. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-017.01.U** — Register exactly **one caption/voice/source claim** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-017.01.S** — Pin the exact primary source URL/revision, exact claim ID, authoritative source image and their content hashes for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-017.01.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **two-source comparison**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-017.01.X** — For that **one caption/voice/source claim**, perform or independently replay this bounded operation: **Generate exact transcript from locked authored narration and align to encoded speech**. **Receipt:** a single output artifact corresponding to **two-source comparison**.
- [ ] **EM-017.01.T** — Check the actual output against the predeclared assertion using source-level attribution, graph/visual identity and explicit evidence-strength or uncertainty checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-017.01.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-017.01.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-017.02 — Extract every final on-screen scientific caption/highlight

**Required deliverable from 243-subtask register:** pixel/OCR plus authored ledger. **Unit of work:** one caption/voice/source claim. **Domain:** science. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-017.02.U** — Register exactly **one caption/voice/source claim** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-017.02.S** — Pin the exact primary source URL/revision, exact claim ID, authoritative source image and their content hashes for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-017.02.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **pixel/OCR plus authored ledger**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-017.02.X** — For that **one caption/voice/source claim**, perform or independently replay this bounded operation: **Extract every final on-screen scientific caption/highlight**. **Receipt:** a single output artifact corresponding to **pixel/OCR plus authored ledger**.
- [ ] **EM-017.02.T** — Check the actual output against the predeclared assertion using source-level attribution, graph/visual identity and explicit evidence-strength or uncertainty checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-017.02.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-017.02.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-017.03 — Compare substance name, chemistry, negation and uncertainty across narration/source/visual

**Required deliverable from 243-subtask register:** row-level findings. **Unit of work:** one caption/voice/source claim. **Domain:** science. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-017.03.U** — Register exactly **one caption/voice/source claim** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-017.03.S** — Pin the exact primary source URL/revision, exact claim ID, authoritative source image and their content hashes for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-017.03.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **row-level findings**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-017.03.X** — For that **one caption/voice/source claim**, perform or independently replay this bounded operation: **Compare substance name, chemistry, negation and uncertainty across narration/source/visual**. **Receipt:** a single output artifact corresponding to **row-level findings**.
- [ ] **EM-017.03.T** — Check the actual output against the predeclared assertion using source-level attribution, graph/visual identity and explicit evidence-strength or uncertainty checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-017.03.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-017.03.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-017.04 — Audit muted timing and comprehension on the actual sequence, not isolated text boxes

**Required deliverable from 243-subtask register:** trial and questions. **Unit of work:** one caption/voice/source claim. **Domain:** science. **Dependencies:** U → S → O → X → T → R. **State:** NOT_AUDITED.

- [ ] **EM-017.04.U** — Register exactly **one caption/voice/source claim** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-017.04.S** — Pin the exact primary source URL/revision, exact claim ID, authoritative source image and their content hashes for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-017.04.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **trial and questions**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-017.04.X** — For that **one caption/voice/source claim**, perform or independently replay this bounded operation: **Audit muted timing and comprehension on the actual sequence, not isolated text boxes**. **Receipt:** a single output artifact corresponding to **trial and questions**.
- [ ] **EM-017.04.T** — Check the actual output against the predeclared assertion using source-level attribution, graph/visual identity and explicit evidence-strength or uncertainty checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-017.04.N** — Construct one independent negative case that violates this exact science/source/voice/provenance acceptance criterion; run the same validator and record an explicit HOLD/FAIL rather than a false PASS. **Receipt:** one evidence-linked rejected-case run with input hashes.
- [ ] **EM-017.04.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

### EM-017.05 — Reject a silent removed disclaimer or mistimed OH highlight

**Required deliverable from 243-subtask register:** fail-closed QA. **Unit of work:** one caption/voice/source claim. **Domain:** science. **Dependencies:** U → S → O → X → T → N → R. **State:** NOT_AUDITED.

- [ ] **EM-017.05.U** — Register exactly **one caption/voice/source claim** for this objective; assign a stable unit key and recorded source location. **Receipt:** one unit inventory row.
- [ ] **EM-017.05.S** — Pin the exact primary source URL/revision, exact claim ID, authoritative source image and their content hashes for that unit; mark missing or contradictory evidence **BLOCKED**. **Receipt:** one input/source hash manifest row.
- [ ] **EM-017.05.O** — Write **one falsifiable acceptance assertion** before execution, grounded in required output: **fail-closed QA**. **Receipt:** assertion ID and expected PASS/FAIL outcome.
- [ ] **EM-017.05.X** — For that **one caption/voice/source claim**, perform or independently replay this bounded operation: **Reject a silent removed disclaimer or mistimed OH highlight**. **Receipt:** a single output artifact corresponding to **fail-closed QA**.
- [ ] **EM-017.05.T** — Check the actual output against the predeclared assertion using source-level attribution, graph/visual identity and explicit evidence-strength or uncertainty checks. **Receipt:** one measured PASS/FAIL/HOLD with test identity and actual input bytes.
- [ ] **EM-017.05.N** — Exercise one realistic failing or adversarial case for **Reject a silent removed disclaimer or mistimed OH highlight**, retaining source/film identity controls. **Receipt:** a correctly rejected case with reason and fixture/real-media scope.
- [ ] **EM-017.05.R** — Attach exactly one immutable result record: unit key, source/output SHA(s), command/workflow, accepted evidence URL, limitations and disposition. **Receipt:** reviewable evidence ledger row; roll up only genuinely verified units.

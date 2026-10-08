# Rolling enrichment pipeline — deployment contract

Issue: #6411. This is a research-only control plane, not a clinical evidence publication path.

## Single-writer reservation protocol
- The reservation snapshot must include **all** PMID/title/DOI identities in current main, every open research PR, and all active lane reservations. A partial snapshot is unsafe: stop rather than claim no duplicates.
- Five lanes submit proposed <=25-record intake manifests to a **single** coordinator job. The job must hold a repository-wide serialized GitHub Actions concurrency group (cancel-in-progress: false), re-fetch main and all open PR heads and reservations, then validate and reserve identities.
- The local CLI is not a distributed lock. Do not run concurrent `reserve` commands on the same file or publish their output without an exact-head compare-and-swap commit. A lost-update race could otherwise admit duplicate records.
- Every submission gets a durable reservation receipt with lane, batch, exact head SHA, normalized identifiers and source provenance. If the authoritative ledger changes, rerun dedup and refuse stale commits.
- The proposed script's snapshot schema is intentionally minimal; it must not be enabled for real lanes until the baseline loader, PR discovery, transactional commit, and conflict-retry logic exist and have been tested.

## Rolling 500 checkpoint
- Each lane produces <=25 *genuinely new* records per execution. Count accepted reservations, not search hits.
- Freeze a batch only when 500 unique records are independently verified with exact authoritative title/abstract, design, species/human classification, safety, limitations, and provenance.
- Freeze SHA-pinned immutable manifest; open draft PR; begin next research batch on a new branch from latest main while preserving the pending batch in the global exclusion set.
- Single merge coordinator reviews pending batches in dependency order. Require independent semantic review, issue/PR governance, required checks on **exact head**, and mergeability. If main changes, rebase/reconcile and re-run checks. No parallel lane merges.
- Only after confirmed merge update authoritative main baseline and release merged reservations. Never treat draft PRs as accepted clinical evidence.

## Fail-closed recovery
- If writes are blocked, preserve proposed records outside the authoritative reservation set, label them UNRESERVED and do not allow another lane to assume they are claimed.
- Do not disable research discovery merely because merge is blocked; do not allow staging, publishing, or clinical admission without provenance and review.
- Report candidate / verified / integrated / staged / merged counts separately. Missing receipt = unknown, not success.
- Existing PR #6390 and #6397 require semantic review and exact-head governance before merges.

## Activation criteria
1. Baseline and pending-PR source discovery validated.
2. Serialized writer and CAS/transactional persistence tested under 5-way contention.
3. Verified 500 freeze and independent review gates.
4. CI passes on exact head, and an approved coordinator owns merges.
5. Only then re-enable paused lane 3.

## Validation bootstrap
The PR that introduces the Research rolling gate is validated by the repository's pre-existing high-risk CI stack while held from merge. After that workflow exists on `main`, ordinary research/data PRs are required to pass `Research rolling gate` on their exact head before the autonomous merge controller can merge them.

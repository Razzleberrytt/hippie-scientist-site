# Fast evidence finalization workflow

Use this workflow for one herb or compound evidence pack at a time. It replaces the old normalize → review → dry-run → apply → full data build → cleanup sequence with a slug-scoped review and apply command.

## Prepare the review pack

Place the target profile's patch files in `data/patches/inbox/`, then run:

```bash
npm run evidence:finalize -- --slug=ashwagandha
```

This command:

- finds only inbox patches that resolve to the requested canonical profile;
- normalizes them in temporary staging;
- rejects mixed-target files and unsafe non-evidence operations;
- performs a transactional dry run;
- detects exact existing-claim duplicates and repeated sources;
- writes:
  - `data/reviews/evidence/ashwagandha.report.md`
  - `data/reviews/evidence/ashwagandha.report.json`
  - `data/reviews/evidence/ashwagandha.manifest.json`

Nothing canonical or live is changed during preparation.

## Review

Read the Markdown report. Confirm:

- every claim is cautious and population-specific;
- every patch has a DOI, PMID, or authoritative URL;
- benefit, limitation/null evidence, and safety are balanced;
- duplicate or superseded canonical claims are identified.

Add superseded IDs to the manifest's `deprecated_claim_ids` array. Add a source to `deprecated_source_ids` only when every claim using it is also deprecated; the apply command enforces this.

## Approve and apply

After review:

```bash
npm run evidence:finalize -- \
  --slug=ashwagandha \
  --approve \
  --reviewer="Willie Randolph" \
  --apply
```

Approval is tied to the exact normalized batch through `batch_hash`. Changing a patch invalidates the approval and forces a new review.

The apply phase:

1. Repeats normalization and dry-run checks.
2. Requires a current approved review manifest.
3. Applies the whole profile batch transactionally.
4. Marks reviewed claims and sources approved.
5. Deprecates only the IDs explicitly listed in the manifest.
6. Validates canonical schemas and references.
7. Creates a rollback snapshot.
8. Rebuilds canonical SQLite once.
9. Replaces only that profile's canonical citation slice in its runtime detail JSON.
10. Verifies every exported claim-to-source relationship.
11. Archives normalized patches and original raw inbox files.
12. Appends a hash-chained `evidence_finalize` audit record.

It does **not** rebuild route manifests, internal links, sitemap data, semantic snapshots, search indexes, or unrelated profile records.

## Useful options

```bash
# Use one specific inbox file
npm run evidence:finalize -- --slug=ashwagandha --file=data/patches/inbox/ashwagandha-pack.json

# Regenerate a stale approved manifest after patch changes
npm run evidence:finalize -- --slug=ashwagandha --refresh

# Skip SQLite rebuild during experimentation; do not use for the final committed apply
npm run evidence:finalize -- --slug=ashwagandha --approve --reviewer="Name" --apply --no-rebuild

# Preserve temporary normalization staging for debugging
npm run evidence:finalize -- --slug=ashwagandha --keep-staging
```

## Recommended six-slot research pack

1. Strongest supported benefit.
2. Second distinct benefit.
3. Null, negative, or inconsistent evidence.
4. Important population or subgroup limitation.
5. Short-term safety or tolerability.
6. Interaction, long-term uncertainty, or evidence-quality limitation.

Aim for four to six final claims and a small set of unique, traceable sources. More is not automatically better.

## CI behavior

Evidence-related pull requests receive the focused **Evidence Data Check**, which runs citation/finalization tests, canonical validation, and review-manifest validation. Expensive full-site checks should be reserved for the ready-for-review state and the final merge candidate.

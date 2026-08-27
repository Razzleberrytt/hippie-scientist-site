# Risk-tiered autonomous merge policy

The autonomous merge controller optimizes for throughput without knowingly merging deterministic failures.

## Low risk

Docs, tests, and other non-production-only changes require CI to be green. Unrelated checks that are still running do not block merge. Any already-completed failure still blocks.

## Medium risk

Ordinary product-code changes require CI, Site Health Check, Atomic upgrade gate, Production Content Lint, and Build quality regression. Unrelated checks that are merely pending do not block merge. Any already-completed failure still blocks.

## High risk

Scientific/YMYL evidence and safety data, citation/evidence pipelines, crawl/indexing/canonical/redirect behavior, deploy infrastructure, data generators, and CI/governance changes remain fail-closed: every triggered exact-head workflow/check must reach a successful terminal state before merge.

The controller also preserves exact-head/base freshness, clean mergeability, fork restrictions, explicit hold labels, bounded transient retries, and serialized merge revalidation.

A GitHub Actions `action_required` result with no executed jobs is never treated as validation success; the branch must acquire a new executable exact-head validation cycle before merge. Empty workflow runs are infrastructure evidence only and never authorize a manual or automated merge bypass.

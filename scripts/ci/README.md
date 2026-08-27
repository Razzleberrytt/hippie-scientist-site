# CI controller notes

The autonomous merge controller uses the risk-tier policy documented in `docs/merge-risk-policy.md`. High-risk scientific/search/deploy/governance changes retain full exact-head gating; lower-risk changes may merge once their required gates are green, while known completed failures remain blocking.

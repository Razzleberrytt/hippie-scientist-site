# Main protection owner command bridge

The existing `Enforce Main Protection` workflow remains the sole repository authority that applies the documented `main` branch protection contract.

In addition to manual `workflow_dispatch`, the repository owner may trigger that same authority from a normal issue (not a pull request) with the exact command:

`/protect-main PROTECT MAIN`

The workflow still requires `REPO_ADMIN_TOKEN` with repository Administration write permission, applies the existing fail-closed protection payload, and verifies live provider state before reporting success. Non-owner comments, pull-request comments, and non-exact commands do not execute the enforcement job.

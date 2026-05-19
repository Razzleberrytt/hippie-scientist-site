# Workflow Failure Visibility Policy

## Scope
This policy applies to production, CI, deploy, release, build, data, SEO, security, and agent-assist GitHub Actions workflows in this repository.

## Hidden failures are disallowed in production-impacting workflows
- Do not use `|| true`, `set +e` without explicit re-fail logic, or other masking patterns.
- Commands that fail must fail the step and job.
- Multi-line shell steps must use `set -euo pipefail` when they contain control flow or multiple commands.

## `continue-on-error`
- Default: do not use `continue-on-error`.
- Allowed only for intentionally non-blocking experimental/manual diagnostics.
- Any non-blocking step must include a nearby comment explaining:
  - why non-blocking behavior is intentional,
  - where failure evidence is recorded (summary/artifact),
  - who is responsible for review.

## Required workflow summary output for important workflows
For workflows that produce deploy/data/agent outputs, write a GitHub Actions job summary (`$GITHUB_STEP_SUMMARY`) including:
- workflow purpose,
- branch/ref,
- key commands run,
- pass/fail status,
- artifact names or output paths,
- next manual action (if needed).

## Least-privilege permissions
- Default workflow permissions:

```yaml
permissions:
  contents: read
```

- Elevate only when required:
  - `contents: write` only for workflows that commit/push changes.
  - `pull-requests: write` only for workflows that create/comment on PRs.
  - `issues: write` only for workflows that comment on issues.

## Node and install policy
- Use `actions/setup-node@v4`.
- For Node/npm workflows use:
  - `node-version-file: .nvmrc`
  - `cache: npm` (where installs are performed)
- Use `npm ci` in CI/deploy/release workflows.
- Do not use `npm install` in CI/deploy/release unless explicitly justified by a workflow comment.
- Run `npm run check:node` where quality/build/deploy correctness matters.

## Workbook/data guardrails
- Run `npm run validate:workbook-source` before workbook-dependent commands.
- Run `npm run data:validate` after data generation where applicable.
- Fail the job if generated artifacts change unexpectedly and are uncommitted.

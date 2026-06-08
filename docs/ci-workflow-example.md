# CI Workflow Integration Example

This document provides example GitHub Actions workflow configurations for integrating agent patch validation into your CI pipeline.

## Example: GitHub Actions Workflow

If you use GitHub Actions, create `.github/workflows/validate-and-report.yml`:

```yaml
name: Validate Data & Agent Patches

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Validate workbook source
        run: npm run validate:workbook-source
      
      - name: Validate agent patches
        run: npm run validate:agent-patches
      
      - name: Build data from workbook
        run: npm run data:build
      
      - name: Report pending patches
        run: npm run report:pending-patches
        # Continue even if there are pending patches
        # (this is informational only)
        continue-on-error: true
      
      - name: Typecheck
        run: npm run typecheck
      
      - name: Lint
        run: npm run lint

  full-check:
    runs-on: ubuntu-latest
    timeout-minutes: 60
    if: github.event_name == 'pull_request'

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run full check
        run: npm run check:full
      
      - name: Upload patch report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: patch-validation-report
          path: |
            ops/agent-review/
          retention-days: 7
```

## Example: Cloudflare Pages Build

If you deploy to Cloudflare Pages, add to `wrangler.toml`:

```toml
[env.production]
routes = [
  { pattern = "example.com/*", custom_domain = true }
]

[build]
command = "npm run check:full && npm run build:fast"
cwd = "/"
root_dir = "out"

[env.production.build]
command = "npm run check:full && npm run build:fast"
```

This ensures:
1. Patches are validated before build
2. Pending patches are reported
3. Build fails if patches have errors
4. Data is fresh from workbook

## Example: GitLab CI

If you use GitLab CI, create `.gitlab-ci.yml`:

```yaml
stages:
  - validate
  - build

validate:
  stage: validate
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run validate:workbook-source
    - npm run validate:agent-patches
    - npm run report:pending-patches
    - npm run typecheck
    - npm run lint
  allow_failure:
    - script:
        - npm run report:pending-patches

build:
  stage: build
  image: node:20
  cache:
    paths:
      - node_modules/
  script:
    - npm ci
    - npm run check:full
    - npm run build:fast
  only:
    - main
    - develop
```

## Continuous Integration Strategy

### For Development Branches

Run lightweight validation:
```bash
npm run validate:agent-patches
npm run report:pending-patches
```

This:
- Catches malformed patches early
- Reports pending work
- Doesn't block on pending patches

### For Main/Production Branches

Run full validation:
```bash
npm run check:full
```

This:
- Validates patches
- Reports pending patches
- Builds and verifies everything
- Fails if patches are invalid

### For Pull Requests

**Recommended approach:**
1. Check syntax: `npm run validate:agent-patches`
2. Report status: `npm run report:pending-patches`
3. If patches are present, add comment to PR:
   - List pending patches
   - Link to review instructions: `npm run agent:review`
   - Ask author to approve/reject in followup

## Artifact Handling

### Storing Patch Review Artifacts

When `npm run agent:review` is run in CI, it generates:
- `ops/agent-review/approved-patches.json` — Detailed JSON
- `ops/agent-review/approved-patches.csv` — Spreadsheet format

**Recommendation:** Upload as CI artifacts for developer access

**GitHub Actions example:**
```yaml
- name: Store patch review results
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: agent-patch-review
    path: ops/agent-review/
    retention-days: 30
```

## Notification Strategy

### When Patches Are Detected

Use conditional steps to notify developers:

**GitHub Actions example:**
```yaml
- name: Report patch status
  if: always()
  run: |
    if [ -f "ops/agent-review/approved-patches.json" ]; then
      COUNT=$(jq length ops/agent-review/approved-patches.json)
      echo "## Agent Patches Pending Review ($COUNT)" >> $GITHUB_STEP_SUMMARY
      echo "Run \`npm run agent:review\` to review patches" >> $GITHUB_STEP_SUMMARY
    fi
```

### When Patches Have Errors

Fail the build with clear messaging:

```yaml
- name: Check patch validation
  run: |
    npm run validate:agent-patches
    if [ $? -ne 0 ]; then
      echo "Patch validation failed!"
      echo "Run locally: npm run validate:agent-patches"
      exit 1
    fi
```

## Local Developer Workflow

Developers should follow this before pushing:

```bash
# Run agents locally (if authorized)
npm run agent:run --mode=standard --batch=5

# Validate what was generated
npm run validate:agent-patches

# Review what was created
npm run agent:review

# Check everything
npm run check:full

# Push only if validation passes
git push
```

## Integration Checklist

When setting up CI with agent patch validation:

- [ ] Add patch validation script to CI configuration
- [ ] Ensure `npm run validate:agent-patches` runs before build
- [ ] Add `npm run report:pending-patches` for visibility
- [ ] Configure artifact storage for review outputs
- [ ] Add notifications for when patches are detected
- [ ] Document the workflow for team members
- [ ] Test with sample patches to verify behavior
- [ ] Plan review/approval process (manual or automated)
- [ ] Consider scheduled agent runs (cron) if needed
- [ ] Set up rollback plan (keep patch manifests)

## Troubleshooting CI Integration

### Build fails on valid patches
**Issue:** CI rejects patches that should be valid
**Solution:** Check `npm run validate:agent-patches` locally first

### Pending patches cause CI to fail
**Issue:** `report:pending-patches` or review process blocks build
**Solution:** Make those steps `continue-on-error: true` if they should be informational

### Patch files are corrupted between runs
**Issue:** JSON files get modified between generation and validation
**Solution:** Don't modify `agent/patches/` during build; treat as immutable

### Review artifacts are lost
**Issue:** CI artifacts expire or aren't uploaded
**Solution:** Use `retention-days` parameter; configure artifact storage

## Next Steps

1. Choose your CI platform (GitHub Actions, GitLab, Cloudflare, etc.)
2. Add workflows using the examples above
3. Test with `npm run agent:run` to generate sample patches
4. Run `npm run check:full` locally to verify integration
5. Push and monitor CI behavior
6. Adjust notification/approval workflow as needed

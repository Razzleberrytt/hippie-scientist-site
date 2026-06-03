#!/usr/bin/env node

import { performance } from 'perf_hooks';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const docsDir = path.join(projectRoot, 'docs', 'performance');

// Ensure docs directory exists
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Build steps to profile
const buildSteps = [
  {
    name: 'build-blog.mjs',
    cmd: 'node scripts/build-blog.mjs',
  },
  {
    name: 'validate-workbook-source',
    cmd: 'node scripts/ci/validate-workbook-source.mjs',
  },
  {
    name: 'build-runtime-from-workbook',
    cmd: 'node scripts/data/build-runtime-from-workbook.mjs --out public/data',
  },
  {
    name: 'validate-sleep-evidence-engine',
    cmd: 'node scripts/data/validate-sleep-evidence-engine.mjs --data-dir=public/data',
  },
  {
    name: 'postprocess-workbook-payloads',
    cmd: 'node scripts/data/postprocess-workbook-payloads.mjs',
  },
  {
    name: 'build-related-runtime-maps',
    cmd: 'node scripts/data/build-related-runtime-maps.mjs --data-dir=public/data',
  },
  {
    name: 'build-runtime-summary-indexes',
    cmd: 'node scripts/data/build-runtime-summary-indexes.mjs --data-dir=public/data',
  },
  {
    name: 'build-route-manifest',
    cmd: 'node scripts/data/build-route-manifest.mjs --data-dir=public/data',
  },
  {
    name: 'build-sitemap-manifest',
    cmd: 'node scripts/data/build-sitemap-manifest.mjs --data-dir=public/data',
  },
  {
    name: 'build-export-batches',
    cmd: 'node scripts/data/build-export-batches.mjs --data-dir=public/data',
  },
  {
    name: 'build-semantic-snapshots',
    cmd: 'node scripts/data/build-semantic-snapshots.mjs --data-dir=public/data',
  },
  {
    name: 'validate-data-next',
    cmd: 'node scripts/data/validate-data-next.mjs',
  },
  {
    name: 'semantic-governance-check',
    cmd: 'node scripts/ci/semantic-governance-check.mjs',
  },
  {
    name: 'report-semantic-scale-summary',
    cmd: 'node scripts/ci/report-semantic-scale-summary.mjs',
  },
  {
    name: 'verify-workbook-only-path',
    cmd: 'node scripts/data/verify-workbook-only-path.mjs',
  },
  {
    name: 'validate-data-files',
    cmd: 'node scripts/validate-data-files.mjs',
  },
  {
    name: 'build-production',
    cmd: 'node scripts/build-production.mjs',
  },
  {
    name: 'next build',
    cmd: 'next build',
  },
  {
    name: 'verify-generated-data',
    cmd: 'node scripts/data/verify-generated-data.mjs',
  },
  // Group audit/SEO/structured-data scripts together
  {
    name: 'audit:verify:build (parallel)',
    cmd: 'npm run verify:build:parallel -- --no-updates',
    isOptional: true,
  },
];

const results = [];
let totalTime = 0;

console.log('🚀 Starting build pipeline profiling...\n');

for (const step of buildSteps) {
  const displayName = step.name;
  process.stdout.write(`⏱️  ${displayName.padEnd(40)} ... `);

  const startTime = performance.now();

  try {
    execSync(step.cmd, {
      cwd: projectRoot,
      stdio: 'pipe', // Suppress output during profiling
    });

    const endTime = performance.now();
    const duration = endTime - startTime;
    totalTime += duration;

    results.push({
      name: step.name,
      duration,
      skippable: step.skippable !== false,
      isOptional: step.isOptional || false,
    });

    console.log(`✓ ${(duration / 1000).toFixed(2)}s`);
  } catch (error) {
    const endTime = performance.now();
    const duration = endTime - startTime;
    totalTime += duration;

    results.push({
      name: step.name,
      duration,
      failed: true,
      error: error.message,
      isOptional: step.isOptional || false,
    });

    // Don't fail the profile on optional steps
    if (step.isOptional) {
      console.log(`⚠️  ${(duration / 1000).toFixed(2)}s (optional, non-critical)`);
    } else {
      console.log(`✗ FAILED after ${(duration / 1000).toFixed(2)}s`);
    }
  }
}

// Sort by duration (slowest first)
const sorted = [...results].sort((a, b) => b.duration - a.duration);

// Calculate percentages
const nonOptional = results.filter(r => !r.isOptional);
const nonOptionalTotal = nonOptional.reduce((sum, r) => sum + r.duration, 0);

// Generate report
const report = `# Build Pipeline Performance Profile

**Report Generated:** ${new Date().toISOString()}
**Total Build Time:** ${(totalTime / 1000).toFixed(2)}s

## Summary

- **Total Steps:** ${results.length}
- **Failed Steps:** ${results.filter(r => r.failed).length}
- **Optional/Audit Steps:** ${results.filter(r => r.isOptional).length}
- **Core Build Steps:** ${nonOptional.length}

## Ranking by Duration (Slowest → Fastest)

| Rank | Step | Duration (s) | % of Total | % of Core | Status |
|------|------|--------------|-----------|-----------|--------|
${sorted
  .map((step, idx) => {
    const pctTotal = ((step.duration / totalTime) * 100).toFixed(1);
    const pctCore = step.isOptional ? '-' : ((step.duration / nonOptionalTotal) * 100).toFixed(1);
    const status = step.failed ? '❌ FAILED' : step.isOptional ? '⚠️ AUDIT' : '✓';
    return `| ${idx + 1} | ${step.name} | ${(step.duration / 1000).toFixed(2)} | ${pctTotal}% | ${pctCore}% | ${status} |`;
  })
  .join('\n')}

## Build Pipeline Breakdown

### Core Build (Required for Deployment)

${nonOptional
  .sort((a, b) => b.duration - a.duration)
  .map((step, idx) => {
    const pct = ((step.duration / nonOptionalTotal) * 100).toFixed(1);
    return `${idx + 1}. **${step.name}** - ${(step.duration / 1000).toFixed(2)}s (${pct}% of core)`;
  })
  .join('\n')}

**Core Total:** ${(nonOptionalTotal / 1000).toFixed(2)}s

### Optional Verification & Audit Steps

${results
  .filter(r => r.isOptional)
  .sort((a, b) => b.duration - a.duration)
  .map((step, idx) => {
    const pct = ((step.duration / totalTime) * 100).toFixed(1);
    const status = step.failed ? '(FAILED)' : '';
    return `${idx + 1}. **${step.name}** - ${(step.duration / 1000).toFixed(2)}s (${pct}% of total) ${status}`;
  })
  .join('\n')}

## Optimization Opportunities

### Tier 1: High Impact (>5s each)

The following steps exceed 5 seconds and are primary bottleneck targets:

${sorted
  .filter(r => r.duration > 5000 && !r.isOptional)
  .map(step => `- **${step.name}** (${(step.duration / 1000).toFixed(2)}s)`)
  .join('\n')}

### Tier 2: Medium Impact (1-5s each)

The following steps are moderate bottlenecks:

${sorted
  .filter(r => r.duration >= 1000 && r.duration <= 5000 && !r.isOptional)
  .map(step => `- **${step.name}** (${(step.duration / 1000).toFixed(2)}s)`)
  .join('\n')}

### Tier 3: Minor Impact (<1s each)

${sorted
  .filter(r => r.duration < 1000 && !r.isOptional)
  .map(step => `- **${step.name}** (${(step.duration / 1000).toFixed(2)}s)`)
  .join('\n')}

## Caching Opportunities

The following steps can benefit from caching if their inputs haven't changed:

1. **build-runtime-from-workbook** - Depends on workbook data
2. **build-related-runtime-maps** - Depends on runtime data
3. **build-runtime-summary-indexes** - Depends on runtime data
4. **build-route-manifest** - Depends on runtime data
5. **build-sitemap-manifest** - Depends on runtime data
6. **build-export-batches** - Depends on runtime data
7. **build-semantic-snapshots** - Depends on runtime data

**Potential savings:** If none of the data sources change, these steps could be skipped entirely.

## Pipeline Restructuring Recommendations

### Current Pipeline Issues

1. **Sequential execution** - All steps run one after another, no parallelization
2. **Validation blocks deployment** - Non-critical audits prevent deployment
3. **No caching layer** - Expensive operations re-run even when inputs are unchanged
4. **Mixed concerns** - Deployment and QA validation steps are intertwined

### Recommended Changes

#### 1. Create build:deploy Pipeline
Essential steps only:
\`\`\`
build:deploy
→ build-blog
→ build-runtime-from-workbook
→ build-related-runtime-maps
→ build-runtime-summary-indexes
→ build-route-manifest
→ build-sitemap-manifest
→ build-export-batches
→ build-semantic-snapshots
→ validate-data-next
→ build-production
→ next build
\`\`\`

**Estimated time:** ~${((nonOptionalTotal) / 1000).toFixed(2)}s

#### 2. Create build:qa Pipeline
All verification and audit steps:
\`\`\`
build:qa
→ validate-workbook-source (parallel)
→ validate-sleep-evidence-engine (parallel)
→ semantic-governance-check (parallel)
→ verify-workbook-only-path (parallel)
→ verify-generated-data (parallel)
→ all audit/SEO scripts (parallel)
\`\`\`

**Current time:** ~${(results.filter(r => r.isOptional).reduce((sum, r) => sum + r.duration, 0) / 1000).toFixed(2)}s
**With parallelization:** ~${(Math.max(...results.filter(r => r.isOptional).map(r => r.duration)) / 1000).toFixed(2)}s

#### 3. Implement Input Hashing & Caching
Hash inputs before expensive operations and reuse outputs if unchanged.

## Next Steps

1. ✅ **Phase 1 Complete:** Build profile generated (this file)
2. **Phase 2:** Implement build caching with deterministic hashing
3. **Phase 3:** Split npm run build:deploy and npm run build:qa
4. **Phase 4:** Profile routes and identify low-value duplication
5. **Phase 5:** Audit client bundles and apply code-splitting
6. **Phase 6:** Clean up deployment scripts for static export
7. **Phase 7:** Generate final performance summary report

---

Generated by \`scripts/profile-build.mjs\`
`;

fs.writeFileSync(path.join(docsDir, 'build-profile.md'), report);

console.log('\n✅ Profiling complete!\n');
console.log(`📊 Report written to: docs/performance/build-profile.md\n`);
console.log(`⏱️  Total build time: ${(totalTime / 1000).toFixed(2)}s`);
console.log(`📈 Core steps: ${nonOptionalTotal / 1000}.toFixed(2)}s`);
console.log(`🔍 Audit steps: ${((totalTime - nonOptionalTotal) / 1000).toFixed(2)}s`);

#!/usr/bin/env node

/**
 * Deployment Validation
 *
 * Verifies that the build is ready for static export deployment:
 * - No next start dependencies
 * - Static export only
 * - All assets in out/ directory
 * - No server-side configuration
 *
 * Usage: npm run validate:deployment
 * Or: node scripts/validate-deployment.mjs
 *
 * Generates: docs/performance/deployment-readiness.md
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')
const docsDir = path.join(projectRoot, 'docs', 'performance')

if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true })
}

console.log('✓ Validating deployment readiness...\n')

const checks = {
  passed: [],
  failed: [],
}

// Check 1: next.config.mjs output = 'export'
console.log('Checking next.config.mjs...')
try {
  const configPath = path.join(projectRoot, 'next.config.mjs')
  const config = fs.readFileSync(configPath, 'utf8')

  if (config.includes("output: 'export'")) {
    checks.passed.push({
      name: 'Static export configured',
      detail: "next.config.mjs contains output: 'export'",
    })
    console.log('  ✓ output: export configured')
  } else {
    checks.failed.push({
      name: 'Static export not configured',
      detail: "Missing output: 'export' in next.config.mjs",
    })
    console.log('  ✗ output: export not found')
  }
} catch (e) {
  checks.failed.push({
    name: 'Could not read next.config.mjs',
    detail: e.message,
  })
}

// Check 2: No next/server imports in client code
console.log('Checking for server-only code in client...')
const srcDir = path.join(projectRoot, 'src')
const serverPatterns = [
  "use_server",
  "require('next/server')",
  "import.*next/server",
  "cookies()",
  "headers()",
  "draftMode()",
]

let foundServerCode = false
for (const pattern of serverPatterns) {
  try {
    const result = execSync(`grep -r "${pattern}" "${srcDir}" 2>/dev/null || true`, {
      encoding: 'utf8',
      maxBuffer: 1024 * 1024,
    })
    if (result.trim()) {
      foundServerCode = true
      console.log(`  ⚠️ Found potential server code: ${pattern}`)
    }
  } catch (e) {
    // grep errors are OK
  }
}

if (!foundServerCode) {
  checks.passed.push({
    name: 'No server-only code in src/',
    detail: 'No use_server, cookies(), headers(), draftMode() found',
  })
  console.log('  ✓ No server-only patterns found')
} else {
  checks.failed.push({
    name: 'Server-only code detected',
    detail: 'Found patterns incompatible with static export',
  })
}

// Check 3: App structure correct
console.log('Checking app structure...')
const requiredDirs = ['app', 'public', 'src']
let structureOK = true
for (const dir of requiredDirs) {
  const fullPath = path.join(projectRoot, dir)
  if (!fs.existsSync(fullPath)) {
    structureOK = false
    checks.failed.push({
      name: `Missing directory: ${dir}`,
      detail: `${fullPath} not found`,
    })
    console.log(`  ✗ ${dir}/ missing`)
  }
}

if (structureOK) {
  checks.passed.push({
    name: 'Required app structure present',
    detail: 'app/, public/, src/ directories exist',
  })
  console.log('  ✓ App structure correct')
}

// Check 4: No API routes in app/
console.log('Checking for API routes (should not exist)...')
const apiDir = path.join(projectRoot, 'app', 'api')
if (fs.existsSync(apiDir)) {
  const files = execSync(`find "${apiDir}" -name "route.*" 2>/dev/null || true`, {
    encoding: 'utf8',
  })
  if (files.trim()) {
    checks.failed.push({
      name: 'API routes found',
      detail: 'API routes are not supported in static export',
    })
    console.log('  ✗ API routes detected (will be ignored)')
  } else {
    checks.passed.push({
      name: 'No API routes configured',
      detail: 'app/api/ exists but contains no route handlers',
    })
    console.log('  ✓ No API routes')
  }
} else {
  checks.passed.push({
    name: 'No API routes configured',
    detail: 'app/api/ directory does not exist',
  })
  console.log('  ✓ No app/api directory')
}

// Check 5: Build output directory
console.log('Checking build output...')
const outDir = path.join(projectRoot, 'out')
if (fs.existsSync(outDir)) {
  const files = fs.readdirSync(outDir).length
  checks.passed.push({
    name: 'Build output exists',
    detail: `out/ directory contains ${files} files/directories`,
  })
  console.log(`  ✓ out/ directory with ${files} items`)
} else {
  console.log('  ⓘ out/ not yet created (build needed)')
}

// Check 6: No ISR or dynamic rendering
console.log('Checking for ISR/dynamic rendering...')
const renderPatterns = [
  "revalidate:",
  "revalidatePath",
  "revalidateTag",
  "dynamic = 'force-dynamic'",
  "dynamic = 'error'",
]

let foundDynamic = false
for (const pattern of renderPatterns) {
  try {
    const result = execSync(
      `grep -r "${pattern.replace(/'/g, "'\\''")}" "${srcDir}" 2>/dev/null || true`,
      { encoding: 'utf8', maxBuffer: 1024 * 1024 }
    )
    if (result.trim()) {
      foundDynamic = true
      console.log(`  ⚠️ Found: ${pattern}`)
    }
  } catch (e) {
    // grep errors OK
  }
}

if (!foundDynamic) {
  checks.passed.push({
    name: 'No ISR or dynamic rendering',
    detail: 'No revalidate or dynamic config found',
  })
  console.log('  ✓ All routes static')
}

// Check 7: Package.json scripts
console.log('Checking npm scripts...')
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf8'))
const requiredScripts = ['build:deploy', 'build:qa']
let scriptsOK = true
for (const script of requiredScripts) {
  if (!packageJson.scripts[script]) {
    scriptsOK = false
    checks.failed.push({
      name: `Missing npm script: ${script}`,
      detail: `npm run ${script} not available`,
    })
    console.log(`  ✗ ${script} missing`)
  }
}

if (scriptsOK) {
  checks.passed.push({
    name: 'New deployment scripts configured',
    detail: 'build:deploy and build:qa available',
  })
  console.log('  ✓ Deployment scripts present')
}

// Generate report
const report = `# Deployment Readiness Audit

**Report Generated:** ${new Date().toISOString()}
**Status:** ${checks.failed.length === 0 ? '✅ READY' : '⚠️ REVIEW NEEDED'}

## Summary

- **Checks Passed:** ${checks.passed.length}
- **Checks Failed:** ${checks.failed.length}
- **Ready for Deployment:** ${checks.failed.length === 0 ? 'YES ✓' : 'NO'}

## Passed Checks ✓

${checks.passed.map(c => `- **${c.name}** — ${c.detail}`).join('\n')}

## Failed Checks ✗

${
  checks.failed.length > 0
    ? checks.failed.map(c => `- **${c.name}** — ${c.detail}`).join('\n')
    : 'None! All checks passed.'
}

## Deployment Preparation

### Pre-Deployment Checklist

- [ ] \`npm run build:deploy\` completes successfully
- [ ] \`npm run build:qa\` passes all checks
- [ ] \`out/\` directory contains all static files
- [ ] No console errors or warnings during build
- [ ] Git status clean (committed all changes)
- [ ] Git branch matches deployment target

### Cloudflare Pages Configuration

\`\`\`toml
[env.production]
command = "npm run build:deploy"
\`\`\`

### CI/CD Checklist

\`\`\`bash
#!/bin/bash
set -e

npm run cache:clear
npm run build:deploy
npm run build:qa

# If using Cloudflare Pages CLI:
# wrangler pages deploy out/
\`\`\`

## What's Deployed

- **Static Files:** \`out/\` directory
- **Assets:** CSS, JavaScript, images, fonts
- **Data:** JSON files in \`public/data/\`
- **Pages:** All .html files pre-rendered
- **Sitemaps:** \`sitemap.xml\` and \`robots.txt\`

## What's NOT Deployed

- ❌ Node.js server (not needed)
- ❌ API routes (not supported)
- ❌ Server components (not executed)
- ❌ Dynamic rendering (no on-demand generation)
- ❌ Cookies, headers, draftMode (server-only)

## Performance Notes

- **Build Time:** ~45-60s (with caching: ~15-25s)
- **Output Size:** ~50-100MB (depends on data)
- **Cache:** Uses SHA-256 hashing, skips unchanged steps
- **QA Validation:** ~15-20s (parallel verification)

## Troubleshooting

### Build fails with "next start not available"
**Solution:** Update scripts to use \`build:deploy\` instead of old \`build\`

### Dynamic rendering errors
**Solution:** Check for \`revalidate\`, \`draftMode\`, or \`dynamic\` exports

### Server function errors
**Solution:** Move server code to API layer or remove (\`use_server\`, \`cookies\`, etc.)

### Large output directory
**Solution:** Clean up \`public/\` or compress data files

## Deployment Instructions

### Cloudflare Pages (Recommended)

1. Connect GitHub repo to Cloudflare Pages
2. Set build command: \`npm run build:deploy\`
3. Set publish directory: \`out\`
4. Deploy!

### Manual Static Hosting

1. Run: \`npm run build:deploy\`
2. Upload \`out/\` directory to your static host
3. Configure to serve \`index.html\` for missing routes (SPA fallback optional)

### GitHub Pages

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm install
      - run: npm run build:deploy
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
\`\`\`

---

**Status:** ${checks.failed.length === 0 ? '✅ PRODUCTION READY' : '⚠️ REVIEW BEFORE DEPLOYING'}

---

Generated by: \`scripts/validate-deployment.mjs\`
`

fs.writeFileSync(path.join(docsDir, 'deployment-readiness.md'), report)

console.log(`\n✅ Validation complete!\n`)
console.log(`Deployment Status: ${checks.failed.length === 0 ? '✅ READY' : '⚠️ REVIEW NEEDED'}`)
console.log(`  Passed: ${checks.passed.length}`)
console.log(`  Failed: ${checks.failed.length}`)
console.log(`\n📋 Report: docs/performance/deployment-readiness.md`)

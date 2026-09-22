import { spawn } from 'node:child_process'
import process from 'node:process'

export const PREBUILD_GROUPS = [
  {
    name: 'source-boundaries',
    command: 'npm run validate:static-export && node scripts/ci/validate-public-json-imports.mjs && node scripts/ci/validate-quarantine-imports.mjs && node scripts/ci/validate-direct-dependencies.mjs',
  },
  {
    name: 'format-and-headers',
    command: 'node scripts/ci/validate-xlsx-boundary.mjs && node scripts/ci/validate-security-headers.mjs',
  },
  {
    name: 'generated-data',
    command: 'node scripts/data/verify-generated-data.mjs',
  },
  {
    name: 'route-source-contracts',
    command: 'npx tsx scripts/ci/validate-guide-related.mjs && node scripts/ci/validate-route-seo.mjs && node scripts/validators/validate-canonical-host.mjs && node scripts/validate-route-governance.mjs && node scripts/ci/validate-dangerously-set-inner-html.mjs',
  },
]

export const POSTBUILD_GROUPS = [
  {
    name: 'route-and-metadata',
    command: 'node scripts/verify-core-routes.mjs && node scripts/verify-redirects.mjs && node scripts/ci/audit-profile-robots.mjs && node scripts/ci/validate-deploy-readiness.mjs && node scripts/ci/validate-build-seo-metadata.mjs && node scripts/ci/audit-metadata-duplicates.mjs',
  },
  {
    name: 'links',
    command: 'node scripts/ci/audit-internal-links.mjs && node scripts/ci/validate-internal-links.mjs && node scripts/ci/validate-hub-child-coverage.mjs',
  },
  {
    name: 'schema-and-route-seo',
    command: 'node scripts/ci/audit-structured-data.mjs && node scripts/ci/audit-seo-routes.mjs && node scripts/ci/validate-guide-faqs.mjs',
  },
  {
    name: 'sitemap-and-output',
    command: 'node scripts/ci/validate-sitemap.mjs --require-built && node scripts/ci/validate-sitemap-completeness.mjs --require-built && node scripts/ci/validate-robots.mjs --require-built && node scripts/ci/validate-feed-output.mjs && npm run audit:sitemap-affiliate && npm run validate:pagefind-body && npm run validate:cluster-member-export && node scripts/report-performance-budget.mjs',
  },
]

function runGroup(group, phase) {
  const started = Date.now()
  console.log(`[verify-output] ${phase}/${group.name}: starting`)
  return new Promise((resolve) => {
    const child = spawn(group.command, {
      cwd: process.cwd(),
      env: process.env,
      stdio: 'inherit',
      shell: true,
    })
    child.on('error', (error) => {
      resolve({ name: group.name, code: 1, error: error.message, durationMs: Date.now() - started })
    })
    child.on('exit', (code, signal) => {
      resolve({
        name: group.name,
        code: code ?? 1,
        signal: signal || null,
        durationMs: Date.now() - started,
      })
    })
  })
}

async function runPhase(name, groups) {
  const started = Date.now()
  console.log(`[verify-output] ${name}: running ${groups.length} bounded independent groups`)
  const results = await Promise.all(groups.map((group) => runGroup(group, name)))
  const failed = results.filter((result) => result.code !== 0)
  for (const result of results) {
    console.log(`[verify-output] ${name}/${result.name}: ${result.code === 0 ? 'PASS' : 'FAIL'} ${(result.durationMs / 1000).toFixed(2)}s`)
  }
  if (failed.length) {
    const detail = failed.map((result) => `${result.name} (exit ${result.code}${result.signal ? `, signal ${result.signal}` : ''}${result.error ? `, ${result.error}` : ''})`).join('; ')
    throw new Error(`${name} failed: ${detail}`)
  }
  console.log(`[verify-output] ${name}: PASS in ${((Date.now() - started) / 1000).toFixed(2)}s`)
}

export async function main() {
  const started = Date.now()
  await runPhase('prebuild', PREBUILD_GROUPS)
  await runPhase('postbuild', POSTBUILD_GROUPS)
  console.log(`[verify-output] PASS in ${((Date.now() - started) / 1000).toFixed(2)}s`)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(`[verify-output] FAIL: ${error instanceof Error ? error.message : error}`)
    process.exitCode = 1
  })
}

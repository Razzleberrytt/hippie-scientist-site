#!/usr/bin/env node
/**
 * Production-safety guard: refuses to ship if the built HTML still contains
 * dev-affiliate-00 references, which would silently lose every affiliate sale.
 *
 * The Amazon Associates tag is injected via the AMAZON_AFFILIATE_TAG env var,
 * which is set in Cloudflare Pages env vars for production builds. This script
 * does NOT require the env var locally (we only care about the built output).
 *
 * To fix the live site, set the env var in Cloudflare Pages:
 *   Production environment: AMAZON_AFFILIATE_TAG=razzleberry02-20
 * Then trigger a redeploy.
 *
 * Usage: node scripts/ci/audit-affiliate-tag-production.mjs
 *        npm run audit:affiliate-tag-production
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DEV_TAG = 'dev-affiliate-00';
const OUT_DIR = path.join(ROOT, 'out');

let problems = 0;

if (!fs.existsSync(OUT_DIR)) {
  console.error('[affiliate-tag] FAIL: out/ directory does not exist. Run npm run build first.');
  process.exit(1);
}

let htmlScanned = 0;
let badRefs = 0;
const badUrls = new Set();

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlScanned++;
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(/https?:\/\/(?:www\.)?amazon\.com\/[^"'<>\s)]*tag=dev-affiliate-00[^"'<>\s)]*/g) || [];
      for (const m of matches) {
        badRefs++;
        if (badUrls.size < 5) badUrls.add(m);
      }
    }
  }
}

walk(OUT_DIR);
console.log(`[affiliate-tag] scanned ${htmlScanned} HTML files in out/`);

if (badRefs > 0) {
  console.error(`[affiliate-tag] FAIL: ${badRefs} Amazon links still reference ${DEV_TAG}.`);
  console.error('  Sample URLs with dev tag:');
  for (const u of badUrls) console.error(`    ${u}`);
  console.error('  Set AMAZON_AFFILIATE_TAG in Cloudflare Pages env vars before redeploying.');
  problems++;
} else {
  console.log(`[affiliate-tag] no ${DEV_TAG} references in built HTML OK`);
}

if (problems > 0) {
  console.error(`\n[affiliate-tag] FAILED with ${problems} problem(s).`);
  process.exit(1);
}
console.log('\n[affiliate-tag] OK');

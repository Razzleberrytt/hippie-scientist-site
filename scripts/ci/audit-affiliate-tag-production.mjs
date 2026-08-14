#!/usr/bin/env node
/**
 * Production-safety guard for Amazon affiliate attribution.
 *
 * Refuse to ship built HTML that contains either:
 * - the old development placeholder tag, or
 * - an Amazon.com commerce URL with no Associates `tag` parameter at all.
 *
 * The configured production tag may come from AMAZON_AFFILIATE_TAG or the
 * repository default; this guard does not hard-code one valid production tag.
 * It only rejects known-bad placeholder attribution and missing attribution.
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
let amazonRefs = 0;
let badRefs = 0;
let untaggedRefs = 0;
const badUrls = new Set();
const untaggedUrls = new Set();
const amazonUrlPattern = /https?:\/\/(?:www\.)?amazon\.com\/[^"'<>\s)]*/g;

function inspectAmazonUrl(rawUrl) {
  amazonRefs++;
  const decodedUrl = rawUrl.replace(/&amp;/gi, '&');

  try {
    const url = new URL(decodedUrl);
    const tag = url.searchParams.get('tag');

    if (!tag) {
      untaggedRefs++;
      if (untaggedUrls.size < 5) untaggedUrls.add(rawUrl);
      return;
    }

    if (tag === DEV_TAG) {
      badRefs++;
      if (badUrls.size < 5) badUrls.add(rawUrl);
    }
  } catch {
    // URL syntax is validated elsewhere; avoid turning unrelated malformed
    // markup into an affiliate-attribution false positive here.
  }
}

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      htmlScanned++;
      const content = fs.readFileSync(full, 'utf8');
      const matches = content.match(amazonUrlPattern) || [];
      for (const match of matches) inspectAmazonUrl(match);
    }
  }
}

walk(OUT_DIR);
console.log(`[affiliate-tag] scanned ${htmlScanned} HTML files and ${amazonRefs} Amazon.com URL references in out/`);

if (badRefs > 0) {
  console.error(`[affiliate-tag] FAIL: ${badRefs} Amazon links still reference ${DEV_TAG}.`);
  console.error('  Sample URLs with dev tag:');
  for (const url of badUrls) console.error(`    ${url}`);
  problems++;
} else {
  console.log(`[affiliate-tag] no ${DEV_TAG} references in built HTML OK`);
}

if (untaggedRefs > 0) {
  console.error(`[affiliate-tag] FAIL: ${untaggedRefs} Amazon.com links have no Associates tag parameter.`);
  console.error('  Sample untagged URLs:');
  for (const url of untaggedUrls) console.error(`    ${url}`);
  problems++;
} else {
  console.log('[affiliate-tag] all built Amazon.com links include a tag parameter OK');
}

if (problems > 0) {
  console.error(`\n[affiliate-tag] FAILED with ${problems} problem(s).`);
  process.exit(1);
}
console.log('\n[affiliate-tag] OK');

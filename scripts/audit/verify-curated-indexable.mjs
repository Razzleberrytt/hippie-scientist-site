#!/usr/bin/env node
/**
 * Regression guard: verify every slug in the editor-curated allowlist
 * (mirrored from src/lib/index-allowlist.ts) actually has
 * indexability_status === 'PUBLISH' in the built
 * public/data/{herbs,compounds}.json flat lists.
 *
 * Exits non-zero if any curated slug is downgraded so a stray workbook edit
 * can't silently turn high-traffic pages back into noindex.
 *
 * Why the lists are duplicated here: this script runs in CI without TS
 * transpilation. Keep this file in lockstep with src/lib/index-allowlist.ts —
 * the `npm run audit:curated-indexable` job will catch drift because the
 * overlay would have flipped any mismatched slug back to NEEDS_REVIEW anyway.
 *
 * Usage:  node scripts/audit/verify-curated-indexable.mjs
 *         npm run audit:curated-indexable
 */
import fs from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public/data');

// MUST stay in lockstep with src/lib/index-allowlist.ts
const CURATED_INDEXABLE_HERB_SLUGS = [
  'ashwagandha',
  'rhodiola',
  'piper-methysticum',
  'turmeric',
  'ginger',
  'peppermint',
  'black-cohosh',
  'momordica-charantia',
  'black-seed',
  'bacopa',
  'ginkgo-biloba',
  'saffron',
  'melissa-officinalis',
  'valerian',
];

const CURATED_INDEXABLE_COMPOUND_SLUGS = [
  'l-theanine',
  'magnesium',
  'omega-3',
  'caffeine',
  'epigallocatechin-gallate-egcg',
  'n-acetylcysteine',
  'coenzyme-q10',
  'curcumin-piperine',
  'berberine',
  'alpha-gpc',
  'cdp-choline',
  'phosphatidylcholine',
  'acetyl-l-carnitine',
  'l-tyrosine',
  'huperzine-a',
];

function loadFlat(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
}

// A curated slug that fails the PUBLISH check is a real regression only if
// nothing in scripts/data/indexability-policy.mjs's own reasons explain it as
// a deliberate governance decision (e.g. `hidden_until_grounded`,
// `research_only`) rather than a content bug. Restrict to reasons whose
// `finish()`-produced robots/sitemap_included state actually matches what a
// real hold looks like — a stray reason string alone (without the matching
// noindex robots + excluded sitemap state) doesn't count, since that would
// just be masking a genuine inconsistency instead of a real hold.
const GOVERNANCE_HOLD_REASON_PATTERN =
  /^(noindex-decision:|profile-status:(research_only|minimal|draft|archived))/;

export function isKnownGovernanceHold(rec) {
  if (!rec) return false;
  const reasons = Array.isArray(rec.indexability_reasons) ? rec.indexability_reasons : [];
  const hasGovernanceReason = reasons.some((r) => GOVERNANCE_HOLD_REASON_PATTERN.test(String(r)));
  if (!hasGovernanceReason) return false;
  const robotsNoindex = String(rec.robots || '').toLowerCase().includes('noindex');
  const sitemapExcluded = rec.sitemap_included !== true;
  return robotsNoindex && sitemapExcluded;
}

function check(list, slugs, kind) {
  const bySlug = new Map(list.map((r) => [r?.slug, r]));
  const problems = [];
  const holds = [];
  for (const slug of slugs) {
    const rec = bySlug.get(slug);
    if (!rec) {
      problems.push({ slug, issue: 'missing_from_data' });
      continue;
    }
    const wrongStatus = String(rec.indexability_status || '').toUpperCase() !== 'PUBLISH';
    const wrongSitemap = rec.sitemap_included !== true;
    if (!wrongStatus && !wrongSitemap) continue;

    if (isKnownGovernanceHold(rec)) {
      holds.push({ slug, actual: rec.indexability_status, reasons: rec.indexability_reasons });
      continue;
    }
    if (wrongStatus) {
      problems.push({
        slug,
        issue: 'wrong_indexability_status',
        actual: rec.indexability_status,
        reasons: rec.indexability_reasons,
      });
    }
    if (wrongSitemap) {
      problems.push({ slug, issue: 'sitemap_included_false', actual: rec.sitemap_included });
    }
  }
  return { kind, problems, holds };
}

function main() {
  const herbs = loadFlat('herbs.json');
  const compounds = loadFlat('compounds.json');

  const herbReport = check(herbs, CURATED_INDEXABLE_HERB_SLUGS, 'herbs');
  const compoundReport = check(compounds, CURATED_INDEXABLE_COMPOUND_SLUGS, 'compounds');

  const totalProblems =
    herbReport.problems.length + compoundReport.problems.length;

  for (const r of [herbReport, compoundReport]) {
    if (r.problems.length === 0) {
      console.log(`[verify-curated-indexable] ${r.kind}: all curated slugs are PUBLISH + sitemap_included ✅`);
    } else {
      console.log(`[verify-curated-indexable] ${r.kind}: ${r.problems.length} problems:`);
      for (const p of r.problems) console.log(`  - ${p.slug}: ${p.issue} ${p.actual ? `(actual=${p.actual})` : ''}`);
    }
    for (const h of r.holds) {
      console.log(`  (known governance hold, not a regression) ${h.slug}: actual=${h.actual} reasons=${JSON.stringify(h.reasons)}`);
    }
  }

  if (totalProblems > 0) {
    console.error(`\n[verify-curated-indexable] FAILED: ${totalProblems} curated slug(s) regressed. Fix the governance overlay or workbook before deploying.`);
    process.exit(1);
  }
  console.log('\n[verify-curated-indexable] OK');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

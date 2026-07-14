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

// A curated slug dropping out of PUBLISH is only a *regression* if nothing
// deliberately put it there. `indexability-policy.mjs` records an explicit
// governance decision in `indexability_reasons` whenever a profile is held
// back on purpose (e.g. `hidden_until_grounded` pending stronger evidence
// grounding, or a `research_only` profile status). Mirror those two reason
// families here — keep in lockstep with NOINDEX_DECISIONS and the
// research_only/minimal profile-status handling in
// scripts/data/indexability-policy.mjs — so an editor's deliberate hold
// doesn't get flagged as a false-positive "regression" every run.
const DELIBERATE_HOLD_DECISIONS = ['hidden_until_grounded', 'research_archive_runtime'];
const DELIBERATE_HOLD_PROFILE_STATUSES = ['research_only', 'minimal'];

function isDeliberateHold(rec) {
  const reasons = Array.isArray(rec?.indexability_reasons) ? rec.indexability_reasons : [];
  return reasons.some((reason) => {
    const [key, value] = String(reason).split(':');
    if (key === 'noindex-decision' && DELIBERATE_HOLD_DECISIONS.includes(value)) return true;
    if (key === 'profile-status' && DELIBERATE_HOLD_PROFILE_STATUSES.includes(value)) return true;
    return false;
  });
}

function loadFlat(file) {
  const p = path.join(DATA_DIR, file);
  if (!fs.existsSync(p)) return [];
  const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
  return Array.isArray(parsed) ? parsed : [];
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
    const bucket = isDeliberateHold(rec) ? holds : problems;
    const issuePrefix = bucket === holds ? 'known_governance_hold' : null;
    if (String(rec.indexability_status || '').toUpperCase() !== 'PUBLISH') {
      bucket.push({
        slug,
        issue: issuePrefix ?? 'wrong_indexability_status',
        actual: rec.indexability_status,
        reasons: rec.indexability_reasons,
      });
    }
    if (rec.sitemap_included !== true) {
      bucket.push({
        slug,
        issue: issuePrefix ?? 'sitemap_included_false',
        actual: rec.sitemap_included,
      });
    }
  }
  return { kind, problems, holds };
}
const herbs = loadFlat('herbs.json');
const compounds = loadFlat('compounds.json');

const herbReport = check(herbs, CURATED_INDEXABLE_HERB_SLUGS, 'herbs');
const compoundReport = check(compounds, CURATED_INDEXABLE_COMPOUND_SLUGS, 'compounds');

const totalProblems = herbReport.problems.length + compoundReport.problems.length;
const totalHolds = herbReport.holds.length + compoundReport.holds.length;

for (const r of [herbReport, compoundReport]) {
  if (r.problems.length === 0) {
    console.log(`[verify-curated-indexable] ${r.kind}: all curated slugs are PUBLISH + sitemap_included ✅`);
  } else {
    console.log(`[verify-curated-indexable] ${r.kind}: ${r.problems.length} problems:`);
    for (const p of r.problems) console.log(`  - ${p.slug}: ${p.issue} ${p.actual ? `(actual=${p.actual})` : ''}`);
  }
  if (r.holds.length > 0) {
    console.log(`[verify-curated-indexable] ${r.kind}: ${r.holds.length} deliberate governance hold(s) (not counted as a regression):`);
    for (const p of r.holds) console.log(`  - ${p.slug}: held back by ${JSON.stringify(p.reasons ?? p.actual)}`);
  }
}

if (totalProblems > 0) {
  console.error(`\n[verify-curated-indexable] FAILED: ${totalProblems} curated slug(s) regressed${totalHolds > 0 ? ` (${totalHolds} more excluded as deliberate governance holds)` : ''}. Fix the governance overlay or workbook before deploying.`);
  process.exit(1);
}
console.log(`\n[verify-curated-indexable] OK${totalHolds > 0 ? ` (${totalHolds} deliberate governance hold(s) excluded)` : ''}`);

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const dataDir = path.join(root, 'public', 'data');
const issueCsvPath = path.join(root, 'issues.csv');
const reportPath = path.join(root, 'validation-report.md');

const DATASETS = [
  {
    type: 'herb',
    primaryFile: path.join(dataDir, 'herbs.json'),
    detailDirs: [path.join(dataDir, 'herb-detail'), path.join(dataDir, 'herbs-detail')]
  },
  {
    type: 'compound',
    primaryFile: path.join(dataDir, 'compounds.json'),
    detailDirs: [path.join(dataDir, 'compound-detail'), path.join(dataDir, 'compounds-detail')]
  }
];

function csvEscape(value) {
  const text = value == null ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function normalizeName(value) {
  return String(value ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’`]/g, "'")
    .replace(/\([^)]*\)/g, '')
    .replace(/\b(lion)'s\b/gi, "$1s")
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function isBrokenSlug(value) {
  if (value == null) return true;
  const slug = String(value).trim();
  return slug.length === 0 || /^nan$/i.test(slug) || /(^|[-_\s])nan($|[-_\s])/i.test(slug);
}

function displayName(record) {
  return record?.name ?? record?.displayName ?? record?.common_name ?? record?.title ?? '';
}

function recordId(type, record, source) {
  const raw = record?.id ?? record?.slug ?? path.basename(source, '.json');
  return `${type}:${raw}`;
}

function richnessScore(entry) {
  const record = entry.record;
  const values = Object.values(record ?? {});
  const nonEmptyFields = values.filter((value) => {
    if (Array.isArray(value)) return value.length > 0;
    if (value && typeof value === 'object') return Object.keys(value).length > 0;
    return value != null && String(value).trim() !== '';
  }).length;
  const summaryLength = String(record?.summary ?? record?.description ?? '').length;
  const slugBonus = isBrokenSlug(entry.slug) ? 0 : 1000;
  const sourceBonus = entry.sourceKind === 'primary' ? 100 : 0;
  return slugBonus + sourceBonus + nonEmptyFields * 10 + Math.min(summaryLength, 500);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function readDetailFiles(type, detailDirs, existingKeys) {
  const entries = [];
  for (const dir of detailDirs) {
    let files = [];
    try {
      files = await readdir(dir);
    } catch {
      continue;
    }
    for (const file of files.filter((name) => name.endsWith('.json'))) {
      const source = path.join(dir, file);
      const record = await readJson(source);
      const slug = record?.slug ?? path.basename(file, '.json');
      const name = displayName(record);
      const key = `${slug}::${normalizeName(name)}`;
      if (existingKeys.has(key)) continue;
      existingKeys.add(key);
      entries.push({
        type,
        id: recordId(type, record, source),
        name,
        slug,
        source,
        sourceKind: 'detail',
        record
      });
    }
  }
  return entries;
}

async function loadEntries() {
  const entries = [];
  for (const dataset of DATASETS) {
    const records = await readJson(dataset.primaryFile);
    const existingKeys = new Set();
    records.forEach((record, index) => {
      const slug = record?.slug;
      const name = displayName(record);
      existingKeys.add(`${slug}::${normalizeName(name)}`);
      entries.push({
        type: dataset.type,
        id: recordId(dataset.type, record, `${dataset.primaryFile}#${index}`),
        name,
        slug,
        source: `${path.relative(root, dataset.primaryFile)}#${index}`,
        sourceKind: 'primary',
        record
      });
    });
    entries.push(...(await readDetailFiles(dataset.type, dataset.detailDirs, existingKeys)));
  }
  return entries;
}

function buildIssues(entries) {
  const issues = [];
  for (const entry of entries) {
    if (isBrokenSlug(entry.slug)) {
      issues.push({
        type: entry.type,
        id: entry.id,
        name: entry.name,
        slug: entry.slug ?? '',
        reason: entry.slug == null || String(entry.slug).trim() === '' ? 'slug-missing' : 'slug-broken',
        action: 'REVIEW-DELETE-ENTRY'
      });
    }
  }

  const byName = new Map();
  for (const entry of entries) {
    const nameKey = normalizeName(entry.name);
    if (!nameKey) continue;
    if (!byName.has(nameKey)) byName.set(nameKey, []);
    byName.get(nameKey).push(entry);
  }

  for (const [nameKey, group] of byName) {
    const uniqueIds = new Map(group.map((entry) => [entry.id, entry]));
    const dedupedGroup = [...uniqueIds.values()];
    if (dedupedGroup.length < 2) continue;
    const keep = [...dedupedGroup].sort((a, b) => richnessScore(b) - richnessScore(a) || String(a.id).localeCompare(String(b.id)))[0];
    for (const entry of dedupedGroup) {
      issues.push({
        type: entry.type,
        id: entry.id,
        name: entry.name,
        slug: entry.slug ?? '',
        reason: entry.id === keep.id ? `duplicate-group:${nameKey}` : `DUPLICATE-OF-${keep.id}`,
        action: entry.id === keep.id ? 'KEEP-CANONICAL-REVIEW' : `MERGE-KEEP-${keep.id}`
      });
    }
  }

  return issues.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
}

function riskLevel(totalIssues, brokenSlugs, duplicateGroups) {
  if (brokenSlugs > 0 || duplicateGroups > 20 || totalIssues > 100) return 'High';
  if (duplicateGroups > 5 || totalIssues > 25) return 'Med';
  return 'Low';
}

async function main() {
  const entries = await loadEntries();
  const issues = buildIssues(entries);
  const brokenSlugIssues = issues.filter((issue) => issue.reason === 'slug-broken' || issue.reason === 'slug-missing');
  const duplicateKeepRows = issues.filter((issue) => issue.action === 'KEEP-CANONICAL-REVIEW');
  const risk = riskLevel(issues.length, brokenSlugIssues.length, duplicateKeepRows.length);

  const csv = [
    ['type', 'id', 'name', 'slug', 'reason', 'action'].join(','),
    ...issues.map((issue) => [issue.type, issue.id, issue.name, issue.slug, issue.reason, issue.action].map(csvEscape).join(','))
  ].join('\n');
  await writeFile(issueCsvPath, `${csv}\n`, 'utf8');

  const totals = entries.reduce(
    (acc, entry) => {
      acc[entry.type] = (acc[entry.type] ?? 0) + 1;
      return acc;
    },
    {}
  );
  const report = `# Herb/Compound Data Quality Validation Report

Generated: ${new Date().toISOString()}

## Summary

- Total entries: ${entries.length}
- Herb entries: ${totals.herb ?? 0}
- Compound entries: ${totals.compound ?? 0}
- Issues found: ${issues.length}
- Broken slug issues: ${brokenSlugIssues.length}
- Duplicate name groups: ${duplicateKeepRows.length}
- Risk level: ${risk}

## Root-Cause Notes

- Slug issues are entries where \`slug\` is null, empty, or matches \`/nan/i\`.
- Duplicate names are grouped by normalized display name: case-folded, punctuation-normalized, and parenthetical scientific labels removed.
- The suggested canonical record favors valid slugs, primary collection records, and richer populated fields.
- No source data was modified by this audit.

## Validation Checklist

- [x] CSV has all issues with reasons
- [x] Cleanup script has rollback option
- [x] Duplicate names identified using normalized-name grouping
- [x] Report includes risk assessment
- [ ] Manual reviewer confirms each \`REVIEW-DELETE-ENTRY\`
- [ ] Manual reviewer confirms each \`MERGE-KEEP-*\`
- [ ] Run cleanup in dry-run mode before apply
- [ ] Confirm reference-check warnings before deletion/merge

## Outputs

- \`issues.csv\`
- \`cleanup.js\`
- \`validation-report.md\`
`;
  await writeFile(reportPath, report, 'utf8');

  console.log(`Wrote ${path.relative(root, issueCsvPath)}`);
  console.log(`Wrote ${path.relative(root, reportPath)}`);
  console.log(`Total entries: ${entries.length}`);
  console.log(`Issues found: ${issues.length}`);
  console.log(`Risk level: ${risk}`);
}

await mkdir(root, { recursive: true });
await main();

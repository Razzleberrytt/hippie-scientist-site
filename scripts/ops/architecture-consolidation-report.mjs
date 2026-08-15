#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['components', 'lib', 'app'];
const OUTPUT = 'ops/reports/architecture-consolidation.json';
const SOURCE_RE = /\.(?:[cm]?[jt]sx?)$/;

async function walk(dir) {
  const result = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return result; }
  for (const entry of entries) {
    if (['node_modules', '.next', 'out', 'coverage'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full));
    else result.push(full);
  }
  return result;
}

function rel(file) { return path.relative(ROOT, file).replaceAll(path.sep, '/'); }
function hash(value) { return crypto.createHash('sha256').update(value).digest('hex').slice(0, 16); }

function normalizeForDuplicateDetection(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/^\s*import[\s\S]*?from\s+['"][^'"]+['"];?\s*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function importSpecifiers(source) {
  const specs = [];
  for (const match of source.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?['"]([^'"]+)['"]/g)) specs.push(match[1]);
  for (const match of source.matchAll(/import\(['"]([^'"]+)['"]\)/g)) specs.push(match[1]);
  return specs;
}

function candidatePaths(importer, specifier) {
  let base;
  if (specifier.startsWith('@/')) base = path.join(ROOT, specifier.slice(2));
  else if (specifier.startsWith('.')) base = path.resolve(path.dirname(importer), specifier);
  else return [];
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'];
  return [
    ...extensions.map((ext) => `${base}${ext}`),
    ...extensions.slice(1).map((ext) => path.join(base, `index${ext}`)),
  ].map((value) => path.normalize(value));
}

function isRouteEntry(file) {
  const name = path.basename(file);
  return /^(?:page|layout|loading|error|not-found|route)\.[cm]?[jt]sx?$/.test(name);
}

function isTestOrStory(file) {
  return /(?:__tests__|\.test\.|\.spec\.|\.stories\.)/.test(file);
}

async function main() {
  const files = (await Promise.all(SCAN_DIRS.map((dir) => walk(path.join(ROOT, dir))))).flat();
  const sourceFiles = files.filter((file) => SOURCE_RE.test(file) && !isTestOrStory(file));
  const sources = new Map();
  for (const file of sourceFiles) sources.set(path.normalize(file), await fs.readFile(file, 'utf8'));

  const incoming = new Map([...sources.keys()].map((file) => [file, new Set()]));
  for (const [importer, source] of sources) {
    for (const specifier of importSpecifiers(source)) {
      const resolved = candidatePaths(importer, specifier).find((candidate) => sources.has(candidate));
      if (resolved) incoming.get(resolved)?.add(rel(importer));
    }
  }

  const emptyArtifacts = [];
  const reExportAliases = [];
  const orphanComponents = [];
  const legacyCandidates = [];
  const configFiles = [];
  const duplicateGroups = new Map();

  for (const [file, source] of sources) {
    const relative = rel(file);
    if (!source.trim()) emptyArtifacts.push(relative);
    if (/^\s*export\s+\{?\s*default\s*\}?\s+from\s+['"][^'"]+['"]\s*;?\s*$/.test(source.trim())) reExportAliases.push(relative);
    if (/components\//.test(relative) && !isRouteEntry(file) && (incoming.get(file)?.size ?? 0) === 0) orphanComponents.push(relative);
    if (/(?:^|\/)(?:legacy|deprecated|obsolete)(?:\/|[-_.])/i.test(relative) || /legacy.*mapper|mapper.*legacy/i.test(relative)) legacyCandidates.push(relative);
    if (/(?:^|\/)[^/]*(?:config|constants)[^/]*\.[cm]?[jt]sx?$/i.test(relative)) configFiles.push(relative);

    if (/components\//.test(relative) && source.trim().length > 80) {
      const normalized = normalizeForDuplicateDetection(source);
      if (normalized.length > 80) {
        const key = hash(normalized);
        if (!duplicateGroups.has(key)) duplicateGroups.set(key, []);
        duplicateGroups.get(key).push(relative);
      }
    }
  }

  const exactStructuralDuplicates = [...duplicateGroups.values()].filter((group) => group.length > 1);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    scannedSourceFiles: sourceFiles.length,
    policy: 'Candidates are reported, not auto-deleted. Remove or merge only after usage and behavior are verified.',
    summary: {
      emptyArtifacts: emptyArtifacts.length,
      orphanComponents: orphanComponents.length,
      reExportAliases: reExportAliases.length,
      exactStructuralDuplicateGroups: exactStructuralDuplicates.length,
      legacyCandidates: legacyCandidates.length,
      configurationFiles: configFiles.length,
    },
    candidates: {
      emptyArtifacts: emptyArtifacts.sort(),
      orphanComponents: orphanComponents.sort(),
      reExportAliases: reExportAliases.sort(),
      exactStructuralDuplicates,
      legacyCandidates: legacyCandidates.sort(),
      configurationFiles: configFiles.sort(),
    },
    consolidationRules: [
      'Prefer configurable primitives when components differ only by labels, spacing, or presentation flags.',
      'Remove obsolete templates, utilities, schema mappers, transforms, and constants only after verified zero live imports.',
      'Centralize repeated domain transformations and configuration instead of adding another page-local variant.',
      'Keep compatibility re-exports only when they protect a stable import contract; otherwise collapse them deliberately.',
    ],
  };

  await fs.mkdir(path.dirname(OUTPUT), { recursive: true });
  await fs.writeFile(OUTPUT, `${JSON.stringify(report, null, 2)}\n`);
  console.log(`Architecture consolidation report → ${OUTPUT}`);
  console.log(JSON.stringify(report.summary, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});

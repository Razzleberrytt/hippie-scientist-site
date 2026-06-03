#!/usr/bin/env node
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function parseArgs(argv) {
  const args = {
    issues: 'issues.csv',
    dataDir: path.join('public', 'data'),
    outDir: 'cleaned-data',
    apply: false,
    force: false,
    reviewed: false,
    rollback: ''
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--apply') args.apply = true;
    else if (arg === '--force') args.force = true;
    else if (arg === '--reviewed') args.reviewed = true;
    else if (arg === '--issues') args.issues = argv[++index];
    else if (arg === '--data-dir') args.dataDir = argv[++index];
    else if (arg === '--out-dir') args.outDir = argv[++index];
    else if (arg === '--rollback') args.rollback = argv[++index];
    else if (arg === '--help') {
      console.log(`Usage:
  node cleanup.js --issues issues.csv
  node cleanup.js --issues issues.csv --apply
  node cleanup.js --rollback .data-cleanup-backups/<backup-id>

Options:
  --apply       Write cleaned files back to public/data after backup.
  --reviewed    Required with --apply for reviewed delete/merge actions.
  --force       Allow removing records even when references are found.
  --out-dir     Dry-run output directory. Default: cleaned-data.
  --data-dir    Data directory. Default: public/data.
`);
      process.exit(0);
    }
  }
  return args;
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') quoted = false;
      else value += char;
    } else if (char === '"') quoted = true;
    else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }
  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }
  const [header, ...body] = rows.filter((item) => item.length > 1);
  return body.map((item) => Object.fromEntries(header.map((key, index) => [key, item[index] ?? ''])));
}

function idValue(id) {
  return String(id).replace(/^[^:]+:/, '');
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function writeJson(file, value) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function listJsonFiles(dir) {
  const files = [];
  async function walk(current) {
    let entries = [];
    try {
      entries = await readdir(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) await walk(fullPath);
      else if (entry.name.endsWith('.json')) files.push(fullPath);
    }
  }
  await walk(dir);
  return files;
}

async function findReferences(dataDir, issue, targetFiles) {
  const needleValues = [issue.id, idValue(issue.id), issue.slug, issue.name].filter(Boolean);
  const files = await listJsonFiles(dataDir);
  const targetSet = new Set(targetFiles.map((file) => path.resolve(file)));
  const refs = [];
  for (const file of files) {
    if (targetSet.has(path.resolve(file))) continue;
    const text = await readFile(file, 'utf8');
    if (needleValues.some((needle) => text.includes(needle))) {
      refs.push(path.relative(root, file));
    }
  }
  return refs;
}

async function rollback(backupDir, dataDir) {
  if (!backupDir || !existsSync(backupDir)) {
    throw new Error(`Rollback backup not found: ${backupDir}`);
  }
  await cp(backupDir, dataDir, { recursive: true, force: true });
  console.log(`Rolled back ${dataDir} from ${backupDir}`);
}

async function createBackup(dataDir) {
  const backupDir = path.join(root, '.data-cleanup-backups', new Date().toISOString().replace(/[:.]/g, '-'));
  await mkdir(path.dirname(backupDir), { recursive: true });
  await cp(dataDir, backupDir, { recursive: true });
  return backupDir;
}

function issueShouldRemove(issue) {
  return issue.action === 'DELETE-ENTRY' || issue.action === 'REVIEW-DELETE-ENTRY' || issue.action.startsWith('MERGE-KEEP-');
}

function issueNeedsReviewConfirmation(issue) {
  return issue.action.includes('REVIEW') || issue.action.startsWith('MERGE-KEEP-');
}

async function cleanCollection(type, dataDir, outDir, issues, log, apply, force) {
  const file = path.join(dataDir, `${type}s.json`);
  const records = await readJson(file);
  const removeIssues = issues.filter((issue) => issue.type === type && issueShouldRemove(issue));
  const targetFiles = [file];
  const keep = [];

  for (const record of records) {
    const recordSlug = record?.slug ?? '';
    const recordId = `${type}:${record?.id ?? recordSlug}`;
    const matched = removeIssues.find((issue) => issue.id === recordId || issue.slug === recordSlug);
    if (!matched) {
      keep.push(record);
      continue;
    }
    const refs = await findReferences(dataDir, matched, targetFiles);
    if (refs.length > 0 && !force) {
      keep.push(record);
      log.push({ type, id: matched.id, action: 'SKIP-REFERENCED', reason: matched.reason, references: refs });
    } else {
      log.push({ type, id: matched.id, action: matched.action, reason: matched.reason, references: refs });
    }
  }

  const outputFile = apply ? file : path.join(outDir, `${type}s.json`);
  await writeJson(outputFile, keep);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const dataDir = path.resolve(root, args.dataDir);

  if (args.rollback) {
    await rollback(path.resolve(root, args.rollback), dataDir);
    return;
  }

  const issues = parseCsv(await readFile(path.resolve(root, args.issues), 'utf8'));
  const log = [];

  if (args.apply && !args.reviewed && issues.some(issueNeedsReviewConfirmation)) {
    throw new Error('Refusing --apply: CSV contains review-gated actions. Re-run with --reviewed after manual review.');
  }

  const backupDir = await createBackup(dataDir);
  const outDir = path.resolve(root, args.outDir);

  if (!args.apply) {
    await mkdir(outDir, { recursive: true });
    console.log(`Dry run: writing cleaned collection files to ${path.relative(root, outDir)}`);
  } else {
    console.log(`Apply mode: backup created at ${path.relative(root, backupDir)}`);
  }

  await cleanCollection('herb', dataDir, outDir, issues, log, args.apply, args.force);
  await cleanCollection('compound', dataDir, outDir, issues, log, args.apply, args.force);

  const logFile = args.apply
    ? path.join(backupDir, 'cleanup-log.json')
    : path.join(outDir, 'cleanup-log.json');
  await writeJson(logFile, {
    generatedAt: new Date().toISOString(),
    mode: args.apply ? 'apply' : 'dry-run',
    backupDir,
    force: args.force,
    changes: log
  });

  console.log(`Backup: ${path.relative(root, backupDir)}`);
  console.log(`Logged ${log.length} reviewed changes/skips`);
  console.log(`Rollback: node cleanup.js --rollback ${path.relative(root, backupDir)}`);
}

await main().catch((error) => {
  console.error(error);
  process.exit(1);
});

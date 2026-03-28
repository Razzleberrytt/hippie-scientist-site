import { existsSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const REPO_ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..', '..');
export const OPS_DIR = join(REPO_ROOT, 'ops');
export const STATE_DB_PATH = join(OPS_DIR, 'state.db');
export const MIGRATIONS_DIR = join(OPS_DIR, 'migrations');

export function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function listMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^\d+.*\.sql$/u.test(file))
    .sort();
}

export function bootstrapStateDb() {
  ensureDir(OPS_DIR);
  const migrationFiles = listMigrationFiles();
  if (migrationFiles.length === 0) {
    throw new Error('No migration files found in ops/migrations.');
  }

  const payload = {
    dbPath: STATE_DB_PATH,
    migrationsDir: MIGRATIONS_DIR,
    migrationFiles,
  };

  const runner = `
import json, sqlite3, sys
payload = json.loads(sys.stdin.read())
conn = sqlite3.connect(payload['dbPath'])
cur = conn.cursor()
cur.execute('CREATE TABLE IF NOT EXISTS _migrations(name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)')
for name in payload['migrationFiles']:
    exists = cur.execute('SELECT 1 FROM _migrations WHERE name = ?', (name,)).fetchone()
    if exists:
        continue
    sql = open(f"{payload['migrationsDir']}/{name}", 'r', encoding='utf-8').read()
    cur.executescript(sql)
    cur.execute('INSERT INTO _migrations(name) VALUES (?)', (name,))
conn.commit()
rows = cur.execute('SELECT name, applied_at FROM _migrations ORDER BY name').fetchall()
print(json.dumps({'applied': [r[0] for r in rows], 'count': len(rows)}))
conn.close()
`;

  const result = spawnSync('python3', ['-c', runner], {
    input: JSON.stringify(payload),
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    throw new Error(`Failed to bootstrap SQLite state DB: ${result.stderr || result.stdout}`);
  }

  return JSON.parse(result.stdout.trim() || '{"applied":[],"count":0}');
}

export function compileSchema(schemaPath) {
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true });
  addFormats(ajv);
  const schema = loadJson(schemaPath);
  return ajv.compile(schema);
}

export function nowIso() {
  return new Date().toISOString();
}

export function fail(message, details = '') {
  console.error(`[enrichment] ${message}`);
  if (details) console.error(details);
  process.exitCode = 1;
}

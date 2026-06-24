import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

export const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const OPS_DIR = join(REPO_ROOT, 'ops');
export const STATE_DB_PATH = join(OPS_DIR, 'state.db');
export const MIGRATIONS_DIR = join(OPS_DIR, 'migrations');

export function ensureDir(path) {
  if (!existsSync(path)) mkdirSync(path, { recursive: true });
}

export function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function writeJson(path, value) {
  writeFileSync(path, JSON.stringify(value, null, 2));
}

export function listMigrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((file) => /^\d+.*\.sql$/u.test(file))
    .sort();
}

export function runSqlite(payload) {
  const runner = `
import json, sqlite3, sys
payload = json.loads(sys.stdin.read())
conn = sqlite3.connect(payload['dbPath'])
conn.row_factory = sqlite3.Row
cur = conn.cursor()
args = payload.get('args') or []
if payload.get('many'):
    cur.executemany(payload['sql'], args)
    conn.commit()
    print(json.dumps({'changes': conn.total_changes}))
elif payload.get('select'):
    rows = cur.execute(payload['sql'], args).fetchall()
    print(json.dumps([dict(r) for r in rows]))
else:
    cur.execute(payload['sql'], args)
    conn.commit()
    print(json.dumps({'changes': conn.total_changes, 'lastrowid': cur.lastrowid}))
conn.close()
`;

  const result = runPython(['-c', runner], JSON.stringify({ dbPath: STATE_DB_PATH, ...payload }));
  if (result.status !== 0) {
    throw new Error(`SQLite command failed: ${result.stderr || result.stdout}`);
  }

  return JSON.parse(result.stdout.trim() || 'null');
}

function runPython(args, input) {
  const attempts = [
    { command: 'python3', args },
    { command: 'py', args: ['-3', ...args] },
  ];

  let lastResult = null;
  for (const attempt of attempts) {
    const result = spawnSync(attempt.command, attempt.args, {
      input,
      encoding: 'utf8',
    });
    lastResult = result;
    const combinedOutput = `${result.stderr || ''}\n${result.stdout || ''}`;
    const isWindowsStoreAliasMiss =
      attempt.command === 'python3' &&
      result.status !== 0 &&
      /Python was not found; run without arguments to install from the Microsoft Store/i.test(combinedOutput);
    if (result.error?.code === 'ENOENT' || isWindowsStoreAliasMiss) continue;
    return result;
  }

  return lastResult ?? spawnSync('python3', args, {
    input,
    encoding: 'utf8',
  });
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

  const result = runPython(['-c', runner], JSON.stringify(payload));

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

function stableNormalize(value) {
  if (Array.isArray(value)) return value.map((entry) => stableNormalize(entry));
  if (value && typeof value === 'object') {
    const normalized = {};
    for (const key of Object.keys(value).sort()) normalized[key] = stableNormalize(value[key]);
    return normalized;
  }
  return value;
}

export function deterministicRunKey(input, prefix = 'det') {
  const normalized = JSON.stringify(stableNormalize(input));
  const hash = createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `${prefix}_${hash}`;
}

export function deterministicRunId(_input) {
  void _input;
  return generatePrefixedUlid('run');
}

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
function encodeBase32(value, length) {
  let current = BigInt(value);
  let output = '';
  while (output.length < length) {
    output = CROCKFORD_BASE32[Number(current % 32n)] + output;
    current /= 32n;
  }
  return output;
}

export function createUlid(now = Date.now()) {
  const timePart = encodeBase32(BigInt(now), 10);
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  let randomValue = 0n;
  for (const byte of randomBytes) randomValue = (randomValue << 8n) | BigInt(byte);
  const randomPart = encodeBase32(randomValue, 26).slice(-16);
  return `${timePart}${randomPart}`;
}

export function generatePrefixedUlid(prefix) {
  return `${prefix}_${createUlid()}`;
}

export function fail(message, details = '') {
  console.error(`[enrichment] ${message}`);
  if (details) console.error(details);
  process.exitCode = 1;
}

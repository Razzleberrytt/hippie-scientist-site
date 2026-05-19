#!/usr/bin/env node
import fs from 'node:fs';
import process from 'node:process';

const packageJson = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
const expected = packageJson?.engines?.node;

if (!expected) {
  console.log('No package.json engines.node constraint found; skipping Node version check.');
  process.exit(0);
}

const current = process.version.replace(/^v/, '');

const parseVersion = (value) => value.split('.').map((segment) => Number.parseInt(segment, 10) || 0);
const compare = (left, right) => {
  const [la, lb, lc] = parseVersion(left);
  const [ra, rb, rc] = parseVersion(right);
  if (la !== ra) return la - ra;
  if (lb !== rb) return lb - rb;
  return lc - rc;
};

const checks = expected
  .split(/\s+/)
  .map((token) => token.trim())
  .filter(Boolean)
  .map((token) => {
    const match = token.match(/^(>=|<=|>|<|=)?v?(\d+(?:\.\d+){0,2})$/);
    if (!match) {
      throw new Error(`Unsupported engines.node token: "${token}"`);
    }
    return { op: match[1] ?? '=', version: match[2] };
  });

const satisfies = checks.every(({ op, version }) => {
  const cmp = compare(current, version);
  switch (op) {
    case '>': return cmp > 0;
    case '>=': return cmp >= 0;
    case '<': return cmp < 0;
    case '<=': return cmp <= 0;
    case '=': return cmp === 0;
    default: return false;
  }
});

if (!satisfies) {
  console.error(`Node ${current} does not satisfy package.json engines.node constraint: ${expected}`);
  process.exit(1);
}

console.log(`Node ${current} satisfies package.json engines.node constraint: ${expected}`);

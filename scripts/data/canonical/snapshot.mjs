// Snapshot + rollback of the canonical dataset.
//
// A snapshot is a timestamped copy of data/canonical/** taken immediately
// before a patch apply, enabling full rollback. Directories are injectable so
// tests can run against temp locations.

import fs from 'node:fs'
import path from 'node:path'
import { canonicalDir as defaultCanonicalDir, snapshotsDir as defaultSnapshotsDir } from './paths.mjs'
import { ensureDir } from './jsonl.mjs'

function copyDir(src, dest) {
  ensureDir(dest)
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dest, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else if (entry.isFile()) fs.copyFileSync(s, d)
  }
}

export function createSnapshot(label = '', { canonicalDir = defaultCanonicalDir, snapshotsDir = defaultSnapshotsDir } = {}) {
  const ts = new Date().toISOString().replace(/[:.]/g, '-')
  const name = label ? `${ts}_${label}` : ts
  const dest = path.join(snapshotsDir, name)
  copyDir(canonicalDir, path.join(dest, 'canonical'))
  fs.writeFileSync(path.join(dest, 'meta.json'), `${JSON.stringify({ created_at: new Date().toISOString(), label }, null, 2)}\n`, 'utf8')
  return { name, path: dest }
}

export function listSnapshots({ snapshotsDir = defaultSnapshotsDir } = {}) {
  if (!fs.existsSync(snapshotsDir)) return []
  return fs
    .readdirSync(snapshotsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

export function restoreSnapshot(name, { canonicalDir = defaultCanonicalDir, snapshotsDir = defaultSnapshotsDir } = {}) {
  const snapshots = listSnapshots({ snapshotsDir })
  const target = name === 'latest' ? snapshots[snapshots.length - 1] : name
  if (!target || !snapshots.includes(target)) {
    throw new Error(`snapshot not found: ${name}`)
  }
  const src = path.join(snapshotsDir, target, 'canonical')
  if (!fs.existsSync(src)) throw new Error(`snapshot has no canonical dir: ${target}`)
  fs.rmSync(canonicalDir, { recursive: true, force: true })
  copyDir(src, canonicalDir)
  return { restored: target }
}

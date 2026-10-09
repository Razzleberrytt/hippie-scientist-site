import fs from 'node:fs';
import path from 'node:path';
import {validateManifest} from './github-reservation-controller.mjs';
import {normalizeDoi,normalizeTitle} from './rolling-coordinator.mjs';

// Preflight only: never writes reservations or bypasses the serialized controller.
// Usage: node scripts/research/prepare-lane-intake.mjs candidate.json output-directory
export function prepareLaneIntake(manifest) {
  const accepted = [], rejected = [], seen = new Set();
  if (!manifest || !Array.isArray(manifest.records)) throw Error('candidate manifest must contain records array');
  for (const [index, record] of (manifest.records || []).entries()) {
    const identity = [
      'pmid:' + String(record?.pmid || '').trim(),
      ...(record?.doi ? ['doi:' + normalizeDoi(record.doi)] : []),
      'title:' + normalizeTitle(record?.title || '')
    ];
    if (identity.some(key => seen.has(key))) {
      rejected.push({index, pmid: record?.pmid || null, reason: 'duplicate within candidate pool'});
      continue;
    }
    try {
      validateManifest({...manifest, records: [record]});
      accepted.push(record);
      for (const key of identity) seen.add(key);
    } catch (error) {
      rejected.push({index, pmid: record?.pmid || null, reason: String(error.message)});
    }
  }
  const manifests = [];
  for (let i = 0; i < accepted.length; i += 25)
    manifests.push({...manifest, records: accepted.slice(i, i + 25)});
  return {manifests, rejected, candidate_count: (manifest.records || []).length, accepted_count: accepted.length};
}

if (process.argv[1]?.endsWith('prepare-lane-intake.mjs')) {
  const [input, output] = process.argv.slice(2);
  if (!input || !output) throw Error('usage: prepare-lane-intake.mjs candidate.json output-directory');
  const result = prepareLaneIntake(JSON.parse(fs.readFileSync(input, 'utf8')));
  fs.mkdirSync(output, {recursive: true});
  for (const [i, manifest] of result.manifests.entries())
    fs.writeFileSync(path.join(output, 'intake-' + String(i + 1).padStart(3, '0') + '.json'), JSON.stringify(manifest, null, 2) + '\n', {flag: 'wx'});
  // Keep the diagnostic JSON outside the '*.json' intake trigger; it is not a reservation manifest.
  fs.writeFileSync(path.join(output, 'preflight-report.txt'), JSON.stringify({...result, manifests: result.manifests.map((m,i) => ({file: 'intake-' + String(i + 1).padStart(3, '0') + '.json', count: m.records.length}))}, null, 2) + '\n', {flag: 'wx'});
  console.log(JSON.stringify({candidates: result.candidate_count, accepted: result.accepted_count, rejected: result.rejected.length, manifests: result.manifests.length}));
  if (!result.accepted_count) process.exitCode = 1;
}

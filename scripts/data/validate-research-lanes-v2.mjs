#!/usr/bin/env node
// Fail-closed validation of cross-lane reservations and resumable checkpoints.
// Invoke with: node scripts/data/validate-research-lanes-v2.mjs registry.json checkpoint.json
import fs from 'node:fs';
const fail = message => { console.error(message); process.exitCode = 1; };
const norm = value => String(value ?? '').trim().toLowerCase().replace(/\s+/g,' ');
const doi = value => norm(value).replace(/^https?:\/\/(dx\.)?doi\.org\//,'').replace(/^doi:\s*/,'');
const states = ['DISCOVERED','RESERVED','SOURCE_VERIFIED','SEMANTIC_REVIEWED','DEDUPED','INTEGRATED','STAGED','MERGED'];
export function validate(registry, checkpoint) {
 const errors = [];
 if (!Array.isArray(registry?.reservations)) errors.push('Missing reservations array');
 if (!Array.isArray(checkpoint?.records)) errors.push('Missing checkpoint records');
 if (errors.length) return errors;
 const identities = new Map();
 for (const r of registry.reservations) {
  if (![1,2,3,4,5].includes(r.lane)) errors.push('Invalid lane');
  if (!r.reservationId || !r.pmid || !/^\d+$/.test(String(r.pmid))) errors.push('Invalid reservation identity');
  for (const [kind,value] of [['pmid',r.pmid],['doi',doi(r.doi)],['title',norm(r.title)]]) {
   if (!value) continue;
   const key=kind+':'+value;
   if (identities.has(key) && identities.get(key)!==r.reservationId) errors.push('Collision '+key);
   else identities.set(key,r.reservationId);
  }
 }
 const ids = new Set(registry.reservations.map(r=>r.reservationId));
 for (const r of checkpoint.records) {
  if (!ids.has(r.reservationId)) errors.push('Unreserved checkpoint '+r.reservationId);
  if (!states.includes(r.state)) errors.push('Invalid state '+r.state);
  if (states.indexOf(r.state)>=states.indexOf('SOURCE_VERIFIED')) {
   for (const field of ['pmid','exactTitle','abstract','studyDesign','population','intervention','outcomes','nullResults','limitations','safety','sourceUrl','verifiedAt'])
    if (r[field]===undefined || r[field]===null || r[field]==='') errors.push('Missing '+field+' for '+r.reservationId);
  }
  if (r.claimsPromoted || r.dosingPromoted) errors.push('Forbidden promotion '+r.reservationId);
 }
 return errors;
}
if (process.argv[1]?.endsWith('validate-research-lanes-v2.mjs')) {
 const [a,b]=process.argv.slice(2);
 if (!a || !b) fail('Usage: validator registry.json checkpoint.json');
 else {
  try { const errors=validate(JSON.parse(fs.readFileSync(a)),JSON.parse(fs.readFileSync(b))); if(errors.length) errors.forEach(fail); else console.log('PASS: reservation/checkpoint invariants'); }
  catch(e) { fail(e.message); }
 }
}

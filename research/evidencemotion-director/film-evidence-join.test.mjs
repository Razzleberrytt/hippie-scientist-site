import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {inspectFilmEvidenceJoins} from './film-evidence-join.mjs';

const graph = () => ({
  schema_version:'claim-dna-1c-relationships/0.1', batch_id:'synthetic-only',
  claims:{'claim-1':{claim_id:'claim-1',ingredient:'test-ingredient',studies:['doi:10.1000/example']}},
  studies:{'doi:10.1000/example':{canonical_id:'doi:10.1000/example',pmid:null,claims:['claim-1'],ingredients:['test-ingredient']}},
  ingredients:{'test-ingredient':{profile_slug:'test-ingredient',claims:['claim-1'],studies:['doi:10.1000/example']}}
});
const film = () => [{filmClaimId:'shot-01',claimId:'claim-1',ingredient:'test-ingredient',
  claimType:'human_effect',sourceKind:'bibliographic_relationship',canonicalStudyIds:['doi:10.1000/example']}];
const run=(g=graph(),f=film(),sha)=>{
  const relationshipIndexBytes=JSON.stringify(g);
  return inspectFilmEvidenceJoins({relationshipIndexBytes,
    expectedIndexSha256:sha ?? createHash('sha256').update(relationshipIndexBytes).digest('hex'), filmClaims:f});
};
const denied=r=>{assert.equal(r.status,'HOLD'); assert.equal(r.mayPublish,false);
  assert.equal(r.scientificClaimsApproved,false);assert.deepEqual(r.joins,[]);};
test('reciprocal opaque DOI joins are review candidates, never science approval',()=>{
  const r=run();assert.equal(r.status,'IDENTITY_LINKS_READY_FOR_EDITORIAL_REVIEW');
  assert.equal(r.joins.length,1);assert.equal(r.scientificClaimsApproved,false);
  assert.equal(r.mediaApproved,false);assert.equal(r.mayPublish,false);
  assert.equal(r.joins[0].canonicalStudyIds[0],'doi:10.1000/example');
});
test('changed source bytes refuse pinned SHA',()=>{const r=run(graph(),film(),'a'.repeat(64));denied(r);assert.ok(r.errors.includes('SOURCE_INDEX_SHA_CHANGED'));});
test('missing trusted pin refuses even a self-consistent graph',()=>denied(inspectFilmEvidenceJoins({relationshipIndexBytes:JSON.stringify(graph()),filmClaims:film()})));
test('malformed json refuses',()=>denied(inspectFilmEvidenceJoins({relationshipIndexBytes:'{',expectedIndexSha256:createHash('sha256').update('{').digest('hex'),filmClaims:film()})));
test('unsupported relationship version refuses',()=>{const g=graph();g.schema_version='future-version';denied(run(g));});
test('missing film inventory refuses',()=>denied(run(graph(),[])));
test('fabricated study identity refuses',()=>{const f=film();f[0].canonicalStudyIds=['pmid:999999'];denied(run(graph(),f));});
test('missing reverse study->claim link refuses',()=>{const g=graph();g.studies['doi:10.1000/example'].claims=[];denied(run(g));});
test('missing ingredient->study link refuses',()=>{const g=graph();g.ingredients['test-ingredient'].studies=[];denied(run(g));});
test('unknown ingredient refuses',()=>{const f=film();f[0].ingredient='other';denied(run(graph(),f));});
test('a structure asset cannot be converted to human-effect evidence',()=>{const f=film();f[0].sourceKind='pubchem_structure';const r=run(graph(),f);denied(r);assert.ok(r.errors[0].includes('NON_BIBLIOGRAPHIC'));});
test('illustrative art cannot be converted to study evidence',()=>{const f=film();f[0].sourceKind='illustrative_art';denied(run(graph(),f));});
test('duplicate citation IDs are refused',()=>{const f=film();f[0].canonicalStudyIds=['doi:10.1000/example','doi:10.1000/example'];denied(run(graph(),f));});
test('duplicate film claim ID refused',()=>{const f=[...film(),...film()];denied(run(graph(),f));});
test('DOI identifier can never be put into PMID field',()=>{const g=graph();g.studies['doi:10.1000/example'].pmid='doi:10.1000/example';denied(run(g));});
test('unknown claimed clinical authority cannot self-promote',()=>{const f=film();f[0].scientificClaimsApproved=true;const r=run(graph(),f);assert.equal(r.scientificClaimsApproved,false);assert.equal(r.mayPublish,false);});
test('all-or-nothing joins, no partial list when one claim is bad',()=>{const f=[...film(),{...film()[0],filmClaimId:'shot-02',canonicalStudyIds:['pmid:999']}];denied(run(graph(),f));});

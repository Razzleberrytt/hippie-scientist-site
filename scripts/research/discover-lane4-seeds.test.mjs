import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'

const native=readFileSync('.github/workflows/research-lane4-native-hourly.yml','utf8')
const owner=readFileSync('.github/workflows/research-lane-intake.yml','utf8')
const discover=readFileSync('scripts/research/discover-lane4-seeds.mjs','utf8')

test('native Lane 4 schedules no paid agent and submits a bounded seed through GitHub only',()=>{
  assert.match(native,/schedule:\s*\n\s*- cron: '27 \* \* \* \*'/)
  assert.match(native,/node scripts\/research\/discover-lane4-seeds\.mjs/)
  assert.match(native,/research\/intake\/4\/native-\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}/)
  assert.match(native,/git push origin "HEAD:refs\/heads\/\$branch"/)
  assert.match(discover,/\.slice\(0,2\)/)
  assert.match(discover,/seed_only:true/)
  assert.match(discover,/research_only:true/)
})

test('one serialized push-triggered reservation authority; never double-submit',()=>{
  assert.match(native,/group: research-reservation-global/)
  assert.match(owner,/group: research-reservation-global/)
  assert.match(owner,/- 'research\/intake\/\*\*'/)
  assert.match(owner,/- 'ops\/research-intake\/\*\.json'/)
  assert.match(owner,/CANDIDATE_PATH="\$manifest" node scripts\/research\/github-reservation-controller\.mjs reserve/)
  assert.doesNotMatch(native,/node scripts\/research\/github-reservation-controller\.mjs reserve/,
    'native discovery must not also reserve, because push handles reservation')
  assert.doesNotMatch(native,/workflow_dispatch[^\n]*candidate_path/, 'no second dispatch path')
})

test('source ledger integrity and publication firewall remain explicit',()=>{
  assert.match(discover,/registry\.schema_version!==1/)
  assert.match(discover,/Array\.isArray\(registry\.reservations\)/)
  assert.match(discover,/Array\.isArray\(registry\.batches\)/)
  assert.match(discover,/git\/blobs\/.*registryMeta\.sha/)
  assert.match(discover,/research_only:true/)
  assert.doesNotMatch(discover,/clinical_approved\s*:\s*true|publish_approved\s*:\s*true/)
  assert.match(owner,/name: Validate research control plane/)
})

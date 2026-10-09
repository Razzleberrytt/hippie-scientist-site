import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {selectReplaySeed,parseReservationReceipt,selectIntakeBranches,parsePinnedReplayJson} from './replay-committed-intakes.mjs'

const seed={schema_version:1,seed_only:true,lane:4,pmids:['12345678','22345678']}
test('bounded exact source PMID seed selection',()=>{
  assert.deepEqual(selectReplaySeed(seed).state,'ready')
  assert.deepEqual(selectReplaySeed(seed).pmids,['12345678','22345678'])
  assert.equal(selectReplaySeed({...seed,seed_only:false}).state,'not-pmid-seed')
  assert.equal(selectReplaySeed(seed,new Set(seed.pmids)).state,'already-reserved')
  assert.equal(selectReplaySeed(seed,new Set(['12345678'])).state,'partial-reservation-hold')
  assert.deepEqual(selectReplaySeed(seed,new Set(['12345678'])).pmids,['22345678'])
})
test('refuse duplicate, invalid, oversized and malformed source seeds',()=>{
  for(const bad of [
    {...seed,pmids:['12345678','12345678']},
    {...seed,pmids:['12345','invalid']},
    {...seed,pmids:[]},
    {...seed,pmids:Array.from({length:26},(_,i)=>String(10000000+i))},
    {...seed,lane:6}, {...seed,pmids:[' 12345678']},
  ]) assert.throws(()=>selectReplaySeed(bad))
})
test('reservation receipts must match the full requested manifest exactly',()=>{
  const ok='INFO source check\n'+JSON.stringify({reserved:2,lane:4,batches:['rolling-0009']})+'\n'
  assert.equal(parseReservationReceipt(ok,2,4).reserved,2)
  assert.throws(()=>parseReservationReceipt(ok,1,4))
  assert.throws(()=>parseReservationReceipt(ok,2,3),/partial receipt/)
  assert.throws(()=>parseReservationReceipt('{"reserved":2,"lane":4,"batches":[]}',2,4),/partial receipt/)
  assert.throws(()=>parseReservationReceipt('{"reserved":2,"lane":4,"batches":["rolling-0009","rolling-0009"]}',2,4),/partial receipt/)
  assert.throws(()=>parseReservationReceipt('{"reserved":2,"lane":4,"batches":["other-system"]}',2,4),/partial receipt/)
  assert.throws(()=>parseReservationReceipt(ok,2,0),/Invalid exact reservation expectations/)
  assert.throws(()=>parseReservationReceipt('INFO source check\n',2,4))
  assert.throws(()=>parseReservationReceipt('{"reserved":2,"lane":4}',2,4))
  assert.throws(()=>parseReservationReceipt('{"reserved":0,"lane":4,"batches":[]}',2,4))
})

test('keeps frozen-batch recovery ahead of optional replay',()=>{
  const workflow=readFileSync('.github/workflows/research-lane-intake.yml','utf8')
  const frozen=workflow.indexOf('name: Recover pending freezes without bypassing gates')
  const replay=workflow.indexOf('name: Replay exact committed PMID seeds missed by push events')
  assert.ok(frozen>=0 && replay>frozen,'frozen batches must recover even if seed replay blocks')
  assert.match(workflow, /RESEARCH_REPLAY_MAX_FILES: '1'/)
})

test('scheduled replay continues after recovery failure only when control-plane validation passed',()=>{
  const workflow=readFileSync('.github/workflows/research-lane-intake.yml','utf8')
  const recoveryJob=workflow.slice(workflow.indexOf('  recover:'))
  assert.match(recoveryJob, /name: Validate research control plane\n\s+id: validate_research_control_plane/)
  assert.match(recoveryJob, /name: Recover pending freezes without bypassing gates\n\s+id: recover_freezes/)
  const replay=recoveryJob.slice(recoveryJob.indexOf('name: Replay exact committed PMID seeds missed by push events'))
  assert.match(replay, /if: \$\{\{ !cancelled\(\) && steps\.validate_research_control_plane\.outcome == 'success'/)
  assert.match(replay, /steps\.recover_freezes\.outcome == 'success' \|\| steps\.recover_freezes\.outcome == 'failure'/)
  assert.doesNotMatch(replay, /if: always\(\)/)
})

test('repo-wide pagination cannot hide pinned research/intake branches',()=>{
  const sha='a'.repeat(40)
  const refs=[
    {ref:'refs/heads/main',object:{sha}},
    {ref:'refs/heads/research/intake/4/withdrawal',object:{sha}},
    {ref:'refs/heads/research/intake/1/sleep',object:{sha}},
    {ref:'refs/heads/research/intake-malformed',object:{sha}},
  ]
  const selected=selectIntakeBranches(refs)
  assert.deepEqual(selected.map(b=>b.name),[
    'research/intake/1/sleep','research/intake/4/withdrawal'
  ])
  assert.ok(selected.every(b=>b.commit.sha===sha))
  assert.throws(()=>selectIntakeBranches({invalid:true}),/Invalid GitHub/)
  assert.throws(()=>selectIntakeBranches(refs,1),/cap reached/)
  assert.throws(()=>selectIntakeBranches([
    {ref:'refs/heads/research/intake/4/forged',object:{sha:'not-a-sha'}}
  ]),/exact commit SHA/)
})


test('replay reads inline GitHub contents using the existing safe source decoder',async()=>{
  const registry={schema_version:1,reservations:[{pmid:'10000001',state:'RESERVED'}],batches:[]}
  const sha='a'.repeat(40)
  const value=await parsePinnedReplayJson({
    sha,encoding:'base64',content:Buffer.from(JSON.stringify(registry)).toString('base64'),
  },async()=>{throw Error('inline content must not request a blob')})
  assert.deepEqual(value,registry)
})

test('oversized registry with encoding none loads exact Contents API blob SHA',async()=>{
  const registry={schema_version:1,reservations:[{pmid:'10000001',state:'RESERVED'}],batches:[]}
  const sha='b'.repeat(40)
  const seen=[]
  const value=await parsePinnedReplayJson({sha,encoding:'none',content:''},async pinned=>{
    seen.push(pinned)
    return {encoding:'base64',content:Buffer.from(JSON.stringify(registry)).toString('base64')}
  })
  assert.deepEqual(seen,[sha],'Fallback must use exact Contents SHA, never a moving branch')
  assert.deepEqual(value,registry)
})

test('replay fails closed for missing, empty, malformed or unsupported GitHub content',async()=>{
  const sha='c'.repeat(40)
  const oversized={sha,encoding:'none',content:''}
  await assert.rejects(parsePinnedReplayJson(oversized,async()=>({encoding:'base64',content:''})),/empty|missing/i)
  await assert.rejects(parsePinnedReplayJson(oversized,async()=>({encoding:'none',content:'bad'})),/missing|base64/i)
  await assert.rejects(parsePinnedReplayJson({encoding:'none',content:''},async()=>({encoding:'base64',content:'e30='})),/SHA/)
  await assert.rejects(parsePinnedReplayJson({
    sha,encoding:'base64',content:Buffer.from('{invalid').toString('base64'),
  },async()=>{throw Error('unexpected blob request')}),/Pinned replay JSON invalid/)
  await assert.rejects(parsePinnedReplayJson({sha,encoding:'base64',content:''},
    async()=>{throw Error('GitHub read failed 502')}),/GitHub read failed 502/)
})

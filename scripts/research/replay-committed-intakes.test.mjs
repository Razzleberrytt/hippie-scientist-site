import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {selectReplaySeed,parseReservationReceipt} from './replay-committed-intakes.mjs'

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
  assert.equal(parseReservationReceipt(ok,2).reserved,2)
  assert.throws(()=>parseReservationReceipt(ok,1))
  assert.throws(()=>parseReservationReceipt('INFO source check\n',2))
  assert.throws(()=>parseReservationReceipt('{"reserved":2,"lane":4}',2))
  assert.throws(()=>parseReservationReceipt('{"reserved":0,"lane":4,"batches":[]}',2))
})

test('keeps frozen-batch recovery ahead of optional replay',()=>{
  const workflow=readFileSync('.github/workflows/research-lane-intake.yml','utf8')
  const frozen=workflow.indexOf('name: Recover pending freezes without bypassing gates')
  const replay=workflow.indexOf('name: Replay exact committed PMID seeds missed by push events')
  assert.ok(frozen>=0 && replay>frozen,'frozen batches must recover even if seed replay blocks')
  assert.match(workflow, /RESEARCH_REPLAY_MAX_FILES: '1'/)
})

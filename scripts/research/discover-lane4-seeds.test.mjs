import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
import {selectLane4Candidates,createLane4Seed,discoverLane4} from './discover-lane4-seeds.mjs'

const native=readFileSync('.github/workflows/research-lane4-native-hourly.yml','utf8')
const intake=readFileSync('.github/workflows/research-lane-intake.yml','utf8')

test('hourly native path stays inside the original global serialized controller',()=>{
  assert.match(native,/cron: '27 \* \* \* \*'/)
  assert.match(native,/group: research-reservation-global/)
  assert.match(intake,/group: research-reservation-global/)
  assert.match(native,/node --test scripts\/research\/\*\.test\.mjs/)
  assert.match(native,/git push origin "HEAD:refs\/heads\/\$branch"/)
  assert.match(native,/research\/intake\/4\/native-\$\{GITHUB_RUN_ID\}-\$\{GITHUB_RUN_ATTEMPT\}/)
  assert.match(native,/pull-requests: write/)
  assert.match(native,/contents: write/)
  assert.match(native,/CANDIDATE_PATH: \$\{\{ steps\.discover\.outputs\.seed \}\}/)
  assert.equal((native.match(/run: node scripts\/research\/github-reservation-controller\.mjs reserve/g)||[]).length,1)
  assert.match(native,/GITHUB_TOKEN pushes do not trigger/)
  assert.match(intake,/name: Replay exact committed PMID seeds missed by push events/)
})

test('bounded novel source identities, deduplicated without clinical interpretation',()=>{
  const reservations=[{pmid:'11111111',state:'RESERVED'},{pmid:'22222222',state:'RELEASED'}]
  assert.deepEqual(selectLane4Candidates({idlist:['11111111','22222222','22222222','33333333','44444444']},reservations),
    ['22222222','33333333'])
  const seed=createLane4Seed(['22222222','33333333'])
  assert.equal(seed.seed_only,true)
  assert.equal(seed.research_only,true)
  assert.equal(seed.lane_focus,'withdrawal-dependence-nps')
  assert.equal(seed.lane,4)
  assert.deepEqual(seed.pmids,['22222222','33333333'])
  assert.doesNotMatch(JSON.stringify(seed),/clinical_approved":true|publish_approved":true/)
  assert.deepEqual(selectLane4Candidates({idlist:['11111111']},reservations),[])
})

test('fail closed on invalid source ledger, PubMed payload and seed bounds',()=>{
  assert.throws(()=>selectLane4Candidates(null,[]),/Malformed PubMed/)
  assert.throws(()=>selectLane4Candidates({idlist:'bad'},[]),/Malformed PubMed/)
  assert.throws(()=>selectLane4Candidates({idlist:['11111111']},null),/Canonical/)
  assert.throws(()=>selectLane4Candidates({idlist:['11111111']},[{pmid:'?' ,state:'RESERVED'}]),/Invalid PMID/)
  assert.throws(()=>selectLane4Candidates({idlist:['oops']},[]),/Malformed PMID/)
  assert.throws(()=>selectLane4Candidates({idlist:[]},[],3),/cap/)
  assert.throws(()=>createLane4Seed([]),/Invalid/)
  assert.throws(()=>createLane4Seed(['11111111','11111111']),/Invalid/)
  assert.throws(()=>createLane4Seed(['11111111','22222222','33333333']),/Invalid/)
})

test('oversized canonical registry uses exact Contents SHA blob and preserves research-only identity',async()=>{
  const sha='a'.repeat(40)
  const registry={schema_version:1,reservations:[{pmid:'11111111',state:'RESERVED'}],batches:[]}
  const urls=[]
  const fetchImpl=async url=>{
    urls.push(url)
    if(url.includes('/contents/'))return {ok:true,json:async()=>({sha,encoding:'none',content:''})}
    if(url.endsWith('/git/blobs/'+sha))return {ok:true,json:async()=>({
      encoding:'base64',content:Buffer.from(JSON.stringify(registry)).toString('base64')
    })}
    if(url.includes('esearch.fcgi?'))return {ok:true,json:async()=>({esearchresult:{idlist:['11111111','22222222','33333333']}})}
    throw Error('Unexpected endpoint '+url)
  }
  const result=await discoverLane4({repo:'test/repository',token:'unit-test',fetchImpl})
  assert.equal(result.state,'candidates')
  assert.deepEqual(result.seed.pmids,['22222222','33333333'])
  assert.ok(urls.some(x=>x.endsWith('/git/blobs/'+sha)), 'must read SHA-pinned blob, not mutable ref')
  assert.equal(urls.length,3)
})

test('invalid oversize registry and absent PubMed idlist cannot look like no new studies',async()=>{
  const sha='b'.repeat(40)
  const invalid=async url=>{
    if(url.includes('/contents/'))return {ok:true,json:async()=>({sha,encoding:'none',content:''})}
    if(url.includes('/git/blobs/'))return {ok:true,json:async()=>({encoding:'base64',content:'e2JhZA=='})}
    throw Error('Should never search after invalid ledger')
  }
  await assert.rejects(discoverLane4({repo:'test/repository',token:'token',fetchImpl:invalid}),/Pinned registry JSON invalid/)
  const valid=async url=>{
    if(url.includes('/contents/'))return {ok:true,json:async()=>({
      sha,encoding:'base64',content:Buffer.from(JSON.stringify({schema_version:1,reservations:[],batches:[]})).toString('base64')
    })}
    if(url.includes('esearch.fcgi?'))return {ok:true,json:async()=>({esearchresult:{}})}
    throw Error('Unexpected fetch '+url)
  }
  await assert.rejects(discoverLane4({repo:'test/repository',token:'token',fetchImpl:valid}),/Malformed PubMed/)
})

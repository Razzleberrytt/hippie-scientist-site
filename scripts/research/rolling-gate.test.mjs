import test from 'node:test';import assert from 'node:assert/strict';import {audit} from './rolling-gate.mjs';
const r=(n)=>({pmid:String(n),title:'Research title '+n,doi:'10.5555/'+n});
test('five lanes no collisions',()=>{const reservations=Array.from({length:5},(_,lane)=>Array.from({length:25},(_,i)=>({...r(lane*25+i+1),lane:lane+1,batch:'b'+lane}))).flat();assert.equal(audit({baseline:[],reservations,openPrs:[],expectedHeads:{}}).reserved,125)});
test('pending PR excluded',()=>assert.throws(()=>audit({baseline:[],reservations:[r(1)],openPrs:[{number:7,head_sha:'abc',records:[r(1)]}],expectedHeads:{7:'abc'}}),/collision/));
test('stale head rejected',()=>assert.throws(()=>audit({baseline:[],reservations:[],openPrs:[{number:7,head_sha:'abc',records:[]}],expectedHeads:{7:'def'}}),/stale/));
test('missing PR inventory rejected',()=>assert.throws(()=>audit({baseline:[],reservations:[],openPrs:[{number:7,head_sha:'abc'}],expectedHeads:{7:'abc'}}),/incomplete/));

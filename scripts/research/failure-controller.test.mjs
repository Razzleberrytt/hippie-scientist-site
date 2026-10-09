import test from 'node:test';import assert from 'node:assert/strict';import {classifyFailure,withRecovery} from './failure-controller.mjs';
test('classifies validation and concurrency',()=>{assert.equal(classifyFailure(new Error('collision pmid:1')).retry,false);const e=new Error('conflict');e.status=409;assert.equal(classifyFailure(e).retry,true)});
test('bounded retry recovers',async()=>{let n=0;const v=await withRecovery(()=>{n++;if(n<2){const e=new Error('conflict');e.status=409;throw e}return 7},{sleep:async()=>{}});assert.equal(v,7);assert.equal(n,2)});

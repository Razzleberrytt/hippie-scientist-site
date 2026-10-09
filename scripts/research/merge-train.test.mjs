import test from 'node:test';import assert from 'node:assert/strict';import {decide} from './merge-train.mjs';
const p={number:1,draft:false,issue_linked:true,governance_complete:true,independent_semantic_review:true,head_sha:'h',base_sha:'b',mergeable:true,required_checks:[{head_sha:'h',conclusion:'success'}]};
const c={current_head_sha:'h',current_base_sha:'b',predecessor_pending:false};
test('eligible only on exact head',()=>assert.equal(decide(p,c).decision,'ELIGIBLE_FOR_AUTHORIZED_MERGE'));
test('hold stale, missing review and predecessor',()=>{assert.ok(decide(p,{...c,current_head_sha:'other'}).reasons.includes('stale head'));assert.ok(decide({...p,independent_semantic_review:false},c).reasons.includes('semantic review'));assert.ok(decide(p,{...c,predecessor_pending:true}).reasons.includes('predecessor pending'))});

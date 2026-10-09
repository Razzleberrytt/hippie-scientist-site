import test from 'node:test';
import assert from 'node:assert/strict';
import {decodeGitHubContent} from './github-reservation-controller.mjs';

test('large GitHub Contents payload falls back to Git blob',async()=>{
 const expected=JSON.stringify({reservations:[{pmid:'12345'}]});
 const result=await decodeGitHubContent(
  {sha:'known-sha',encoding:'none',content:''},
  async sha=>{
   assert.equal(sha,'known-sha');
   return {encoding:'base64',content:Buffer.from(expected).toString('base64')};
  }
 );
 assert.equal(result,expected);
});
test('missing Git blob fails closed',async()=>{
 await assert.rejects(
  decodeGitHubContent({sha:'known-sha',encoding:'none',content:''},async()=>({encoding:'none',content:''})),
  /blob payload unavailable/
 );
});
test('small Contents payload needs no blob request',async()=>{
 const expected=JSON.stringify({reservations:[]});
 const result=await decodeGitHubContent(
  {sha:'small-sha',encoding:'base64',content:Buffer.from(expected).toString('base64')},
  async()=>{throw Error('unexpected blob read')}
 );
 assert.equal(result,expected);
});

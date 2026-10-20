import {test,expect} from 'vitest'
import {verifyR819CueBinding} from '../r819-acoustic-cue-binding.mjs'
const h='a'.repeat(64)
function fixture(){
 const words=[{word:'pain',start:7.0,end:7.2},{word:'relief',start:7.2,end:7.48},
  {word:'tolerance',start:8.9,end:9.4},{word:'withdrawal',start:11.1,end:11.6}]
 const alignment={receiptSha256:h,receipt:{schemaVersion:'ths-r810-local-word-alignment-v1',
  engine:'mfa-offline',timingSource:'acoustic-forced-alignment',
  humanAuditoryReview:{status:'pass'},words}}
 const storyboard={beats:[{id:'reports',start:7,end:12,
  alignmentReceiptSha256:h,items:[{objectId:'pain-card',wordIndex:0,anchorWord:'pain',cueSeconds:7},
    {objectId:'tolerance-card',wordIndex:2,anchorWord:'tolerance',cueSeconds:8.9}]}]}
 return {alignment,storyboard}
}
test('verified original MFA word starts drive exact ordered card cues',()=>{
 const {alignment,storyboard}=fixture()
 const p=verifyR819CueBinding(storyboard,alignment)
 expect(p.itemCount).toBe(2)
 expect(p.items[1].word).toBe('tolerance')
})
test('made-up 13-second timing or wrong word index cannot be treated as an aligned cue',()=>{
 const {alignment,storyboard}=fixture()
 storyboard.beats[0].items[0].cueSeconds=8.4
 expect(()=>verifyR819CueBinding(storyboard,alignment)).toThrow(/actual MFA word/)
})
test('a plausible but different alignment SHA cannot certify the words',()=>{
 const {alignment,storyboard}=fixture()
 alignment.receiptSha256='b'.repeat(64)
 expect(()=>verifyR819CueBinding(storyboard,alignment)).toThrow(/SHA mismatch/)
})
test('a different spoken word at the same timestamp still fails',()=>{
 const {alignment,storyboard}=fixture()
 storyboard.beats[0].items[0].anchorWord='calm'
 expect(()=>verifyR819CueBinding(storyboard,alignment)).toThrow(/actual MFA word/)
})
test('an unverified or unreviewed acoustic receipt is a hard stop',()=>{
 const {alignment,storyboard}=fixture()
 alignment.receipt.humanAuditoryReview.status='pending'
 expect(()=>verifyR819CueBinding(storyboard,alignment)).toThrow(/previously verified/)
})
test('duplicate word reuse is not a six-item speech sequence',()=>{
 const {alignment,storyboard}=fixture()
 storyboard.beats[0].items[1].wordIndex=0
 expect(()=>verifyR819CueBinding(storyboard,alignment)).toThrow(/duplicate word index/)
})

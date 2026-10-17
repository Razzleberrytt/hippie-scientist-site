import test from 'node:test'
import assert from 'node:assert/strict'
import {assertMobileOpeningHookSvg} from '../mobile-hook-clarity-gate.mjs'
const svg=(texts,attrs='')=>'<svg '+attrs+' xmlns="http://www.w3.org/2000/svg">'+texts.map(t=>'<text x="60" y="220">'+t+'</text>').join('')+'</svg>'
test('restraint: three visible text blocks and approved pill survive',()=>{
 const x=assertMobileOpeningHookSvg(svg(['PHENIBUT','CALMING OR ADDICTIVE?','Withdrawal can be severe.'],'data-hero-kind="capsule" data-hero-template="clean-capsule-v1"'))
 assert.equal(x.texts,3)
})
test('original screenshot overload is rejected',()=>{
 const prior=['THE HIPPIE SCIENTIST','EVIDENCEMOTION · HARM REDUCTION','THE SIDE THEY SKIP','01/06','CALMING OR ADDICTIVE?','WITHDRAWAL CAN BE SEVERE','Sold as a calming','SOURCE: CDC / SYSTEMATIC REVIEWS','PHENIBUT: THE OTHER SIDE','FOLLOW FOR THE SCIENCE, NOT THE HYPE']
 assert.throws(()=>assertMobileOpeningHookSvg(svg(prior)),/MOBILE_OPENING_HOLD/)
})
test('early promotional CTA is rejected even below density limits',()=>{
 assert.throws(()=>assertMobileOpeningHookSvg(svg(['Phenibut','FOLLOW FOR THE SCIENCE'])),/EARLY_CTA/)
})
test('source or reference card must be visually deferred but never removed from ledger',()=>{
 assert.throws(()=>assertMobileOpeningHookSvg(svg(['Calming or addictive?','SOURCE: CDC'])),/SOURCE_MUST_BE_IN_SEPARATE_AUDITED_SOURCE_BEAT/)
})
test('freeform unlabeled capsule cannot obtain proof by assertion',()=>{
 assert.throws(()=>assertMobileOpeningHookSvg(svg(['Phenibut'], 'data-hero-kind="capsule"')),/CAPSULE_REQUIRES_APPROVED_SHAPE_TEMPLATE/)
})
test('valid short scientific claim remains permitted',()=>assert.doesNotThrow(()=>assertMobileOpeningHookSvg(svg(['PHENIBUT','GABA-B','Dependence can develop']))))
test('long single label also fails',()=>assert.throws(()=>assertMobileOpeningHookSvg(svg(['A calming supplement may affect the central nervous system and has been associated with a number of serious withdrawal reactions requiring medical attention'])),/VISIBLE_WORDS_EXCEED_17/))

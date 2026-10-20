import test from 'node:test'
import assert from 'node:assert/strict'
import {assertMobileOpeningHookSvg} from '../mobile-hook-clarity-gate.mjs'
const svg=(texts,attrs='')=>'<svg '+attrs+' xmlns="http://www.w3.org/2000/svg">'+texts.map(t=>'<text x="60" y="220">'+t+'</text>').join('')+'</svg>'
test('restraint: three visible text blocks and approved pill survive',()=>{
 const x=assertMobileOpeningHookSvg(svg(['PHENIBUT','CALMING OR ADDICTIVE?','Withdrawal can be severe.'],'data-hero-kind="capsule" data-hero-template="clean-capsule-v1"'))
 assert.equal(x.visibleTextNodes,3)
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

test('existing producer can retain small governed trust labels and a wrapped two-line headline',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
 '<text data-em-role="brand">The Hippie Scientist</text>'+
 '<text data-em-role="headline">CALMING OR</text>'+
 '<text data-em-role="headline">ADDICTIVE?</text>'+
 '<text data-em-role="disclosure">Educational; not medical advice.</text>'+
 '<text data-em-role="provenance">https://thehippiescientist.net/articles/phenibut</text>'+
 '<metadata>{&quot;teachingObject&quot;:&quot;danger signal&quot;}</metadata>'+
 '</svg>'
 const x=assertMobileOpeningHookSvg(xml)
 assert.equal(x.visibleTextNodes,5)
 assert.equal(x.semanticGroups,1)
 assert.equal(x.governedTrustLabelsRetained,3)
})
test('declared capsule without approved template cannot bypass gate by omitting optional marker',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg"><text>PHENIBUT</text>'+
 '<metadata>{&quot;teachingObject&quot;:&quot;capsule&quot;}</metadata></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/CAPSULE_REQUIRES_APPROVED_SHAPE_TEMPLATE/)
})
test('tagged source roles do not excuse an unrelated cluster of decorative banners',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
 '<text data-em-role="brand">THS</text>'+
 ['THE SIDE THEY SKIP','01/06','CALMING OR ADDICTIVE?','WITHDRAWAL','THREE MORE LABELS']
   .map(t=>'<text>'+t+'</text>').join('')+
 '<text data-em-role="provenance">https://example.org/source</text></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/TEXT_BLOCKS_EXCEED_4/)
})


test('twelve role-tagged headline fragments cannot bypass semantic-group count',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   Array.from({length:12},(_,i)=>'<text data-em-role="headline">WORD'+i+'</text>').join('')+'</svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/HEADLINE_LINES_EXCEED_2/)
})
test('ten fake brand labels cannot bypass clutter ceiling',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   Array.from({length:10},()=>'<text data-em-role="brand">The Hippie Scientist</text>').join('')+
   '<text data-em-role="headline">What happens?</text></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/DUPLICATE_TRUST_ROLE_BRAND/)
})
test('untrusted explanatory paragraph cannot masquerade as provenance',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   '<text data-em-role="provenance">Supplement absorption differs from merely swallowing a capsule.</text></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/NONCANONICAL_PROVENANCE_URL/)
})
test('disclosure tag cannot hide arbitrary teaching copy',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   '<text data-em-role="disclosure">Absorption depends on the body and the dose that is swallowed.</text></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/UNTRUSTED_DISCLOSURE_COPY/)
})
test('the canonical source URL in scene metadata binds any provenance label',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   '<text data-em-role="provenance">https://example.org/wrong</text>'+
   '<metadata>{&quot;sourceUrl&quot;:&quot;https://example.org/actual&quot;}</metadata></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/NONCANONICAL_PROVENANCE_URL/)
})
test('brand trust tag cannot be used for oversized headline art',()=>{
 const xml='<svg xmlns="http://www.w3.org/2000/svg">'+
   '<text data-em-role="brand" font-size="96">The Hippie Scientist</text></svg>'
 assert.throws(()=>assertMobileOpeningHookSvg(xml),/UNTRUSTED_LABEL_FONT_SIZE_BRAND/)
})

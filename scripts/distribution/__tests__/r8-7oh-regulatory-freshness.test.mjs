import {test,expect} from 'vitest'
import {validate7OhRegulatoryStatus,OCT9_7OH_PRIMARY_SOURCES} from '../r8-7oh-regulatory-freshness.mjs'
import {assessR819Release} from '../r819-brutal-bar.mjs'
const snapshot=()=>({
 verifiedOn:'2026-10-12',noticeAnnouncedOn:'2026-10-09',
 proposalStatus:'PROPOSED_NO_7OH_ORDER',
 thresholds:{solidsMgPerG:1,liquidsMgPerMl:1,concentrationOperator:'>',mitragynineRatio:100,
  ratioOperator:'<',ratioDenominator:'7OH_OR_MGPI_OR_BOTH'},
 naturalLeafScope:'TRACE_LEAF_NOT_INTENDED_TARGET',
 existingMGPIAndMGM15MGM16OrderEffective:'2026-08-26',
 primarySourceUrls:[...OCT9_7OH_PRIMARY_SOURCES],primarySourcesReviewedByHuman:true,
 reviewer:'Editorial reviewer fixture',spokenStatusVerified:true,
 claimedEffectiveDate:null,claimedFederalRegisterPublicationDate:null
})
const input=()=>({
 onScreenText:'Oct 9, 2026: DEA proposed >1 mg/g or >1 mg/mL, OR <100:1 7-OH/MGPI thresholds; ordinary kratom leaf excluded from intended scope.',
 narrationText:'As of October 2026, DEA proposed threshold-based 7-OH scheduling; no 7-OH temporary order had been issued on October 9.',
 publicationDate:'2026-10-12',snapshot:snapshot()
})
test('accepts a dated, source-bound proposed 7-OH status without falsely approving publication',()=>{
 expect(validate7OhRegulatoryStatus(input())).toEqual([])
})
test('old federal action pending Oct 11 footer is rejected',()=>{
 const v=input();v.onScreenText+=' 7-OH federal scheduling: pending Oct 11'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/pending language/)
})
test('proposal cannot be called an effective 7-OH order',()=>{
 const v=input();v.onScreenText+=' 7-OH is now Schedule I'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/already Schedule I/)
})
test('a ratio-only qualifying product still requires the precise OR condition',()=>{
 const v=input();v.snapshot.thresholds.ratioOperator='>'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/exact >1 mg/)
})
test('unconfirmed Nov 13 order and Oct 14 Federal Register dates rejected',()=>{
 const v=input();v.snapshot.claimedEffectiveDate='2026-11-13'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/unsupported future/)
 v.snapshot.claimedEffectiveDate=null;v.onScreenText+=' published Oct 14'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/unconfirmed/)
})
test('publication-day recheck and real spoken update are not optional',()=>{
 const v=input();v.publicationDate='2026-10-13';v.snapshot.spokenStatusVerified=false
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/publication day/)
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/actual narration/)
})
test('MGPI / MGM-15 / MGM-16 Aug 26 order must be preserved',()=>{
 const v=input();v.snapshot.existingMGPIAndMGM15MGM16OrderEffective='2026-10-09'
 expect(validate7OhRegulatoryStatus(v).join(' ')).toMatch(/Aug 26/)
})
test('generic non-regulatory supplement videos are not blocked',()=>{
 expect(validate7OhRegulatoryStatus({narrationText:'Magnesium and sleep',onScreenText:'R8.19'})).toEqual([])
})
test('R8.19 science holds regulatory content lacking a publication-day snapshot',()=>{
 const v=assessR819Release({science:{regulatoryClaimPresent:true,exactOnScreenText:'7-OH DEA scheduling proposed',exactNarrationText:'DEA proposed 7-OH scheduling'}})
 expect(v.correctness.blockers.join(' ')).toMatch(/primary-source snapshot/)
 expect(v.publicationVerdict).toBe('DO_NOT_PUBLISH')
})

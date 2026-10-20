// Source-backed regulatory status gate for 7-OH videos.
// A structured producer attestation is NOT proof of a live Federal Register check.
// Fail closed on stale proposals, fabricated effective dates, and unsynced voice.
export const OCT9_7OH_PRIMARY_SOURCES=Object.freeze([
 'https://www.hhs.gov/press-room/hhs-recommends-thresholds-enhanced-kratom-products-7-oh-mgpi.html',
 'https://www.justice.gov/opa/pr/department-justice-announces-updates-emergency-scheduling-actions-7-oh-and-related-opioid'
])
const date=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+'T00:00:00Z'))
const norm=v=>String(v??'').toLowerCase().replace(/\s+/g,' ')
const has7oh=s=>/\b7[- ]?(?:oh|hydroxy(?:mitragynine)?)\b/i.test(s)
const hasReg=s=>/\b(?:dea|federal|schedule(?:d| i| one)?|scheduling|notice of intent|30.day notice|mgpi)\b/i.test(s)
export function validate7OhRegulatoryStatus({onScreenText='',narrationText='',regulatoryClaimPresent=false,snapshot,publicationDate}={}){
 const screen=norm(onScreenText),voice=norm(narrationText),all=screen+' '+voice
 if(!regulatoryClaimPresent&&!(has7oh(all)&&hasReg(all)))return []
 const errors=[]
 if(/federal action pending|federal scheduling:\s*pending(?:\s*oct\s*11)?|effective\s+nov(?:ember)?\s+13|(?:published|publication)\s+oct(?:ober)?\s+14/i.test(all))
  errors.push('R8 regulatory status: undated pending language or unconfirmed effective/publication date')
 if(!date(publicationDate))errors.push('R8 regulatory status: publication date required for day-of-release verification')
 if(!snapshot||typeof snapshot!=='object')return [...errors,'R8 regulatory status: primary-source snapshot required']
 if(!date(snapshot.verifiedOn)||!date(snapshot.noticeAnnouncedOn))
  errors.push('R8 regulatory status: dated primary-source check and notice date required')
 if(date(publicationDate)&&snapshot.verifiedOn!==publicationDate)
  errors.push('R8 regulatory status: re-check DEA/Federal Register on publication day')
 if(snapshot.noticeAnnouncedOn!=='2026-10-09')
  errors.push('R8 regulatory status: Oct 9 updated Notice of Intent not established')
 if(snapshot.proposalStatus!=='PROPOSED_NO_7OH_ORDER')
  errors.push('R8 regulatory status: proposed 7-OH controls must not be represented as effective')
 const t=snapshot.thresholds??{}
 if(t.solidsMgPerG!==1||t.liquidsMgPerMl!==1||t.concentrationOperator!=='>'||
    t.mitragynineRatio!==100||t.ratioOperator!=='<'||t.ratioDenominator!=='7OH_OR_MGPI_OR_BOTH')
  errors.push('R8 regulatory status: exact >1 mg/g, >1 mg/mL, OR <100:1 mitragynine-to-7OH/MGPI thresholds missing')
 if(snapshot.naturalLeafScope!=='TRACE_LEAF_NOT_INTENDED_TARGET')
  errors.push('R8 regulatory status: natural botanical trace-leaf scope must remain qualified')
 if(snapshot.existingMGPIAndMGM15MGM16OrderEffective!=='2026-08-26')
  errors.push('R8 regulatory status: preserve Aug 26 existing Schedule I controls')
 if(snapshot.claimedEffectiveDate||snapshot.claimedFederalRegisterPublicationDate)
  errors.push('R8 regulatory status: unsupported future effective/FR publication date')
 if(!Array.isArray(snapshot.primarySourceUrls)||OCT9_7OH_PRIMARY_SOURCES.some(u=>!snapshot.primarySourceUrls.includes(u)))
  errors.push('R8 regulatory status: both dated HHS and DOJ primary citations required')
 if(snapshot.primarySourcesReviewedByHuman!==true)
  errors.push('R8 regulatory status: named publication-day primary-source review required')
 if(typeof snapshot.reviewer!=='string'||!snapshot.reviewer.trim())
  errors.push('R8 regulatory status: source reviewer name required')
 if(snapshot.spokenStatusVerified!==true||!has7oh(voice)||!/(?:propos|notice of intent|not yet scheduled|not yet issued|threshold)/i.test(voice))
  errors.push('R8 regulatory status: updated 7-OH proposal not verified in actual narration')
 if(/7[- ]?oh.{0,70}(?:already|now|is)\s+(?:schedule i|scheduled)|(?:schedule i|scheduled).{0,40}7[- ]?oh/i.test(all))
  errors.push('R8 regulatory status: do not label 7-OH already Schedule I under the pending proposal')
 return [...new Set(errors)]
}

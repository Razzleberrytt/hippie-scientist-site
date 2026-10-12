// Science passes and craft passes are independent. Neither a rendered test nor a
// historical score is an independent V approval or owner iPhone playback signoff.
const clean=x=>String(x??'').trim(), hex=x=>/^[a-f0-9]{64}$/.test(clean(x))
const killers=['static-template-without-hero','narration-time-stretch',
 'compositional-drought-over-six-seconds','stock-or-clipart-visual-language']
export const R819_CRAFT_KILL_CRITERIA=Object.freeze(killers)
const CORRECTNESS=['scienceSourcesVerified','attributionVerified','denominatorsVerified',
 'symbolicLabelsVerified','pmidFootersVerified','wordCaptionsVerified','factualGraphicsDeterministic']
const CRAFT=['heroVisualPresent','hookElementMoves','narrationCutTiming',
 'multiItemSequenceAligned','noStockTransitions','compositionPixelProof','premiumVisualQuality']
export function verifyR819OwnerReferenceShelf(shelf){
 const v=shelf?.videos
 const valid=Array.isArray(v)&&v.length>=3&&v.length<=5&&new Set(v.map(x=>x.url)).size===v.length&&
  v.every(x=>clean(x.title)&&/^https:\/\//.test(clean(x.url))&&clean(x.reason)&&x.curatedBy==='owner')
 return {status:valid?'OWNER_REFERENCE_SHELF_CURATED':'OWNER_REFERENCE_SHELF_PENDING',valid,count:v?.length??0}
}
export function evaluateR819Release({correctness,craft,technical,referenceShelf,signoffs}={}){
 const shelf=verifyR819OwnerReferenceShelf(referenceShelf),killCriteria=[]
 if(craft?.heroVisualPresent===false||craft?.staticTemplateLayout===true)killCriteria.push(killers[0])
 if(craft?.narrationStretched===true||technical?.audioTempoFactor!==1||
  technical?.audioFilters?.some(x=>/\b(?:atempo|asetrate|rubberband|setpts)\b/i.test(x)))
  killCriteria.push(killers[1])
 if(Number(technical?.longestCompositionalDroughtSeconds)>6||craft?.longCompositionalHold===true)
  killCriteria.push(killers[2])
 if(craft?.stockFeelOrClipArt===true)killCriteria.push(killers[3])
 const missingScience=CORRECTNESS.filter(k=>correctness?.[k]!==true)
 const scientificVerdict=missingScience.length===0?'PASS':
  missingScience.some(k=>correctness?.[k]===false)?'FAIL':'PENDING'
 const technicalChecks={
  nativeFrame:technical?.width===1080&&technical?.height===1920&&technical?.fps===30,
  immutableSource:hex(technical?.masterSha256)&&hex(technical?.artManifestSha256),
  audio:technical?.audioTempoFactor===1&&Number.isFinite(technical?.integratedLufs)&&
    Math.abs(technical.integratedLufs+14)<=1&&Number.isFinite(technical?.truePeakDbtp)&&
    technical.truePeakDbtp<=-1,
  provenance:technical?.trustLayerAboveArt===true&&technical?.artAssetPinsVerified===true&&
    technical?.rendererTelemetryVerified===true,
  pixelReview:technical?.finalDecodedPixelReview===true
 }
 const technicalPassed=Object.values(technicalChecks).every(Boolean)
 const missingCraft=CRAFT.filter(k=>craft?.[k]!==true)
 const craftVerdict=killCriteria.length?'FAIL':
    shelf.valid&&!missingCraft.length&&technicalPassed?'PASS':'PENDING'
 const eligible=scientificVerdict==='PASS'&&craftVerdict==='PASS'&&
  signoffs?.ownerNativePhoneViewed===true&&signoffs?.ownerFullNarrationListened===true&&
  signoffs?.vIndependentCraftApproval===true&&signoffs?.finalMasterHash===technical.masterSha256
 return {schemaVersion:'ths-r819-dual-verdict-v1',
  correctness:{verdict:scientificVerdict,missing:missingScience},
  craft:{verdict:craftVerdict,killCriteria,missing:missingCraft,referenceShelf:shelf},
  technical:{passed:technicalPassed,checks:technicalChecks},
  releaseEligible:eligible,
  status:eligible?'ALL_RELEASE_GATES_SATISFIED':killCriteria.length?
    'CRAFT_VETO_DO_NOT_PUBLISH':'REVIEW_HOLD_NOT_PUBLISHED',
  limitation:'Separate exact-master scientific review, V craft veto and owner full phone/audio review are required.'}
}

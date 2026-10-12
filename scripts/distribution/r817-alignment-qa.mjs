// R8.17 acoustic timing has no defensible confidence metric unless actual
// independent reference boundaries are inspected against the exact source WAV.
// MFA's internal confidence alone is NOT calibrated timing accuracy.
export function measureR817AlignmentAudit(alignedWords,reference,context={}){
 const errors=[],seen=new Set(),offsets=[]
 if(!/^[a-f0-9]{64}$/.test(String(context.audioSha256||''))||
   !String(context.reviewerId||'').trim()||
   context.reviewerId===context.authorId)
   errors.push('independent alignment auditor and original audio SHA required')
 for(const row of reference||[]){
  const i=row.index,word=alignedWords?.[i]
  if(!Number.isInteger(i)||seen.has(i)||!word||
     !Number.isFinite(row.start)||!Number.isFinite(row.end)||row.end<=row.start) {
    errors.push('invalid independently reviewed word reference');continue
  }
  seen.add(i)
  if(row.word!==word.word){errors.push('word identity/reference mismatch');continue}
  offsets.push(Math.abs(row.start-word.start),Math.abs(row.end-word.end))
 }
 const min=Math.min(5,alignedWords?.length||0)
 if(seen.size<min||seen.size===0)errors.push('at least five distinct spot-checked word boundaries are required')
 if(errors.length)throw Error(errors.join('; '))
 const mean=offsets.reduce((a,b)=>a+b,0)/offsets.length
 const max=Math.max(...offsets)
 return {schemaVersion:'ths-r817-independent-mfa-accuracy-v1',
  audioSha256:context.audioSha256,reviewerId:context.reviewerId,
  sampleWordCount:seen.size,meanBoundaryOffsetSeconds:Number(mean.toFixed(4)),
  maxBoundaryOffsetSeconds:Number(max.toFixed(4)),
  passed:mean<=.12&&max<=.22,
  independentReferenceLabeling:true,
  caveat:'Sample-based boundary review, not an objective guarantee for every syllable'}
}
export function assertR817AlignmentAudit(receipt,audioSha256){
 if(receipt?.schemaVersion!=='ths-r817-independent-mfa-accuracy-v1'||
    receipt.passed!==true||receipt.audioSha256!==audioSha256||
    receipt.sampleWordCount<5||receipt.meanBoundaryOffsetSeconds>.12||
    receipt.maxBoundaryOffsetSeconds>.22||!receipt.independentReferenceLabeling||
    !String(receipt.reviewerId||'').trim())
  throw Error('R8.17 independently sampled MFA boundary accuracy proof missing')
 return true
}

import crypto from 'node:crypto'
const hash=b=>crypto.createHash('sha256').update(b).digest('hex')
const ok=x=>/^[a-f0-9]{64}$/.test(String(x??''))
export function verifyR819CueBinding(board, alignment) {
 if(!alignment?.receipt||!ok(alignment.receiptSha256)||
  alignment.receipt.schemaVersion!=='ths-r810-local-word-alignment-v1'||
  alignment.receipt.engine!=='mfa-offline'||
  alignment.receipt.timingSource!=='acoustic-forced-alignment'||
  alignment.receipt.humanAuditoryReview?.status!=='pass')
  throw Error('R8.19 requires previously verified R8.10 word-alignment receipt')
 const words=alignment.receipt.words
 if(!Array.isArray(words)||!words.length)throw Error('R8.19 verified words missing')
 const reports=[]
 for(const beat of board.beats||[]){
  if(!beat.items?.length)continue
  if(beat.alignmentReceiptSha256!==alignment.receiptSha256)
   throw Error('R8.19 acoustic receipt SHA mismatch for '+beat.id)
  const seen=new Set()
  for(const item of beat.items){
   if(!Number.isInteger(item.wordIndex)||item.wordIndex<0||item.wordIndex>=words.length||seen.has(item.wordIndex))
    throw Error('R8.19 narration item has invalid or duplicate word index: '+item.objectId)
   seen.add(item.wordIndex)
   const word=words[item.wordIndex]
   if(!Number.isFinite(word.start)||!Number.isFinite(word.end)||
     word.end<=word.start||Math.abs(item.cueSeconds-word.start)>.2||
     word.start<beat.start-.002||word.start>beat.end+.002||
     String(item.anchorWord??'').toLowerCase().replace(/[^a-z0-9]/g,'')!==
       String(word.word??'').toLowerCase().replace(/[^a-z0-9]/g,''))
    throw Error('R8.19 cue does not match actual MFA word: '+item.objectId)
   reports.push({beatId:beat.id,itemId:item.objectId,wordIndex:item.wordIndex,word:word.word,start:word.start})
  }
 }
 return {status:'VERIFIED_R810_WORD_CUES_BOUND',alignmentReceiptSha256:alignment.receiptSha256,
  itemCount:reports.length,items:reports,proofSha256:hash(JSON.stringify(reports))}
}

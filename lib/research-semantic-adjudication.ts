/**
 * Append-only editorial source-mention review, Semantic 1.02.
 *
 * An editor may evaluate WHETHER a source-text mention was correctly indexed.
 * A recorded decision can NEVER promote intake research to a clinical finding,
 * efficacy grade, drug interaction, medical recommendation or live page.
 */
import type {ResearchSourceWitness} from './research-semantic-provenance'

export type ResearchAdjudicationEvent={
  eventId:string
  witnessId:string
  sourceSignature:string
  reviewerCode:string
  recordedAt:string
  priorEventId:string|null
  decision:'source-text-match-confirmed'|'false-positive'|'needs-full-text'
  rationale:string
  inspected:'bibliographic-title-or-abstract'|'full-publication'
}
export type ResearchAdjudicationLedger={
  version:1
  events:ResearchAdjudicationEvent[]
  reviewCount:number
  currentDecisions:Array<{witnessId:string;eventId:string;decision:ResearchAdjudicationEvent['decision']}>
  autoPublished:false
}

/** Strict replay validation; edits to source text invalidate dependent reviews. */
export function validateResearchAdjudicationLedger(
  raw:{version:number;events:readonly ResearchAdjudicationEvent[]},
  witnesses:readonly ResearchSourceWitness[],
):ResearchAdjudicationLedger{
  if(raw.version!==1||!Array.isArray(raw.events))throw Error('Invalid research adjudication ledger schema')
  const ids=new Set<string>()
  const known=new Map(witnesses.map(w=>[w.id,w]))
  const last=new Map<string,ResearchAdjudicationEvent>()
  let previousTimestamp=''
  const output:ResearchAdjudicationEvent[]=[]
  for(const event of raw.events){
    const witness=known.get(event.witnessId)
    if(!witness||witness.sourceSignature!==event.sourceSignature)
      throw Error('Adjudication references a stale or unknown text witness')
    if(!/^[a-z0-9][a-z0-9._-]{7,99}$/i.test(event.eventId)||ids.has(event.eventId))
      throw Error('Adjudication event identity missing or reused')
    ids.add(event.eventId)
    if(!/^[a-z0-9][a-z0-9._-]{2,79}$/i.test(event.reviewerCode))
      throw Error('Adjudication missing attributable reviewer code')
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(event.recordedAt)||
      !Number.isFinite(Date.parse(event.recordedAt))||new Date(event.recordedAt).toISOString()!==
      event.recordedAt||event.recordedAt<previousTimestamp)
      throw Error('Adjudication timestamps must be valid, append-ordered UTC')
    previousTimestamp=event.recordedAt
    if(!['source-text-match-confirmed','false-positive','needs-full-text'].includes(event.decision)||
      !['bibliographic-title-or-abstract','full-publication'].includes(event.inspected)||
      typeof event.rationale!=='string'||event.rationale.trim().length<24||
      event.rationale.length>1000)throw Error('Adjudication decision is unsubstantiated')
    if((last.get(event.witnessId)?.eventId||null)!==event.priorEventId)
      throw Error('Adjudication must extend the prior event for this witness')
    last.set(event.witnessId,event)
    output.push({...event})
  }
  return {
    version:1,events:output,reviewCount:last.size,
    currentDecisions:[...last.values()].map(e=>({
      witnessId:e.witnessId,eventId:e.eventId,decision:e.decision,
    })),
    autoPublished:false,
  }
}

/**
 * Semantic 1.02: bounded, verbatim title/abstract witness spans.
 * These excerpts prove text presence only. They do not show study results,
 * efficacy, causality, safety or adjudicated scientific meaning.
 */
import {normalizeSemanticText,semanticSourceSignature,type SemanticMention,type SemanticRecord}
  from './research-semantic-network'

export type ResearchSourceWitness = {
  id: string
  pmid: string
  sourceSignature: string
  conceptId: string
  conceptLabel: string
  matched: string
  basis: 'title' | 'abstract'
  sentenceIndex: number
  start: number
  end: number
  quote: string
  status: 'unreviewed-verbatim-source-text'
}

type TextSpan={start:number;end:number;sentenceIndex:number}

function sentenceSpans(text:string):TextSpan[]{
  // Offset-preserving approximate sentence segmentation; every accepted quote
  // must still equal a literal substring of the source. Boundaries do not imply
  // that a PMID's reported results have been evaluated.
  const chunks:TextSpan[]=[]
  const boundary=/[.!?]\s+(?=[A-Z0-9([])/g
  let start=0
  for(const match of text.matchAll(boundary)){
    const end=(match.index??0)+1
    if(end>start)chunks.push({start,end,sentenceIndex:chunks.length})
    start=(match.index??0)+match[0].length
  }
  if(start<text.length)chunks.push({start,end:text.length,sentenceIndex:chunks.length})
  return chunks.map(part=>{
    let {start,end}=part
    while(start<end&&/\s/.test(text[start]))start++
    while(end>start&&/\s/.test(text[end-1]))end--
    return {...part,start,end}
  }).filter(part=>part.end>part.start)
}
function containsLiteralConcept(text:string,matched:string):boolean{
  const haystack=' '+normalizeSemanticText(text)+' '
  const needle=normalizeSemanticText(matched)
  return needle.length>=4&&haystack.includes(' '+needle+' ')
}

/** At most six small, source-exact excerpts per study. Never ship full abstracts. */
export function buildResearchSourceWitnesses(
  source:SemanticRecord, mentions:readonly SemanticMention[],
):ResearchSourceWitness[]{
  const sourceSignature=semanticSourceSignature(source)
  const titleSpans:TextSpan[]=source.title.trim()
    ?[{start:0,end:source.title.length,sentenceIndex:0}]:[]
  const abstractSpans=sentenceSpans(source.abstract)
  const results:ResearchSourceWitness[]=[]
  for(const mention of mentions){
    const text=mention.basis==='title'?source.title:source.abstract
    const spans=mention.basis==='title'?titleSpans:abstractSpans
    const span=spans.find(s=>{
      const quote=text.slice(s.start,s.end)
      return quote.length<=320&&containsLiteralConcept(quote,mention.matched)
    })
    if(!span)continue
    const quote=text.slice(span.start,span.end)
    results.push({
      id:[source.pmid,sourceSignature,mention.basis,span.sentenceIndex,mention.id].join(':'),
      pmid:source.pmid,sourceSignature,conceptId:mention.id,
      conceptLabel:mention.label,matched:mention.matched,basis:mention.basis,
      sentenceIndex:span.sentenceIndex,start:span.start,end:span.end,quote,
      status:'unreviewed-verbatim-source-text',
    })
    if(results.length===6)break
  }
  return results
}
export function verifyResearchSourceWitness(
  source:SemanticRecord,witness:ResearchSourceWitness,
):boolean{
  const text=witness.basis==='title'?source.title:source.abstract
  return witness.pmid===source.pmid&&
    witness.sourceSignature===semanticSourceSignature(source)&&
    witness.status==='unreviewed-verbatim-source-text'&&
    Number.isInteger(witness.start)&&Number.isInteger(witness.end)&&
    witness.start>=0&&witness.end>witness.start&&witness.end<=text.length&&
    witness.quote===text.slice(witness.start,witness.end)&&
    witness.quote.length<=320&&
    containsLiteralConcept(witness.quote,witness.matched)&&
    witness.id===[source.pmid,witness.sourceSignature,witness.basis,
      witness.sentenceIndex,witness.conceptId].join(':')
}

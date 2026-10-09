/**
 * Scientific Intelligence 2.0 · source-first discovery.
 *
 * A query matches bibliography metadata only. This function never scores
 * clinical quality, infers cause/effect, or joins a research-only PMID to an
 * independently reviewed claim. Every exposed result still belongs to the
 * signed, ungraded research-intake snapshot already loaded by the Studio.
 */
import type {ResearchDNA} from './research-intelligence-studio'
import type {SemanticNetwork} from './research-semantic-network'

const STOPWORDS=new Set([
  'a','an','the','and','or','for','with','from','about','into','that','this','what',
  'which','who','why','where','when','how','is','are','was','were','be','been','can',
  'could','would','should','do','does','did','of','to','in','on','at','by','it','i',
  'we','my','your','our','any','some','there','say','says','know','show','shows',
  'evidence','research','study','studies','improve','improves','help','helps',
])
const normalize=(value:string)=>value.toLowerCase().normalize('NFKC').replace(/[^a-z0-9]+/g,' ').trim()

export function discoverResearchIntake(
  dna:readonly ResearchDNA[],
  graph:SemanticNetwork,
  query:string,
  maxResults=6,
):{total:number;matches:ResearchDNA[];terms:string[];sourceCount:number}{
  const raw=query.trim()
  const terms=[...new Set(normalize(raw).split(' ').filter(
    term=>term.length>=3&&!STOPWORDS.has(term),
  ))]
  // If a question contains only filler words, show a genuine empty state.
  const invalidQuery=raw.length>0&&terms.length===0
  const valid=dna.filter(d=>{
    const entry=graph.entries[d.pmid]
    return /^\d{5,10}$/.test(d.pmid)&&d.grade==='ungraded-research-intake'&&
      !!entry&&!!entry.sourceSignature&&d.sourceWitnesses.every(w=>
        w.pmid===d.pmid&&w.sourceSignature===entry.sourceSignature)
  })
  const scored=invalidQuery?[]:valid.flatMap(d=>{
    const title=normalize(d.title)
    const fields=normalize([
      d.pmid,d.title,d.category,d.method,d.comparator,
      ...d.outcomeMentions,...d.populationMentions,...d.substancesMentioned,
      ...d.safetyMentions,...d.concepts.map(c=>c.label),
    ].join(' '))
    if(raw&&(!terms.length||!terms.every(t=>fields.includes(t))))return []
    const rank=d.pmid===raw?3:raw&&title.includes(normalize(raw))?2:
      raw&&terms.every(t=>title.includes(t))?1:0
    return [{d,rank}]
  })
  scored.sort((a,b)=>b.rank-a.rank||a.d.pmid.localeCompare(b.d.pmid))
  const limit=Math.max(1,Math.min(12,Number.isFinite(maxResults)?Math.trunc(maxResults)||6:6))
  return {total:scored.length,matches:scored.slice(0,limit).map(x=>x.d),
    terms,sourceCount:valid.length}
}

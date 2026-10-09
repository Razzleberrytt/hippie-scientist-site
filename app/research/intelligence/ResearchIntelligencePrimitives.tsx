'use client'
import {useState} from 'react'
import type {DraftBrief} from '@/lib/research-intelligence-studio'
import type {ResearchSourceWitness} from '@/lib/research-semantic-provenance'
import styles from './ResearchIntelligence.module.css'

const human=(s:string)=>s.replace(/_/g,' ').replace(/\bnps\b/gi,'NPS')
const pubmed=(s:string)=>'https://pubmed.ncbi.nlm.nih.gov/'+s+'/'

export function Notice({children}:{children:React.ReactNode}){return <p className={styles.notice}><span aria-hidden='true'>◈</span> {children}</p>}
export function Tag({children}:{children:React.ReactNode}){return <span className={styles.tag}>{children}</span>}
export function Sources({pmids,onSelect}:{pmids:string[];onSelect?:(pmid:string)=>void}){return <div className={styles.sources}>{pmids.slice(0,6).map(x=><span className={styles.sourcePair} key={x}><a href={pubmed(x)} target='_blank' rel='noopener noreferrer'>PMID {x} ↗</a>{onSelect?<button type='button' onClick={()=>onSelect(x)} aria-label={'Trace PMID '+x+' across instruments'}>Trace</button>:null}</span>)}</div>}
export function WitnessPanel({items}:{items:ResearchSourceWitness[]}){
  if(!items.length)return <p>No bounded title/abstract quotation is available for these matched concepts.</p>
  return <ul className={styles.witnessList}>{items.map(w=><li key={w.id}>
    <strong>{w.conceptLabel} · {w.basis==='title'?'TITLE':'ABSTRACT SENTENCE '+(w.sentenceIndex+1)}</strong>
    <blockquote>{w.quote}</blockquote>
    <small>Verbatim source-text match · not a scientific result interpretation</small>
  </li>)}</ul>
}
export function Brief({brief,onSelect}:{brief:DraftBrief;onSelect:(pmid:string)=>void}){
const [show,setShow]=useState(false),[status,setStatus]=useState('')
const payload=JSON.stringify({title:brief.title,mode:brief.mode,rationale:brief.rationale,
  pmids:brief.pmids,sourceStudyIds:brief.sourceStudyIds,reviewStatus:brief.status,autopublish:false,
  checklist:['Verify source IDs','Compare populations and outcomes','Check independent studies',
  'Review null and adverse findings','Approve wording with qualified editorial review']},null,2)
function copy(){
  if(typeof navigator==='undefined'||!navigator.clipboard){setShow(true);setStatus('Copy the displayed text manually.');return}
  void navigator.clipboard.writeText(payload).then(()=>setStatus('Copied; nothing published.'))
    .catch(()=>{setShow(true);setStatus('Clipboard blocked; copy the displayed text manually.')})
}
return <article className={styles.paper}>
  <div className={styles.paperTop}><Tag>{human(brief.mode)}</Tag><span>REVIEW REQUIRED</span></div>
  <h3>{brief.title}</h3><p>{brief.rationale}</p><Sources pmids={brief.pmids} onSelect={onSelect}/>
  <div className={styles.controls}><button type='button' onClick={copy}>Copy work order ↗</button>
    <button type='button' aria-expanded={show} onClick={()=>setShow(x=>!x)}>{show?'Hide JSON':'Inspect JSON'}</button></div>
  {status?<p role='status'>{status}</p>:null}
  {show?<textarea readOnly rows={11} className={styles.export} aria-label='Copyable source-grounded editorial work order' value={payload}/>:null}
</article>
}

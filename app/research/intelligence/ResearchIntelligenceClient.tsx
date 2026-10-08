'use client'
import {useEffect,useMemo,useRef,useState} from 'react'
import Link from 'next/link'
import {askResearchSources,explainSemanticVoyage,hydrateResearchStudioWithPublishedEvidence,type ResearchStudio,type DraftBrief,type ReviewedStudyInput} from '@/lib/research-intelligence-studio'
import type {SemanticNetwork} from '@/lib/research-semantic-network'
import {buildResearchCaseFile} from '@/lib/research-intelligence-casefile'
import type {ResearchSourceWitness} from '@/lib/research-semantic-provenance'
import styles from './ResearchIntelligence.module.css'

type Payload=ResearchStudio&{graph:SemanticNetwork}
type Tab='dna'|'contradictions'|'frontier'|'time'|'voyages'|'safety'|'ask'|'reactor'
const stations: Array<{id:Tab;number:string;label:string;tagline:string}>=[
{id:'dna',number:'01',label:'Study DNA',tagline:'Source fingerprints'},
{id:'contradictions',number:'02',label:'Contradiction Observatory',tagline:'Published evidence differences'},
{id:'frontier',number:'03',label:'Knowledge Frontier',tagline:'Inventory coverage questions'},
{id:'time',number:'04',label:'Evidence Time Machine',tagline:'Publication chronology'},
{id:'voyages',number:'05',label:'Semantic Voyages',tagline:'Witnessed concept paths'},
{id:'safety',number:'06',label:'Interaction Matrix',tagline:'Safety literature mapping'},
{id:'ask',number:'07',label:'Ask the Evidence',tagline:'Transparent source retrieval'},
{id:'reactor',number:'08',label:'Content Reactor',tagline:'Governed editorial proposals'},
]
function human(s:string){return s.replace(/_/g,' ').replace(/\bnps\b/gi,'NPS')}
const pubmed=(s:string)=>'https://pubmed.ncbi.nlm.nih.gov/'+s+'/'
function Notice({children}:{children:React.ReactNode}){return <p className={styles.notice}><span aria-hidden='true'>◈</span> {children}</p>}
function Tag({children}:{children:React.ReactNode}){return <span className={styles.tag}>{children}</span>}
function Sources({pmids,onSelect}:{pmids:string[];onSelect?:(pmid:string)=>void}){return <div className={styles.sources}>{pmids.slice(0,6).map(x=><span className={styles.sourcePair} key={x}><a href={pubmed(x)} target='_blank' rel='noopener noreferrer'>PMID {x} ↗</a>{onSelect?<button type='button' onClick={()=>onSelect(x)} aria-label={'Trace PMID '+x+' across instruments'}>Trace</button>:null}</span>)}</div>}
function WitnessPanel({items}:{items:ResearchSourceWitness[]}){
  if(!items.length)return <p>No bounded title/abstract quotation is available for these matched concepts.</p>
  return <ul className={styles.witnessList}>{items.map(w=><li key={w.id}>
    <strong>{w.conceptLabel} · {w.basis==='title'?'TITLE':'ABSTRACT SENTENCE '+(w.sentenceIndex+1)}</strong>
    <blockquote>{w.quote}</blockquote>
    <small>Verbatim source-text match · not a scientific result interpretation</small>
  </li>)}</ul>
}
function Brief({brief,onSelect}:{brief:DraftBrief;onSelect:(pmid:string)=>void}){
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

export default function ResearchIntelligenceClient(){
const [data,setData]=useState<Payload|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('')
const [tab,setTab]=useState<Tab>('dna'),[search,setSearch]=useState(''),[more,setMore]=useState(false),[dnaVisible,setDnaVisible]=useState(9)
const [from,setFrom]=useState(''),[to,setTo]=useState(''),[query,setQuery]=useState(''),[asked,setAsked]=useState(false)
const [year,setYear]=useState('')
const [focusPmid,setFocusPmid]=useState(''),[focusLookup,setFocusLookup]=useState('')
const caseRef=useRef<HTMLElement|null>(null)
async function activate(){
 if(data||loading)return
 setLoading(true);setError('')
 try{
  // Reuse the established published evidence dataset instead of hydrating
  // another duplicate copy during Next.js static-page generation.
  const [response,evidenceResponse]=await Promise.all([
    fetch('/research/intelligence/dataset.json',{cache:'force-cache'}),
    fetch('/evidence/evidence-report/dataset.json',{cache:'force-cache'}),
  ])
  if(!response.ok||!evidenceResponse.ok)throw new Error('Required static source missing')
  const v=(await response.json()) as Payload
  const published=(await evidenceResponse.json()) as {
    schemaVersion?:number
    generatedFrom?:string
    studies?:ReviewedStudyInput[]
  }
  if(published.schemaVersion!==1 ||
     published.generatedFrom!=='current indexable runtime records' ||
     !Array.isArray(published.studies) ||
     !published.studies.every(x=>typeof x.id==='string'&&Array.isArray(x.relationships)))
    throw new Error('Published evidence identity verification failed')
  if(v.schemaVersion!==1||v.systemVersion!=='1.04'||v.sourceWave!==7500||v.researchOnly!==true||v.sourceCount!==500||
     v.metrics?.automaticallyPromotedClaims!==0||!Array.isArray(v.dna)||v.dna.length!==500||
     !v.graph||Object.keys(v.graph.entries||{}).length!==500||
     v.adjudication?.autoPublished!==false||
     v.publicationLineage?.independentlyVerifiedTrialUnits!==null||
     v.publicationLineage?.sourceCount!==500||
     v.dna.some(x=>x.grade!=='ungraded-research-intake'||!v.graph.entries[x.pmid]||
       !Array.isArray(x.sourceWitnesses)||x.sourceWitnesses.some(w=>w.pmid!==x.pmid||
       w.sourceSignature!==v.graph.entries[x.pmid].sourceSignature)))throw new Error('Integrity')
  setData({
    ...hydrateResearchStudioWithPublishedEvidence(v,published.studies),
    graph:v.graph,
  })
 }catch{setError('Unable to load or verify this source snapshot. The original source register remains available.')}
 finally{setLoading(false)}
}
function navigate(next:Tab){setTab(next);setMore(false);setDnaVisible(9);if(!data)void activate()}
const filtered=useMemo(()=>data?data.dna.filter(d=>!search.trim()||
 [d.title,d.pmid,d.category,d.method,d.comparator,...d.outcomeMentions,...d.populationMentions,...d.substancesMentioned,...d.concepts.map(m=>m.label)]
 .some(s=>s.toLowerCase().includes(search.trim().toLowerCase()))):[],[data,search])
const concepts=useMemo(()=>data?.graph.concepts.filter(c=>c.kind!=='method')||[],[data])
const voyage=useMemo(()=>data&&from&&to?explainSemanticVoyage(data.graph,from,to):[],[data,from,to])
const answer=useMemo(()=>data&&asked?askResearchSources(query,data):null,[data,query,asked])
const chrono=useMemo(()=>data?.timeline.filter(d=>d.sources>0)||[],[data])
const maxYear=Math.max(1,...chrono.map(x=>x.sources))
const selected=chrono.find(x=>String(x.year)===year)
const active=stations.find(x=>x.id===tab)!
const caseFile=useMemo(()=>data&&focusPmid?buildResearchCaseFile(data,data.graph,focusPmid):null,[data,focusPmid])
useEffect(()=>{if(focusPmid&&data)caseRef.current?.scrollIntoView({block:'start'})},[focusPmid,data])
function inspectPmid(pmid:string){setFocusPmid(pmid);setFocusLookup(pmid)}
function openCaseInstrument(next:Tab){
 if(!caseFile||!data)return
 if(next==='dna'){setSearch(caseFile.pmid);setDnaVisible(9)}
 if(next==='time'&&caseFile.year)setYear(caseFile.year)
 if(next==='ask'){
  setQuery(data.graph.entries[caseFile.pmid].mentions.filter(m=>m.kind!=='method')
    .slice(0,2).map(m=>m.matched).join(' '));setAsked(false)
 }
 if(next==='voyages'){
  const ids=data.graph.entries[caseFile.pmid].mentions.filter(m=>m.kind!=='method').map(m=>m.id)
  if(ids.length>1){setFrom(ids[0]);setTo(ids[1])}
 }
 navigate(next)
}
return <section className={styles.studio}>
  <header className={styles.hero}>
    <div className={styles.heroCopy}>
      <div className={styles.indexline}><span>THS / THE ATLAS</span><span>RESEARCH INTELLIGENCE v1.04 · 01—08</span></div>
      <p className={styles.eyebrow}>Eight instruments. One knowledge system.</p>
      <h1>The science is a <em>landscape.</em> Learn to navigate it.</h1>
      <p className={styles.lead}>Explore the structure of knowledge—from study fingerprints and differing results to unknowns, source-witnessed connections, safety literature and questions worth investigating.</p>
      <div className={styles.heroActions}>
        <button className={styles.prime} type='button' onClick={()=>void activate()} disabled={loading} aria-busy={loading}>
          {loading?'Preparing the atlas…':data?'Research atlas active ✓':'Enter the intelligence atlas ↗'}
        </button>
        <Link href='/research/source-register/'>Original source register →</Link>
      </div>
      <p className={styles.heroCaveat}>Scientific discovery ≠ clinical evidence. Research intake and graded evidence remain separate.</p>
    </div>
    <div className={styles.heroArt} aria-hidden='true'>
      <div className={styles.orbitA}/><div className={styles.orbitB}/><div className={styles.orbitC}/>
      <div className={styles.centerSymbol}>Σ<span>THS</span></div>
      <div className={styles.orbitNoteA}>SOURCE / SEMANTICS</div>
      <div className={styles.orbitNoteB}>PATTERN / PROVENANCE</div>
    </div>
  </header>
  {error?<div className={styles.error} role='alert'>{error}<button type='button' onClick={()=>void activate()}>Retry</button></div>:null}
  <div className={styles.instrumentHeader}><span className={styles.micro}>00 / INDEX</span>
    <h2>Eight instruments for reading the unknown.</h2>
    <p>All eight use the same identifiers, graph and source-provenance boundaries.</p>
  </div>
  <div className={styles.stationGrid} role='group' aria-label='Research intelligence instruments'>
    {stations.map(s=><button type='button' key={s.id} aria-pressed={tab===s.id} onClick={()=>navigate(s.id)} className={styles.station}>
      <span>{s.number} / {tab===s.id?'ACTIVE':'EXPLORE'}</span><strong>{s.label}</strong>
      <small>{s.tagline}</small><i aria-hidden='true'>↗</i>
    </button>)}
  </div>
  <section className={styles.workspace} aria-label='Selected intelligence instrument'>
    <div className={styles.workspaceTitle}><div><span className={styles.micro}>INSTRUMENT / {active.number}</span><h2>{active.label}</h2></div>
      <span className={styles.status}>{data?'VERIFIED / READY':'PREVIEW / OPEN TO EXPLORE'}</span>
    </div>
    {data?<section ref={caseRef} className={styles.caseWorkbench} aria-label='Shared eight-instrument source case file'>
      <form className={styles.caseLookup} onSubmit={e=>{e.preventDefault();inspectPmid(focusLookup.trim())}}>
        <label className={styles.field}>Trace a verified PubMed source through all eight instruments
          <input type='search' inputMode='numeric' value={focusLookup} maxLength={10}
            onChange={e=>setFocusLookup(e.target.value)} placeholder='Enter a PMID from this 500-paper intake batch'/>
        </label>
        <button type='submit' className={styles.prime} disabled={!/^\d{5,10}$/.test(focusLookup.trim())}>Open case file ↗</button>
      </form>
      {focusPmid&&!caseFile?<p role='status'>That PMID is not in this 500-paper source-verified semantic snapshot. Search the full source register for broader coverage.</p>:null}
      {caseFile?<article className={styles.casePanel} aria-live='polite'>
        <div className={styles.paperTop}><Tag>RESEARCH-ONLY CASE FILE</Tag><span>PMID {caseFile.pmid}</span></div>
        <h3>{caseFile.title}</h3>
        <p>{caseFile.sourceWitnessCount} exact quotation anchors · {caseFile.conceptLabels.length} indexed concept labels · {caseFile.reviewedCitationIds.length} exact linked reviewed citation records.</p>
        <p><strong>Unknown remains unknown:</strong> {caseFile.unresolvedFields.join(' · ')||'No missing controlled categories detected; independent quality review still required'}. Publication identity does not prove underlying-trial independence.</p>
        <a href={caseFile.sourceUrl} target='_blank' rel='noopener noreferrer'>Inspect original source ↗</a>
        <div className={styles.caseGrid}>{caseFile.instruments.map(signal=><button type='button' key={signal.instrument} onClick={()=>openCaseInstrument(signal.instrument)}
          aria-label={'Open '+stations.find(s=>s.id===signal.instrument)?.label+' for PMID '+caseFile.pmid}>
          <strong>{stations.find(s=>s.id===signal.instrument)?.label}</strong>
          <span>{signal.linkedItems} indexed lead{signal.linkedItems===1?'':'s'}</span>
          <small>{signal.basis}. {signal.limit}.</small>
        </button>)}</div>
        <p className={styles.caseCaveat}>Counts describe only this limited, sometimes sampled index—not independent clinical findings, complete literature coverage or evidence of safety. No tool publishes medical conclusions.</p>
      </article>:null}
    </section>:null}
    {!data?<div className={styles.placeholder}><p>Explore a locally generated research snapshot. The detailed graph loads only after you open it—no premium API or subscription required.</p>
      <button type='button' disabled={loading} onClick={()=>void activate()} className={styles.prime}>{loading?'Loading…':'Activate research instrument ↗'}</button></div>:null}

    {data&&tab==='dna'?<>
      <Notice>Text-matched descriptors are research navigation, not validated design classifications, study eligibility, or efficacy grades. Unknown fields remain explicit.</Notice>
      <div className={styles.metrics}><div><strong>{data.metrics.fingerprints}</strong><span>Source fingerprints</span></div>
        <div><strong>{data.metrics.classifiedMethods}</strong><span>Classifiable method phrases</span></div>
        <div><strong>{data.metrics.quotedTextWitnesses}</strong><span>Verbatim source text anchors</span></div></div>
      <Notice>Publication Identity Observatory: {data.publicationLineage.matchedIntakePmids} source PMIDs cross-referenced to separately reviewed citations by exact PMID/DOI. This establishes citation identity, <strong>not independence of underlying trials</strong>.</Notice>
      <label className={styles.field}>Find a source fingerprint<input type='search' value={search}
        onChange={e=>{setSearch(e.target.value);setDnaVisible(9)}} placeholder='Search a substance, outcome or PMID'/></label>
      <p role='status' className={styles.micro}>{filtered.length} source fingerprints match · showing {Math.min(dnaVisible,filtered.length)}</p>
       <div className={styles.paperGrid}>{filtered.slice(0,dnaVisible).map(d=><article className={styles.paper} key={d.pmid}>
        <div className={styles.paperTop}><Tag>{human(d.category)}</Tag><span>{d.year||'Year unknown'}</span></div>
        <h3>{d.title}</h3><dl className={styles.fingerprint}>
          <div><dt>Study method signal</dt><dd>{d.method} <small>({human(d.methodBasis)})</small></dd></div>
          <div><dt>Comparator phrase</dt><dd>{d.comparator}</dd></div>
          <div><dt>Population words</dt><dd>{d.populationMentions.join(' · ')||'Not classified'}</dd></div>
          <div><dt>Outcome words</dt><dd>{d.outcomeMentions.join(' · ')||'Not classified'}</dd></div>
          <div><dt>Substances named</dt><dd>{d.substancesMentioned.join(' · ')||'Not classified'}</dd></div></dl>
        <details><summary className={styles.detail}>Inspect verbatim evidence trail ({d.sourceWitnesses.length})</summary>
          <WitnessPanel items={d.sourceWitnesses}/>
          <p>These extracted quotations are title/abstract snippets only. Check the full publication and editorial evidence before interpreting findings.</p>
          {d.sourceWitnesses.length>0?<details><summary className={styles.detail}>Prepare an editorial review packet</summary>
            <textarea className={styles.export} rows={10} readOnly aria-label={'Review packet for PMID '+d.pmid}
              value={JSON.stringify({status:'draft-only',publication:d.sourceUrl,sourcePmid:d.pmid,
              reviewEvents:d.sourceWitnesses.map(w=>({witnessId:w.id,sourceSignature:w.sourceSignature,
                eventId:'REPLACE_WITH_UNIQUE_EVENT_ID',priorEventId:null,reviewerCode:'REPLACE',
                recordedAt:'REPLACE_WITH_UTC_TIMESTAMP',decision:'needs-full-text',
                inspected:'bibliographic-title-or-abstract',rationale:'REPLACE: describe your source verification in at least 24 characters.'})),
              noClinicalPromotion:true,noAutopublish:true},null,2)}/></details>:null}
        </details>
        <details><summary className={styles.detail}>Missingness audit ({d.missing.length})</summary>
          <p>{d.missing.length?d.missing.join(' · '):'No missing controlled categories found; full quality review still required.'}</p></details>
        {data.publicationLineage.crossReferences.filter(link=>link.intakePmid===d.pmid).map(link=>
          <details key={link.intakePmid}><summary className={styles.detail}>Exact publication identity · {link.reviewedStudyIds.length} reviewed citation reference(s)</summary>
            <p>Matched using {link.evidence==='exact-pmid'?'the same PMID':'the same DOI'}; underlying trial independence and evidence direction are not inferred.</p>
            {link.reviewedStudyIds.slice(0,8).map(id=><p key={id}><Link href={'/learn/citation-explorer/#study-'+id.toLowerCase().replace(/[^a-z0-9]+/g,'-')}>Reviewed citation {id} ↗</Link></p>)}
          </details>)}
        <div className={styles.caseActions}><button type='button' onClick={()=>inspectPmid(d.pmid)}>Trace through eight instruments ↗</button><a className={styles.paperLink} href={d.sourceUrl} target='_blank' rel='noopener noreferrer'>PubMed · {d.pmid} ↗</a></div>
      </article>)}</div>
      {filtered.length>dnaVisible?<button type='button' className={styles.more} onClick={()=>setDnaVisible(n=>n+30)}>Show next {Math.min(30,filtered.length-dnaVisible)} of {filtered.length} fingerprints →</button>:null}
       {filtered.length===0?<p className={styles.placeholder}>No records match these terms within the 500-paper verified intake batch.</p>:null}
    </>:null}

    {data&&tab==='contradictions'?<>
      <Notice>Only separately published citation-relationship labels qualify as directional signals. Differences require expert review of endpoints, populations, exposure, study independence and quality before calling them contradictions.</Notice>
      <div className={styles.metrics}><div><strong>{data.debates.length}</strong><span>Candidate review groups</span></div>
        <div><strong>{data.debates.filter(x=>x.populationComparable).length}</strong><span>Matching reported population strings</span></div>
        <div><strong>0</strong><span>Automatically adjudicated</span></div></div>
      <section className={styles.lineage} aria-label='Publication identity and independence'>
        <h3>Publication identity ≠ independent study</h3>
        <p>The existing reviewed evidence dataset provides {data.publicationLineage.reviewedWithExactIdentity} of {data.publicationLineage.reviewedRecordCount} citations with exact PMID or DOI identifiers. {data.publicationLineage.duplicateCitationGroups.length} same-publication citation groups and {data.publicationLineage.identityConflicts.length} identity conflicts require careful interpretation. <strong>Underlying trial independence is unverified in this interface.</strong></p>
        {data.publicationLineage.duplicateCitationGroups.slice(0,6).map(g=><p key={g.studyIds.join('|')}>
          Repeated citation record: {g.studyIds.join(' · ')} ({g.witness}); these are not multiple independent publications.
        </p>)}
        {data.publicationLineage.identityConflicts.length>0?<p role='status'>Some identifiers conflict; the system refuses to collapse those records without human verification.</p>:null}
      </section>
      {!data.debates.length?<p className={styles.placeholder}>No candidate groups in this reviewed citation scope; this does not prove wider scientific agreement.</p>:null}
      <div className={styles.paperGrid}>{data.debates.slice(0,more?35:10).map(d=><article key={d.id} className={styles.paper}>
        <div className={styles.paperTop}><Tag>REVIEW REQUIRED</Tag><span>{d.studies.length} source citations</span></div>
        <h3>{d.ingredient} / {d.outcome}</h3>
        <p>Published relationship descriptors differ: <strong>{d.directions.map(human).join(' · ')}</strong></p>
        <p>{d.populationComparable?'Matching nonempty population descriptions':'Population comparability unresolved or different'}. <strong>Independent underlying trials: unverified.</strong></p>
        <ul className={styles.studyRows}>{d.studies.slice(0,5).map(s=><li key={s.studyId}>
          <span>{human(s.relationship)} · {s.year||'year unknown'} · {human(s.evidenceClass)}</span>
          <Link href={s.href}>Citation ↗</Link></li>)}</ul>
        {data.publicationLineage.crossReferences.filter(link=>link.reviewedStudyIds.some(id=>d.studies.some(s=>s.studyId===id))).map(link=>
          <button key={link.intakePmid} type='button' className={styles.caseTrace}
            onClick={()=>inspectPmid(link.intakePmid)}>Trace exact PMID {link.intakePmid} across tools ↗</button>)}
        <Link className={styles.paperLink} href={d.ingredientPath}>Published ingredient profile ↗</Link>
      </article>)}</div>
      {data.debates.length>10&&!more?<button type='button' className={styles.more} onClick={()=>setMore(true)}>More candidate differences →</button>:null}
    </>:null}

    {data&&tab==='frontier'?<>
      <Notice>These are thin title intersections among the 500 verified intake papers, not global absence-of-research conclusions. Search the wider literature before assessing a true gap.</Notice>
      <div className={styles.metrics}><div><strong>{data.frontiers.length}</strong><span>Coverage questions</span></div>
        <div><strong>{data.graph.concepts.length}</strong><span>Indexed research concepts</span></div>
        <div><strong>{data.graph.summary.metadataOnlyPapers}</strong><span>Outside controlled vocabulary</span></div></div>
      <div className={styles.paperGrid}>{data.frontiers.slice(0,more?40:12).map(f=><article key={f.id} className={styles.paper}>
        <div className={styles.paperTop}><Tag>{f.togetherInBatch?'THIN COVERAGE':'UNMAPPED PAIR'}</Tag><span>THIS BATCH ONLY</span></div>
        <h3>{f.substance}<span className={styles.multiply}> × </span>{f.outcome}</h3>
        <p>{f.subjectPapers} source titles mention the substance, {f.outcomePapers} mention the outcome, and {f.togetherInBatch} mention both.</p>
        <Sources pmids={f.samplePmids} onSelect={inspectPmid}/>
      </article>)}</div>
      {data.frontiers.length>12&&!more?<button type='button' className={styles.more} onClick={()=>setMore(true)}>More knowledge-frontier questions →</button>:null}
    </>:null}

    {data&&tab==='time'?<>
      <Notice>Publication chronology is not evidence-grade history. Reviewed citation publications are a separate dataset; counts must not be added together. Historic grade changes are shown only in their recorded change log.</Notice>
      <div className={styles.metrics}><div><strong>{data.metrics.datedPublications}</strong><span>Dated research records</span></div>
        <div><strong>{chrono.length}</strong><span>Years represented</span></div>
        <div><strong>{selected?.sources||'—'}</strong><span>{year||'Select a year'} / source records</span></div></div>
      <div className={styles.timeline} role='group' aria-label='Choose a publication year'>
        {chrono.map(t=><button key={t.year} type='button' aria-pressed={year===String(t.year)}
          title={t.year+': '+t.sources+' source records'} onClick={()=>setYear(String(t.year))}>
          <span className={styles.timelineBar} style={{height:Math.max(5,100*t.sources/maxYear)+'%'}}/>
          <span className={styles.timelineYear}>{t.year}</span>
        </button>)}
      </div>
      {selected?<article className={styles.paper}><div className={styles.paperTop}><Tag>{year}</Tag><span>YEAR SELECTED</span></div>
        <h3>{selected.sources} source papers in this batch</h3>
        <p>{selected.reviewedCitations} separately reviewed citation publications carry this year; these two inventories are not additive.</p>
        <Sources pmids={selected.pmids} onSelect={inspectPmid}/></article>:<p className={styles.placeholder}>Select a year in the publication timeline to inspect bibliographic sources.</p>}
      <div className={styles.recordedChanges}>
        <h3>Recorded editorial evidence-grade changes</h3>
        <p>These events come from the separately maintained editorial grade-change log, not inferred historic scores.</p>
        {data.recordedChanges.length ? data.recordedChanges.slice(0,8).map(change => (
          <article key={change.id}>
            <span>{change.occurredAt.slice(0,10)}</span>
            <Link href={change.path}>{change.title} ↗</Link>
            <small>{change.summary}</small>
          </article>
        )) : <p>No change entries passed the governed, dated editorial-log filter.</p>}
      </div>
      <Link className={styles.related} href='/evidence/evidence-report/changes/'>Recorded evidence changes →</Link>
    </>:null}

    {data&&tab==='voyages'?<>
      <Notice>Every route step has an exact PMID witnessing concept co-mention. A text trail is not a biological pathway, a mechanistic finding, or therapeutic evidence.</Notice>
      <div className={styles.fieldGrid}>
        <label className={styles.field}>Departure concept<select value={from} onChange={e=>setFrom(e.target.value)}>
          <option value=''>Choose a concept</option>{concepts.map(c=><option key={c.id} value={c.id}>{c.label} ({c.papers})</option>)}
        </select></label>
        <label className={styles.field}>Destination concept<select value={to} onChange={e=>setTo(e.target.value)}>
          <option value=''>Choose a concept</option>{concepts.filter(c=>c.id!==from).map(c=><option key={c.id} value={c.id}>{c.label} ({c.papers})</option>)}
        </select></label>
      </div>
      {from&&to?<div className={styles.journey}>
        <h3>{voyage.length?voyage.length+' source-witnessed bibliographic hop'+(voyage.length===1?'':'s'):'No path within three source-witnessed hops'}</h3>
        {voyage.map((s,i)=><article key={s.pmid+':'+i} className={styles.journeyStep}>
          <span>{String(i+1).padStart(2,'0')} / HOP</span>
          <strong>{concepts.find(c=>c.id===s.from)?.label||s.from} ↗ {concepts.find(c=>c.id===s.to)?.label||s.to}</strong>
          <p>{s.explanation}</p><Tag>{s.provenance==='both-title'?'BOTH IN TITLE':'TITLE + ABSTRACT'}</Tag>
          <a href={pubmed(s.pmid)} target='_blank' rel='noopener noreferrer'>Inspect PMID {s.pmid} ↗</a><button className={styles.caseTrace} type='button' onClick={()=>inspectPmid(s.pmid)}>Open eight-instrument case ↗</button>
        </article>)}
        {!voyage.length?<p>Unconnected in this batch. No inference about real-world relationship is possible.</p>:null}
      </div>:<p className={styles.placeholder}>Pick two concepts to reveal a bounded, source-witnessed path.</p>}
    </>:null}

    {data&&tab==='safety'?<>
      <Notice>These are references where safety vocabulary and substance names co-occur in source text. They are not verified interactions, confirmed adverse reactions, causal assessments or personalized safety advice.</Notice>
      <div className={styles.metrics}><div><strong>{data.safety.length}</strong><span>Safety-text intersections</span></div>
        <div><strong>{data.safety.filter(x=>x.titleWitnesses>0).length}</strong><span>Both terms in titles</span></div>
        <div><strong>0</strong><span>Automatically certified interactions</span></div></div>
      {!data.safety.length?<p className={styles.placeholder}>No controlled safety co-mentions identified; this does not mean the substances are safe.</p>:null}
      <div className={styles.paperGrid}>{data.safety.slice(0,more?40:12).map(s=><article key={s.id} className={styles.paper}>
        <div className={styles.paperTop}><Tag>TEXT CO-MENTION ONLY</Tag><span>{s.count} paper{s.count===1?'':'s'}</span></div>
        <h3>{s.substance}<span className={styles.multiply}> / </span>{s.topic}</h3>
        <p>{s.titleWitnesses} title-level co-mentions; other matches may be from abstracts. No assessment of the finding is implied.</p>
        <Sources pmids={s.pmids} onSelect={inspectPmid}/></article>)}</div>
      {data.safety.length>12&&!more?<button type='button' className={styles.more} onClick={()=>setMore(true)}>More safety literature contexts →</button>:null}
      <h3>Cross-instrument witness trails</h3>
      <p>These threads connect a substance, an outcome and a safety topic only when all three occur within the same source record. Their co-mention is not a causal or clinical claim.</p>
      {!data.investigations.length?<p>No three-concept trails found in this snapshot; no broader research conclusion follows.</p>:null}
      <div className={styles.paperGrid}>{data.investigations.slice(0,8).map(thread=><article className={styles.paper} key={thread.id}>
        <div className={styles.paperTop}><Tag>SAME-PAPER TEXT WITNESSES</Tag><span>{thread.pmids.length} shown</span></div>
        <h3>{thread.substance} / {thread.outcome} / {thread.safetyTopic}</h3>
        <p>{thread.titleTripleWitnesses} title-level triple mention(s). Full papers require scientific review.</p>
        <Sources pmids={thread.pmids} onSelect={inspectPmid}/>
      </article>)}</div>
    </>:null}

    {data&&tab==='ask'?<>
      <Notice>Ask the Evidence is an explainable source finder—not a generative treatment adviser. Retrieval produces no efficacy, dose, drug-interaction or safety conclusion.</Notice>
      <form className={styles.askForm} onSubmit={e=>{e.preventDefault();setAsked(true)}}>
        <label className={styles.field}>What would you like to investigate?
          <textarea rows={3} maxLength={300} value={query} onChange={e=>{setQuery(e.target.value);setAsked(false)}}
            placeholder='For example: Which studies mention creatine and cognition?'/></label>
        <button type='submit' className={styles.prime} disabled={!query.trim()}>Inspect the source trail ↗</button>
      </form>
      {answer?<div className={styles.askAnswer} role='status'><h3>{answer.matches.length} {answer.matchMode==='all-concepts'?'indexed-concept matches':'source candidates'} in the current research batch</h3>
        <p>Recognized: {answer.understoodConcepts.length?answer.understoodConcepts.join(' · '):'No matching controlled concepts'}</p>
        {answer.unresolvedTerms.length?<p><strong>Question terms not indexed:</strong> {answer.unresolvedTerms.join(' · ')}. Check these against full papers before drawing conclusions.</p>:null}
        <p><strong>{answer.matchMode==='all-concepts'?'All-concept match':answer.matchMode==='partial-concepts'?'Partial-only retrieval':'No recognized concept'}:</strong> {answer.retrievalNote}</p>
        <p>{answer.warning}</p>
        <div className={styles.paperGrid}>{answer.matches.map(m=><article className={styles.paper} key={m.pmid}>
          <h3>{m.title}</h3><p>{m.reason}</p><details><summary className={styles.detail}>Why this paper matched</summary><WitnessPanel items={m.witnesses}/></details><a className={styles.paperLink} href={m.url} target='_blank' rel='noopener noreferrer'>Original PMID {m.pmid} ↗</a><button className={styles.caseTrace} type='button' onClick={()=>inspectPmid(m.pmid)}>Trace source ↗</button>
        </article>)}</div></div>:null}
    </>:null}

    {data&&tab==='reactor'?<>
      <Notice>Proposals are draft-only editorial work orders with a mandatory scientific review checklist. The system does not write or publish claims, doses, recommendations or articles.</Notice>
      <div className={styles.metrics}><div><strong>{data.briefs.length}</strong><span>Draft work orders</span></div>
        <div><strong>{data.adjudication.reviewCount}</strong><span>Recorded source-mention reviews</span></div>
        <div><strong>0</strong><span>Automatically published</span></div></div>
      <p>Review ledger decisions concern source-text indexing only. They cannot certify safety, clinical conclusions or publication.</p>
      <section className={styles.reviewHistory} aria-label='Source indexing review history'>
        <h3>Source-indexing review history</h3>
        <p>Append-only editorial events are recorded against exact source quotes. Reviewer codes are recorded assertions, not independent certification of expertise.</p>
        {data.adjudication.events.length===0?<p>No source-text indexing reviews have been recorded in this snapshot.</p>:null}
        <ol>{data.adjudication.events.slice(-12).reverse().map(e=><li key={e.eventId}>
          <strong>{human(e.decision)}</strong> · {e.recordedAt.slice(0,10)} · reviewer {e.reviewerCode}
          <p>{e.rationale}</p>
          <a href={pubmed(e.witnessId.split(':')[0])} target='_blank' rel='noopener noreferrer'>Inspect original publication ↗</a>
        </li>)}</ol>
      </section>
      <div className={styles.paperGrid}>{data.briefs.slice(0,more?40:9).map(v=><Brief brief={v} key={v.id} onSelect={inspectPmid}/>)}</div>
      {data.briefs.length>9&&!more?<button type='button' className={styles.more} onClick={()=>setMore(true)}>More editorial hypotheses →</button>:null}
    </>:null}
  </section>
  <footer className={styles.bottom}><span>THS / RESEARCH-ONLY KNOWLEDGE ENGINE</span>
    <span>ZERO AUTOMATIC EVIDENCE PROMOTION · <Link href='/learn/citation-explorer/'>PUBLISHED CITATIONS ↗</Link></span></footer>
</section>
}

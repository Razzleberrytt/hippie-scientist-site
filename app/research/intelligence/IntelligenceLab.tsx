'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  askSourceInventory,
  findIntelligenceVoyage,
  type ResearchIntelligenceData,
} from '@/lib/research-intelligence-suite'
import styles from './IntelligenceLab.module.css'

type Surface = 'dna'|'contradictions'|'frontier'|'timeline'|'voyages'|'safety'|'ask'|'reactor'
const SURFACES:readonly {id:Surface;index:string;name:string;sub:string}[] = [
  {id:'dna',index:'01',name:'Study DNA',sub:'Inspect source fingerprints'},
  {id:'contradictions',index:'02',name:'Contradiction Radar',sub:'Review opposite title wording'},
  {id:'frontier',index:'03',name:'Knowledge Frontier',sub:'Map within-batch coverage'},
  {id:'timeline',index:'04',name:'Evidence Time Machine',sub:'Travel by publication year'},
  {id:'voyages',index:'05',name:'Semantic Voyages',sub:'Trace source-backed concept paths'},
  {id:'safety',index:'06',name:'Safety Matrix',sub:'Inspect co-mentioned contexts'},
  {id:'ask',index:'07',name:'Ask the Evidence',sub:'Retrieve grounded citations'},
  {id:'reactor',index:'08',name:'Content Reactor',sub:'Queue source-backed editorial ideas'},
]

function sourceLink(pmid:string){
  return 'https://pubmed.ncbi.nlm.nih.gov/'+pmid+'/'
}
function Source({pmid}: {pmid:string}) {
  return <a href={sourceLink(pmid)} target='_blank' rel='noopener noreferrer' className={styles.sourceLink}>PMID {pmid} ↗</a>
}
function Kind({children}: {children:React.ReactNode}) {
  return <span className={styles.kind}>{children}</span>
}
function Empty({children}: {children:React.ReactNode}) {
  return <p className={styles.empty}>{children}</p>
}
function NotInference() {
  return <p className={styles.boundary}>Research navigation only · Not evidence grading, efficacy, verified adverse effects, confirmed interactions, or clinical advice.</p>
}
function Title({index,title,summary}: {index:string;title:string;summary:string}) {
  return <div className={styles.panelTitle}>
    <p className={styles.micro}>INTELLIGENCE / {index} / DISCOVERY MODE</p>
    <h3>{title}</h3>
    <p>{summary}</p>
  </div>
}
export default function IntelligenceLab({totalIndexedPmids}:{totalIndexedPmids:number}) {
  const [data,setData]=useState<ResearchIntelligenceData|null>(null)
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')
  const [tab,setTab]=useState<Surface>('dna')
  const [paperQuery,setPaperQuery]=useState('')
  const [focus,setFocus]=useState('')
  const [year,setYear]=useState('')
  const [a,setA]=useState('')
  const [b,setB]=useState('')
  const [question,setQuestion]=useState('')
  const [method,setMethod]=useState('')
  const [selectedEditorial,setSelectedEditorial]=useState<string[]>([])

  async function activate(){
    if(data||loading)return
    setError('')
    setLoading(true)
    try {
      const response=await fetch('/research/intelligence/dataset.json', {cache:'force-cache'})
      if(!response.ok)throw new Error('Archive response unavailable')
      const payload:unknown=await response.json()
      const doc=payload as ResearchIntelligenceData
      if(doc.schema_version!==1||doc.research_only!==true||doc.admission!=='none'||
        doc.summary?.automaticallyApprovedClaims!==0||doc.summary?.inspected!==500||
        !Array.isArray(doc.studies)||doc.studies.length!==500||
        new Set(doc.studies.map(s=>s.pmid)).size!==500||
        !doc.graph||Object.keys(doc.graph.entries).length!==500||
        !doc.studies.every(s=>doc.graph.entries[s.pmid]?.pmid===s.pmid) ||
        !Array.isArray(doc.coverage)||!Array.isArray(doc.years)||!Array.isArray(doc.opportunities)||
        !Array.isArray(doc.wordingCandidates))throw new Error('Source provenance contract failed')
      setData(doc)
    } catch {
      setError('The exact-source intelligence bundle could not be loaded or verified. No inference has been made; the public Source Register is still available.')
    } finally {setLoading(false)}
  }

  const paperList=useMemo(()=>{
    if(!data)return []
    const q=paperQuery.toLowerCase().trim()
    return data.studies.filter(st=>(!q||st.title.toLowerCase().includes(q)||st.pmid.includes(q))&&
      (!method||st.method===method)).slice(0,30)
  },[data,paperQuery,method])
  const methodOptions=useMemo(()=>data?[...new Set(data.studies.map(p=>p.method))].sort():[],[data])
  const currentCoverage=useMemo(()=>data?.coverage.find(c=>c.id===focus)||data?.coverage[0],[data,focus])
  const currentYear=useMemo(()=>data?.years.find(x=>x.year===year)||data?.years.find(x=>x.year!=='Unknown'),[data,year])
  const inquiry=useMemo(()=>data&&question.trim()?askSourceInventory(question,data,12):null,[question,data])
  const path=useMemo(()=>data&&a&&b?findIntelligenceVoyage(data,a,b,3):[],[data,a,b])
  const safetyRows=useMemo(()=>data?.coverage.filter(c=>c.safetyContext.length).sort((x,y)=>
    y.safetyContext.reduce((n,m)=>n+m.count,0)-x.safetyContext.reduce((n,m)=>n+m.count,0))||[],[data])
  const intro=<>
    <div className={styles.heroHeader}>
      <div>
        <p className={styles.micro}>THE HIPPIE SCIENTIST / THE RESEARCH INTELLIGENCE LAB / VOL. 001</p>
        <h1>Knowledge is a <em>living thing.</em></h1>
      </div>
      <span className={styles.heroGlyph} aria-hidden='true'>∴</span>
    </div>
    <p className={styles.heroText}>Eight research instruments. One source-bound semantic foundation. Trace what papers actually name, explore where topics intersect, and expose questions worth investigating—without mistaking textual relationships for scientific conclusions.</p>
    <div className={styles.heroFooter}>
      <span>SOURCE VERIFIED / RESEARCH ONLY</span>
      <span>500 PAPER PILOT · {totalIndexedPmids.toLocaleString()} CUMULATIVE PMID IDENTITIES</span>
      <span>NO AUTOMATIC CLAIM PROMOTION</span>
    </div>
  </>
  return (
    <div className={styles.lab}>
      <header className={styles.hero}>{intro}</header>
      <div className={styles.body}>
        {!data ? <section className={styles.activation}>
          <p className={styles.micro}>A NEW WAY TO INVESTIGATE</p>
          <h2>Enter the <em>observatory.</em></h2>
          <p>Explore study fingerprints, review queues, semantic pathways, source coverage and publication history. The detailed network is downloaded only when you enter this lab.</p>
          <button disabled={loading} onClick={()=>void activate()} aria-busy={loading} className={styles.enter}>
            {loading?'Loading exact-source intelligence…':'Activate the eight instruments ↗'}
          </button>
          {error?<p role='alert' className={styles.error}>{error}</p>:null}
          <div className={styles.previewGrid}>{SURFACES.map(x=><div key={x.id}><span>{x.index}</span><strong>{x.name}</strong><small>{x.sub}</small></div>)}</div>
          <NotInference/>
        </section> : <>
          <div className={styles.statistics} aria-label='Current pilot coverage'>
            {[
              [data.summary.fingerprinted,'Source fingerprints'],
              [data.summary.conceptCount,'Active concepts'],
              [data.summary.yearsCovered,'Years represented'],
              [data.summary.automaticallyApprovedClaims,'New claims approved'],
            ].map(([count,name])=><div key={String(name)}><strong>{Number(count).toLocaleString()}</strong><span>{name}</span></div>)}
          </div>
          <div className={styles.workspace}>
            <nav aria-label='Select research intelligence instrument' className={styles.instrumentNav}>
              <p className={styles.micro}>INSTRUMENT INDEX / 8</p>
              {SURFACES.map(item=><button key={item.id} type='button' aria-current={tab===item.id?'page':undefined}
                onClick={()=>setTab(item.id)} className={tab===item.id?styles.activeInstrument:styles.instrument}>
                <span>{item.index}</span><strong>{item.name}</strong><small>{item.sub}</small>
              </button>)}
              <Link href='/research/source-register/' className={styles.originalLink}>Original PubMed source register ↗</Link>
            </nav>
            <div className={styles.instrumentBody}>
              {tab==='dna'&&<>
                <Title index='01' title='Study DNA' summary='Every source has a fingerprint. Signals below mean specific words appeared in verified bibliographic records; study designs and findings still need independent interpretation.'/>
                <div className={styles.filters}>
                  <label>Find a study<input type='search' value={paperQuery} onChange={e=>setPaperQuery(e.target.value)} placeholder='Title or PMID'/></label>
                  <label>Method cue<select value={method} onChange={e=>setMethod(e.target.value)}><option value=''>All method labels</option>{methodOptions.map(m=><option key={m} value={m}>{m}</option>)}</select></label>
                </div>
                <p className={styles.count}>{paperList.length} of up to 30 displayed · {data.studies.length} sources indexed</p>
                {paperList.length?paperList.map(st=><article className={styles.study} key={st.pmid}>
                  <div className={styles.studyMeta}><span>{st.year||'Undated'} / {st.category.replace(/_/g,' ')}</span><Kind>{st.method}</Kind></div>
                  <h4>{st.title}</h4><Source pmid={st.pmid}/>
                  <div className={styles.chips}>{st.concepts.map(m=><span title={'Exact '+m.basis+' phrase: '+m.matched} key={m.id}>{m.label}<small>{m.basis}</small></span>)}</div>
                  <p className={styles.caption}>{st.concepts.length?'Controlled terms matched in the title and/or abstract.':'No terms matched the controlled vocabulary; data are not fabricated.'} {st.reviewedSourceOverlap>0?'This PMID also occurs in the separately reviewed public evidence index.':''}</p>
                </article>):<Empty>No matches. Absence from this limited intake is not evidence of scientific absence.</Empty>}
              </>}
              {tab==='contradictions'&&<>
                <Title index='02' title='Contradiction Radar' summary='A review queue for opposite title wording—not a claim that research findings conflict. Opposite wording can reflect different populations, interventions or outcomes.'/>
                <div className={styles.largeMetric}><strong>{data.wordingCandidates.length}</strong><span>title-wording pairs to examine manually</span></div>
                {data.wordingCandidates.length===0?<Empty>No eligible opposite-wording pairs in the current 500-study set. That is a meaningful zero; we will not manufacture contradictions.</Empty>:data.wordingCandidates.slice(0,35).map((v,i)=><article className={styles.study} key={v.pmids.join(':')+i}>
                  <div className={styles.studyMeta}><Kind>Unverified review candidate</Kind><span>{v.concept} × {v.outcome}</span></div>
                  <div className={styles.contrast}><div><span>Title wording A</span><p>{v.titles[0]}</p><Source pmid={v.pmids[0]}/></div><div><span>Title wording B</span><p>{v.titles[1]}</p><Source pmid={v.pmids[1]}/></div></div>
                  <p className={styles.caption}>{v.reason}</p>
                </article>)}
              </>}
              {tab==='frontier'&&<>
                <Title index='03' title='Knowledge Frontier' summary='A cartography of what this intake batch labels—not a claim about the world’s total literature. Empty cells indicate unclassified coverage here.'/>
                <div className={styles.filters}><label>Select named substance
                  <select value={currentCoverage?.id||''} onChange={e=>setFocus(e.target.value)}>
                    {data.coverage.map(c=><option value={c.id} key={c.id}>{c.label} ({c.sourceMentions})</option>)}
                  </select></label></div>
                {currentCoverage?<section className={styles.feature}>
                  <p className={styles.micro}>SPECIMEN / {currentCoverage.id.toUpperCase()}</p>
                  <h4>{currentCoverage.label}</h4>
                  <p>{currentCoverage.sourceMentions} source mentions · {currentCoverage.titleMentions} title mentions</p>
                  <div className={styles.analyticRows}>{[
                    ['Co-mentioned outcomes',currentCoverage.outcomes],
                    ['Population labels',currentCoverage.populations],
                    ['Study method labels',currentCoverage.methods],
                    ['Safety context labels',currentCoverage.safetyContext],
                  ].map(([name,items])=><div key={String(name)}><strong>{String(name)}</strong>{(items as Array<{id:string;label:string;count:number}>).length?
                    (items as Array<{id:string;label:string;count:number}>).map(v=><div key={v.id} className={styles.barRow}><span>{v.label}</span><div className={styles.barTrack}><i style={{width:Math.max(3,100*v.count/currentCoverage.sourceMentions)+'%'}}/></div><b>{v.count}</b></div>):
                    <p className={styles.caption}>No matching controlled terms in this batch</p>}
                  </div>)}</div>
                  <p className={styles.caption}>{currentCoverage.note}</p>
                </section>:<Empty>No named substance matches found in the pilot.</Empty>}
              </>}
              {tab==='timeline'&&<>
                <Title index='04' title='Evidence Time Machine' summary='Publication chronology—not a reconstructed history of evidence-grade changes. Scientific consensus changes require curated editorial version receipts.'/>
                <div className={styles.timeline}>
                  {data.years.filter(y=>y.year!=='Unknown').map(v=><button key={v.year} type='button' onClick={()=>setYear(v.year)}
                    aria-pressed={currentYear?.year===v.year} className={styles.timePoint}>
                    <span style={{height:Math.max(8,100*v.count/Math.max(1,...data.years.map(y=>y.count)))+'%'}}/>
                    <b>{v.year}</b><small>{v.count}</small>
                  </button>)}
                </div>
                {currentYear?<div className={styles.feature}>
                  <p className={styles.micro}>TEMPORAL LENS / {currentYear.year}</p>
                  <h4>{currentYear.count} publication{currentYear.count===1?'':'s'}</h4>
                  {currentYear.pmids.slice(0,12).map(pmid=>{
                    const st=data.studies.find(x=>x.pmid===pmid)
                    return <p className={styles.timelineStudy} key={pmid}><span>{st?.title||'Source record'}</span><Source pmid={pmid}/></p>
                  })}
                </div>:<Empty>No year metadata available.</Empty>}
                <p className={styles.caption}>Year-unknown papers remain part of the indexed research set and are not assigned imaginary dates.</p>
                <Link href='/evidence/evidence-report/changelog/' className={styles.secondaryLink}>Explore separately reviewed editorial evidence changes ↗</Link>
              </>}
              {tab==='voyages'&&<>
                <Title index='05' title='Semantic Voyages' summary='Trace a bounded path between concepts using source-ID witnesses at each step. Paths are textual co-mentions—not biological causality.'/>
                <div className={styles.filters}>
                  <label>Departure<select value={a} onChange={e=>setA(e.target.value)}><option value=''>Choose concept</option>{data.graph.concepts.filter(x=>x.kind!=='method').map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
                  <label>Destination<select value={b} onChange={e=>setB(e.target.value)}><option value=''>Choose another concept</option>{data.graph.concepts.filter(x=>x.kind!=='method'&&x.id!==a).map(x=><option key={x.id} value={x.id}>{x.label}</option>)}</select></label>
                </div>
                {!a||!b?<Empty>Select two concepts to inspect up to three source-witnessed steps.</Empty>:path.length?
                  <div className={styles.pathFlow}>{path.map((v,i)=><div className={styles.pathStep} key={v.pmid+':'+i}>
                    <span className={styles.micro}>HOP {String(i+1).padStart(2,'0')} / {v.provenance}</span>
                    <h4>{data.graph.concepts.find(x=>x.id===v.from)?.label||v.from} → {data.graph.concepts.find(x=>x.id===v.to)?.label||v.to}</h4>
                    <Source pmid={v.pmid}/><p>{v.explanation}</p>
                  </div>)}</div>:
                  <Empty>No path within three verified source-text hops. This does not mean the concepts are scientifically unrelated.</Empty>}
              </>}
              {tab==='safety'&&<>
                <Title index='06' title='Safety Intelligence Matrix' summary='Discover when named substances and safety vocabulary appear in the same research source. Co-mentioning these terms does not establish a drug interaction, toxicity or clinical risk.'/>
                <p className={styles.count}>{safetyRows.length} substances have at least one safety-context co-mention</p>
                {safetyRows.length?safetyRows.map(row=><div key={row.id} className={styles.safetyRow}>
                  <div><h4>{row.label}</h4><small>{row.sourceMentions} substance mentions</small></div>
                  <div>{row.safetyContext.map(c=><div key={c.id} className={styles.safetyCell}>
                    <span>{c.label}</span><b>{c.count} co-mentions</b>
                    <div className={styles.sourceSet}>{c.sample.map(pmid=><Source key={pmid} pmid={pmid}/>)}</div>
                  </div>)}</div>
                </div>):<Empty>No exact controlled substance/safety co-mentions in the current pilot.</Empty>}
                <NotInference/>
              </>}
              {tab==='ask'&&<>
                <Title index='07' title='Ask the Evidence' summary='A deterministic citation retrieval engine—not an AI clinician or a generative claim engine. Search a research question and receive traceable candidate sources.'/>
                <label className={styles.askLabel}>Your research question
                  <textarea rows={3} value={question} maxLength={240} onChange={e=>setQuestion(e.target.value)}
                    placeholder='What papers mention magnesium and sleep?'/>
                </label>
                {inquiry?<section className={styles.answer}>
                  <p className={styles.micro}>RETRIEVAL REPORT / {inquiry.matches.length} SHOWN</p>
                  <h4>{inquiry.recognizedConcepts.length?inquiry.recognizedConcepts.join(' × '):'Free-text source matches'}</h4>
                  <p>{inquiry.message}</p>
                  <div className={styles.answerLinks}>{inquiry.matches.map(s=><article key={s.pmid}><span>{s.title}</span><Source pmid={s.pmid}/></article>)}</div>
                </section>:<Empty>Enter a concept or research question. The engine only searches this verified 500-paper intake and will not generate treatment advice.</Empty>}
                <Link href='/learn/citation-explorer/' className={styles.secondaryLink}>Continue into separately reviewed Citation Explorer ↗</Link>
              </>}
              {tab==='reactor'&&<>
                <Title index='08' title='Semantic Content Reactor' summary='Generate editorial investigation leads from the same graph. Nothing is published, recommended or scientifically approved automatically.'/>
                <div className={styles.largeMetric}><strong>{data.opportunities.length}</strong><span>source-bound review ideas in this pilot</span></div>
                <div className={styles.ideaToolbar}><span>{selectedEditorial.length} selected for a local review brief</span><button type='button' onClick={()=>setSelectedEditorial([])}>Clear selection</button></div>
                {data.opportunities.slice(0,45).map(item=><article key={item.id} className={styles.idea}>
                  <input type='checkbox' checked={selectedEditorial.includes(item.id)} aria-label={'Select '+item.headline}
                    onChange={e=>setSelectedEditorial(current=>e.target.checked?[...current,item.id]:current.filter(id=>id!==item.id))}/>
                  <div><Kind>{item.angle.replace('-',' ')}</Kind><h4>{item.headline}</h4><p>{item.rationale}</p>
                    <div className={styles.sourceSet}>{item.pmids.map(id=><Source key={id} pmid={id}/>)}</div>
                  </div>
                </article>)}
                {selectedEditorial.length>0?<button type='button' className={styles.enter} onClick={()=>{
                  const selected=data.opportunities.filter(x=>selectedEditorial.includes(x.id))
                  const body=['THS Semantic Intelligence — editorial research queue','Research-only; all claims require review.','',...selected.flatMap(x=>[
                    x.headline,x.rationale,'Primary sources: '+x.pmids.map(sourceLink).join(' · '),'Editorial status: NOT APPROVED','',
                  ])].join('\n')
                  void navigator.clipboard?.writeText(body)
                }}>Copy source-backed research brief ↗</button>:null}
              </>}
              <NotInference/>
            </div>
          </div>
        </>}
      </div>
      <footer className={styles.footer}><span>WAVES 7001–7500 / SOURCE VERIFIED</span><span>EXPERIMENTAL DISCOVERY / NO AUTOMATIC CLINICAL CLAIMS</span><Link href='/research/source-register/'>Open source register ↗</Link></footer>
    </div>
  )
}

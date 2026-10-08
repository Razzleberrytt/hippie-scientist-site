'use client'

import { useMemo, useState } from 'react'
import { findExplainableConceptPath, type SemanticNetwork } from '@/lib/research-semantic-network'
import styles from './SemanticResearchObservatory.module.css'

type Props = {
  network: SemanticNetwork
  onFocusConcept: (concept: string) => void
  onFocusPaper: (pmid: string) => void
}

function label(value: string) {
  return value.replace(/_/g,' ').replace(/\bnps\b/i,'NPS')
}

export default function SemanticResearchObservatory({network,onFocusConcept,onFocusPaper}:Props) {
  const [first,setFirst]=useState('')
  const [second,setSecond]=useState('')
  const [lens,setLens]=useState<'connections'|'bridges'|'gaps'>('connections')

  const grouped=useMemo(()=>{
    const ids=network.concepts.filter(c=>c.kind==='substance'||c.kind==='outcome')
    return ids.slice().sort((a,b)=>b.titleMentions-a.titleMentions||b.papers-a.papers).slice(0,10)
  },[network.concepts])
  const filteredIds=useMemo(()=>{
    const records=Object.values(network.entries)
    return records.filter(x=>(!first||x.mentions.some(m=>m.id===first))&&(!second||x.mentions.some(m=>m.id===second)))
  },[first,second,network.entries])
  const semanticPath = useMemo(() => first && second
    ? findExplainableConceptPath(network, first, second, 3)
    : [], [network, first, second])
  const conceptLabel = (id: string) => network.concepts.find(c => c.id === id)?.label || id
  const combinations=useMemo(()=>{
    if(!first)return []
    const counts=new Map<string,number>()
    for(const entry of filteredIds)for(const m of entry.mentions){
      if(m.id!==first&&m.kind!=='method')counts.set(m.id,(counts.get(m.id)||0)+1)
    }
    return [...counts.entries()].map(([id,count])=>({
      id,count,concept:network.concepts.find(c=>c.id===id),
    })).filter(x=>x.concept).sort((a,b)=>b.count-a.count||a.id.localeCompare(b.id)).slice(0,8)
  },[first,filteredIds,network.concepts])
  const gaps=useMemo(()=>Object.values(network.entries).filter(x=>x.mentions.length===0),[network.entries])
  const summary=network.summary
  const detailedGraphReady = Object.keys(network.entries).length === summary.sourcePapers
  const top=grouped.slice(0,8)
  const step=2*Math.PI/Math.max(1,top.length)

  function selectConcept(id:string){
    setFirst(id)
    setSecond('')
    onFocusConcept(id)
  }
  function selectPaper(pmid:string){onFocusPaper(pmid)}

  return (
    <section className={styles.observatory} aria-labelledby='semantic-observatory-title'>
      <div className={styles.masthead}>
        <div>
          <p className={styles.kicker}>THE HIPPIE SCIENTIST / RESEARCH INTELLIGENCE / EXPERIMENTAL 01</p>
          <h2 id='semantic-observatory-title' className={styles.title}>The semantic <em>observatory.</em></h2>
          <p className={styles.dek}>Move from isolated citations to explainable connections. Shared words are signposts for research, not proof that two studies agree.</p>
        </div>
        <span className={styles.sigla} aria-hidden='true'>↗</span>
      </div>

      <div className={styles.metrics} aria-label='Semantic connection coverage'>
        {[
          {value:summary.activeConcepts,unit:'Concepts',detail:'controlled labels'},
          {value:summary.explainableEdges,unit:'Paper links',detail:'explainable overlap'},
          {value:summary.crossTopicEdges,unit:'Cross-topic',detail:'potential bridges'},
          {value:summary.linkedProfiles,unit:'Profile mentions',detail:'exact titles'},
        ].map(item=><div key={item.unit} className={styles.metric}>
          <p className={styles.figure}>{item.value.toLocaleString()}</p>
          <p className={styles.metricLabel}>{item.unit}</p>
          <p className={styles.metricSmall}>{item.detail}</p>
        </div>)}
      </div>

      <div className={styles.content}>
        <div className={styles.constellation}>
          <div className={styles.topline}>
            <span>01 / Concept constellation</span><span>Source-text topology</span>
          </div>
          <svg viewBox='0 0 380 300' role='img' aria-label='Decorative orbital map of the most frequently title-mentioned research subjects. Accessible concept controls appear below.'>
            <circle cx='190' cy='148' r='102' fill='none' stroke='currentColor' opacity='.18' strokeDasharray='2 7'/>
            <circle cx='190' cy='148' r='61' fill='none' stroke='currentColor' opacity='.13'/>
            <circle cx='190' cy='148' r='133' fill='none' stroke='currentColor' opacity='.10'/>
            {top.map((c,i)=>{
              const a=i*step-Math.PI/2
              const x=190+Math.cos(a)*106
              const y=148+Math.sin(a)*100
              return <g key={c.id}>
                <line x1='190' y1='148' x2={x} y2={y} stroke='currentColor' opacity={first&&first!==c.id?'.10':'.25'} strokeWidth='.8'/>
                <circle cx={x} cy={y} r={first===c.id?7:4.5} fill={first===c.id?'#d2a34d':'#acc8b1'}/>
                <text x={x} y={y+(y<148?-13:19)} fill='currentColor' opacity={first&&first!==c.id?'.35':'.85'}
                  fontSize='9.5' textAnchor='middle'>{c.label.length>20?c.label.slice(0,18)+'…':c.label}</text>
              </g>
            })}
            <circle cx='190' cy='148' r='36' fill='#e1b969'/>
            <text x='190' y='145' fontSize='13' textAnchor='middle' fontWeight='800' fill='#242b20'>THS</text>
            <text x='190' y='157' fontSize='6.5' textAnchor='middle' letterSpacing='1.2' fill='#242b20'>RESEARCH</text>
          </svg>
          <div className={styles.conceptButtons} aria-label='Explore research concepts'>
            {top.map(c=><button key={c.id} type='button' aria-pressed={first===c.id}
              className={styles.conceptButton} onClick={()=>selectConcept(c.id)}>
              {c.label}<span>{c.papers}</span>
            </button>)}
          </div>
          <p className={styles.fineprint}>Circle size is illustrative; counts and source matches—not node positions—are authoritative.</p>
        </div>

        <div className={styles.lens}>
          <div className={styles.topline}><span>02 / Inquiry engine</span><span>Two-concept lens</span></div>
          <h3>Ask what <em>intersects.</em></h3>
          <p className={styles.helper}>Choose one or two research concepts. Results include mentions in article titles or abstracts, with no inference about efficacy.</p>
          <div className={styles.selects}>
            <label>Concept A
              <select value={first} onChange={e=>{setFirst(e.target.value);onFocusConcept(e.target.value);setSecond('')}}>
                <option value=''>All concepts</option>
                {network.concepts.map(c=><option key={c.id} value={c.id}>{c.label} ({c.papers})</option>)}
              </select>
            </label>
            <label>Concept B
              <select value={second} onChange={e=>setSecond(e.target.value)}>
                <option value=''>Any second concept</option>
                {network.concepts.filter(c=>c.id!==first).map(c=><option key={c.id} value={c.id}>{c.label} ({c.papers})</option>)}
              </select>
            </label>
          </div>
          {first && second ? (
            <div className={styles.pathPanel} aria-live='polite'>
              <strong>Semantic pathway / {!detailedGraphReady ? 'Loading source witnesses' : semanticPath.length ? semanticPath.length + ' bibliographic hop' + (semanticPath.length === 1 ? '' : 's') : 'No linked path within 3 hops'}</strong>
              {semanticPath.length ? (
                <ol>
                  {semanticPath.map((step, i) => (
                    <li key={step.pmid + '-' + i}>
                      <span>{conceptLabel(step.from)} → {conceptLabel(step.to)}</span>
                      <button type='button' onClick={() => selectPaper(step.pmid)}>PMID {step.pmid} ↗</button>
                      <small>{step.provenance === 'both-title' ? 'Both title phrases' : 'Title + abstract'}</small>
                    </li>
                  ))}
                </ol>
              ) : <p>{detailedGraphReady ? 'No witness path found in this source batch. That is not evidence that the topics are unrelated.' : 'Open the source graph to inspect exact PMID witnesses.'}</p>}
              <p>Co-occurrence path only, with direct source IDs. No biological or treatment inference.</p>
            </div>
          ) : null}
          <div className={styles.lensReadout}>
            <strong>{(detailedGraphReady ? filteredIds.length : summary.sourcePapers).toLocaleString()}</strong>
            <span>{detailedGraphReady ? 'papers with selected mention' + (first&&second?'s (intersection)':'') : 'source papers in the overview · activate the graph to filter'}</span>
          </div>
          <div className={styles.switches} aria-label='Semantic insight view'>
            {([['connections','Adjacencies'],['bridges','Cross-topic'],['gaps','Blind spots']] as const).map(([id,title])=>
              <button key={id} type='button' onClick={()=>setLens(id)} aria-pressed={lens===id}>{title}</button>)}
          </div>
          {lens==='connections'?<div className={styles.results}>
            {combinations.length ? combinations.map(c=><button key={c.id} type='button'
              onClick={()=>{setSecond(c.id)}} className={styles.resultRow}>
              <span><strong>{c.concept!.label}</strong><small>Shared mention with selected concept</small></span>
              <span>{c.count} ↗</span>
            </button>) : <p className={styles.blank}>Select a concept to surface co-mentioned ideas in this research batch.</p>}
          </div>:null}
          {lens==='bridges'?<div className={styles.results}>
            {network.bridges.filter(b=>!first||b.sharedConcepts.some(n=>network.concepts.some(c=>c.id===first&&c.label===n))).slice(0,6).map(b=>
              <button key={b.pmid+':'+b.neighborPmid} type='button' onClick={()=>selectPaper(b.pmid)} className={styles.resultRow}>
                <span><strong>{b.sharedConcepts.join(' · ')}</strong><small>{label(b.categories[0])} ↔ {label(b.categories[1])}</small></span>
                <span>PMID {b.pmid} ↗</span>
              </button>)}
            {!network.bridges.length?<p className={styles.blank}>No explainable cross-topic edges in this batch.</p>:null}
          </div>:null}
          {lens==='gaps'?<div className={styles.results}>
            <p className={styles.blank}>{summary.metadataOnlyPapers} source-verified papers have no controlled vocabulary match. That indicates a <strong>taxonomy coverage gap</strong>, not an absence of useful evidence.</p>
            {gaps.slice(0,5).map(g=><button type='button' key={g.pmid} onClick={()=>selectPaper(g.pmid)} className={styles.resultRow}><span><strong>Unmapped source</strong><small>PMID {g.pmid}</small></span><span>Inspect ↗</span></button>)}
          </div>:null}
          <p className={styles.fineprint}>All views are experimental navigation aids. Validate population, design, results and conflicts directly from the primary sources.</p>
        </div>
      </div>
    </section>
  )
}

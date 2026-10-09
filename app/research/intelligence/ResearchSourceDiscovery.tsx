'use client'
import {useMemo,useState} from 'react'
import Link from 'next/link'
import {discoverResearchIntake} from '@/lib/research-intelligence-discovery'
import type {ResearchDNA} from '@/lib/research-intelligence-studio'
import type {SemanticNetwork} from '@/lib/research-semantic-network'
import styles from './ResearchIntelligence.module.css'

type Props={
  dna:readonly ResearchDNA[]
  graph:SemanticNetwork
  onInspect:(pmid:string)=>void
}

/** A question is a lexical discovery lead, never a clinical answer. */
export default function ResearchSourceDiscovery({dna,graph,onInspect}:Props){
  const [query,setQuery]=useState('')
  const found=useMemo(()=>discoverResearchIntake(dna,graph,query),[dna,graph,query])
  return <section className={styles.discovery} aria-label='Find a research source by topic'>
    <div className={styles.discoveryHeading}>
      <div>
        <strong>01 / Start with a question or topic</strong>
        <p>Find a source by topic, substance, outcome, or PMID. Select an actual publication to connect its eight research instruments and twelve scientific projections.</p>
      </div>
      <span>RESEARCH DISCOVERY ONLY</span>
    </div>
    <label className={styles.field}>Topic or question
      <input type='search' value={query} maxLength={140} onChange={event=>setQuery(event.target.value)}
        placeholder='e.g. Does magnesium improve sleep?'/>
    </label>
    <p className={styles.discoveryMeta} role='status'>
      {query.trim()?found.total+' metadata match'+(found.total===1?'':'es'):'Sample of source records'}
      {' · '}{found.sourceCount} eligible source fingerprints in this snapshot
    </p>
    {found.matches.length?<ol className={styles.discoveryResults}>
      {found.matches.map(d=><li key={d.pmid}>
        <button type='button' onClick={()=>onInspect(d.pmid)} aria-label={'Open research-only case for PMID '+d.pmid+': '+d.title}>
          <span>{d.category.replaceAll('_',' ')} · {d.year||'Year unknown'} · PMID {d.pmid}</span>
          <strong>{d.title}</strong>
          <small>Open signed source case and inspect the evidence boundaries ↗</small>
        </button>
      </li>)}
    </ol>:<p className={styles.discoveryEmpty}>
      No matching metadata in this limited snapshot. This does not mean there is no research on the question.
      {' '}<Link href='/research/source-register/'>Explore the wider source register.</Link>
    </p>}
    <p className={styles.discoveryBoundary}>Matches are lexical and ranked by text relevance, <strong>not scientific quality</strong>. Co-mentions do not prove benefit, risk, mechanism, or a reviewed relationship; all research-intake studies remain ungraded until independently evaluated.</p>
  </section>
}

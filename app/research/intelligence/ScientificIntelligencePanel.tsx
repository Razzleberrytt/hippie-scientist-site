'use client'
import type {ScientificIntelligenceCase} from '@/lib/scientific-intelligence-suite'
import styles from './ResearchIntelligence.module.css'

type Props={science:ScientificIntelligenceCase;onOpenCapability:(id:string)=>void;getCapabilityLabel:(id:string)=>string}
export default function ScientificIntelligencePanel({science,onOpenCapability,getCapabilityLabel}:Props){
  return (
<section className={styles.scienceWorkbench} aria-label='Twelve scientific intelligence capabilities'>
          <div className={styles.scienceHeading}>
            <div><span className={styles.micro}>SCIENTIFIC REASONING / 1.08—1.14</span>
              <h4>Twelve connected research capabilities</h4>
              <p>One source identity. Twelve distinct investigations. All source-bounded and inspectable.</p></div>
            <span role='status'>{science.calibrationPassed?'INTERNAL GUARDS PASS':'CALIBRATION REVIEW REQUIRED'} · {science.calibrationChecks} checks</span>
          </div>
          <div className={styles.scienceGrid}>{science.capabilities.map((cap,i)=><details key={cap.id} className={styles.scienceCard}>
            <summary><span className={styles.scienceCardTop}>CAPABILITY {String(i+1).padStart(2,'0')} · v{cap.version}</span>
              <strong>{cap.name}</strong><span className={styles.scienceSummary}>{cap.summary}</span>
              <small>Inspect findings and provenance ↗</small></summary>
            <div className={styles.scienceDetail}>
              <ul>{cap.findings.map((finding,j)=><li key={j}>{finding}</li>)}</ul>
              <p><strong>Scientific boundary:</strong> {cap.limitation}</p>
              <button type='button' className={styles.caseTrace} onClick={()=>onOpenCapability(cap.id)}>Continue in {getCapabilityLabel(cap.id)} · exact source ↗</button>
              <details><summary>Inspect structured, source-bound receipt</summary>
                <textarea readOnly className={styles.export} rows={9} aria-label={cap.name+' structured scientific review receipt'}
                  value={JSON.stringify({capability:cap.id,pmid:science.pmid,
                    sourceSignature:science.sourceSignature,releaseApproved:false,receipt:cap.receipt},null,2)}/></details>
            </div>
          </details>)}</div>
          <p className={styles.scienceGuard}>No treatment recommendation, evidence grade promotion or automatic publication. Passing internal guards is not proof of scientific validity. Independent review is mandatory.</p>
        </section>
  )
}

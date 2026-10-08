import 'server-only'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewedSemanticOverlay, ReviewedSemanticEdge, ReviewedContradictionFlag, SemanticRecord } from './research-semantic-network'

const DIR='ops/enrichment-submissions/reconciliation'
const REVIEW_DIR='ops/research-coordinator/reviews'
const read=<T>(p:string)=>JSON.parse(readFileSync(p,'utf8')) as T
const digest=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex')

type Manifest={batch_id:string;artifact_parts:Array<{path:string}>;batch_content_sha256?:string}
type Review={
 schema_version:number;batch_id:string;batch_content_sha256:string;independent_semantic_review:boolean;reviewer:string;reviewed_at:string;
 reviewed_records:number;accepted_records:number;rejected_records:number;
 record_reviews:Array<{pmid:string;semantic_relationships:Array<{subject:string;predicate:string;object:string;context:string;evidence_type:string;uncertainty:string}>;contradiction_flags:string[]}>
}

function batchRows(manifest:Manifest){
 const rows:any[]=[]
 for(const part of manifest.artifact_parts||[]){
  if(!part.path?.startsWith(DIR+'/')||part.path.includes('..'))throw new Error('Unsafe reviewed semantic artifact path')
  const payload=read<{rows?:any[]}>(part.path)
  rows.push(...(payload.rows||[]))
 }
 return rows
}

export function getReviewedResearchSemanticOverlay(records:readonly SemanticRecord[]):ReviewedSemanticOverlay{
 if(!existsSync(REVIEW_DIR))return {edges:[],contradictions:[]}
 const active=new Set(records.map(r=>String(r.pmid)))
 if(!active.size)return {edges:[],contradictions:[]}
 const manifests=new Map<string,Manifest>()
 for(const name of readdirSync(DIR).filter(n=>n.endsWith('-final-manifest.json'))){
  try{const m=read<Manifest>(join(DIR,name));if(m.batch_id)manifests.set(m.batch_id,m)}catch{continue}
 }
 const edges:ReviewedSemanticEdge[]=[]
 const contradictions:ReviewedContradictionFlag[]=[]
 for(const name of readdirSync(REVIEW_DIR).filter(n=>n.endsWith('-independent-review.json'))){
  let review:Review
  try{review=read<Review>(join(REVIEW_DIR,name))}catch{continue}
  if(review.schema_version!==1||review.independent_semantic_review!==true||review.reviewed_records!==500||review.accepted_records!==500||review.rejected_records!==0)continue
  const manifest=manifests.get(review.batch_id);if(!manifest)continue
  const rows=batchRows(manifest),contentHash=digest(rows)
  if(review.batch_content_sha256!==contentHash||manifest.batch_content_sha256!==contentHash)continue
  const sourcePmids=new Set(rows.map(r=>String(r.pmid)))
  if(!Array.isArray(review.record_reviews)||review.record_reviews.length!==500||new Set(review.record_reviews.map(r=>String(r.pmid))).size!==500)continue
  for(const rr of review.record_reviews){
    const pmid=String(rr.pmid)
    if(!sourcePmids.has(pmid)||!active.has(pmid))continue
    for(const rel of rr.semantic_relationships||[]){
      const raw=[pmid,rel.subject,rel.predicate,rel.object,rel.context,rel.evidence_type,rel.uncertainty,review.batch_id].join('\0')
      edges.push({
        id:'reviewed:'+createHash('sha256').update(raw).digest('hex').slice(0,24),
        sourcePmid:pmid,subject:String(rel.subject),predicate:String(rel.predicate),object:String(rel.object),
        context:String(rel.context),evidenceType:String(rel.evidence_type),uncertainty:String(rel.uncertainty),
        reviewer:review.reviewer,reviewedAt:review.reviewed_at,batchId:review.batch_id,
        provenance:'independent-scientific-review',
      })
    }
    for(const flag of rr.contradiction_flags||[])if(String(flag).trim()){
      contradictions.push({sourcePmid:pmid,flag:String(flag).trim(),reviewer:review.reviewer,reviewedAt:review.reviewed_at,batchId:review.batch_id,provenance:'independent-scientific-review'})
    }
  }
 }
 return {
   edges:[...new Map(edges.map(e=>[e.id,e])).values()].sort((a,b)=>a.sourcePmid.localeCompare(b.sourcePmid)||a.id.localeCompare(b.id)),
   contradictions:contradictions.sort((a,b)=>a.sourcePmid.localeCompare(b.sourcePmid)||a.flag.localeCompare(b.flag)),
 }
}

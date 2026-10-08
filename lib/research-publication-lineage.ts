/**
 * Semantic System 1.03 · Publication Identity Observatory
 *
 * The site's research-quality topology already governs underlying trial
 * independence for approved claims. This client-safe, bounded bridge resolves
 * bibliographic *publication* identity only (exact PMID and exact DOI).
 *
 * No authorship/name similarity, graph co-occurrence, shared population or
 * inferred trial registry is accepted as proof of underlying study independence.
 */
export type IntakePublicationIdentity={
  pmid:string
  doi?:string
}
export type ReviewedPublicationIdentity={
  id:string
  pmid?:string
  doi?:string
}
export type PublicationIdentityCrossReference={
  intakePmid:string
  reviewedStudyIds:string[]
  evidence:'exact-pmid'|'exact-doi'
  status:'same-publication-citation-identity'
}
export type PublicationIdentityGroup={
  studyIds:string[]
  pmids:string[]
  dois:string[]
  witness:'exact-pmid'|'exact-doi'
  status:'duplicate-citation-records-not-multiple-publications'
}
export type PublicationIdentityConflict={
  studyIds:string[]
  pmids:string[]
  dois:string[]
  reason:'conflicting-pmid-or-doi-identities'
  status:'review-required-no-automatic-collapse'
}
export type PublicationLineageReport={
  sourceCount:number
  reviewedRecordCount:number
  reviewedWithExactIdentity:number
  matchedIntakePmids:number
  crossReferences:PublicationIdentityCrossReference[]
  duplicateCitationGroups:PublicationIdentityGroup[]
  identityConflicts:PublicationIdentityConflict[]
  unknownUnderlyingStudyIndependence:number
  independentlyVerifiedTrialUnits:null
  scope:'exact-publication-identifiers-only'
  status:'trial-independence-not-established'
}
const canonicalPmid=(value:unknown)=>{
  const text=typeof value==='string'?value.trim():''
  return /^\d{5,10}$/.test(text)?text:''
}
const canonicalDoi=(value:unknown)=>{
  if(typeof value!=='string')return ''
  const result=value.trim().toLowerCase()
    .replace(/^(?:https?:\/\/(?:dx\.)?doi\.org\/|doi:\s*)/,'')
    .replace(/[.\s]+$/,'')
  return /^10\.\d{4,9}\/[^\s?#]+$/i.test(result)?result:''
}
type Normalized={id:string;pmid:string;doi:string}
function compatible(left:Normalized,right:Normalized){
  return !(left.pmid&&right.pmid&&left.pmid!==right.pmid) &&
    !(left.doi&&right.doi&&left.doi!==right.doi)
}
/**
 * Pure, deterministic and fail-closed. Identity disagreement blocks an alias
 * from being counted as a duplicate or as an intake-to-reviewed match.
 */
export function buildPublicationLineageReport(
  intake:readonly IntakePublicationIdentity[],
  citations:readonly ReviewedPublicationIdentity[],
):PublicationLineageReport {
  const byId=new Map<string,Normalized>()
  const identityConflicts:PublicationIdentityConflict[]=[]
  for(const item of citations){
    const id=String(item.id||'').trim()
    if(!id)continue
    const rec={id,pmid:canonicalPmid(item.pmid),doi:canonicalDoi(item.doi)}
    const prior=byId.get(id)
    if(prior){
      if(prior.pmid!==rec.pmid||prior.doi!==rec.doi)
        throw Error('One published citation ID has conflicting source metadata')
      continue
    }
    byId.set(id,rec)
  }
  const reviewed=[...byId.values()].sort((a,b)=>a.id.localeCompare(b.id))
  const uniqueIntake=new Map<string,{pmid:string;doi:string}>()
  const byIntakeDoi=new Map<string,string>()
  for(const item of intake){
    const pmid=canonicalPmid(item.pmid)
    if(!pmid||uniqueIntake.has(pmid))throw Error('Invalid or duplicate intake PMID')
    const doi=canonicalDoi(item.doi)
    if(doi&&byIntakeDoi.has(doi))
      throw Error('Duplicate DOI inside exact-verified intake requires review')
    uniqueIntake.set(pmid,{pmid,doi})
    if(doi)byIntakeDoi.set(doi,pmid)
  }
  const groups=new Map<string,Normalized[]>()
  for(const row of reviewed){
    for(const key of [row.pmid?'pmid:'+row.pmid:'',row.doi?'doi:'+row.doi:'']){
      if(!key)continue
      if(!groups.has(key))groups.set(key,[])
      groups.get(key)!.push(row)
    }
  }
  const duplicateCitationGroups:PublicationIdentityGroup[]=[]
  const seen=new Set<string>()
  for(const [key,rows] of groups){
    if(rows.length<2)continue
    const studyIds=[...new Set(rows.map(r=>r.id))].sort()
    if(studyIds.length<2)continue
    const groupId=studyIds.join('|')
    if(seen.has(groupId))continue
    seen.add(groupId)
    const pmids=[...new Set(rows.map(r=>r.pmid).filter(Boolean))].sort()
    const dois=[...new Set(rows.map(r=>r.doi).filter(Boolean))].sort()
    if(pmids.length>1||dois.length>1){
      identityConflicts.push({studyIds,pmids,dois,
        reason:'conflicting-pmid-or-doi-identities',
        status:'review-required-no-automatic-collapse'})
      continue
    }
    duplicateCitationGroups.push({studyIds,pmids,dois,
      witness:key.startsWith('pmid:')?'exact-pmid':'exact-doi',
      status:'duplicate-citation-records-not-multiple-publications'})
  }
  const references=new Map<string,{studyIds:Set<string>;basis:Set<'exact-pmid'|'exact-doi'>}>()
  for(const row of reviewed){
    const p=row.pmid?uniqueIntake.get(row.pmid):undefined
    const d=row.doi?uniqueIntake.get(byIntakeDoi.get(row.doi)||''):undefined
    if(p&&d&&p.pmid!==d.pmid){
      identityConflicts.push({studyIds:[row.id],pmids:[row.pmid,p.pmid,d.pmid].filter(Boolean),
        dois:[row.doi],reason:'conflicting-pmid-or-doi-identities',
        status:'review-required-no-automatic-collapse'})
      continue
    }
    const target=p||d
    if(!target)continue
    const source:Normalized={id:target.pmid,pmid:target.pmid,doi:target.doi}
    if(!compatible(source,row)){
      identityConflicts.push({studyIds:[row.id],pmids:[row.pmid,target.pmid].filter(Boolean),
        dois:[row.doi,target.doi].filter(Boolean),
        reason:'conflicting-pmid-or-doi-identities',
        status:'review-required-no-automatic-collapse'})
      continue
    }
    if(!references.has(target.pmid))references.set(target.pmid,{studyIds:new Set(),basis:new Set()})
    references.get(target.pmid)!.studyIds.add(row.id)
    references.get(target.pmid)!.basis.add(p?'exact-pmid':'exact-doi')
  }
  const crossReferences=[...references].map(([intakePmid,link])=>({
    intakePmid,reviewedStudyIds:[...link.studyIds].sort(),
    evidence:(link.basis.has('exact-pmid')?'exact-pmid':'exact-doi') as 'exact-pmid'|'exact-doi',
    status:'same-publication-citation-identity' as const,
  })).sort((a,b)=>a.intakePmid.localeCompare(b.intakePmid))
  return {
    sourceCount:uniqueIntake.size,reviewedRecordCount:reviewed.length,
    reviewedWithExactIdentity:reviewed.filter(r=>r.pmid||r.doi).length,
    matchedIntakePmids:crossReferences.length,crossReferences,
    duplicateCitationGroups:duplicateCitationGroups.sort((a,b)=>a.studyIds[0].localeCompare(b.studyIds[0])),
    identityConflicts:identityConflicts.sort((a,b)=>a.studyIds[0].localeCompare(b.studyIds[0])),
    unknownUnderlyingStudyIndependence:reviewed.length,
    independentlyVerifiedTrialUnits:null,
    scope:'exact-publication-identifiers-only',
    status:'trial-independence-not-established',
  }
}

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const sha = (value) => crypto.createHash('sha256').update(value).digest('hex')
const valid = (name) => /^[a-z][a-z0-9-]{1,60}$/.test(String(name??''))
const versionOk = (v) => /^[a-z][a-z0-9-]*-v[1-9]\d*$/.test(String(v??''))
const hex = /^[a-f0-9]{64}$/i
const kinds = new Set(['hook','beat-skeleton','caption-style','actor-style'])
const allowedChanges = {hook:'hook-structure','beat-skeleton':'beat-order',
  'caption-style':'caption-style','actor-style':'visual-layout'}
function immutable(file, value) {
  const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n')
  fs.mkdirSync(path.dirname(file),{recursive:true})
  if (fs.existsSync(file)) {
    if (Buffer.compare(fs.readFileSync(file),bytes)!==0) throw Error('R8.11 component version is immutable')
    return {file,sha256:sha(bytes),existing:true}
  }
  fs.writeFileSync(file,bytes,{flag:'wx',mode:0o444})
  return {file,sha256:sha(bytes),existing:false}
}
export function registerR811ComponentVersion(flywheelRoot,{proposalId,kind,fromComponentVersion,toComponentVersion,
  previousTemplateContentSha256,newTemplateContentSha256}) {
  if (!valid(proposalId)||!kinds.has(kind)||!versionOk(fromComponentVersion)||!versionOk(toComponentVersion)
    ||fromComponentVersion===toComponentVersion
    ||!fromComponentVersion.startsWith(kind+'-')||!toComponentVersion.startsWith(kind+'-')
    ||!hex.test(previousTemplateContentSha256)||!hex.test(newTemplateContentSha256)
    ||previousTemplateContentSha256===newTemplateContentSha256) {
    throw Error('R8.11 component version must identify a real changed visual/template asset')
  }
  const root=path.resolve(flywheelRoot)
  const pBytes=fs.readFileSync(path.join(root,'template-proposals',proposalId+'.json'))
  const aBytes=fs.readFileSync(path.join(root,'template-approvals',proposalId+'.json'))
  const p=JSON.parse(pBytes),a=JSON.parse(aBytes)
  if(a.decision!=='approved'||a.proposalSha256!==sha(pBytes)
    ||a.proposalId!==proposalId||!a.reviewerId
    ||a.appliesToInFlight!==false||p.appliesToInFlight!==false
    ||p.autoApplyAllowed!==false||p.changeType!==allowedChanges[kind]) {
    throw Error('R8.11 component upgrade needs a human-approved, empirical flywheel proposal of the right type')
  }
  if(!Number.isFinite(p.data?.viewDeltaPercent) || !p.data?.cohortSizes?.before ||
      !p.data?.cohortSizes?.after) throw Error('R8.11 version lineage needs observed cohort delta')
  const version={schemaVersion:'ths-evidencemotion-r811-component-version-v1',
    componentType:kind,version:toComponentVersion,parentVersion:fromComponentVersion,
    priorContentSha256:previousTemplateContentSha256,currentContentSha256:newTemplateContentSha256,
    sourceProposalSha256:sha(pBytes),sourceApprovalSha256:sha(aBytes),
    measuredViewDeltaPercent:p.data.viewDeltaPercent,
    measuredFollowConversionDeltaPercentagePoints:p.data.followConversionDeltaPercentagePoints,
    cohortSizes:p.data.cohortSizes,reviewerId:a.reviewerId,
    approvedAt:a.approvedAt,scienceBoundary:p.scienceBoundary,
    activation:'future-videos-only',retroactiveChangeAllowed:false,
    autoApply:false,autoPublish:false,templatePerformanceIsNotScientificQuality:true}
  return immutable(path.join(root,'component-versions',kind,toComponentVersion+'.json'),version)
}
export function getR811ComponentLineage(root,kind){
  if(!kinds.has(kind))throw Error('R8.11 component kind invalid')
  const dir=path.join(path.resolve(root),'component-versions',kind)
  if(!fs.existsSync(dir))return []
  return fs.readdirSync(dir).filter(x=>/\.json$/.test(x)).sort().map(x=>JSON.parse(fs.readFileSync(path.join(dir,x),'utf8')))
}

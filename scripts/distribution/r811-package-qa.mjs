import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { buildR811Receipt } from './r811-creative-operations.mjs'
import { verifyR811DraftAssets } from './r811-derived-assets.mjs'

const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')
export function verifyR811Package(dir, { manifest = null } = {}) {
  const root = path.resolve(dir)
  const m = manifest || JSON.parse(fs.readFileSync(path.join(root,'video-asset-manifest.json'),'utf8'))
  if (m.productionSystemRelease !== 'R8.11') return null
  if (m.creativeMethodRelease !== 'R8.10' || m.creativeR810?.status !== 'approved') {
    throw Error('R8.11 does not run without exact approved R8.10 scientific methodology')
  }
  if (m.r811Plan?.file !== 'r811-experiment-plan.json' ||
      !/^[a-f0-9]{64}$/.test(String(m.r811Plan?.sha256||''))) {
    throw Error('R8.11 missing exact experiment-plan sidecar hash')
  }
  const bytes = fs.readFileSync(path.join(root,m.r811Plan.file))
  if (sha(bytes) !== m.r811Plan.sha256) throw Error('R8.11 local experiment plan bytes changed after package build')
  const plan = JSON.parse(bytes.toString('utf8'))
  const receipt = buildR811Receipt(plan, {creativeR810:m.creativeR810})
  if (JSON.stringify(receipt) !== JSON.stringify(m.r811Experiment)) {
    throw Error('R8.11 one-experiment SHA receipt differs from the exact reviewed input')
  }
  if (plan.zeroCost.meteredCreditsAllowed !== false || receipt.publishingPermission !== false) {
    throw Error('R8.11 cannot acquire hosted generation credits or upload permissions')
  }
  if (m.sourceUrl !== plan.provenanceCard.canonicalSourceUrl) {
    throw Error('R8.11 source trust card URL differs from canonical governed video source')
  }
  const source = m.assets?.filter(a=>a.role==='source') || []
  if (source.length!==1 || source[0].spoken!==false) throw Error('R8.11 requires the inherited silent source-ledger end-card')
  const assets = verifyR811DraftAssets(root,m)
  return { experimentId:receipt.experimentId,oneExperiment:true,planSha256:receipt.planSha256,
    planFileSha256:sha(bytes),derivativeProof:assets,zeroPaidCredits:true,
    publicationPermission:false }
}

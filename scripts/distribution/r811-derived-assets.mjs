import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { buildR811Receipt, verifyR811Receipt } from './r811-creative-operations.mjs'

const sha = (data) => crypto.createHash('sha256').update(data).digest('hex')
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (x) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[x]))
const clean = (value) => String(value ?? '').trim().replace(/\s+/g, ' ')
const leaf = (file) => {
  if (!/^[a-z0-9][a-z0-9._-]+$/i.test(file)) throw Error('R8.11 invalid child filename')
  return file
}
function write(dir, filename, body) {
  const bytes = Buffer.from(body)
  fs.writeFileSync(path.join(dir, leaf(filename)), bytes)
  return { file: filename, sha256: sha(bytes), bytes: bytes.length }
}
function trustedCard(plan, headline, detail) {
  const url = new URL(plan.provenanceCard.canonicalSourceUrl)
  if (!['https:', 'http:'].includes(url.protocol)) throw Error('R8.11 canonical evidence URL must be a web URL')
  const title = clean(headline).slice(0, 68)
  const note = clean(detail).slice(0, 75)
  return '<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920" role="img" aria-label="Evidence sourced preview">' +
    '<rect width="1080" height="1920" fill="#102126"/>' +
    '<rect x="80" y="165" width="920" height="1550" rx="54" fill="#182e31" stroke="#69b7a2" stroke-width="5"/>' +
    '<text x="130" y="340" font-family="sans-serif" font-size="42" fill="#a5dccc">THE HIPPIE SCIENTIST</text>' +
    '<text x="130" y="545" font-family="sans-serif" font-size="49" fill="#ffffff">' + esc(title) + '</text>' +
    '<text x="130" y="650" font-family="sans-serif" font-size="36" fill="#dbefea">' + esc(note) + '</text>' +
    '<text x="130" y="1035" font-family="sans-serif" font-size="39" fill="#a5dccc">Source-linked, reviewed as of</text>' +
    '<text x="130" y="1110" font-family="sans-serif" font-size="50" fill="#ffffff">' + esc(plan.provenanceCard.claimsVerifiedAt) + '</text>' +
    '<text x="130" y="1515" font-family="sans-serif" font-size="25" fill="#bcd6d2">' + esc(url.hostname + url.pathname).slice(0, 82) + '</text>' +
    '<text x="130" y="1600" font-family="sans-serif" font-size="22" fill="#bcd6d2">Exact source and scientific caveats belong in the reviewed master.</text>' +
    '<text x="130" y="1800" font-family="sans-serif" font-size="25" fill="#ffffff">DRAFT • NOT FOR PUBLICATION</text>' +
    '</svg>'
}
export function buildR811DraftAssets({ packageDir, plan, creativeR810, firstHookScene, renderScene,
  sourceUrl, contentHash, disclosure, r812Enabled = false }) {
  const dir = path.resolve(packageDir)
  const receipt = buildR811Receipt(plan, { creativeR810 })
  verifyR811Receipt(plan, receipt, { creativeR810 })
  if (firstHookScene?.role !== 'hook' || !clean(firstHookScene.voiceover) ||
      !clean(sourceUrl) || !clean(contentHash) || !clean(disclosure) || typeof renderScene !== 'function') {
    throw Error('R8.11 cannot derive approved hook previews without exact original hook scene and source')
  }
  const selected = plan.hookVariants.find(v => v.id === plan.chosenHookId)
  if (clean(firstHookScene.voiceover) !== clean(selected.narration) || clean(firstHookScene.onScreenText) !== clean(selected.screenText)) {
    throw Error('R8.11 selected experiment hook is not the actual rendered main-video hook')
  }
  if (Number(firstHookScene.speechEnd) - Number(firstHookScene.start) > 3.001) {
    throw Error('R8.11 claimed first-three-second hook must end speaking within three seconds')
  }
  fs.mkdirSync(dir, { recursive: true })
  const previewAssets = []
  const approachByArm = {a:'question',b:'contrast',c:'reveal'}
  for (const variant of plan.hookVariants) {
    const preview = renderScene({
      ...firstHookScene, onScreenText: variant.screenText, voiceover: variant.narration,
      motionType: 'highlight', role: 'hook',
    }, { sourceUrl, contentHash, disclosure, creativeMethodRelease:'R8.10', motionPhase:'post' })
    if (!preview?.svg?.startsWith('<svg') || !preview.svg.includes('</svg>')) throw Error('R8.11 source renderer returned invalid hook preview SVG')
    // This draft is a visual storyboard. Replacement spoken audio and final
    // word alignment are mandatory before it can be posted as a true A/B arm.
    const approach = r812Enabled ? approachByArm[variant.id] : null
    const r812Graphic = approach === 'question'
      ? '<g data-r812-hook-approach="question"><text x="820" y="660" fill="#69b7a2" font-size="210">?</text></g>'
      : approach === 'contrast'
        ? '<g data-r812-hook-approach="contrast"><rect x="160" y="600" width="330" height="200" rx="35" stroke="#69b7a2" fill="none" stroke-width="9"/><rect x="590" y="600" width="330" height="200" rx="35" stroke="#e2ac69" fill="none" stroke-width="9"/></g>'
        : approach === 'reveal'
          ? '<g data-r812-hook-approach="reveal"><circle cx="540" cy="705" r="110" fill="none" stroke="#69b7a2" stroke-width="18"/><path d="M450 700 l80 75 l130 -170" stroke="#e2ac69" stroke-width="18" fill="none"/></g>' : ''
    const draft = preview.svg.replace('</svg>',
      r812Graphic + '<text x="120" y="1850" font-size="26" fill="#ffffff">A/B VISUAL DRAFT • NOT FOR PUBLICATION</text></svg>')
    const file = write(dir, 'r811-hook-' + variant.id + '-preview.svg', draft + '\n')
    previewAssets.push({ ...file, variantId: variant.id, approach: approach ?? 'legacy-draft',
      narrationSha256: sha(clean(variant.narration)),
      scienceReviewSha256: sha(JSON.stringify(variant.reviewReceipt)),
      spokenAudio: false, published: false, needsIndependentAudioAndMasterQa: true })
  }
  const chosen = plan.hookVariants.find(v => v.id === plan.chosenHookId)
  const cover = write(dir, 'r811-evidence-cover-preview.svg',
    trustedCard(plan, chosen.screenText, 'Research context and limitations matter.') + '\n')
  const trust = write(dir, 'r811-evidence-trust-card.svg',
    trustedCard(plan, 'Read the evidence', 'As-of source review, not a promotional rating.') + '\n')
  const outputs = [
    { type:'full-video',status:'depends-on-R8.10-exact-master-QA',requiresHumanApproval:true },
    ...previewAssets.map(x => ({ type:'hook-variant-' + x.variantId, ...x, status:'visual-draft-only' })),
    { type:'teaser-work-order',status:'no-encoded-cutdown-yet',requiresHumanApproval:true,requiresSourceAndSafetyContext:true },
    { type:'cover-preview',status:'visual-draft-only',requiresHumanApproval:true,...cover },
    { type:'source-trust-card',status:'visual-draft-only',requiresHumanApproval:true,...trust },
  ]
  const workOrder = {
    schemaVersion:'ths-evidencemotion-r811-derivatives-v1',
    sourcePacketSha256:plan.sourcePacketSha256,
    inheritedR810PlanSha256:plan.r810GovernedPlanSha256,
    r811PlanSha256:receipt.planSha256,
    selectedHookId:plan.chosenHookId,
    allOutputsShareOneApprovedEvidencePacket:true,
    outputFiles:outputs,
    publicationAuthority:false,
    autoPublishing:false,
    noPaidCredits:true,
    teaserSafety:'Copy source caveats/disclosures or require a separate reviewed narration. No unreviewed claim cropping.',
  }
  const workOrderFile = write(dir,'r811-derivative-workorders.json',JSON.stringify(workOrder,null,2)+'\n')
  return { receipt, workOrderFile, previewAssets, cover, trust, outputs }
}
export function verifyR811DraftAssets(packageDir, manifest) {
  const dir = path.resolve(packageDir)
  if (manifest.productionSystemRelease !== 'R8.11') return null
  const doc = manifest.r811Derivatives
  if (!doc || !/^[a-f0-9]{64}$/.test(doc.sha256) || doc.file !== 'r811-derivative-workorders.json' ||
      manifest.r811Experiment?.planSha256 !== doc.planSha256) throw Error('R8.11 derived work-order provenance is missing or stale')
  const bytes = fs.readFileSync(path.join(dir,doc.file))
  if (sha(bytes) !== doc.sha256) throw Error('R8.11 derivative work-order bytes differ from manifest')
  const parsed = JSON.parse(bytes)
  if (parsed.r811PlanSha256 !== manifest.r811Experiment.planSha256 || parsed.autoPublishing !== false ||
      parsed.noPaidCredits !== true) throw Error('R8.11 derivative bundle claims unauthorized publication or spending')
  for (const result of parsed.outputFiles) {
    if (!result.file) continue
    if (!/^[a-z0-9][a-z0-9._-]+$/i.test(result.file) ||
        sha(fs.readFileSync(path.join(dir,result.file))) !== result.sha256) throw Error('R8.11 visual derivative content changed')
  }
  return { workOrderSha256: sha(bytes), totalAssets:parsed.outputFiles.filter(x => x.file).length }
}

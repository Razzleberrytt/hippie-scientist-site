// R8.17 canonical-first-pass quality gates: source-bound, deterministic, owner-first.

// No new evidence authority, narrator substitution or auto-publishing.
import { assertR817RetentionPlan, assessR817RetentionMaster } from './r817-retention-gates.mjs'
import { assertR817RenderedActionProof } from './r817-rendered-evidence.mjs'
import { assertR817AlignmentAudit } from './r817-alignment-qa.mjs'
import { assertR818TelemetryBinding } from './r818-telemetry-qa.mjs'
import { assessEvidenceMotionAudienceQuality } from './evidencemotion-audience-quality.mjs'

export const R817_CANONICAL = Object.freeze({
  "schemaVersion": "ths-evidencemotion-r817-first-pass-v1",
  "output": {
    "width": 1080,
    "height": 1920,
    "fps": 30,
    "audioCodec": "aac",
    "audioSampleRate": 44100,
    "audioChannels": 2
  },
  "voice": {
    "engine": "kokoro-onnx",
    "engineVersion": "0.6.1",
    "name": "am_michael",
    "modelSha256": "ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c",
    "voicebankSha256": "bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d"
  }
});

const R817=R817_CANONICAL;

function normalize(v){return String(v??"").trim().replace(/\s+/g," ");}

function hex64(v){return /^[a-f0-9]{64}$/.test(String(v??""));}

export function assertR817FirstPass(plan,manifest){
  const errors=[],p=plan??{},m=manifest??{};
  const fail=(why)=>errors.push(why);
  if(p.schemaVersion!==R817.schemaVersion) fail("R8.17 incorrect canonical first-pass schema");
  if(p.status!=="review-ready")fail("R8.17 preflight needs review-ready authored plan; no silent approval");
  if(!/^https:\/\//.test(normalize(p.sourceUrl))||!hex64(p.sourceContentHash))fail("R8.17 source URL and exact source-content hash required");
  if(normalize(p.sourceUrl)!==normalize(m.sourceUrl)||p.sourceContentHash!==m.sourceContentHash)fail("R8.17 plan/source manifest identity mismatch");
  if(!hex64(p.reviewedClaimLedgerSha256)||normalize(p.scientificReviewAuthority)!=="upstream-evidence-ledger")fail("R8.17 claim ledger must bind an upstream reviewed source, not rewrite scientific claims");
  for(const [key,value] of Object.entries(R817.output)){if(p.output?.[key]!==value)fail("R8.17 canonical mobile output mismatch: "+key);}
  for(const [key,value] of Object.entries(R817.voice)){if(p.voice?.[key]!==value)fail("R8.17 pinned original Kokoro narrator mismatch: "+key);}
  if(p.voice?.fallbackAllowed!==false)fail("R8.17 forbids alternate/robot narration");
  const claims=new Map();
  if(!Array.isArray(p.claims)||!p.claims.length)fail("R8.17 must bind at least one reviewed evidence claim");
  for(const c of Array.isArray(p.claims)?p.claims:[]){
    const id=normalize(c?.id);
    if(!id||claims.has(id))fail("R8.17 duplicate or empty claim identity");
    if(!normalize(c?.sourceId)||!normalize(c?.statement)||!hex64(c?.verifiedSourceSha256))fail("R8.17 claim missing source/statement/verified source hash");
    if(c?.displayValue!==undefined && (!normalize(c?.displayValue)||!normalize(c?.denominator)||!normalize(c?.evidenceTier)))fail("R8.17 numeric claim needs exact display, denominator and evidence tier");
    claims.set(id,c);
  }
  if(!Array.isArray(p.beats)||p.beats.length<3)fail("R8.17 requires >=3 purpose-built semantic beats");
  let next=0,hasDepth=false,hasMeaningful3D=false,hasCta=false;
  const beatIds=new Set();
  for(const b of Array.isArray(p.beats)?p.beats:[]){
    const id=normalize(b?.id),start=Number(b?.start),end=Number(b?.end);
    if(!id||beatIds.has(id))fail("R8.17 duplicate or missing beat identity");
    beatIds.add(id);
    if(!Number.isFinite(start)||!Number.isFinite(end)||Math.abs(start-next)>0.002||!(end>start)||end-start>8.01)fail("R8.17 bad, static or discontinuous beat: "+id);
    next=end;
    if(!normalize(b?.visualObject?.name)||["placeholder","question-mark-bottle","flat-rectangle","floating-spheres","unlabeled-blob"].includes(b?.visualObject?.kind))fail("R8.17 missing recognizable, named science object: "+id);
    if(!normalize(b?.semanticAction)||/^(hold|show|slide|generic|zoom)$/i.test(normalize(b?.semanticAction)))fail("R8.17 beat must show a meaningful action, not an empty slide: "+id);
    if(!Array.isArray(b?.depthPlanes)||["far","mid","near"].some(x=>!b.depthPlanes.includes(x)))fail("R8.17 multi-plane 2.5D/3D composition missing: "+id);
    else hasDepth=true;
    if(b?.artMethod==="rendered-3d"){
      hasMeaningful3D=true;
      if(!hex64(b?.visualObject?.assetSha256)||!["vtk","blender","webgl","threejs"].includes(b?.renderEngine)||b?.visualObject?.isValidatedDocking===true)fail("R8.17 real 3D needs render identity, model hash, and no invented docking proof: "+id);
      if(/receptor|molecule|binding/i.test(normalize(b?.visualObject?.name))&&!normalize(b?.symbolicLimitLabel))fail("R8.17 illustrative molecular 3D needs visible symbolic limitation: "+id);
    } else if(b?.artMethod!=="cinematic-2.5d")fail("R8.17 visual method must be authored 2.5D or rendered 3D: "+id);
    if(b?.visualObject?.kind==="receptor-binding" && (b?.semanticAction!=="ligand-enters-pocket"||b?.bindingPocketVisible!==true||b?.ligandMotionVisible!==true))fail("R8.17 receptor action must visibly dock into a pocket: "+id);
    const spoken=normalize(b?.narrationText),caption=normalize(b?.captionText);
    if(spoken!==caption)fail("R8.17 caption must match exact owned narration, not adjacent scene or paraphrase: "+id);
    if(!spoken&&b?.silentEvidenceBeat!==true)fail("R8.17 missing narration requires explicitly silent evidence beat: "+id);
    if(!spoken&&b?.claimedWordAlignment===true)fail("R8.17 silent beat cannot claim word-level alignment: "+id);
    const used=Array.isArray(b?.claimIds)?b.claimIds:[];
    if(b?.numericVisual){
      const nv=b.numericVisual,c=claims.get(nv.claimId);
      if(!used.includes(nv.claimId)||!c||c.displayValue===undefined)fail("R8.17 number is not linked to a verified claim: "+id);
      else {
        if(nv.finalDisplay!==c.displayValue || normalize(nv.denominator)!==normalize(c.denominator))fail("R8.17 exact numeric graphic/denominator drift: "+id);
        if(normalize(nv.sourceId)!==normalize(c.sourceId))fail("R8.17 number source citation mismatch: "+id);
      }
      if(nv.animation==="count-up"&&!(nv.settleSeconds>=1&&nv.transientCue==="COUNTING"&&nv.finalFrameProofRequired===true))fail("R8.17 count-up must settle on exact bound value with a visible transient cue: "+id);
      if(!["fixed","count-up"].includes(nv.animation))fail("R8.17 unsupported number-animation mode: "+id);
      if(nv.legacyValue!==undefined||nv.startValue!==undefined||nv.freehandValue!==undefined)fail("R8.17 numbers must be generated from canonical claim value, not placeholders: "+id);
    }
    for(const usedId of used)if(!claims.has(usedId))fail("R8.17 scene cites an unregistered claim: "+id);
    if(['hook','mechanism','evidence','finding','safety','limitation'].includes(b?.role)&&used.length===0)
      fail("R8.17 substantive scientific beat needs source-bound claim IDs: "+id);
    for(const usedId of used){
      const c=claims.get(usedId);
      if(c && (!Array.isArray(b?.onScreenSourceIds)||!b.onScreenSourceIds.includes(c.sourceId)))
        fail("R8.17 each scientific beat must display its exact own source footer: "+id);
    }
    if(/\bdeaths?\b|\bfatalit/i.test(spoken+" "+normalize(b?.onScreenText))&&used.some(x=>claims.get(x)?.sourceType==="regulatory-signal")&&!/fda|regulator|safety signal/i.test(normalize(b?.sourceAttribution)))fail("R8.17 regulator death warning must display explicit FDA/signal attribution: "+id);
    if(b?.role==="cta")hasCta=true;
    if(/science\s*[/|]\s*signal\s*[/|]\s*context|00\d\s*[/|]\s*evidence/i.test(normalize(b?.onScreenText)))fail("R8.17 bans ornamental HUD and meaningless footer: "+id);
  }
  if(next<5||next>60)fail("R8.17 must fit 5–60 seconds of authored voice-first video");
  if(!hasDepth)fail("R8.17 cinematic depth is absent");
  if(p.artisticDirection?.ownerFirst!==true||p.artisticDirection?.noPrimitivePlaceholders!==true)fail("R8.17 owner-first cinematic quality brief missing");
  if(p.artisticDirection?.requires3D===true&&!hasMeaningful3D)fail("R8.17 declared 3D requirement was silently replaced by flat artwork");
  if(!hasCta)fail("R8.17 requires an intentional closing CTA");
  try { assertR817RetentionPlan(p) } catch (e) { fail(e.message) }
  if(errors.length)throw Error(errors.join("\n"));
  return {schemaVersion:R817.schemaVersion,videoId:normalize(p.videoId),sourceUrl:p.sourceUrl,claimCount:claims.size,beatCount:p.beats.length,passesSemanticPreflight:true,publicationApproved:false,ownerVisualApproval:false,independentVVerified:false};
}

export function assessR817EncodedMaster(receipt){
  const r=receipt??{},errors=[];
  if(!hex64(r.outputSha256)||!hex64(r.sourcePlanSha256))errors.push("R8.17 final encoded/master plan SHA-256 missing");
  if(r.video?.codec!=="h264"||r.video?.width!==1080||r.video?.height!==1920||r.video?.fps!==30||r.video?.decoded!==true)errors.push("R8.17 final native 1080p H264@30 decode required");
  if(r.audio?.codec!=="aac"||r.audio?.sampleRate!==44100||r.audio?.channels!==2||r.audio?.decodedAudible!==true)errors.push("R8.17 final mobile AAC stereo decode required");
  if(!Number.isFinite(r.audio?.integratedLufs)||Math.abs(r.audio.integratedLufs+14)>1.5||!Number.isFinite(r.audio?.truePeakDbfs)||r.audio.truePeakDbfs>-.1)errors.push("R8.17 final AAC loudness/true peak outside governed target");
  if(r.originalVoice?.engine!=="kokoro-onnx"||r.originalVoice?.name!=="am_michael"||r.originalVoice?.voicebankSha256!==R817.voice.voicebankSha256||r.originalVoice?.modelSha256!==R817.voice.modelSha256)errors.push("R8.17 exact archived narrator proof missing");
  if(r.nativeArt?.minSourceWidth<1080||r.nativeArt?.minSourceHeight<1920||r.nativeArt?.wasUpscaled===true)errors.push("R8.17 native source art resolution not proved");
  if(r.visualProof?.allClaimRestingFramesChecked!==true||r.visualProof?.allCaptionSafeAreasChecked!==true||r.visualProof?.receptorWasSymbolicAndLabeled===false)errors.push("R8.17 scene-by-scene final-pixel science/safe-area review missing");
  if(errors.length)throw Error(errors.join("\n"));
  const blockers=[];
  if(r.captionProof?.type!=="mfa-offline-reviewed")blockers.push("independent exact-audio word alignment pending");
  if(r.motionProof?.outputSha256!==r.outputSha256||!hex64(r.motionProof?.sampledRawFramesSha256))
    blockers.push("exact-master motion frame SHA/output binding missing");
  if(r.hookFrames?.outputSha256!==r.outputSha256)
    blockers.push("exact-master muted-twist frame identity missing");
  if(r.ctaProof?.outputSha256!==r.outputSha256||
      r.ctaProof?.primaryVisible!==true||r.ctaProof?.secondaryVisible!==true||
      r.ctaProof?.safetyPrimary!==true)
    blockers.push("exact-master safety CTA and sourced secondary open loop pixel verification missing");
  try {
    const retention=assessR817RetentionMaster({
      motion:r.motionProof,hookFrames:r.hookFrames,muteTest:r.muteTest,
      captionProof:r.captionProof,captionPixelProof:r.captionPixelProof,
      ctaProof:r.ctaProof,outputSha256:r.outputSha256,authorId:r.approvedPlan?.authorId,
      alignmentProof:r.alignmentProof
    });
    blockers.push(...retention.blockers);
  } catch (error) {
    blockers.push("R8.17 encoded-master retention proof invalid: "+error.message);
  }
  try {
    const t=r.rendererTelemetry
    if(t?.outputSha256!==r.outputSha256||!hex64(t?.sidecarSha256)||
       t.sidecarSha256!==r.telemetrySidecarSha256)
      throw Error('R8.18 exact-master/telemetry sidecar hash mismatch')
    assertR818TelemetryBinding(r.approvedPlan,t.telemetry,{
      rendererCodeSha256:t.rendererCodeSha256,
      renderedSceneAssetsSha256:t.renderedSceneAssetsSha256
    })
  }catch(error){blockers.push("R8.18 native geometric telemetry missing: "+error.message)}
  try {
    assertR817RenderedActionProof(r.approvedPlan,r.renderedActionProof,r.outputSha256);
  }catch(error){blockers.push(error.message)}
  try {
    assertR817AlignmentAudit(r.alignmentProof,r.narrationWavSha256);
    if(r.alignmentProof?.reviewerId===r.approvedPlan?.authorId)
      blockers.push("MFA audit cannot be approved by its plan author");
  }catch(error){blockers.push(error.message)}
  // Audience interest is a separate evidence question from correct encoding,
  // scientific validity, and aligned speech. Default to HOLD, never to praise.
  const audienceQuality=assessEvidenceMotionAudienceQuality({
    filmSha256:r.outputSha256,
    audienceBrief:r.audienceBrief,
    decodedPixelReview:r.audiencePixelReview,
    independentCritics:r.audienceCritics,
    observedPerformance:r.observedPerformance
  });
  if(audienceQuality.decision!=='APPROVED'){
    blockers.push('audience-quality independent full-film review not approved: '+audienceQuality.decision);
    blockers.push(...audienceQuality.timecodedRepairTargets);
  }
  if(r.ownerDeviceReview?.status!=="accepted")blockers.push("owner iPhone visual/listening acceptance pending");
  if(r.independentScientificReview?.status!=="approved")blockers.push("independent exact-master scientific review pending");
  if(r.ownerPublicationApproval!==true)blockers.push("owner publication approval pending");
  return {technicalPassed:true,technicalMeaning:'CORE_MEDIA_FORMAT_ONLY_NOT_AUDIENCE_APPROVAL',
    audienceQuality, audienceQualityPassed:audienceQuality.audienceQualityApproved,
    postingRecommendationAllowed:blockers.length===0&&audienceQuality.mayRecommendPosting,
    publicationReady:blockers.length===0,blockers,autoPublished:false,
    independentVVerified:r.independentScientificReview?.reviewer==="V"&&r.independentScientificReview?.status==="approved"};
}



// Compare the storyboard against what the existing video producer *actually* rendered.
export function assertR817SceneBinding(plan,scenes) {
  const p=plan??{},rendered=Array.isArray(scenes)?scenes:[];
  if(!Array.isArray(p.beats)||p.beats.length!==rendered.length)throw Error("R8.17 approved storyboard/rendered scene inventory mismatch");
  for(let i=0;i<rendered.length;i++){
    const a=p.beats[i],b=rendered[i],id=String(a.id??"");
    if(id!==String(b.beatId??"")||a.role!==b.role||Math.abs(Number(a.start)-Number(b.start))>0.002||Math.abs(Number(a.end)-Number(b.end))>0.002)throw Error("R8.17 rendered scene identity or timing drift: "+id);
    if(String(a.narrationText??"").replace(/\s+/g," ").trim()!==String(b.voiceover??"").replace(/\s+/g," ").trim())throw Error("R8.17 rendered scene narration does not match its approved beat: "+id);
    if(String(a.onScreenText??"").trim()!==String(b.onScreenText??"").trim())throw Error("R8.17 authored headline differs from approved scene: "+id);
    if(a.numericVisual){
      if(!String(b.onScreenText??"").includes(a.numericVisual.finalDisplay)||!String(b.onScreenText??"").includes(a.numericVisual.denominator))throw Error("R8.17 actual on-screen headline missing exact verified number/denominator: "+id);
    }
  }
  return true;
}

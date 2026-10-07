import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const configPath = path.join(root, 'config', 'social-production-sovereignty.json')
const policyPath = path.join(root, 'docs', 'social-production-sovereignty.md')

function fail(message) {
  console.error('[social-production-sovereignty] FAIL:', message)
  process.exitCode = 1
}

if (!fs.existsSync(configPath)) {
  fail('missing config/social-production-sovereignty.json')
} else {
  const cfg = JSON.parse(fs.readFileSync(configPath, 'utf8'))

  if (cfg.release !== 'R8.04') fail('canonical release must be R8.04')
  if (cfg.critical_path?.requires_paid_membership !== false) fail('paid membership may not be required')
  if (cfg.critical_path?.requires_metered_credits !== false) fail('metered credits may not be required')
  if (cfg.critical_path?.requires_hosted_generation !== false) fail('hosted generation may not be required')
  if (cfg.critical_path?.manual_upload_capable !== true) fail('manual-upload-capable path is required')
  if (cfg.voice?.allow_basic_system_tts !== false) fail('basic/robotic system TTS must remain disallowed')
  if (cfg.voice?.natural_presence_required !== true) fail('Natural Presence must remain a hard voice gate')
  if (cfg.publication?.baseline_transport !== 'manual_native_upload') fail('manual native upload must be the baseline transport')
  if (cfg.publication?.third_party_scheduler_required !== false) fail('third-party schedulers may not be required')
  if (cfg.publication?.provider_identity_is_canonical !== false) fail('provider identity may not be canonical')

  const forbidden = [
    'descript',
    'hosted_tts_credits',
    'hosted_image_generation_credits',
    'hosted_video_generation_credits',
  ]
  for (const key of forbidden) {
    if (cfg.providers?.[key] !== 'forbidden_critical_path') {
      fail(`${key} must remain forbidden in the critical path`)
    }
  }

  if (cfg.providers?.metricool !== 'forbidden_new_creation_or_scheduling') {
    fail('Metricool must remain forbidden for new creation or scheduling')
  }

  const recovery = new Set(cfg.voice?.allowed_recovery ?? [])
  for (const required of ['local_regenerate', 'local_model_switch', 'authorized_human_recording', 'fail_closed']) {
    if (!recovery.has(required)) fail(`voice recovery is missing ${required}`)
  }

  if (cfg.failure_semantics?.quality !== 'fail_closed') fail('quality must fail closed')
  if (cfg.failure_semantics?.dependency !== 'never_fail_open_to_paid_provider') {
    fail('dependency failures must never fail open to a paid provider')
  }
}

if (!fs.existsSync(policyPath)) {
  fail('missing docs/social-production-sovereignty.md')
} else {
  const policy = fs.readFileSync(policyPath, 'utf8')
  for (const marker of [
    'manual native upload',
    'A basic OS/system voice is not an acceptable production fallback',
    'There is no sixth step that silently buys, spends, or requests credits',
    'Quality may fail closed. Dependencies may not fail open.'
  ]) {
    if (!policy.includes(marker)) fail(`policy missing required invariant: ${marker}`)
  }
}

function readRequired(relativePath) {
  const file = path.join(root, relativePath)
  if (!fs.existsSync(file)) {
    fail(`missing governed production surface: ${relativePath}`)
    return ''
  }
  return fs.readFileSync(file, 'utf8')
}

const videoPackage = readRequired('scripts/distribution/render-vertical-video-package.mjs')
for (const marker of [
  "narration-script.json",
  "ths-local-narration-script-v1",
  "localVoiceRequired: true",
  "premiumProviderFallbackAllowed: false",
]) {
  if (!videoPackage.includes(marker)) fail(`vertical video package lost local narration contract: ${marker}`)
}

const mp4Renderer = readRequired('scripts/distribution/render-vertical-video-mp4.mjs')
for (const marker of [
  "verifyLocalNarration",
  "vertical-video-mp4-v2-r804",
  "audio: true",
  "audioCodec: 'aac'",
  "local-open-source",
  "Natural Presence and pronunciation must pass",
]) {
  if (!mp4Renderer.includes(marker)) fail(`MP4 renderer lost R8.04 audio invariant: ${marker}`)
}
if (mp4Renderer.includes("'-an'") || mp4Renderer.includes('"-an"')) {
  fail('R8.04 MP4 renderer may not disable audio with -an')
}

const publisherStage = readRequired('scripts/distribution/stage-publication-media.mjs')
for (const marker of [
  "vertical-video-mp4-v2-r804",
  "receipt.profile?.audio !== true",
  "engineKind) !== 'local-open-source'",
  "naturalPresence) !== 'pass'",
  "pronunciation) !== 'pass'",
]) {
  if (!publisherStage.includes(marker)) fail(`THS Publisher staging lost local-audio release gate: ${marker}`)
}

const localVoice = readRequired('scripts/distribution/render-local-narration.py')
for (const marker of [
  "KPipeline",
  "meteredCreditsRequired",
  '"local-open-source"',
  "Natural Presence remains pending",
]) {
  if (!localVoice.includes(marker)) fail(`local voice runtime is missing sovereignty marker: ${marker}`)
}

const voiceApproval = readRequired('scripts/distribution/approve-local-narration.mjs')
for (const marker of [
  "ths-voice-qa-receipt-v1",
  "naturalPresence !== 'pass'",
  "pronunciation !== 'pass'",
  "exactArtifactReviewed: true",
]) {
  if (!voiceApproval.includes(marker)) fail(`voice approval gate is missing: ${marker}`)
}

const publisherWorkflow = readRequired('.github/workflows/ths-publisher-publication.yml')
if (/METRICOOL|metricool/i.test(publisherWorkflow)) {
  fail('THS Publisher workflow may not route new publication through Metricool')
}

const deployWorkflow = readRequired('.github/workflows/deploy.yml')
if (deployWorkflow.includes('Build governed Metricool publication pilot')) {
  fail('deploy workflow still presents Metricool as the governed production authority')
}

if (!process.exitCode) {
  console.log('[social-production-sovereignty] PASS — R8.04 zero-credit critical path is locked in policy and production code')
}

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

if (!process.exitCode) {
  console.log('[social-production-sovereignty] PASS — R8.04 zero-credit critical path is locked')
}

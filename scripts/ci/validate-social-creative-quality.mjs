import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const cfgPath = path.join(root, 'config', 'social-creative-quality.json')
const policyPath = path.join(root, 'docs', 'social-creative-quality.md')
const gatePath = path.join(root, 'scripts', 'distribution', 'r805-creative-gate.mjs')

function fail(message) {
  console.error('[social-creative-quality] FAIL:', message)
  process.exitCode = 1
}

if (!fs.existsSync(cfgPath)) fail('missing config/social-creative-quality.json')
else {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  if (cfg.release !== 'R8.05') fail('canonical creative release must be R8.05')
  if (!Array.isArray(cfg.inherits) || !cfg.inherits.includes('R8.04')) fail('R8.05 must inherit R8.04 sovereignty')
  if (cfg.premise?.interest_score_min !== 4) fail('premise interest floor must remain 4/5')
  if (cfg.premise?.one_mental_job_required !== true) fail('one-mental-job gate must remain required')
  if (cfg.premise?.payoff_before_method_required !== true) fail('payoff-before-method gate must remain required')
  if (cfg.premise?.paper_summary_opening_forbidden !== true) fail('paper-summary opening must remain forbidden')
  if (cfg.timing?.duration_policy !== 'natural') fail('natural-duration policy is required')
  if (cfg.timing?.fixed_runtime_target_forbidden !== true) fail('fixed runtime target must remain forbidden')
  if (cfg.timing?.narration_is_timing_master !== true) fail('narration must remain the timing master')
  if (cfg.timing?.voice_first_semantic_beat_map_required !== true) fail('voice-first beat map must remain required')
  if (cfg.timing?.semantic_clip_ownership_required !== true) fail('semantic clip ownership must remain required')
  if (cfg.timing?.cut_on_meaning_required !== true) fail('cut-on-meaning must remain required')
  if (cfg.timing?.internal_motion_sync_required !== true) fail('internal-motion synchrony must remain required')
  if (cfg.timing?.exact_local_narration_timeline_required !== true) fail('exact local narration timeline must remain required')
  if (cfg.timing?.visual_timeline_may_not_precede_voice_timeline !== true) fail('visual timeline may not precede voice timing')
  if (cfg.final_cohesion?.whole_piece_review_required !== true) fail('whole-piece cohesion review must remain required')
  if (cfg.final_cohesion?.technical_sync_alone_is_insufficient !== true) fail('technical sync may not satisfy cohesion')
  if (cfg.final_cohesion?.exact_mp4_hash_binding_required !== true) fail('exact MP4 hash binding must remain required')
  if (cfg.final_cohesion?.publication_requires_master_qa_receipt !== true) fail('master QA receipt must remain required before publication')
  if (cfg.recovery?.macro_rebuild_limit !== 1) fail('macro rebuild limit must remain one')
  if (cfg.failure_semantics?.premise !== 'fail_before_render') fail('weak premise must fail before render')
}

for (const [file, markers] of [
  [policyPath, ['one mental job', 'Payoff before methodology', 'voice-first semantic beat map', 'internal motion', 'One macro rebuild']],
  [gatePath, ['interestScore', 'methodologyBeforePayoff', 'narrationIsTimingMaster', 'visualPurpose', 'spokenAnchor', 'semanticBeatMapSha256', 'internalMotionPlanRequired', 'exact-master-qa', 'macroRebuildCount']],
  [path.join(root, 'scripts', 'distribution', 'render-local-narration.py'), ['semantic-beat-timeline.json', 'exact-local-narration']],
  [path.join(root, 'scripts', 'distribution', 'render-vertical-video-package.mjs'), ['motionPhase', "motionPhase: 'pre'", 'motionCueOffset', 'voice-duration-proportional-text-anchor']],
  [path.join(root, 'scripts', 'distribution', 'render-vertical-video-mp4.mjs'), ['verifyMotionVariant', 'cue.toFixed(4)', 'internalMotionRendered: true']],
  [path.join(root, 'scripts', 'distribution', 'approve-r805-master.mjs'), ['ths-r805-master-qa-receipt-v1', 'wholePieceCohesion', 'narrationVisualSync', 'internalMotionSync']],
  [path.join(root, 'scripts', 'distribution', 'stage-publication-media.mjs'), ['r805-master-qa.receipt.json', 'technical sync alone is insufficient', 'exact already-rendered/reviewed master']],
  [path.join(root, 'scripts', 'distribution', 'build-bounded-pilot.mjs'), ['validateR805BriefCopyAgainstCanonical', 'fresh lossless evidence-safety validation']],
]) {
  if (!fs.existsSync(file)) {
    fail(`missing governed creative surface: ${path.relative(root, file)}`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const marker of markers) if (!content.includes(marker)) fail(`${path.basename(file)} missing R8.05 marker: ${marker}`)
}

if (!process.exitCode) {
  console.log('[social-creative-quality] PASS — R8.05 attention-first and semantic AV gates are locked')
}

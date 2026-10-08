import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const cfgPath = path.join(root, 'config', 'social-creative-quality.json')
const policyPath = path.join(root, 'docs', 'social-creative-quality.md')
const gatePath = path.join(root, 'scripts', 'distribution', 'r805-creative-gate.mjs')
const r806GatePath = path.join(root, 'scripts', 'distribution', 'r806-creative-gate.mjs')
const r807GatePath = path.join(root, 'scripts', 'distribution', 'r807-creative-gate.mjs')

function fail(message) {
  console.error('[social-creative-quality] FAIL:', message)
  process.exitCode = 1
}

if (!fs.existsSync(cfgPath)) fail('missing config/social-creative-quality.json')
else {
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'))
  if (cfg.release !== 'R8.07') fail('canonical creative methodology must be R8.07')
  if (cfg.runtime_base_release !== 'R8.05') fail('R8.07 must run on the hardened R8.05 runtime')
  if (!Array.isArray(cfg.inherits) || !cfg.inherits.includes('R8.06') || !cfg.inherits.includes('R8.05') || !cfg.inherits.includes('R8.04')) fail('R8.07 must inherit R8.06, R8.05 and R8.04')
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
  if (cfg.concept_lab?.candidate_count !== 3) fail('R8.06 concept lab must require exactly three candidates')
  if (cfg.opening_native?.immediate_finding_after_hook !== true) fail('R8.06 must require finding immediately after hook')
  if (cfg.opening_native?.opening_visual_modes_min_distinct !== 2) fail('R8.06 opening must require at least two visual teaching modes')
  if (cfg.delivery?.metricool_optional !== true || cfg.delivery?.manual_native_fallback_required !== true || cfg.delivery?.provider_may_mutate_artifact !== false) fail('R8.06 provider-agnostic delivery invariants must remain locked')
  if (cfg.visual_rhythm?.recurring_semantic_motif_required !== true) fail('R8.07 recurring semantic motif must remain required')
  if (cfg.visual_rhythm?.core_composition_families_min_distinct !== 3) fail('R8.07 core story must require at least three composition families')
  if (cfg.visual_rhythm?.max_consecutive_composition_family !== 2 || cfg.visual_rhythm?.max_consecutive_visual_mode !== 2) fail('R8.07 repetition-debt ceilings must remain two')
  if (cfg.visual_rhythm?.semantic_pattern_interrupt_required !== true || cfg.visual_rhythm?.pattern_interrupt_role !== 'limitation' || cfg.visual_rhythm?.pattern_interrupt_reason !== 'limitation-pivot') fail('R8.07 semantic pattern interrupt contract must remain locked')
  if (cfg.visual_rhythm?.local_composition_primitives_required !== true) fail('R8.07 local composition primitives must remain required')
  if (cfg.failure_semantics?.premise !== 'fail_before_render') fail('weak premise must fail before render')
}

for (const [file, markers] of [
  [policyPath, ['one mental job', 'Payoff before methodology', 'voice-first semantic beat map', 'internal motion', 'One macro rebuild']],
  [gatePath, ['interestScore', 'methodologyBeforePayoff', 'narrationIsTimingMaster', 'visualPurpose', 'spokenAnchor', 'semanticBeatMapSha256', "requires exactly one ${role} beat", 'hook to be the first rendered beat', 'payoff-before-method requires the finding beat before the evidence/method beat', 'internalMotionPlanRequired', 'exact-master-qa', 'macroRebuildCount']],
  [r806GatePath, ['concept lab requires exactly three candidates', 'visualPotentialScore >= 4', 'opening beat 2 must be the finding/payoff', 'opening requires at least two distinct visual teaching modes', 'overlaySha256', 'Metricool as optional', 'manual native fallback']],
  [r807GatePath, ['one visualThesis', 'at least three distinct composition families', 'more than two consecutive identical composition families', 'motif must return at the limitation pivot', 'pattern interrupt must be earned by the limitation pivot', 'overlaySha256']],
  [path.join(root, 'scripts', 'distribution', 'render-local-narration.py'), ['semantic-beat-timeline.json', 'exact-local-narration', 'parent_manifest_release', 'parent_release == "R8.04"', 'parent_release == "R8.05"']],
  [path.join(root, 'scripts', 'distribution', 'render-vertical-video-package.mjs'), ["|| 'R8.04'", 'motionPhase', "motionPhase: 'pre'", 'motionCueOffset', 'voice-duration-proportional-text-anchor', 'renderAuthoredComposition', 'data-r807-composition', 'data-r807-motif', 'data-r807-pattern-interrupt']],
  [path.join(root, 'scripts', 'distribution', 'render-vertical-video-mp4.mjs'), ['verifyMotionVariant', 'cue.toFixed(4)', 'internalMotionRendered: true']],
  [path.join(root, 'scripts', 'distribution', 'approve-r805-master.mjs'), ['ths-r805-master-qa-receipt-v1', 'wholePieceCohesion', 'narrationVisualSync', 'internalMotionSync', 'openingScrollStop', 'nativePlatformFeel', 'visualTeachingObject', 'textCardMonotonyRejected', 'visualRhythm', 'motifContinuity', 'semanticPatternInterrupt', 'repetitionDebtRejected']],
  [path.join(root, 'scripts', 'distribution', 'stage-publication-media.mjs'), ['r805-master-qa.receipt.json', 'technical sync alone is insufficient', 'exact already-rendered/reviewed master', 'visualRhythm', 'motifContinuity', 'semanticPatternInterrupt', 'repetitionDebtRejected', 'metricool-if-available', 'manual-native-upload', 'providerMayMutateArtifact']],
  [path.join(root, 'scripts', 'distribution', 'build-bounded-pilot.mjs'), ['validateR805BriefCopyAgainstCanonical', 'requires exactly one governed', 'resolveShortVideoRelease', "|| 'R8.04'", 'assertResearchObjectMatchesMediaPack', 'STALE relative to the governed media-pack content hash', 'ths-r807-creative-receipt-v1', 'fresh lossless evidence-safety validation', 'vertical-video-r805-natural-v1']],
  [path.join(root, 'scripts', 'distribution', 'build-research-distribution.mjs'), ["systemRelease: 'R8.05'", "creativeMethodRelease: 'R8.07'"]],
  [path.join(root, 'scripts', 'distribution', 'creative-spec-lossless.mjs'), ["|| 'R8.04'", 'ths-r807-creative-receipt-v1', 'creativeFoundation', 'concept-required']],
]) {
  if (!fs.existsSync(file)) {
    fail(`missing governed creative surface: ${path.relative(root, file)}`)
    continue
  }
  const content = fs.readFileSync(file, 'utf8')
  for (const marker of markers) if (!content.includes(marker)) fail(`${path.basename(file)} missing R8.05 marker: ${marker}`)
}

if (!process.exitCode) {
  console.log('[social-creative-quality] PASS — R8.07 visual-authorship methodology + R8.05 runtime gates are locked')
}

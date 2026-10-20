import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const source = readFileSync(fileURLToPath(new URL('../r812-mitragynine-review-voice.py', import.meta.url)), 'utf8')

// Regression for the actual old failure: fitting Kokoro audio to a pre-existing
// 43-second video using FFmpeg atempo. Not a creative-quality approval.
test('source narration has no inherited picture-time boundaries', () => {
  const scenes = source.match(/SCENES = \[([\s\S]*?)\n\]/)?.[1] || ''
  expect(scenes).not.toBe('')
  expect(scenes).not.toMatch(/\("[a-z0-9]+",\s*\d+(?:\.\d+)?,/)
  expect(source).toContain('for idx, (name, words) in enumerate(SCENES):')
  expect(source).not.toMatch(/old_start|old_end|LEGACY_VISUAL_DURATION_SECONDS/)
})

test('authentic Kokoro gets a natural radio edit, not an atempo-constrained slot', () => {
  expect(source).toContain('voice_input = apply_pronunciations(words)')
  expect(source).toContain('engine.create(voice_input, voice=VOICE, speed=1.0, lang="en-us")')
  expect(source).toContain('"voiceInput": voice_input')
  expect(source).toContain('"pronunciationLexicon": lexicon_receipt()')
  expect(source).toContain('start_samples = cursor_samples')
  expect(source).toContain('end_samples = start_samples + len(clip)')
  expect(source).toContain('duration_seconds = round(len(speech) / RATE, 4)')
  expect(source).not.toMatch(/atempo|MAX_TEMPO|subprocess|target_samples|fixedDurationSeconds/)
  expect(source).toContain('"timeStretchApplied": False')
  expect(source).toContain('"humanAuditoryReview": "pending"')
  expect(source).toContain('"releaseAuthority": "draft-only-not-for-publication"')
})

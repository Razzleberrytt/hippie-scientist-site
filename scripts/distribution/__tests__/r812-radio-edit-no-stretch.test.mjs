import { test, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
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


test('review WAV and receipt refuse overwrite with either master file already present', () => {
  // Test the real pure-Python function without importing the heavyweight speech
  // runtime or substituting a narrator in a fixture.
  const guardTest = `
import ast
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

tree = ast.parse(Path(sys.argv[1]).read_text(encoding="utf-8"))
functions = [node for node in tree.body if isinstance(node, ast.FunctionDef) and node.name in {"reserve_review_master_paths", "publish_review_pair"}]
assert len(functions) == 2, "destination guard and publisher both required"
namespace = {"Path": Path}
exec(compile(ast.Module(body=functions, type_ignores=[]), "<master-guard>", "exec"), namespace)
guard = namespace["reserve_review_master_paths"]
publish = namespace["publish_review_pair"]

with TemporaryDirectory() as directory:
    root = Path(directory)
    wav, receipt = guard(root)
    assert wav.name.endswith(".wav") and receipt.name.endswith(".receipt.json")
    wav.write_bytes(b"earlier-approved-wav-not-to-be-overwritten")
    try:
        guard(root)
        raise AssertionError("existing WAV did not block overwrite")
    except RuntimeError as exc:
        assert "refuse overwrite" in str(exc)
    assert wav.read_bytes() == b"earlier-approved-wav-not-to-be-overwritten"
    wav.unlink()
    receipt.write_text('{"narrationWavSha256":"frozen"}')
    try:
        guard(root)
        raise AssertionError("existing receipt did not block overwrite")
    except RuntimeError as exc:
        assert "refuse overwrite" in str(exc)
    assert receipt.read_text() == '{"narrationWavSha256":"frozen"}'
    # Simulate a receipt-path race after we claim the new WAV.
    wav.unlink(missing_ok=True)
    try:
        publish(wav, receipt, b"new-audio", '{"new":"receipt"}')
        raise AssertionError("pre-existing receipt race did not block publish")
    except FileExistsError:
        pass
    assert not wav.exists(), "our WAV must be cleaned after receipt conflict"
    assert receipt.read_text() == '{"narrationWavSha256":"frozen"}'
    receipt.unlink()
    publish(wav, receipt, b"new-audio", '{"new":"receipt"}')
    assert wav.read_bytes() == b"new-audio"
    assert receipt.read_text() == '{"new":"receipt"}'
`;
  const script = fileURLToPath(new URL('../r812-mitragynine-review-voice.py', import.meta.url))
  const result = spawnSync('python3', ['-c', guardTest, script], { encoding: 'utf8' })
  expect(result.error).toBeUndefined()
  expect(result.status, result.stderr || result.stdout).toBe(0)
})

test('audio timing receipt exposes exact integer frames without implying final approval', () => {
  expect(source).toContain('audio_path, receipt_path = reserve_review_master_paths(output_dir)')
  expect(source).toContain('with audio_path.open("xb") as new_master:')
  expect(source).toContain('with receipt_path.open("x", encoding="utf-8") as new_receipt:')
  expect(source).toContain('"voiceStartFrame": start_samples')
  expect(source).toContain('"voiceEndFrame": end_samples')
  expect(source).toContain('"naturalSpeechFrames": len(clip)')
  expect(source).toContain('"durationFrames": len(speech)')
  expect(source).toContain('wav_bytes = encoded_wav.getvalue()')
  expect(source).toContain('publish_review_pair(audio_path, receipt_path, wav_bytes, receipt_text)')
  expect(source).toContain('"wordLevelAlignmentCertified": False')
  expect(source).toContain('"humanAuditoryReview": "pending"')
  expect(source).toContain('"releaseAuthority": "draft-only-not-for-publication"')
})

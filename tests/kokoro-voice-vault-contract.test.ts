import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const vault = readFileSync('scripts/distribution/voice-vault.py', 'utf8')
const archiveWorkflow = readFileSync('.github/workflows/voice-model-vault.yml', 'utf8')
const narrationWorkflow = readFileSync('.github/workflows/kokoro-voice-production.yml', 'utf8')
const render = readFileSync('scripts/distribution/render-local-narration.py', 'utf8')
const deps = readFileSync('scripts/distribution/requirements-local-voice.txt', 'utf8')

describe('THS original R8.11 narrator persists across ephemeral environments', () => {
  it('pins the original ONNX INT8 house model and voicebank to known independent SHA-256 hashes', () => {
    expect(vault).toContain('kokoro-v1.0.int8.onnx')
    expect(vault).toContain('voices-v1.0.bin')
    expect(vault).toContain('ae315a79b623f244700e4afb9246c46a26066782e049ba174bf3ba433970ee9c')
    expect(vault).toContain('bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d')
    expect(vault).toContain('model-files-v1.1')
    expect(vault).toContain('THS narrator identity/manifest changed')
    expect(archiveWorkflow).toContain('gh release create')
    expect(archiveWorkflow).toContain('Independently download archived release')
    expect(archiveWorkflow).toContain('Kokoro(root+')
    expect(archiveWorkflow).toContain('gh release download "$TAG"')
    expect(deps).toContain('kokoro-onnx==0.6.1')
  })

  it('fails closed rather than substituting Flite, eSpeak or unrelated Torch voice', () => {
    expect(render).toContain('THS_VOICE_VAULT missing')
    expect(render).toContain('"verify", vault')
    expect(render).toContain('from kokoro_onnx import Kokoro')
    expect(render).toContain('modelSourceRelease')
    expect(render).toContain('modelWeightsSha256')
    expect(render).toContain('voiceWeightsSha256')
    expect(render).toContain('voiceVaultTag')
    expect(render).toContain('voice changes require new approved vault')
    expect(narrationWorkflow).toContain('gh release download ths-kokoro-onnx-am-michael-int8-v1')
    expect(narrationWorkflow).toContain('voice-vault.py verify')
    expect(narrationWorkflow).toContain("obj['engine']['voiceWeightsSha256']")
    expect(narrationWorkflow).not.toMatch(/ffmpeg -f lavfi -i flite|pyttsx3/i)
  })
})

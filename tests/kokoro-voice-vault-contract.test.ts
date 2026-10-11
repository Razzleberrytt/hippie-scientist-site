import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'

const vault = readFileSync('scripts/distribution/voice-vault.py', 'utf8')
const archiveWorkflow = readFileSync('.github/workflows/voice-model-vault.yml', 'utf8')
const narrationWorkflow = readFileSync('.github/workflows/kokoro-voice-production.yml', 'utf8')
const render = readFileSync('scripts/distribution/render-local-narration.py', 'utf8')
const deps = readFileSync('scripts/distribution/requirements-local-voice.txt', 'utf8')

describe('THS original narrator persists across ephemeral environments', () => {
  it('archives original Torch Kokoro and the specific am_michael speaker, not a substituted ONNX preset', () => {
    expect(vault).toContain('kokoro-v1_0.pth')
    expect(vault).toContain('voices/am_michael.pt')
    expect(vault).toContain('hexgrad/Kokoro-82M')
    expect(vault).toContain('config.json')
    expect(vault).toContain('hf_hub_download')
    expect(vault).toContain('revision=revision')
    expect(vault).toContain('hashlib.sha256')
    expect(vault).toContain('Corrupt/incorrect voice asset')
    expect(archiveWorkflow).toContain('gh release create')
    expect(archiveWorkflow).toContain('Read actual persisted release bytes back independently')
    expect(archiveWorkflow).toContain('HF_HUB_OFFLINE=1')
    expect(archiveWorkflow).toContain('KPipeline(lang_code')
    expect(deps).toContain('kokoro==0.9.4')
  })

  it('refuses unverified/missing model files and binds real weights to every narration receipt', () => {
    expect(render).toContain('THS_VOICE_VAULT missing')
    expect(render).toContain('command in ("verify", "restore")')
    expect(render).toContain('os.environ["HF_HUB_OFFLINE"] = "1"')
    expect(render).toContain('modelSourceRevision')
    expect(render).toContain('modelWeightsSha256')
    expect(render).toContain('voiceWeightsSha256')
    expect(render).toContain('modelConfigSha256')
    expect(render).toContain('voice changes require new approved vault')
    expect(narrationWorkflow).toContain('gh release download ths-kokoro-torch-am-michael-v1')
    expect(narrationWorkflow).toContain('voice-vault.py verify')
    expect(narrationWorkflow).toContain('voice-vault.py restore')
    expect(narrationWorkflow).toContain("obj['engine']['voiceWeightsSha256']")
  })
})

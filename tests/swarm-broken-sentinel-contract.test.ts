import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const workflow = () =>
  fs.readFileSync(path.join(process.cwd(), '.github/workflows/swarm-broken-sentinel.yml'), 'utf8')

describe('swarm broken sentinel recovery contract', () => {
  it('keeps the scheduled fallback heartbeat monitored and self-recovers through the trusted controller', () => {
    const text = workflow()

    expect(text).toContain('heartbeat_cutoff=$((now_epoch - 45*60))')
    expect(text).toContain("controller_stale=true")
    expect(text).toContain('actions/workflows/autonomous-merge-controller.yml/dispatches')
    expect(text).toContain('-f ref=main')
    expect(text).toContain('id: recovery')
  })

  it('verifies the recovery workflow result before surfacing a BROKEN issue', () => {
    const text = workflow()

    expect(text).toContain('.event == "workflow_dispatch"')
    expect(text).toContain('.head_branch == "main"')
    expect(text).toContain('.created_at >= $started')
    expect(text).toContain("if [ \"$recovery_conclusion\" = 'success' ]")
    expect(text).toContain('echo "recovered=$recovered" >> "$GITHUB_OUTPUT"')
    expect(text).toContain('echo "other_broken=$other_broken" >> "$GITHUB_OUTPUT"')
    expect(text).toContain("steps.health.outputs.broken == 'true' && (steps.health.outputs.other_broken == 'true' || steps.recovery.outputs.recovered != 'true')")
  })

  it('suppresses or closes the emergency issue when recovery succeeds in the same sentinel run', () => {
    const text = workflow()

    expect(text).toContain("steps.health.outputs.other_broken != 'true' && steps.recovery.outputs.recovered == 'true'")
    expect(text).toContain('No BROKEN issue is needed for this transient scheduler miss.')
    expect(text).toContain('verified a successful trusted controller recovery in this same run')
  })

  it('still alerts when recovery is missing, incomplete, or unsuccessful', () => {
    const text = workflow()

    expect(text).toContain('Controller recovery did not become healthy')
    expect(text).toContain('recovery did not complete successfully')
    expect(text).toContain('no recovery run became visible before timeout')
    expect(text).toContain('Open or refresh BROKEN!!!!! issue')
    expect(text).toContain('*) other_broken=true ;;')
  })
})

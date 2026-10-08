import {readFileSync} from 'node:fs'
import {describe,expect,it} from 'vitest'

const workflow=readFileSync('.github/workflows/research-source-register-integration.yml','utf8')

describe('P0 source-register workflow exact-head recovery contract',()=>{
  it('exposes an explicit workflow_dispatch trigger for bot-refresh zero-job recovery',()=>{
    expect(workflow).toMatch(/^on:\s*\n[\s\S]*?^  workflow_dispatch:\s*$/m)
    expect(workflow).toContain('  pull_request:')
    expect(workflow).toContain('  push:')
  })
  it('keeps source validation read only with no privileged write scope',()=>{
    expect(workflow).toMatch(/^permissions:\s*\n  contents: read/m)
    expect(workflow).not.toMatch(/^\s+(contents|actions|pull-requests|checks|statuses): write\s*$/m)
  })
  it('still runs original pinned source, semantic, and intelligence validations',()=>{
    for(const original of [
      'validate-research-source-register.mjs',
      'validate-research-semantic-network.ts',
      'validate-research-intelligence-studio.ts',
    ])expect(workflow).toContain(original)
  })
})

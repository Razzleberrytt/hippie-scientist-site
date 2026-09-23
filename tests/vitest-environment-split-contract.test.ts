import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const config = fs.readFileSync(path.join(process.cwd(), 'vitest.config.ts'), 'utf8')

describe('Vitest environment split contract', () => {
  it('runs script tests in Node while keeping application tests in jsdom', () => {
    expect(config).toContain("name: 'scripts-node'")
    expect(config).toContain("environment: 'node'")
    expect(config).toContain("include: [SCRIPT_TEST_GLOB]")
    expect(config).toContain("setupFiles: []")
    expect(config).toContain("name: 'app-dom'")
    expect(config).toContain("environment: 'jsdom'")
    expect(config).toContain("exclude: [...TEST_EXCLUDES, 'scripts/**']")
  })

  it('bounds GitHub project workers to the four hosted-runner CPUs', () => {
    expect(config).toContain("maxWorkers: GITHUB_ACTIONS ? 1 : '25%'")
    expect(config).toContain("maxWorkers: GITHUB_ACTIONS ? 3 : '75%'")
  })
})

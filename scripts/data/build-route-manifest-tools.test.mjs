import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = path.resolve(import.meta.dirname, '..', '..')
const manifestBuilder = fs.readFileSync(path.join(root, 'scripts', 'data', 'build-route-manifest.mjs'), 'utf8')
const toolsPage = fs.readFileSync(path.join(root, 'app', 'tools', 'page.tsx'), 'utf8')

describe('route manifest tools hub coverage', () => {
  it('keeps the indexable tools hub in static route metadata', () => {
    expect(manifestBuilder).toContain("'/tools': {")
    expect(manifestBuilder).toContain("title: 'Research Tools | The Hippie Scientist'")
    expect(manifestBuilder).toContain(
      "description: 'Interactive research tools for comparing botanicals, evidence, activity, compounds, and safety context.'",
    )
  })

  it('keeps manifest metadata aligned with the public tools page', () => {
    expect(toolsPage).toContain("title: 'Research Tools | The Hippie Scientist'")
    expect(toolsPage).toContain(
      "description: 'Interactive research tools for comparing botanicals, evidence, activity, compounds, and safety context.'",
    )
    expect(toolsPage).toContain("path: '/tools/'")
  })
})

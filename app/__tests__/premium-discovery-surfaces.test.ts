import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

function source(relativePath: string): string {
  return readFileSync(path.join(process.cwd(), relativePath), 'utf8')
}

describe('premium discovery surfaces regression contract', () => {
  it('scopes the research library premium treatment to the research route', () => {
    const layout = source('app/research/layout.tsx')
    const css = source('styles/research-library-premium.css')

    expect(layout).toContain("import '../../styles/research-library-premium.css'")
    expect(layout).toContain('research-route-theme')
    expect(css).toContain('.research-route-theme main > section:first-child')
    expect(css).toContain('section:has(#source-first-heading)')
    expect(css).toContain('section:has(#research-tools-heading)')
    expect(css).toContain('section:has(#library-context-heading)')
  })

  it('keeps herb and compound profile polish route-scoped', () => {
    const herbsLayout = source('app/herbs/layout.tsx')
    const compoundsLayout = source('app/compounds/layout.tsx')
    const css = source('styles/profile-premium.css')

    expect(herbsLayout).toContain('profile-route-theme--herbs')
    expect(compoundsLayout).toContain('profile-route-theme--compounds')
    expect(herbsLayout).toContain("import '../../styles/profile-premium.css'")
    expect(compoundsLayout).toContain("import '../../styles/profile-premium.css'")
    expect(css).toContain('.profile-route-theme .hs-masthead')
    expect(css).toContain('.profile-route-theme .profile-decision-panel')
    expect(css).toContain('.profile-route-theme #evidence')
    expect(css).toContain('.profile-route-theme #safety')
  })

  it('gives shared library profile cards a stable premium styling hook', () => {
    const primitive = source('components/ui/DecisionPrimitives.tsx')
    const css = source('styles/library-browse.css')

    expect(primitive).toContain('decision-profile-card card-premium')
    expect(css).toContain('.library-browse-page .decision-profile-card')
    expect(css).toContain('.library-browse-page .decision-profile-card::before')
  })

  it('keeps the decision layer identifiable without changing its data contract', () => {
    const panel = source('components/editorial/ProfileDecisionPanel.tsx')

    expect(panel).toContain('profile-decision-panel space-y-4')
    expect(panel).toContain('profile-at-a-glance')
    expect(panel).toContain('profile-next-steps')
    expect(panel).toContain('ScientificVerdictCard')
    expect(panel).toContain('EvidenceConfidence')
  })

  it('preserves reduced-motion handling on animated premium surfaces', () => {
    const researchCss = source('styles/research-library-premium.css')
    const libraryCss = source('styles/library-browse.css')

    expect(researchCss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(libraryCss).toContain('@media (prefers-reduced-motion: reduce)')
  })
})

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
    expect(source('app/research/page.tsx')).toContain('research-page-content')
    expect(css).toContain('.research-route-theme .research-page-content > section:first-child')
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
    expect(panel).not.toContain('profile-at-a-glance')
    expect(panel).not.toContain('runtimeSummary.evidence')
    expect(panel).not.toContain('runtimeSummary.safety')
    expect(panel).toContain('profile-next-steps')
    expect(panel).toContain('ScientificVerdictCard')
    expect(panel).toContain('EvidenceConfidence')
    expect(panel).toContain('verdict ? (')
  })

  it('keeps herb and compound profiles on one mobile information hierarchy', () => {
    const herb = source('app/herbs/[slug]/page.tsx')
    const compound = source('app/compounds/[slug]/page.tsx')

    for (const profile of [herb, compound]) {
      const overview = profile.indexOf('id="overview"')
      const decision = profile.indexOf('<ProfileDecisionPanel')
      const mobileToc = profile.indexOf('variant="mobile"')
      const safety = profile.indexOf('id="safety"')
      const evidence = profile.indexOf('id="evidence"')
      const dosing = profile.indexOf('id="dosing"')

      expect(overview).toBeGreaterThan(-1)
      expect(decision).toBeGreaterThan(overview)
      expect(mobileToc).toBeGreaterThan(decision)
      expect(safety).toBeGreaterThan(mobileToc)
      expect(evidence).toBeGreaterThan(safety)
      expect(dosing).toBeGreaterThan(evidence)
    }

    expect(compound).toContain('<dl className="hs-defs">')
    expect(compound).toContain('space-y-4 sm:space-y-5')
    expect(compound).not.toContain('id="quick-stats"')
    expect(compound).not.toContain('flex-1 min-w-0 space-y-10')
    expect(compound.indexOf('id="compounds"')).toBeGreaterThan(compound.indexOf('id="dosing"'))
    expect(compound).toContain('<ProfileTOC items={tocItems} variant="desktop" />')
  })

  it('preserves reduced-motion handling on animated premium surfaces', () => {
    const researchCss = source('styles/research-library-premium.css')
    const libraryCss = source('styles/library-browse.css')

    expect(researchCss).toContain('@media (prefers-reduced-motion: reduce)')
    expect(libraryCss).toContain('@media (prefers-reduced-motion: reduce)')
  })
})

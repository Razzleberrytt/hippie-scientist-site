import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const root = process.cwd()
const read = (relativePath: string) => fs.readFileSync(path.join(root, relativePath), 'utf8')

describe('global navigation search performance boundary', () => {
  it('keeps the heavy search dialog behind one dynamic first-interaction boundary', () => {
    const navigation = read('components/Navigation.tsx')

    expect(navigation).toContain("dynamic(\n  () => import('./search/GlobalSearchModal')")
    expect(navigation).not.toContain("import { GlobalSearchModal } from './search/GlobalSearchModal'")
    expect(navigation.match(/<GlobalSearchModal/g)).toHaveLength(1)
    expect(navigation).toContain('searchLoaded && typeof document')
    expect(navigation).toContain('createPortal(')
    expect(navigation).toContain('document.body')
  })

  it('preserves the mobile drawer portal and a single navigation-owned hotkey listener', () => {
    const navigation = read('components/Navigation.tsx')

    expect(navigation).toContain("id='mobile-nav'")
    expect(navigation).toContain('mobileOpen && typeof document')
    expect(navigation).toContain("window.addEventListener('keydown', onKey)")
    expect(navigation).toContain("event.key === '/' && !typing && !searchOpen")
    expect(navigation).toContain("event.key.toLowerCase() === 'k'")
  })

  it('keeps the dialog focused on dialog behavior instead of rendering its own trigger', () => {
    const modal = read('components/search/GlobalSearchModal.tsx')

    expect(modal).toContain('open: boolean')
    expect(modal).toContain('onClose: () => void')
    expect(modal).not.toContain('enableHotkeys')
    expect(modal).not.toContain('triggerRef')
    expect(modal).not.toContain("window.addEventListener('keydown'")
    expect(modal).toContain('z-[130]')
  })
})

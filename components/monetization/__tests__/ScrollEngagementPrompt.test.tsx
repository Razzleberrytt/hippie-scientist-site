import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Link from 'next/link'
import ScrollEngagementPrompt from '../ScrollEngagementPrompt'

describe('ScrollEngagementPrompt footer privacy accessibility', () => {
  let callback: IntersectionObserverCallback
  const observe = vi.fn()
  const disconnect = vi.fn()

  beforeEach(() => {
    window.sessionStorage.clear()
    observe.mockClear()
    disconnect.mockClear()
    Object.defineProperty(window, 'innerHeight', { configurable: true, value: 1000 })
    Object.defineProperty(window, 'scrollY', { configurable: true, value: 750 })
    Object.defineProperty(document.documentElement, 'scrollHeight', { configurable: true, value: 2000 })
    class MockObserver {
      constructor(cb: IntersectionObserverCallback) { callback = cb }
      observe = observe
      disconnect = disconnect
    }
    vi.stubGlobal('IntersectionObserver', MockObserver)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('hides the offer while footer legal links are in view, and restores it above the footer', () => {
    render(
      <>
        <footer className='editorial-footer'>
          <Link href='/info/privacy/'>Privacy</Link>
          <button>Privacy settings</button>
        </footer>
        <ScrollEngagementPrompt storageKey='visual-audit-checklist' />
      </>,
    )

    expect(observe).toHaveBeenCalledWith(document.querySelector('footer.editorial-footer'))
    act(() => { fireEvent.scroll(window) })
    expect(screen.getByRole('link', { name: 'Get the checklist' })).toBeInTheDocument()

    act(() => {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(screen.queryByRole('link', { name: 'Get the checklist' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Privacy settings' })).toBeVisible()

    act(() => {
      callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(screen.getByRole('link', { name: 'Get the checklist' })).toBeInTheDocument()
  })

  it('preserves session dismissal on return visits', () => {
    window.sessionStorage.setItem('visual-audit-checklist-dismissed', '1')
    render(<ScrollEngagementPrompt storageKey='visual-audit-checklist-dismissed' />)
    fireEvent.scroll(window)
    expect(screen.queryByRole('link', { name: 'Get the checklist' })).not.toBeInTheDocument()
  })
})

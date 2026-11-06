import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import NewsletterArchivePage from '@/app/info/newsletter/page'
import NewsletterInterestSignup from '../NewsletterInterestSignup'
import { emailCaptureProviderAction } from '@/content/emailCapture'

vi.mock('@/lib/analytics', () => ({ trackEmailSignup: vi.fn() }))

const locationDescriptor = Object.getOwnPropertyDescriptor(window, 'location')!

beforeEach(() => {
  // The shared setup snapshots location; history.replaceState cannot update it.
  Object.defineProperty(window, 'location', {
    configurable: true,
    writable: true,
    value: { ...window.location, search: '' },
  })
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  Object.defineProperty(window, 'location', locationDescriptor)
})

describe('newsletter landing signup journey', () => {
  it('renders one page-owned email form and a direct link to its research choices', () => {
    const { container } = render(<NewsletterArchivePage />)

    expect(container.querySelectorAll('form')).toHaveLength(1)
    expect(container.querySelectorAll('input[type="email"]')).toHaveLength(1)
    expect(container.querySelector('#research-interests')).toHaveAttribute('data-email-capture-owner', 'page')
    expect(screen.getByRole('link', { name: 'Choose research interests' })).toHaveAttribute('href', '#research-interests')
    expect(screen.getByRole('button', { name: /General research/ })).toHaveAttribute('aria-pressed', 'true')
  })

  it('preselects sleep for the existing sleep-interest entry link', async () => {
    window.location.search = '?interest=sleep'
    render(<NewsletterInterestSignup />)

    await waitFor(() => expect(screen.getByRole('button', { name: /^Sleep/ })).toHaveAttribute('aria-pressed', 'true'))
    expect(screen.getByRole('heading', { name: 'Follow sleep research' })).toBeInTheDocument()
  })

  it.each([
    ['Sleep', 'sleep'],
    ['Stress', 'stress'],
    ['Anxiety', 'anxiety'],
    ['Focus', 'focus'],
    ['General research', 'default'],
  ])('submits the %s preference using the existing provider contract', async (label, goal) => {
    const { container } = render(<NewsletterInterestSignup />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(`^${label}`) }))
    fireEvent.change(screen.getByRole('textbox', { name: 'Email address' }), { target: { value: 'reader@example.com' } })
    fireEvent.submit(container.querySelector('form')!)

    await waitFor(() => expect(fetch).toHaveBeenCalledWith(emailCaptureProviderAction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@example.com', magnet: goal, source: `email-capture-${goal}` }),
    }))
  })
})

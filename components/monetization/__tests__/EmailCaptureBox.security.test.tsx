import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { EmailCaptureBox } from '../EmailCaptureBox'
import { emailCaptureProviderAction, emailCaptureProviderHoneypotName } from '@/content/emailCapture'

const mocks = vi.hoisted(() => ({ enabled: true, trackEmailSignup: vi.fn() }))

vi.mock('@/lib/analytics', () => ({ trackEmailSignup: mocks.trackEmailSignup }))
vi.mock('@/components/security/TurnstileWidget', () => ({
  get turnstileEnabled() { return mocks.enabled },
  default: ({ onTokenChange, resetKey }: { onTokenChange: (token: string) => void; resetKey: number }) => (
    <div data-testid='security-widget' data-reset-key={resetKey}>
      <button type='button' onClick={() => onTokenChange('test-turnstile-token')}>Test security token</button>
      <button type='button' onClick={() => onTokenChange('')}>Expire test token</button>
    </div>
  ),
}))

beforeEach(() => {
  mocks.enabled = true
  mocks.trackEmailSignup.mockReset()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }))
})

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function renderSignup() {
  const view = render(<EmailCaptureBox goal='sleep' />)
  fireEvent.change(screen.getByRole('textbox', { name: 'Email address' }), { target: { value: 'reader@example.com' } })
  return { ...view, form: view.container.querySelector('form')!, submit: screen.getByRole('button', { name: 'Get the sleep guide' }) }
}

describe('EmailCaptureBox subscription security contract', () => {
  it('blocks submission without a configured security token, including forced form events', () => {
    const { form, submit } = renderSignup()
    expect(submit).toBeDisabled()
    fireEvent.submit(form)
    expect(fetch).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Complete the security check')
  })

  it('submits the token with the unchanged research preference and attribution', async () => {
    const { form, submit } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    expect(submit).toBeEnabled()
    fireEvent.submit(form)
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(emailCaptureProviderAction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@example.com', magnet: 'sleep', source: 'email-capture-sleep', turnstileToken: 'test-turnstile-token' }),
    }))
    expect(await screen.findByRole('heading', { name: 'You are subscribed!' })).toBeInTheDocument()
    expect(mocks.trackEmailSignup).toHaveBeenCalledWith({ source: 'email-capture-sleep' })
  })

  it('blocks an expired token before any request is sent', () => {
    const { form, submit } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expire test token' }))
    expect(submit).toBeDisabled()
    fireEvent.submit(form)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('requires a fresh token after the server rejects a request', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: false, json: async () => ({ ok: false, error: 'Security verification failed.' }) } as Response)
    const { form, submit } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent('Security verification failed.')
    expect(submit).toBeDisabled()
    expect(screen.getByTestId('security-widget')).toHaveAttribute('data-reset-key', '1')
    expect(mocks.trackEmailSignup).not.toHaveBeenCalled()
  })

  it('does not show success for HTTP 200 with an unsuccessful API result', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => ({ ok: false, error: 'Subscription was not accepted.' }) } as Response)
    const { form } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent('Subscription was not accepted.')
    expect(screen.queryByRole('heading', { name: 'You are subscribed!' })).not.toBeInTheDocument()
    expect(mocks.trackEmailSignup).not.toHaveBeenCalled()
  })

  it('does not show success for an HTML or invalid-JSON response', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({ ok: true, json: async () => { throw new Error('Not JSON') } } as unknown as Response)
    const { form } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong.')
    expect(mocks.trackEmailSignup).not.toHaveBeenCalled()
  })

  it('resets the challenge after a network error without recording a signup', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network unavailable'))
    const { form, submit } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.submit(form)
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not connect')
    expect(submit).toBeDisabled()
    expect(screen.getByTestId('security-widget')).toHaveAttribute('data-reset-key', '1')
    expect(mocks.trackEmailSignup).not.toHaveBeenCalled()
  })

  it('preserves the existing request when client Turnstile is not configured', async () => {
    mocks.enabled = false
    const { form, submit } = renderSignup()
    expect(screen.queryByTestId('security-widget')).not.toBeInTheDocument()
    expect(submit).toBeEnabled()
    fireEvent.submit(form)
    await waitFor(() => expect(fetch).toHaveBeenCalledWith(emailCaptureProviderAction, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reader@example.com', magnet: 'sleep', source: 'email-capture-sleep' }),
    }))
  })

  it('preserves the existing honeypot rejection', () => {
    const { form, container } = renderSignup()
    fireEvent.click(screen.getByRole('button', { name: 'Test security token' }))
    fireEvent.change(container.querySelector(`input[name="${emailCaptureProviderHoneypotName}"]`)!, { target: { value: 'bot' } })
    fireEvent.submit(form)
    expect(fetch).not.toHaveBeenCalled()
  })
})

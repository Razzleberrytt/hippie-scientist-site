import { afterEach, describe, expect, it, vi } from 'vitest'

const loadConfig = async () => {
  vi.resetModules()
  return import('../../lib/mailchimp-integration')
}

describe('mailchimp signup config', () => {
  const originalMailchimpAction = process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION
  const originalEmailAction = process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION

  afterEach(() => {
    if (originalMailchimpAction === undefined) {
      delete process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION
    } else {
      process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION = originalMailchimpAction
    }

    if (originalEmailAction === undefined) {
      delete process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION
    } else {
      process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION = originalEmailAction
    }

    vi.resetModules()
  })

  it('uses the local subscribe endpoint as a client-post API action by default', async () => {
    delete process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION
    delete process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION

    const { mailchimpSignupConfig, validateMailchimpConfig } = await loadConfig()

    expect(mailchimpSignupConfig.action).toBe('/api/subscribe')
    expect(mailchimpSignupConfig.isApiAction).toBe(true)
    expect(mailchimpSignupConfig.isMailchimpAction).toBe(false)
    expect(validateMailchimpConfig()).toEqual({
      ok: true,
      message: 'Using Cloudflare Pages Function newsletter endpoint.',
    })
  })

  it('detects Mailchimp hosted form actions', async () => {
    process.env.NEXT_PUBLIC_MAILCHIMP_FORM_ACTION = 'https://example.us19.list-manage.com/subscribe/post?u=abc123&id=list456'
    delete process.env.NEXT_PUBLIC_EMAIL_CAPTURE_ACTION

    const { mailchimpSignupConfig, validateMailchimpConfig } = await loadConfig()

    expect(mailchimpSignupConfig.isApiAction).toBe(false)
    expect(mailchimpSignupConfig.isMailchimpAction).toBe(true)
    expect(mailchimpSignupConfig.emailFieldName).toBe('EMAIL')
    expect(mailchimpSignupConfig.honeypotName).toBe('b_abc123_list456')
    expect(validateMailchimpConfig()).toEqual({
      ok: true,
      message: 'Mailchimp form action is configured.',
    })
  })
})

import assert from 'node:assert/strict'
import { test } from 'vitest'

import { assessMainProtection, auditMainProtection } from './main-protection-audit.mjs'

test('accepts protected main metadata', () => {
  assert.deepEqual(
    assessMainProtection({ name: 'main', protected: true, protection: { enabled: true } }),
    { branch: 'main', protected: true, protectionEnabled: true },
  )
})

test('fails closed when main is unprotected', async () => {
  await assert.rejects(
    auditMainProtection({
      repository: 'Razzleberrytt/hippie-scientist-site',
      fetchImpl: async () => ({
        ok: true,
        status: 200,
        json: async () => ({ name: 'main', protected: false, protection: { enabled: false } }),
      }),
    }),
    /main is not protected/,
  )
})

test('fails closed on malformed or wrong-branch metadata', () => {
  assert.throws(() => assessMainProtection(null), /missing or invalid/)
  assert.throws(() => assessMainProtection({ name: 'develop', protected: true }), /Expected main branch metadata/)
})

test('uses the canonical branch endpoint and read-only request', async () => {
  let captured
  const result = await auditMainProtection({
    repository: 'owner/repo',
    token: 'redacted-token',
    fetchImpl: async (url, options) => {
      captured = { url, options }
      return {
        ok: true,
        status: 200,
        json: async () => ({ name: 'main', protected: true, protection: { enabled: true } }),
      }
    },
  })

  assert.equal(captured.url, 'https://api.github.com/repos/owner/repo/branches/main')
  assert.equal(captured.options.method, undefined)
  assert.equal(captured.options.headers.Authorization, 'Bearer redacted-token')
  assert.equal(result.protected, true)
})

test('fails closed when GitHub cannot be probed', async () => {
  await assert.rejects(
    auditMainProtection({
      repository: 'owner/repo',
      fetchImpl: async () => ({ ok: false, status: 403 }),
    }),
    /HTTP 403/,
  )
})

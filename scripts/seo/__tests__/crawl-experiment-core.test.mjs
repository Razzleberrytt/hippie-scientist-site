import test from 'node:test'
import assert from 'node:assert/strict'
import { assignArms, normalizeExperimentPath, validateAssignedRows } from '../crawl-experiment-core.mjs'
import { classifyGooglebot, ipMatchesCidr } from '../../../functions/_shared/googlebot-verification.mjs'

test('normalizes canonical herb URLs', () => {
  assert.equal(normalizeExperimentPath('https://thehippiescientist.net/herbs/ashwagandha/'), '/herbs/ashwagandha/')
  assert.equal(normalizeExperimentPath('/herbs/ashwagandha'), '/herbs/ashwagandha/')
  assert.throws(() => normalizeExperimentPath('/compounds/melatonin/'))
})

test('deterministically assigns exact 20/20/57 arms independent of input order', () => {
  const rows = Array.from({ length: 97 }, (_, i) => ({ pathname: `/herbs/test-herb-${i + 1}/` }))
  const a = assignArms(rows, 'seed-v1')
  const b = assignArms([...rows].reverse(), 'seed-v1')
  assert.deepEqual(a.map(({ pathname, arm }) => [pathname, arm]), b.map(({ pathname, arm }) => [pathname, arm]))
  assert.deepEqual(validateAssignedRows(a), { treatment: 20, control: 20, observational: 57 })
})

test('rejects duplicate or wrong-size registries', () => {
  const rows = Array.from({ length: 97 }, (_, i) => ({ pathname: `/herbs/test-herb-${Math.min(i + 1, 96)}/` }))
  assert.throws(() => assignArms(rows))
})

test('CIDR matcher supports IPv4 and IPv6', () => {
  assert.equal(ipMatchesCidr('66.249.66.1', '66.249.64.0/19'), true)
  assert.equal(ipMatchesCidr('8.8.8.8', '66.249.64.0/19'), false)
  assert.equal(ipMatchesCidr('2001:4860:4801:10::1', '2001:4860:4801:10::/64'), true)
  assert.equal(ipMatchesCidr('2001:4860:4801:11::1', '2001:4860:4801:10::/64'), false)
})

test('classifies Googlebot UA without treating generic Google agents as Googlebot', () => {
  assert.equal(classifyGooglebot('Mozilla/5.0 (Linux; Android 6.0.1) AppleWebKit Googlebot/2.1'), 'smartphone')
  assert.equal(classifyGooglebot('Googlebot/2.1 (+http://www.google.com/bot.html)'), 'desktop')
  assert.equal(classifyGooglebot('Googlebot-Image/1.0'), 'image')
  assert.equal(classifyGooglebot('AdsBot-Google (+http://www.google.com/adsbot.html)'), null)
})

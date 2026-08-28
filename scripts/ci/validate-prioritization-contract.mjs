import { readFileSync } from 'node:fs'
import { rank, validatePromotedItem } from './prioritization-contract.mjs'

const fixturePath = new URL('./fixtures/prioritization-contract.json', import.meta.url)
const fixture = JSON.parse(readFileSync(fixturePath, 'utf8'))

const failures = []
for (const testCase of fixture.cases) {
  try {
    const ranked = rank(testCase.items, { now: fixture.now })
    const order = ranked.map((item) => item.id)
    if (JSON.stringify(order) !== JSON.stringify(testCase.expectedOrder)) {
      failures.push(`${testCase.name}: expected ${testCase.expectedOrder.join(', ')}; got ${order.join(', ')}`)
    }
    for (const [id, expected] of Object.entries(testCase.expectedFreshness || {})) {
      const item = ranked.find((candidate) => candidate.id === id)
      if (!item || item.freshness.status !== expected) failures.push(`${testCase.name}: ${id} freshness expected ${expected}`)
    }
    for (const item of testCase.items) {
      const rankedItem = ranked.find((candidate) => candidate.id === item.id)
      if (rankedItem.promotable) validatePromotedItem(item, { now: fixture.now })
      else {
        let rejected = false
        try { validatePromotedItem(item, { now: fixture.now }) } catch { rejected = true }
        if (!rejected) failures.push(`${testCase.name}: ${item.id} should fail promotion while ${rankedItem.freshness.status}`)
      }
    }
  } catch (error) {
    failures.push(`${testCase.name}: ${error.message}`)
  }
}

if (failures.length) {
  console.error('Prioritization contract: FAIL')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exitCode = 1
} else {
  console.log(`Prioritization contract: PASS (${fixture.cases.length} deterministic fixtures)`)
}

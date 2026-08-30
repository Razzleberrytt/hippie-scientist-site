import { describe, expect, it } from 'vitest'

import { isNegatedMatch } from '../validate-evidence-language.mjs'

/**
 * The definitive-term and clinical-claim checks are substring matches, so a
 * sentence that explicitly *denies* a claim was flagged as *making* it.
 *
 * That is worse than noise. It puts pressure on an author to delete the
 * qualifier that makes a claim honest — "no established human clinical use"
 * reads as a violation, and the cheapest way to clear it is to stop saying
 * "no established". The audit would then be driving the copy in exactly the
 * direction it exists to prevent.
 *
 * Every negated case below is real text from the corpus.
 */
describe('evidence language negation', () => {
  const negated = [
    ['no established human clinical use', 'Preclinical evidence only; no established human clinical use.', 'established'],
    ['was not established', 'Safety was not established for the proposed 2.5 g/day novel-food use', 'established'],
    ['has no established evidence', 'Nutmeg has no established therapeutic evidence as a psychoactive agent', 'established'],
    ['more extrapolated than proven', 'downstream body-composition and sleep claims are more extrapolated than proven.', 'proven'],
    ['data is essentially absent', 'human clinical trial data is essentially absent and its FDA compounding status is unresolved', 'human clinical'],
  ]

  for (const [label, text, term] of negated) {
    it(`treats "${label}" as negated`, () => {
      expect(isNegatedMatch(text, text.toLowerCase().indexOf(term), term)).toBe(true)
    })
  }

  const asserted = [
    ['unhedged efficacy claim', 'EAAs stimulate muscle protein synthesis effectively.', 'effectively'],
    ['positive established use', 'with established IV clinical use for supraventricular tachycardia', 'established'],
    ['direct proven claim', 'Clinical trials demonstrate proven benefit in adults', 'proven'],
  ]

  for (const [label, text, term] of asserted) {
    it(`still flags a ${label}`, () => {
      expect(isNegatedMatch(text, text.toLowerCase().indexOf(term), term)).toBe(false)
    })
  }

  it('does not treat an unrelated earlier negation as covering a later claim', () => {
    // The lookbehind window is deliberately short. A "not" far away in an
    // unrelated clause must not license a definitive claim further along.
    const text = 'This is not a sedative. Trials demonstrate proven benefit for sleep onset in adults.'
    expect(isNegatedMatch(text, text.toLowerCase().indexOf('proven'), 'proven')).toBe(false)
  })
})

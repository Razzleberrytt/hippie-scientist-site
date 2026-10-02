import { describe, expect, it } from 'vitest'
import {
  requiredCopyForRoute,
  validateRequiredSourceCopy,
  validateBoundedUiContracts,
} from './validate-bounded-ui-contracts.mjs'

describe('bounded UI source contracts', () => {
  const verifier = `
    const routeContentExpectations = [
      {
        route: '/research',
        required: ['What are you trying to verify?', 'Three jobs, three clear destinations.'],
      },
    ]
  `

  it('extracts required postbuild copy for the bounded route', () => {
    expect(requiredCopyForRoute(verifier, '/research')).toEqual([
      'What are you trying to verify?',
      'Three jobs, three clear destinations.',
    ])
  })

  it('fails before build when postbuild copy drifts from the page source', () => {
    expect(validateRequiredSourceCopy({
      route: '/research',
      source: 'What are you trying to verify? Three jobs, three clear destinations.',
      verifierSource: verifier,
    })).toEqual([])

    expect(validateRequiredSourceCopy({
      route: '/research',
      source: 'What are you trying to verify? Four jobs, four clear destinations.',
      verifierSource: verifier,
    })).toEqual(['Three jobs, three clear destinations.'])
  })

  it('validates the current Research source against the postbuild contract', () => {
    expect(validateBoundedUiContracts()).toEqual({
      routes: 1,
      requiredCopyChecks: 2,
    })
  })
})

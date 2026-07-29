import React from 'react'
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import FailureChainCaseFile from '../FailureChainCaseFile'

const steps = [
  'Research was interpreted as support for unsupervised self-treatment',
  'Nonsterile biological material was injected',
  'Bloodstream infection and multiorgan failure developed',
]

describe('FailureChainCaseFile', () => {
  it('renders the case identity, ratings, and source basis', () => {
    render(
      <FailureChainCaseFile
        caseId="FC-001"
        incident="Intravenous mushroom tea"
        reported="Reported 2021"
        outcome="Critical illness; survived"
        primaryFailure="Injection of nonsterile biological material"
        preventability="Very high"
        medicalSeverity="Critical"
        documentationConfidence="Moderate"
        documentation="Single peer-reviewed case report"
        steps={steps}
      />
    )

    expect(screen.getByRole('heading', { name: 'Intravenous mushroom tea' })).toBeInTheDocument()
    expect(screen.getByText('FC-001')).toBeInTheDocument()
    expect(screen.getByText('Severity: Critical')).toBeInTheDocument()
    expect(screen.getByText('Preventability: Very high')).toBeInTheDocument()
    expect(screen.getByText('Documentation: Moderate')).toBeInTheDocument()
    expect(screen.getByText('Single peer-reviewed case report')).toBeInTheDocument()
  })

  it('renders the failure chain as an ordered list', () => {
    render(
      <FailureChainCaseFile
        caseId="FC-001"
        incident="Intravenous mushroom tea"
        reported="Reported 2021"
        outcome="Critical illness; survived"
        primaryFailure="Injection of nonsterile biological material"
        preventability="Very high"
        medicalSeverity="Critical"
        documentationConfidence="Moderate"
        documentation="Single peer-reviewed case report"
        steps={steps}
      />
    )

    const chain = screen.getByRole('list', { name: 'FC-001 failure chain' })
    expect(chain).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(steps.length)
    steps.forEach((step) => expect(screen.getByText(step)).toBeInTheDocument())
  })
})

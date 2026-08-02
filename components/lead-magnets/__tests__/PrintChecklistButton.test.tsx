import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import PrintChecklistButton from '../PrintChecklistButton'

describe('PrintChecklistButton', () => {
  it('opens the browser print dialog', () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => undefined)

    render(<PrintChecklistButton />)
    fireEvent.click(screen.getByRole('button', { name: 'Print checklist' }))

    expect(print).toHaveBeenCalledOnce()
    print.mockRestore()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button, buttonClassName } from '../Button'

describe('Button', () => {
  it('renders a native button with safe default type and primary styling', () => {
    render(<Button>Save</Button>)

    const button = screen.getByRole('button', { name: 'Save' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveClass('button-primary')
    expect(button).toHaveClass('min-h-11')
  })

  it('supports explicit variants and sizes without replacing consumer classes', () => {
    render(<Button variant='secondary' size='lg' className='extra-class'>Continue</Button>)

    const button = screen.getByRole('button', { name: 'Continue' })
    expect(button).toHaveClass('button-secondary')
    expect(button).toHaveClass('px-5')
    expect(button).toHaveClass('extra-class')
  })

  it('uses native disabled semantics', () => {
    const onClick = vi.fn()
    render(<Button disabled onClick={onClick}>Disabled</Button>)

    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
    button.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('blocks duplicate activation while loading and exposes busy state', () => {
    const onClick = vi.fn()
    render(
      <Button loading loadingLabel='Saving' onClick={onClick}>
        Save
      </Button>,
    )

    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(screen.getByText('Save')).toBeInTheDocument()
    button.click()
    expect(onClick).not.toHaveBeenCalled()
  })

  it('exposes the same class recipe for navigation controls without changing link semantics', () => {
    const classes = buttonClassName({ variant: 'ghost', size: 'sm', fullWidth: true })

    expect(classes).toContain('min-h-11')
    expect(classes).toContain('bg-transparent')
    expect(classes).toContain('px-3')
    expect(classes).toContain('w-full')
  })
})

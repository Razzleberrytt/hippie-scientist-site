import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import type { AnchorHTMLAttributes, ReactNode } from 'react'

import AboutClient from '../info/info/about/AboutClient'

vi.mock('next/link', () => {
  return {
    default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { children: ReactNode; href: string }) => (
      <a href={href} {...props}>
        {children}
      </a>
    ),
  }
})

describe('About page', () => {
  it('shows the premium personal snapshot', () => {
    render(<AboutClient />)

    expect(screen.getByRole('heading', { name: /Willie B\. Randolph III/i })).toBeInTheDocument()
    expect(screen.getByText(/Age 34, father of two little girls, and based in Oak Ridge, Tennessee/i)).toBeInTheDocument()
    expect(screen.getByText(/^Age$/)).toBeInTheDocument()
    expect(screen.getByText(/2 girls/)).toBeInTheDocument()
    expect(screen.getByText(/^Oak Ridge$/)).toBeInTheDocument()
  })
})

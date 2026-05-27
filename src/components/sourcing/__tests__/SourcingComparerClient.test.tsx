import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SourcingComparerClient from '../SourcingComparerClient'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

const mockHerbs = [
  {
    slug: 'valerian',
    name: 'Valerian Root',
  }
]

const mockCompounds = [
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
  }
]

describe('SourcingComparerClient', () => {
  it('renders default compared items on mount', () => {
    render(<SourcingComparerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    expect(screen.getByText('Contextual Sourcing Comparer')).toBeInTheDocument()
    expect(screen.getByText('Ashwagandha Extract')).toBeInTheDocument()
    expect(screen.getByText('Caffeine')).toBeInTheDocument()
  })

  it('updates cost per serving and active yield per dollar when values are modified', () => {
    render(<SourcingComparerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Select the price input for Ashwagandha (default price $19.99, servings 60)
    // Cost per serving = 19.99 / 60 = 0.333
    expect(screen.getByText('$0.33')).toBeInTheDocument()

    // Let's modify the price of Ashwagandha to $30.00
    // To query the correct input, we find by ID: price-ashwagandha
    const priceInput = screen.getByLabelText('Bottle Price ($)', { selector: '#price-ashwagandha' })
    fireEvent.change(priceInput, { target: { value: '30.00' } })

    // Cost per serving should now be 30.00 / 60 = $0.50
    expect(screen.getByText('$0.50')).toBeInTheDocument()
  })

  it('allows adding a custom brand/item manually', () => {
    render(<SourcingComparerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Fill custom inputs
    fireEvent.change(screen.getByLabelText('Item/Brand Name'), { target: { value: 'Super Ginseng' } })
    fireEvent.change(screen.getByLabelText('Bottle Price ($)', { selector: '#customPrice' }), { target: { value: '20.00' } })
    fireEvent.change(screen.getByLabelText('Servings', { selector: '#customServings' }), { target: { value: '40' } })

    // Click add button
    fireEvent.click(screen.getByRole('button', { name: /\+ Add to Comparison Dashboard/i }))

    // Expect to be added to comparison list
    expect(screen.getByText('Super Ginseng')).toBeInTheDocument()
    // Cost per serving: 20.00 / 40 = $0.50
    expect(screen.getAllByText('$0.50').length).toBeGreaterThan(0)
  })

  it('allows adding to sourcing cart and checking quality checklists', () => {
    render(<SourcingComparerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Cart is empty initially
    expect(screen.getByText('0 items')).toBeInTheDocument()

    // Click Add to Sourcing Cart for Caffeine
    const addToCartBtns = screen.getAllByRole('button', { name: /Add to Sourcing Cart/i })
    // The second button corresponds to Caffeine since Caffeine is second in the default comparison list
    fireEvent.click(addToCartBtns[1])

    expect(screen.getByText('1 items')).toBeInTheDocument()

    // Checklist checkboxes are displayed in the cart sidebar
    const coaCheckbox = screen.getByLabelText('Certificate of Analysis (COA) verified')
    expect(coaCheckbox).not.toBeChecked()

    fireEvent.click(coaCheckbox)
    expect(coaCheckbox).toBeChecked()
  })

  it('includes affiliate tag in outbound amazon links', () => {
    render(<SourcingComparerClient herbs={mockHerbs} compounds={mockCompounds} />)
    
    // Caffeine link
    const shopLink = screen.getAllByRole('link', { name: /Amazon Shop/i })[1]
    expect(shopLink.getAttribute('href')).toContain('tag=razzleberry02-20')
  })
})

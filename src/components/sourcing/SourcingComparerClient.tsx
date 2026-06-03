'use client'

import { useState, useMemo } from 'react'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isRestrictedIngredient, isRestrictedRecord } from '@/lib/restricted-ingredients'

interface SourcingItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  standardPrice: number // e.g. 20.00
  servings: number // e.g. 60
  doseMg: number // e.g. 600
  standardizationLabel: string // e.g. "5% Withanolides"
  standardizationPct: number // e.g. 0.05
}

interface SourcingComparerClientProps {
  herbs: any[]
  compounds: any[]
}

const DEFAULT_ITEMS: SourcingItem[] = [
  { slug: 'ashwagandha', name: 'Ashwagandha Extract', type: 'herb', standardPrice: 19.99, servings: 60, doseMg: 600, standardizationLabel: '5% Withanolides', standardizationPct: 0.05 },
  { slug: 'caffeine', name: 'Caffeine', type: 'compound', standardPrice: 11.99, servings: 100, doseMg: 200, standardizationLabel: '100% Pure', standardizationPct: 1.0 },
  { slug: 'l-theanine', name: 'L-Theanine', type: 'compound', standardPrice: 15.49, servings: 90, doseMg: 200, standardizationLabel: '100% Pure', standardizationPct: 1.0 },
  { slug: 'rhodiola', name: 'Rhodiola Rosea Extract', type: 'herb', standardPrice: 22.99, servings: 60, doseMg: 500, standardizationLabel: '3% Rosavins', standardizationPct: 0.03 },
  { slug: 'ginseng', name: 'Panax Ginseng Extract', type: 'herb', standardPrice: 24.99, servings: 50, doseMg: 500, standardizationLabel: '5% Ginsenosides', standardizationPct: 0.05 },
  { slug: 'bacopa', name: 'Bacopa Monnieri Extract', type: 'herb', standardPrice: 18.99, servings: 60, doseMg: 300, standardizationLabel: '20% Bacosides', standardizationPct: 0.20 },
]

function buildSourcingAmazonUrl(names: string[]) {
  const safeNames = names.filter(name => !isRestrictedIngredient(name))
  if (safeNames.length === 0) return ''

  return `https://www.amazon.com/s?k=${encodeURIComponent(safeNames.join(' + '))}&tag=${AFFILIATE_TAGS.amazon}`
}

export default function SourcingComparerClient({ herbs, compounds }: SourcingComparerClientProps) {
  // Combine databases for search autocomplete
  const searchCandidates = useMemo(() => {
    return [
      ...herbs.map(item => ({ slug: item.slug, name: item.name, type: 'herb' as const })),
      ...compounds.map(item => ({ slug: item.slug, name: item.name, type: 'compound' as const }))
    ].filter(item => !isRestrictedRecord(item))
  }, [herbs, compounds])

  // State for compared items (initialized with Ashwagandha & Caffeine)
  const [comparedItems, setComparedItems] = useState<SourcingItem[]>([
    DEFAULT_ITEMS[0],
    DEFAULT_ITEMS[1],
  ])

  // State for custom calculator inputs
  const [customName, setCustomName] = useState('My Store Brand')
  const [customPrice, setCustomPrice] = useState(25.00)
  const [customServings, setCustomServings] = useState(60)
  const [customDose, setCustomDose] = useState(500)
  const [customStdLabel, setCustomStdLabel] = useState('10% Actives')
  const [customStdPct, setCustomStdPct] = useState(10)

  // State for sourcing cart
  const [cartSlugs, setCartSlugs] = useState<string[]>([])
  
  // Checklist verification states per cart item
  const [checklist, setChecklist] = useState<Record<string, { coa: boolean; testing: boolean; metals: boolean }>>({})

  // Dropdown options
  const [searchQuery, setSearchQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleAddCompared = (candidate: { slug: string; name: string; type: 'herb' | 'compound' }) => {
    // Check if already compared
    if (comparedItems.some(i => i.slug === candidate.slug)) return
    
    // Find if it has default data, otherwise initialize mock data
    const matchedDefault = DEFAULT_ITEMS.find(i => i.slug === candidate.slug)
    const newItem: SourcingItem = matchedDefault || {
      slug: candidate.slug,
      name: candidate.name,
      type: candidate.type,
      standardPrice: 20.00,
      servings: 60,
      doseMg: 400,
      standardizationLabel: 'Standard extract',
      standardizationPct: 0.05
    }

    setComparedItems(prev => [...prev, newItem])
    setSearchQuery('')
    setIsOpen(false)
  }

  const handleRemoveCompared = (slug: string) => {
    setComparedItems(prev => prev.filter(i => i.slug !== slug))
  }

  const handleUpdateItemValue = (slug: string, field: keyof SourcingItem, val: any) => {
    setComparedItems(prev =>
      prev.map(item => {
        if (item.slug === slug) {
          return { ...item, [field]: val }
        }
        return item
      })
    )
  }

  const handleAddCustom = () => {
    if (isRestrictedIngredient(customName)) return

    const slug = `custom-${Date.now()}`
    const newItem: SourcingItem = {
      slug,
      name: customName,
      type: 'herb',
      standardPrice: customPrice,
      servings: customServings,
      doseMg: customDose,
      standardizationLabel: customStdLabel,
      standardizationPct: customStdPct / 100
    }
    setComparedItems(prev => [...prev, newItem])
  }

  // Sourcing Cart toggles
  const handleToggleCart = (slug: string) => {
    setCartSlugs(prev => {
      if (prev.includes(slug)) {
        return prev.filter(s => s !== slug)
      } else {
        // Initialize checklist state for item
        setChecklist(prevCheck => ({
          ...prevCheck,
          [slug]: { coa: false, testing: false, metals: false }
        }))
        return [...prev, slug]
      }
    })
  }

  const handleToggleChecklist = (slug: string, field: 'coa' | 'testing' | 'metals') => {
    setChecklist(prev => {
      const current = prev[slug] || { coa: false, testing: false, metals: false }
      return {
        ...prev,
        [slug]: { ...current, [field]: !current[field] }
      }
    })
  }

  // Filter autocomplete list
  const filteredCandidates = useMemo(() => {
    if (!searchQuery) return []
    return searchCandidates.filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !comparedItems.some(item => item.slug === c.slug)
    ).slice(0, 8)
  }, [searchQuery, searchCandidates, comparedItems])

  // Perform sourcing audit calculations for compared list
  const auditResults = useMemo(() => {
    return comparedItems.map(item => {
      const costPerServing = item.standardPrice / (item.servings || 1)
      const costPerMgActive = costPerServing / ((item.doseMg * item.standardizationPct) || 1)
      
      // Calculate active compound yield per $1.00 spent:
      // Active yield (mg) per dose = doseMg * standardizationPct
      // Yield per $1.00 = Active yield / costPerServing
      const activeYieldPerDollar = (item.doseMg * item.standardizationPct) / (costPerServing || 1)

      let costTier: 'Low Cost' | 'Moderate Cost' | 'High Cost' = 'Moderate Cost'
      if (costPerServing < 0.25) {
        costTier = 'Low Cost'
      } else if (costPerServing > 0.55) {
        costTier = 'High Cost'
      }

      let efficiencyRating: 'Highly Cost-Efficient yield' | 'Standard yield efficiency' | 'Low yield efficiency' = 'Standard yield efficiency'
      if (activeYieldPerDollar > 100) {
        efficiencyRating = 'Highly Cost-Efficient yield'
      } else if (activeYieldPerDollar < 25) {
        efficiencyRating = 'Low yield efficiency'
      }

      return {
        ...item,
        costPerServing,
        activeYieldPerDollar,
        costTier,
        efficiencyRating
      }
    })
  }, [comparedItems])

  // Get current cart items list
  const cartItems = useMemo(() => {
    return auditResults.filter(i => cartSlugs.includes(i.slug))
  }, [auditResults, cartSlugs])

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Sourcing Comparison Dashboard */}
      <div className='lg:col-span-2 space-y-6'>
        {/* Dropdown Search to add compared items */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <h2 className='text-lg font-bold text-slate-800' id='comparer-title'>Contextual Sourcing Comparer</h2>
            <p className='text-xs text-slate-500'>Compare serving costs, dosage standardization, and active yield efficiency.</p>
          </div>

          <div className='relative'>
            <input
              type='text'
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value)
                setIsOpen(true)
              }}
              onFocus={() => setIsOpen(true)}
              placeholder="Search botanical database to add to comparison..."
              className='w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-emerald-500 focus:outline-none'
              id='comparer-search-input'
            />
            {isOpen && filteredCandidates.length > 0 && (
              <div className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredCandidates.map(c => (
                  <button
                    key={c.slug}
                    onClick={() => handleAddCompared(c)}
                    type='button'
                    className='flex w-full items-center justify-between px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50'
                  >
                    <span>{c.name}</span>
                    <span className='rounded bg-slate-100 px-2 py-0.5 text-[9px] uppercase font-bold text-slate-500'>{c.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mapped Comparisons */}
        <div className='space-y-4'>
          {auditResults.length === 0 ? (
            <p className='text-center text-sm text-slate-400 italic py-10 rounded-3xl border-2 border-dashed border-slate-200 bg-white'>
              No items in comparison. Use the search box above to add items.
            </p>
          ) : (
            auditResults.map(item => (
              <div
                key={item.slug}
                className='rounded-3xl border border-brand-900/10 bg-white/95 p-5 shadow-sm space-y-4'
              >
                {/* Header info */}
                <div className='flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3'>
                  <div>
                    <h3 className='text-base font-bold text-slate-800'>{item.name}</h3>
                    <p className='text-xs text-slate-400 mt-0.5'>{item.standardizationLabel} ({(item.standardizationPct * 100).toFixed(0)}% Standardization)</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button
                      type='button'
                      onClick={() => handleToggleCart(item.slug)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold border transition ${
                        cartSlugs.includes(item.slug)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                      }`}
                    >
                      {cartSlugs.includes(item.slug) ? '✓ In Cart' : '🛒 Add to Sourcing Cart'}
                    </button>
                    <button
                      type='button'
                      onClick={() => handleRemoveCompared(item.slug)}
                      className='text-slate-400 hover:text-rose-600 text-xs p-1'
                      aria-label={`Remove ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Adjustable parameters */}
                <div className='grid gap-4 sm:grid-cols-4 text-xs'>
                  <div>
                    <label htmlFor={`price-${item.slug}`} className='block text-slate-400 font-medium mb-1'>Bottle Price ($)</label>
                    <input
                      type='number'
                      id={`price-${item.slug}`}
                      value={item.standardPrice}
                      onChange={e => handleUpdateItemValue(item.slug, 'standardPrice', parseFloat(e.target.value) || 0)}
                      className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                      step='0.01'
                    />
                  </div>
                  <div>
                    <label htmlFor={`servings-${item.slug}`} className='block text-slate-400 font-medium mb-1'>Servings</label>
                    <input
                      type='number'
                      id={`servings-${item.slug}`}
                      value={item.servings}
                      onChange={e => handleUpdateItemValue(item.slug, 'servings', parseInt(e.target.value) || 1)}
                      className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                  <div>
                    <label htmlFor={`doseMg-${item.slug}`} className='block text-slate-400 font-medium mb-1'>Dose (mg)</label>
                    <input
                      type='number'
                      id={`doseMg-${item.slug}`}
                      value={item.doseMg}
                      onChange={e => handleUpdateItemValue(item.slug, 'doseMg', parseInt(e.target.value) || 0)}
                      className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                    />
                  </div>
                  <div>
                    <label htmlFor={`pct-${item.slug}`} className='block text-slate-400 font-medium mb-1'>Active % (1-100)</label>
                    <input
                      type='number'
                      id={`pct-${item.slug}`}
                      value={Math.round(item.standardizationPct * 100)}
                      onChange={e => handleUpdateItemValue(item.slug, 'standardizationPct', (parseFloat(e.target.value) || 0) / 100)}
                      className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                      min='1'
                      max='100'
                    />
                  </div>
                </div>

                {/* Audit analysis metrics (Task 3.1 & Task 3.2) */}
                <div className='grid gap-3.5 sm:grid-cols-3 border-t border-slate-100 pt-3 text-center'>
                  <div className='rounded-2xl bg-slate-50/50 border border-slate-100 p-3'>
                    <span className='block text-[9px] uppercase font-bold text-slate-400 mb-0.5'>Cost per serving</span>
                    <p className='text-sm font-bold text-slate-800'>${item.costPerServing.toFixed(2)}</p>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold uppercase mt-1 ${
                      item.costTier === 'Low Cost'
                        ? 'bg-emerald-150 text-emerald-800'
                        : item.costTier === 'High Cost'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-amber-50 text-amber-800'
                    }`}>
                      {item.costTier}
                    </span>
                  </div>

                  <div className='rounded-2xl bg-slate-50/50 border border-slate-100 p-3'>
                    <span className='block text-[9px] uppercase font-bold text-slate-400 mb-0.5'>Active yield per $1.00</span>
                    <p className='text-sm font-bold text-slate-800'>{item.activeYieldPerDollar.toFixed(1)} mg</p>
                    <span className={`inline-block rounded px-1.5 py-0.5 text-[8px] font-bold uppercase mt-1 ${
                      item.efficiencyRating === 'Highly Cost-Efficient yield'
                        ? 'bg-emerald-150 text-emerald-800'
                        : item.efficiencyRating === 'Low yield efficiency'
                        ? 'bg-rose-50 text-rose-700'
                        : 'bg-slate-100 text-slate-500'
                    }`}>
                      {item.efficiencyRating}
                    </span>
                  </div>

                  <div className='rounded-2xl bg-slate-50/50 border border-slate-100 p-3 flex flex-col justify-center'>
                    <span className='block text-[9px] uppercase font-bold text-slate-400 mb-0.5'>Sourcing Affiliate Tag</span>
                    <a
                      href={buildSourcingAmazonUrl([item.name])}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center justify-center gap-1 mt-1 text-xs font-bold text-emerald-700 hover:text-emerald-850 hover:underline'
                    >
                      Amazon Shop ↗
                    </a>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Custom Input Calculator */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-base font-bold text-slate-800'>Add Custom Brand/Item to Audit</h2>
          <p className='text-xs text-slate-500'>Found an ingredient in a local store? Add its parameters manually to compare yield metrics against standard catalog entries.</p>

          <div className='grid gap-4 sm:grid-cols-3 text-xs'>
            <div>
              <label htmlFor='customName' className='block text-slate-400 font-medium mb-1'>Item/Brand Name</label>
              <input
                type='text'
                id='customName'
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
              />
            </div>
            <div>
              <label htmlFor='customPrice' className='block text-slate-400 font-medium mb-1'>Bottle Price ($)</label>
              <input
                type='number'
                id='customPrice'
                value={customPrice}
                onChange={e => setCustomPrice(parseFloat(e.target.value) || 0)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                step='0.01'
              />
            </div>
            <div>
              <label htmlFor='customServings' className='block text-slate-400 font-medium mb-1'>Servings</label>
              <input
                type='number'
                id='customServings'
                value={customServings}
                onChange={e => setCustomServings(parseInt(e.target.value) || 1)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
              />
            </div>
            <div>
              <label htmlFor='customDose' className='block text-slate-400 font-medium mb-1'>Dose per Serving (mg)</label>
              <input
                type='number'
                id='customDose'
                value={customDose}
                onChange={e => setCustomDose(parseInt(e.target.value) || 0)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
              />
            </div>
            <div>
              <label htmlFor='customStdLabel' className='block text-slate-400 font-medium mb-1'>Active Label (e.g. 5% Withanolides)</label>
              <input
                type='text'
                id='customStdLabel'
                value={customStdLabel}
                onChange={e => setCustomStdLabel(e.target.value)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
              />
            </div>
            <div>
              <label htmlFor='customStdPct' className='block text-slate-400 font-medium mb-1'>Active standardization %</label>
              <input
                type='number'
                id='customStdPct'
                value={customStdPct}
                onChange={e => setCustomStdPct(parseFloat(e.target.value) || 0)}
                className='w-full rounded-xl border border-slate-200 px-3 py-2 text-slate-700 focus:outline-none focus:border-emerald-500'
                min='1'
                max='100'
              />
            </div>
          </div>

          <button
            type='button'
            onClick={handleAddCustom}
            className='rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs py-2 px-4 transition-all'
          >
            + Add to Comparison Dashboard
          </button>
        </div>
      </div>

      {/* Sourcing Cart & Checklist Workspace */}
      <div className='lg:col-span-1 space-y-6'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-5'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-slate-800'>Sourcing Cart</h2>
            <span className='rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
              {cartItems.length} items
            </span>
          </div>

          {cartItems.length === 0 ? (
            <p className='text-xs text-slate-400 italic py-6 text-center border-2 border-dashed border-slate-100 rounded-2xl'>
              Your sourcing cart is empty. Click "Add to Sourcing Cart" on any compared ingredient to verify quality checkmarks.
            </p>
          ) : (
            <div className='space-y-5'>
              {cartItems.map(item => {
                const itemCheck = checklist[item.slug] || { coa: false, testing: false, metals: false }
                
                return (
                  <div
                    key={item.slug}
                    className='rounded-2xl border border-slate-100 bg-slate-50/50 p-4 space-y-3'
                  >
                    <div className='flex items-center justify-between border-b border-slate-100 pb-2'>
                      <div>
                        <h3 className='text-xs font-bold text-slate-800'>{item.name}</h3>
                        <span className='text-[10px] text-slate-400'>${item.costPerServing.toFixed(2)}/serving</span>
                      </div>
                      <button
                        type='button'
                        onClick={() => handleToggleCart(item.slug)}
                        className='text-slate-400 hover:text-rose-600 text-xs'
                        aria-label={`Remove ${item.name} from cart`}
                      >
                        ✕ Remove
                      </button>
                    </div>

                    {/* Quality standards checkboxes (Task 3.3) */}
                    <div className='space-y-1.5 text-[11px] text-slate-600'>
                      <span className='block text-[9px] uppercase font-bold text-slate-400 mb-1'>Required Quality Checks</span>
                      
                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={itemCheck.coa}
                          onChange={() => handleToggleChecklist(item.slug, 'coa')}
                          className='rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5'
                        />
                        <span>Certificate of Analysis (COA) verified</span>
                      </label>

                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={itemCheck.testing}
                          onChange={() => handleToggleChecklist(item.slug, 'testing')}
                          className='rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5'
                        />
                        <span>Third-party laboratory tested</span>
                      </label>

                      <label className='flex items-center gap-2 cursor-pointer'>
                        <input
                          type='checkbox'
                          checked={itemCheck.metals}
                          onChange={() => handleToggleChecklist(item.slug, 'metals')}
                          className='rounded text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5'
                        />
                        <span>Heavy metals & toxin screens passed</span>
                      </label>
                    </div>

                    {/* Affiliate Buy Redirect Button */}
                    <div className='pt-2'>
                      <a
                        href={buildSourcingAmazonUrl([item.name])}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='block w-full text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 transition-all'
                      >
                        🛒 Source on Amazon
                      </a>
                    </div>
                  </div>
                )
              })}

              {/* Checkout checklist aggregation */}
              <div className='border-t border-slate-100 pt-3 space-y-3.5'>
                <div className='rounded-2xl bg-amber-50 border border-amber-200/50 p-4 text-[11px] leading-relaxed text-amber-950'>
                  <p className='font-bold text-amber-900'>✓ Quality Standard Assurance:</p>
                  <p className='mt-1 opacity-90'>
                    Before buying, double check that chosen brands display current COAs and third-party laboratory seals. Do not source botanical supplements from unverified sellers.
                  </p>
                </div>

                <a
                  href={buildSourcingAmazonUrl(cartItems.map(i => i.name))}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block w-full text-center rounded-2xl bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs py-3 px-4 transition-all'
                >
                  🛒 Source Entire Cart Combo (Amazon)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

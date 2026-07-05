'use client'

import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Canonical section groups for herb pages.
 * h2s matching these patterns get merged into shared cards.
 * Unmatched h2s become standalone cards.
 */
const CANONICAL_GROUPS: { label: string; patterns: string[]; color: string }[] = [
  {
    label: 'Quick Facts',
    patterns: ['At a Glance', 'Quick Answer', 'Evidence Snapshot', 'TL;DR'],
    color: 'border-l-brand-800',
  },
  {
    label: 'What to Expect',
    patterns: ['What to Expect', 'What .+ Feels Like', 'What .+ Actually', 'Timeline', 'Real Talk'],
    color: 'border-l-brand-700',
  },
  {
    label: 'How to Use It',
    patterns: ['Dosage', 'Dosing', 'Practical Dosage', 'How to Take', 'Timing', 'Protocol', 'Stacking', 'How to Choose', 'Buying Guide', 'Product Selection', 'Extract Types', 'Forms'],
    color: 'border-l-sage-500',
  },
  {
    label: 'The Evidence',
    patterns: ['Clinical Evidence', 'The Evidence', 'Study', 'Trial', 'Research'],
    color: 'border-l-brand-600',
  },
  {
    label: 'How It Works',
    patterns: ['How It Works', 'Mechanism', 'Chemistry', 'Pharmacology', 'Active Compound'],
    color: 'border-l-brand-500',
  },
  {
    label: 'Safety',
    patterns: ['Safety', 'Contraindication', 'Side Effect', 'Drug Interaction', 'Liver Safety', 'Warning'],
    color: 'border-l-amber-600',
  },
  {
    label: 'FAQ',
    patterns: ['FAQ', 'Frequently Asked'],
    color: 'border-l-sage-400',
  },
]

function findGroup(title: string): (typeof CANONICAL_GROUPS)[number] | null {
  for (const group of CANONICAL_GROUPS) {
    for (const pat of group.patterns) {
      if (new RegExp(pat, 'i').test(title)) return group
    }
  }
  return null
}

export default function ContentCards({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    const h2s = Array.from(ref.current.querySelectorAll('h2'))
    if (h2s.length === 0) return

    // Assign each h2 to a canonical group
    const plan: { group: (typeof CANONICAL_GROUPS)[number] | null; h2s: HTMLHeadingElement[] }[] = []
    
    h2s.forEach((h2) => {
      const title = h2.textContent?.trim() || ''
      const group = findGroup(title)
      const last = plan[plan.length - 1]

      if (last && last.group === group) {
        // Same group — merge
        last.h2s.push(h2)
      } else {
        plan.push({ group, h2s: [h2] })
      }
    })

    // Wrap each plan entry into a section card
    plan.forEach((entry) => {
      if (entry.h2s.length === 0) return
      
      const wrapper = document.createElement('section')
      const isMulti = entry.h2s.length > 1
      const color = entry.group?.color || 'border-l-brand-500'
      
      wrapper.className = `my-6 rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-sm ring-1 ring-brand-900/5 border-l-4 ${color}`
      
      if (entry.group && isMulti) {
        const label = document.createElement('div')
        label.className = 'text-xs font-bold uppercase tracking-wider text-brand-600 mb-3 pb-2 border-b border-brand-900/10'
        label.textContent = entry.group.label
        wrapper.appendChild(label)
      }
      
      // Move all content from first h2 through last h2
      const firstH2 = entry.h2s[0]
      const lastH2 = entry.h2s[entry.h2s.length - 1]
      const parent = firstH2.parentNode
      if (!parent) return

      let current: Element | null = firstH2
      while (current) {
        const next = current.nextElementSibling
        wrapper.appendChild(current)
        if (current === lastH2) {
          // Also grab content after last h2 until next h2
          let after = next
          while (after && after.tagName !== 'H2') {
            const afterNext = after.nextElementSibling
            wrapper.appendChild(after)
            after = afterNext
          }
          break
        }
        current = next
      }
      
      parent.insertBefore(wrapper, firstH2)
    })

    // Wrap intro content (before first h2)
    const firstSection = ref.current.querySelector('section')
    if (firstSection) {
      const introCard = document.createElement('section')
      introCard.className = 'my-6 rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-sm ring-1 ring-brand-900/5 border-l-4 border-l-brand-800'
      
      let el = ref.current.firstElementChild
      while (el && el !== firstSection) {
        const next = el.nextElementSibling
        if (el.tagName !== 'SECTION') {
          introCard.appendChild(el)
        }
        el = next
      }
      
      if (introCard.children.length > 0) {
        ref.current.insertBefore(introCard, firstSection)
      }
    }
  }, [])

  return (
    <div ref={ref} className="content-prose max-w-none [&>*]:max-w-reading [&_a]:font-semibold [&_a]:text-brand-800 [&_a:hover]:underline [&_blockquote]:max-w-reading [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-brand-700/40 [&_blockquote]:bg-brand-50/60 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_code]:break-all [&_h2]:mt-0 [&_h2]:text-2xl [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-brand-900/10 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_td]:break-words [&_th]:border-b [&_th]:border-brand-900/10 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_ul]:list-disc">
      {children}
    </div>
  )
}

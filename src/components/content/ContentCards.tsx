'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const SECTION_COLORS = [
  'border-l-brand-600',
  'border-l-sage-500',
  'border-l-brand-400',
  'border-l-sage-400',
] as const

/**
 * Wraps MDX content and splits it into visual cards at h2 boundaries.
 * Each h2 section becomes its own card with alternating accent colors.
 */
export default function ContentCards({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Find all h2 elements
    const h2s = ref.current.querySelectorAll('h2')
    if (h2s.length === 0) return

    // Wrap each h2 + its following content in a section card
    h2s.forEach((h2, i) => {
      const wrapper = document.createElement('section')
      const color = SECTION_COLORS[i % SECTION_COLORS.length]
      wrapper.className = `my-6 rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-sm ring-1 ring-brand-900/5 border-l-4 ${color}`
      
      // Move h2 and all following siblings until next h2 into the wrapper
      const parent = h2.parentNode
      if (!parent) return
      
      wrapper.appendChild(h2.cloneNode(false))
      
      let next = h2.nextElementSibling
      while (next && next.tagName !== 'H2') {
        const toMove = next
        next = next.nextElementSibling
        wrapper.appendChild(toMove)
      }
      
      // Replace original h2 with the wrapped version
      parent.insertBefore(wrapper, h2)
      h2.remove()
    })

    // Handle content before the first h2 (TL;DR, At a Glance) — leave as-is but wrap in its own card
    const first = ref.current.querySelector('section')
    if (first) {
      const prev = first.previousElementSibling
      if (prev && prev.tagName !== 'H2' && prev.tagName !== 'SECTION') {
        const introCard = document.createElement('section')
        introCard.className = 'my-6 rounded-xl border-2 border-brand-900/12 bg-white p-5 shadow-sm ring-1 ring-brand-900/5 border-l-4 border-l-brand-700'
        
        // Move all content before the first h2 section into the intro card
        let el = ref.current.firstElementChild
        while (el && el !== first) {
          const toMove = el
          el = el.nextElementSibling
          if (toMove.tagName !== 'SECTION') {
            introCard.appendChild(toMove)
          }
        }
        
        if (introCard.children.length > 0) {
          ref.current.insertBefore(introCard, first)
        }
      }
    }
  }, [])

  return (
    <div ref={ref} className="content-prose max-w-none [&>*]:max-w-reading [&_a]:font-semibold [&_a]:text-brand-800 [&_a:hover]:underline [&_blockquote]:max-w-reading [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-brand-700/40 [&_blockquote]:bg-brand-50/60 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_code]:break-all [&_h2]:mt-0 [&_h2]:text-2xl [&_h3]:mt-4 [&_h3]:text-xl [&_ol]:list-decimal [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-brand-900/10 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_td]:break-words [&_th]:border-b [&_th]:border-brand-900/10 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_ul]:list-disc">
      {children}
    </div>
  )
}

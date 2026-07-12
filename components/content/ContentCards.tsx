'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const CANONICAL_GROUPS: { patterns: string[] }[] = [
  { patterns: ['At a Glance', 'Quick Answer', 'Evidence Snapshot', 'TL;DR'] },
  { patterns: ['What to Expect', 'What .+ Feels Like', 'What .+ Actually', 'Timeline', 'Real Talk'] },
  { patterns: ['Dosage', 'Dosing', 'Practical Dosage', 'How to Take', 'Timing', 'Protocol', 'Stacking', 'How to Choose', 'Buying Guide', 'Product Selection', 'Extract Types', 'Forms'] },
  { patterns: ['Clinical Evidence', 'The Evidence', 'Study', 'Trial', 'Research'] },
  { patterns: ['How It Works', 'Mechanism', 'Chemistry', 'Pharmacology', 'Active Compound'] },
  { patterns: ['Safety', 'Contraindication', 'Side Effect', 'Drug Interaction', 'Liver Safety', 'Warning', 'Cautions'] },
  { patterns: ['FAQ', 'Frequently Asked'] },
]

function findGroup(title: string): (typeof CANONICAL_GROUPS)[number] | null {
  for (const group of CANONICAL_GROUPS) {
    for (const pat of group.patterns) {
      if (new RegExp(pat, 'i').test(title)) return group
    }
  }
  return null
}

/**
 * Wraps a DOM node tree in a <details> collapsible element.
 * Used for combination warnings and other caution content.
 */
function wrapInDetails(
  startEl: Element,
  endEl: Element | null,
  title: string,
  open = false
) {
  const details = document.createElement('details')
  details.className = 'article-caution-block group'
  if (open) details.setAttribute('open', '')

  const summary = document.createElement('summary')
  summary.className = 'flex cursor-pointer select-none items-center gap-2 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100/40 transition-colors'

  const icon = document.createElement('span')
  icon.className = 'text-xs mr-1'
  icon.setAttribute('aria-hidden', 'true')
  icon.textContent = '!'

  const label = document.createElement('span')
  label.textContent = title

  const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  chevron.setAttribute('class', 'ml-auto size-4 transition-transform group-open:rotate-180')
  chevron.setAttribute('viewBox', '0 0 16 16')
  chevron.setAttribute('fill', 'none')
  chevron.setAttribute('stroke', 'currentColor')
  chevron.setAttribute('stroke-width', '2')
  chevron.setAttribute('aria-hidden', 'true')
  chevron.setAttribute('focusable', 'false')

  const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  chevronPath.setAttribute('d', 'M4 6l4 4 4-4')
  chevronPath.setAttribute('stroke-linecap', 'round')
  chevronPath.setAttribute('stroke-linejoin', 'round')
  chevron.appendChild(chevronPath)

  summary.append(icon, label, chevron)
  details.appendChild(summary)

  const content = document.createElement('div')
  content.className = 'border-t border-amber-600/20 px-4 pb-4 pt-2 text-sm leading-6 text-amber-900/80'

  const parent = startEl.parentNode
  if (!parent) return

  // Insert the (still-empty) details shell at startEl's original position
  // before moving anything — startEl stops being parent's child the moment
  // the loop below appends it into content, so inserting relative to it
  // afterward would throw (it's no longer a child of parent).
  parent.insertBefore(details, startEl)
  details.appendChild(content)

  let current: Element | null = startEl
  while (current && current !== endEl) {
    const next: Element | null = current.nextElementSibling
    content.appendChild(current)
    current = next
  }
}

export default function ContentCards({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!ref.current) return

    // Editorial components (ScientificVerdictCard, DecisionMatrix, RealityCheck,
    // …) render self-contained blocks marked `.not-prose`. Their internal
    // headings/paragraphs must be left untouched — grouping or re-parenting them
    // would tear the components apart. `isEditorial` excludes that whole subtree.
    const isEditorial = (el: Element) => Boolean(el.closest('.not-prose'))

    const h2s = Array.from(ref.current.querySelectorAll('h2')).filter((h2) => !isEditorial(h2))
    if (h2s.length === 0) return

    // ── Step 1: Wrap combination warnings in collapsible <details> ──
    const allElements = Array.from(ref.current.querySelectorAll('*')).filter((el) => !isEditorial(el))
    for (const el of allElements) {
      const text = el.textContent?.trim() || ''
      
      // Match "Do NOT combine with:" or "Avoid stacking with:" patterns
      if (
        el.tagName === 'STRONG' &&
        /do\s*not\s*combine|avoid\s*(stacking|combining)|stacks\s*to\s*avoid|should\s*not\s*be\s*combined/i.test(text)
      ) {
        // Find the parent list or paragraph to wrap
        const listParent = el.closest('ul, ol') || el.closest('p')
        if (listParent && !listParent.closest('details')) {
          const cautionPara = listParent.nextElementSibling?.tagName === 'P' && /caution|avoid/i.test(listParent.nextElementSibling.textContent || '')
            ? listParent.nextElementSibling
            : null
          // Bound the wrap to listParent (plus the caution paragraph, if any) —
          // falling back to null here would make wrapInDetails walk every
          // remaining sibling in the section into one collapsed block.
          const endEl = cautionPara ? cautionPara.nextElementSibling : listParent.nextElementSibling
          wrapInDetails(listParent, endEl, 'Combination Cautions', false)
        }
      }

      // Match standalone caution/warning paragraphs about combining
      if (
        el.tagName === 'P' &&
        /\b(do not|should not|cannot|must not)\b.*\b(combine|mix|take with|stack with)\b/i.test(text) &&
        !el.closest('details')
      ) {
        wrapInDetails(el, el.nextElementSibling, 'Caution', false)
      }
    }

    // ── Step 2: Group h2s into canonical section cards ──
    const plan: { group: (typeof CANONICAL_GROUPS)[number] | null; h2s: HTMLHeadingElement[] }[] = []
    
    h2s.forEach((h2) => {
      const title = h2.textContent?.trim() || ''
      const group = findGroup(title)
      const last = plan[plan.length - 1]
      if (last && last.group === group) {
        last.h2s.push(h2)
      } else {
        plan.push({ group, h2s: [h2] })
      }
    })

    plan.forEach((entry) => {
      if (entry.h2s.length === 0) return
      const wrapper = document.createElement('section')
      wrapper.className = 'article-section-card'
      
      const firstH2 = entry.h2s[0]
      const lastH2 = entry.h2s[entry.h2s.length - 1]
      const parent = firstH2.parentNode
      if (!parent) return

      // Insert the wrapper at firstH2's original position before moving
      // anything into it — same reasoning as wrapInDetails above.
      parent.insertBefore(wrapper, firstH2)

      let current: Element | null = firstH2
      while (current) {
        const next: Element | null = current.nextElementSibling
        wrapper.appendChild(current)
        if (current === lastH2) {
          let after: Element | null = next
          // Stop at the next heading OR any standalone editorial block so those
          // components stay as top-level siblings instead of being absorbed
          // (and double-wrapped) into this section card.
          while (after && after.tagName !== 'H2' && !isEditorial(after)) {
            const afterNext: Element | null = after.nextElementSibling
            wrapper.appendChild(after)
            after = afterNext
          }
          break
        }
        current = next
      }
    })

    // ── Step 3: Wrap intro content ──
    const firstSection = ref.current.querySelector('section')
    if (firstSection) {
      const introCard = document.createElement('section')
      introCard.className = 'article-section-card article-intro-card'
      let el = ref.current.firstElementChild
      while (el && el !== firstSection) {
        const next = el.nextElementSibling
        if (el.tagName !== 'SECTION') introCard.appendChild(el)
        el = next
      }
      if (introCard.children.length > 0) ref.current.insertBefore(introCard, firstSection)
    }
  }, [])

  return (
    <div ref={ref} className="content-prose article-card-flow max-w-none [&>*]:max-w-reading [&_a]:font-semibold [&_a]:text-brand-800 [&_a:hover]:underline [&_blockquote]:max-w-reading [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-brand-700/40 [&_blockquote]:bg-brand-50/60 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_code]:break-all [&_h2]:mt-0 [&_h2]:text-2xl [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-brand-900/10 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_td]:break-words [&_th]:border-b [&_th]:border-brand-900/10 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_ul]:list-disc">
      {children}
    </div>
  )
}

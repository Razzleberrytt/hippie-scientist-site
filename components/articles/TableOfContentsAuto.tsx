'use client'

import { useEffect, useState } from 'react'
import TableOfContents from './TableOfContents'
import type { Heading } from './extractHeadings'

/**
 * Detects h2/h3 elements with id attributes from the article body after mount
 * and renders them as a table of contents. Returns null when no headings are found.
 *
 * Use this as the `toc` prop in ArticleLayout for pages that don't supply a
 * hardcoded headings array:
 *   <ArticleLayout toc={<TableOfContentsAuto />}>
 */
export default function TableOfContentsAuto() {
  const [headings, setHeadings] = useState<Heading[]>([])

  useEffect(() => {
    const elements = document.querySelectorAll('article h2[id], article h3[id]')
    const detected: Heading[] = Array.from(elements)
      .map(el => ({
        id: el.id,
        text: el.textContent?.trim() ?? '',
        level: (el.tagName === 'H2' ? 2 : 3) as 2 | 3,
      }))
      .filter(h => h.id && h.text)
    setHeadings(detected)
  }, [])

  if (!headings.length) return null

  return <TableOfContents headings={headings} />
}

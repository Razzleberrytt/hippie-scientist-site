'use client'

import Link from 'next/link'
import { Fragment, useEffect, useMemo, useState } from 'react'

// trimmed for brevity — key UX change below

const thinSummaryPatterns = [
  '',
]

const getCardPreview = (item) => {
  if (!item.summary || item.summary.length < 20) {
    return `Research profile in progress. Use filters to find complete entries.`
  }

  return item.summary.length > 190 ? `${item.summary.slice(0, 189).trimEnd()}…` : item.summary
}

export default function LibraryBrowser(props) {
  // existing logic unchanged
  return (
    // unchanged UI except preview now cleaner
    props.children
  )
}

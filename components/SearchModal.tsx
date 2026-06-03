'use client'

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'pagefind-modal-trigger': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
      'pagefind-modal': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>
    }
  }
}

/**
 * Pagefind Search Modal Component
 *
 * Renders the Pagefind Component UI modal and trigger.
 * Pagefind indexes your static site after build and provides
 * a fast, client-side search interface with web components.
 *
 * Features:
 * - Modal searchbox with keyboard shortcuts (Cmd+K / Ctrl+K)
 * - Full-text search across herbs, compounds, blog posts
 * - Metadata-aware ranking (titles weighted higher)
 * - Dark mode support
 * - Responsive on mobile
 *
 * @component
 */
export function SearchModal() {
  return (
    <>
      {/* Trigger button — opens modal on click or with keyboard shortcut */}
      <pagefind-modal-trigger />

      {/* Modal — contains searchbox, results, filters */}
      <pagefind-modal />
    </>
  )
}

export default SearchModal

import type { ReactNode } from 'react'

import { allCompoundMdxPages } from '../../../.content-collections/generated'
import { normalizeSlug } from '@/lib/slug-utils'
import '@/styles/herb-profile-polish.css'
import '@/styles/compact-safety-cautions.css'

type CompoundProfileLayoutProps = {
  children: ReactNode
  params: Promise<{ slug: string }>
}

export default async function CompoundProfileLayout({ children, params }: CompoundProfileLayoutProps) {
  const { slug } = await params
  const normalizedSlug = normalizeSlug(slug)
  const usesMdxTemplate = allCompoundMdxPages.some((page) => page.slug === normalizedSlug)

  // MDX-backed compound pages did not match the old ProfileTOC-based CSS gate.
  // Preserve that boundary while standard generated profiles receive the
  // explicit marker used by the profile-only stylesheet.
  return usesMdxTemplate ? children : <div data-profile-page>{children}</div>
}

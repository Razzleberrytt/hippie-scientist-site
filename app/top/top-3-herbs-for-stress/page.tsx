import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { AffiliateConversionCard } from '@/components/affiliate-conversion-card'

// rest of original code unchanged above return

// INSERT BELOW HEADER SECTION:
<AffiliateConversionCard
  title="Ashwagandha"
  description="Best overall for long-term stress, calm, and cortisol support."
  href={getHerbSearchLinks('Ashwagandha')[0]?.url || '#'}
  secondaryHref="/compare/ashwagandha-vs-rhodiola-rosea"
/>

// rest unchanged

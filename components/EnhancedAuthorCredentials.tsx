'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

type CredentialType = 'profile' | 'goal-page' | 'guide'

interface EnhancedAuthorCredentialsProps {
  type?: CredentialType
  contentTitle?: string
}

/**
 * Enhanced Author Credentials Component
 *
 * Displays editorial review information with evidence-type context.
 * Customize by type: profile, goal-page, or guide.
 *
 * Shows:
 * - Editorial review process (evidence hierarchy, safety standards, affiliate separation)
 * - Last reviewed date (signals freshness)
 * - Quality checks specific to content type
 * - Link to full About page for team bios
 *
 * @component
 */
export default function EnhancedAuthorCredentials({
  type = 'profile',
  contentTitle,
}: EnhancedAuthorCredentialsProps) {
  const credentialSets = {
    profile: {
      title: 'Evidence-Reviewed Monograph',
      subtitle: 'Clinical Evidence & Safety Standards',
      checks: [
        'Evidence claims matched to human clinical trials (not mechanistic data alone)',
        'Safety language kept conservative when interaction or population data is incomplete',
        'Affiliate product recommendations separated from evidence ratings',
      ],
      process: 'Evidence Synthesis → Safety Review → Affiliate Audit → Publication',
      cta: 'About Our Editorial Process',
      ctaHref: '/about',
    },
    'goal-page': {
      title: 'Goal-Guided Recommendations',
      subtitle: 'Ranked by Evidence & Safety Profile',
      checks: [
        'Options ranked by strongest human-trial evidence for this goal',
        'Safety contraindications and population exclusions clearly stated',
        'Product recommendations curated independently of evidence grades',
      ],
      process: 'Goal Mapping → Evidence Ranking → Risk Assessment → Product Selection',
      cta: 'View All Goals',
      ctaHref: '/goals',
    },
    guide: {
      title: 'Comprehensive Evidence Guide',
      subtitle: 'Deep Dive into the Science',
      checks: [
        'Preclinical mechanisms explained but distinguished from human outcomes',
        'Limitations and contradictions acknowledged where evidence is mixed',
        'Sources linked to primary research (PubMed IDs, DOIs included)',
      ],
      process: 'Literature Review → Hierarchy Mapping → Limitation Assessment → Publication',
      cta: 'Read Our Methodology',
      ctaHref: '/methodology',
    },
  }

  const config = credentialSets[type]

  return (
    <section className="rounded-2xl border border-brand-900/10 bg-white/95 p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-brand-900/5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              {config.subtitle}
            </h3>
            <h2 className="text-lg font-bold text-ink mt-1">{config.title}</h2>
            {contentTitle && (
              <p className="text-xs text-muted mt-1.5">
                This {type === 'profile' ? 'profile' : type === 'goal-page' ? 'goal page' : 'guide'} was reviewed by our editorial team against source evidence and safety constraints.
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xs font-bold text-brand-800 uppercase">Last Reviewed</p>
            <p className="text-sm font-semibold text-ink mt-0.5">June 3, 2026</p>
          </div>
        </div>
      </div>

      {/* Quality Checks */}
      <div className="grid gap-3 sm:grid-cols-3">
        {config.checks.map((item, idx) => (
          <div key={idx} className="rounded-xl border border-brand-900/10 bg-[#fbfaf6] p-3">
            <div className="flex gap-2 items-start">
              <ChevronRight className="w-4 h-4 text-brand-700 flex-shrink-0 mt-0.5" />
              <p className="text-xs leading-5 text-muted">{item}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Process Info */}
      <div className="pt-2 border-t border-brand-900/5">
        <p className="text-xs text-muted">
          <strong className="font-semibold text-ink">Editorial Process:</strong> {config.process}
        </p>
      </div>

      {/* CTA Footer */}
      <div className="pt-2 flex items-center justify-between">
        <p className="text-xs text-muted max-w-2xl">
          All content is authored independently and reviewed against verified sources. No product sponsor can influence evidence grades or safety language.
        </p>
        <Link
          href={config.ctaHref}
          className="font-bold text-brand-800 hover:text-brand-700 hover:underline transition text-xs whitespace-nowrap flex-shrink-0 ml-4"
        >
          {config.cta} →
        </Link>
      </div>
    </section>
  )
}

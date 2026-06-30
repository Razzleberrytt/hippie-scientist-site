import type { Metadata } from 'next'
import { buildPageMetadata } from '../../src/lib/seo'
import Image from 'next/image'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Infographics — Free to Share',
  description: 'Evidence-based infographics on sleep supplements and ADHD supplements. Free to embed with attribution — share the data, not the hype.',
  path: '/info/info/infographics/',
})

import Link from 'next/link'

const infoGraphicEmbedCode = (slug: string, width: number, height: number, alt: string) => 
  `<a href="https://thehippiescientist.net/evidence/evidence/evidence-report/">
  <img src="https://thehippiescientist.net/info/info/infographics/${slug}.png" 
       alt="${alt}" width="${width}" height="${height}" 
       style="max-width:100%;height:auto;border:0" />
</a>
<p style="font-size:12px;color:#666">Data from 
  <a href="https://thehippiescientist.net/evidence/evidence/evidence-report/">The Hippie Scientist Evidence Report</a>
</p>`

export default function InfographicsPage() {
  return (
    <div className="container-page py-10 space-y-12">
      <section className="space-y-4 max-w-4xl">
        <p className="eyebrow-label">Shareable Resources</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Free Supplement Evidence Infographics
        </h1>
        <p className="text-lg leading-8 text-muted">
          Download or embed these evidence-based infographics on your site. 
          Free to share with attribution — help people find the data, not the marketing.
        </p>
      </section>

      {/* Infographic 1 */}
      <section className="max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Sleep Supplements: Evidence vs Hype</h2>
        <div className="card-premium p-4">
          <Image
            src="/info/info/infographics/sleep-supplements-evidence.png"
            alt="Sleep Supplements Evidence vs Hype infographic showing evidence grades for melatonin, magnesium, valerian, ashwagandha, L-theanine, and glycine based on 816 peer-reviewed studies"
            width={600}
            height={800}
            className="w-full rounded-xl border border-brand-900/10"
            unoptimized
          />
        </div>
        <details className="card-premium p-4 cursor-pointer">
          <summary className="text-sm font-semibold text-ink">Embed code — copy and paste</summary>
          <pre className="mt-3 text-xs leading-relaxed bg-surface-subtle p-3 rounded-lg overflow-x-auto text-muted">
{infoGraphicEmbedCode('sleep-supplements-evidence', 600, 800, 'Sleep Supplements Evidence vs Hype — The Hippie Scientist')}
          </pre>
        </details>
      </section>

      {/* Infographic 2 */}
      <section className="max-w-4xl space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">ADHD Supplements: What the Research Actually Shows</h2>
        <div className="card-premium p-4">
          <Image
            src="/info/info/infographics/adhd-supplements-evidence.png"
            alt="ADHD Supplements evidence infographic showing clinical trial strength for Omega-3, Magnesium, Zinc, L-Theanine, Citicoline, Iron, and Vitamin D based on 816 peer-reviewed studies"
            width={600}
            height={800}
            className="w-full rounded-xl border border-brand-900/10"
            unoptimized
          />
        </div>
        <details className="card-premium p-4 cursor-pointer">
          <summary className="text-sm font-semibold text-ink">Embed code — copy and paste</summary>
          <pre className="mt-3 text-xs leading-relaxed bg-surface-subtle p-3 rounded-lg overflow-x-auto text-muted">
{infoGraphicEmbedCode('adhd-supplements-evidence', 600, 800, 'ADHD Supplements Evidence Levels — The Hippie Scientist')}
          </pre>
        </details>
      </section>

      {/* How to use */}
      <section className="max-w-4xl card-premium p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ink">How to use these infographics</h2>
        <div className="space-y-3 text-sm leading-7 text-muted">
          <p><strong>Bloggers & journalists:</strong> Copy the embed code above and paste into your article HTML. The image links back to our evidence report.</p>
          <p><strong>Social media:</strong> Download the image and share on Instagram, Twitter, Pinterest, or TikTok. Tag @HippieScientist.</p>
          <p><strong>Health practitioners:</strong> Print and display in your office or share as a patient handout.</p>
          <p><strong>Educators & students:</strong> Use in presentations, papers, and coursework with attribution.</p>
        </div>
        <div className="pt-2">
          <Link href="/evidence/evidence/evidence-report/" className="text-sm font-bold text-brand-700 transition hover:text-brand-800">
            Read the full Evidence Report →
          </Link>
        </div>
      </section>
    </div>
  )
}

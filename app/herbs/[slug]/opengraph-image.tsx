import { ImageResponse } from 'next/og'
import { getHerbMetadataRecord } from '../../../src/lib/runtime-metadata-cache'
import { getHerbSummaryIndex } from '../../../src/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '../../../lib/runtime-visibility'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const dynamic = 'force-static'

export async function generateStaticParams() {
  const herbs = await getHerbSummaryIndex()
  return herbs
    .filter((h: any) => getRuntimeVisibility(h).canRender)
    .map((h: any) => ({ slug: String(h.slug) }))
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const herb = await getHerbMetadataRecord(slug)
  const name = String(herb?.displayName || herb?.name || slug)
  const grade = String(herb?.evidence_grade || herb?.evidenceTier || 'Research')
    .split(/[–—]/)[0].trim()
  const summary = String(herb?.summary || '').slice(0, 120)

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: 'linear-gradient(135deg, #fffdf7 0%, #eef8f1 60%, #d9f0df 100%)', padding: '48px', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: '100%', borderRadius: '32px', border: '1px solid rgba(16,32,24,0.08)', background: 'rgba(255,255,255,0.6)', padding: '48px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(16,32,24,0.5)', marginBottom: '16px' }}>
              The Hippie Scientist · Herb Profile
            </div>
            <div style={{ fontSize: 72, fontWeight: 800, color: '#111a16', lineHeight: 1.0, letterSpacing: '-0.04em' }}>
              {name}
            </div>
            {summary && (
              <div style={{ display: 'flex', fontSize: 28, color: 'rgba(16,32,24,0.7)', marginTop: '20px', lineHeight: 1.4, maxWidth: '800px' }}>
                {summary + '…'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ padding: '10px 20px', borderRadius: '999px', background: '#314b33', color: '#fff', fontSize: 18, fontWeight: 600 }}>
              {grade}
            </div>
            <div style={{ padding: '10px 20px', borderRadius: '999px', background: 'rgba(49,75,51,0.1)', color: '#314b33', fontSize: 18, fontWeight: 600 }}>
              Evidence-Based Research
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  )
}

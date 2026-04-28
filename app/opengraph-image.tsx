import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const alt = 'The Hippie Scientist — science-first herb education'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #07111f 0%, #0f172a 45%, #1e293b 100%)',
          color: '#f8fafc',
          padding: '56px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: '100%',
            height: '100%',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '28px',
            padding: '44px',
            background: 'rgba(255,255,255,0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 26,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(248,250,252,0.72)',
              }}
            >
              Science-first herb education
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '920px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: '-0.04em',
              }}
            >
              The Hippie Scientist
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 30,
                lineHeight: 1.35,
                color: 'rgba(248,250,252,0.82)',
              }}
            >
              Plain-English, science-first education about herbs, compounds, and
              related research notes.
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {['Herbs', 'Compounds', 'Blog'].map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '12px 20px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: 24,
                  color: 'rgba(248,250,252,0.88)',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}

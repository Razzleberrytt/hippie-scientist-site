import { ImageResponse } from 'next/og'

export const alt = 'The Hippie Scientist — herbs, compounds, and research notes'
export const size = {
  width: 1200,
  height: 600,
}
export const contentType = 'image/png'

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #07111f 0%, #0f172a 45%, #1e293b 100%)',
          color: '#f8fafc',
          padding: '40px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '24px',
            background: 'rgba(255,255,255,0.04)',
            padding: '36px',
            justifyContent: 'space-between',
            alignItems: 'stretch',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              maxWidth: '760px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(248,250,252,0.72)',
              }}
            >
              Science-first herb education
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 64,
                  fontWeight: 700,
                  lineHeight: 1.04,
                  letterSpacing: '-0.04em',
                }}
              >
                The Hippie Scientist
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 28,
                  lineHeight: 1.35,
                  color: 'rgba(248,250,252,0.82)',
                }}
              >
                Herbs, compounds, and research notes in plain English.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {['Herbs', 'Compounds', 'Blog'].map(label => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    padding: '10px 18px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: 22,
                    color: 'rgba(248,250,252,0.88)',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              width: '220px',
              height: '220px',
              alignSelf: 'center',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: 'radial-gradient(circle at 30% 30%, rgba(96,165,250,0.35), rgba(255,255,255,0.04))',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 88,
            }}
          >
            🌿
          </div>
        </div>
      </div>
    ),
    size,
  )
}

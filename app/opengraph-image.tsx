import { ImageResponse } from 'next/og'

export const dynamic = 'force-static'

export const alt = 'The Hippie Scientist — evidence-first herb and compound reference'
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
          justifyContent: 'space-between',
          alignItems: 'stretch',
          background: 'linear-gradient(135deg, #fffdf7 0%, #eef8f1 60%, #d9f0df 100%)',
          color: '#102018',
          padding: '48px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            width: '100%',
            borderRadius: '32px',
            border: '1px solid rgba(16,32,24,0.08)',
            background: 'rgba(255,255,255,0.55)',
            padding: '48px',
            justifyContent: 'space-between',
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
                flexDirection: 'column',
                gap: '22px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  letterSpacing: '0.24em',
                  textTransform: 'uppercase',
                  color: 'rgba(16,32,24,0.58)',
                }}
              >
                Evidence-first herb education
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 74,
                  fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.05em',
                }}
              >
                The Hippie Scientist
              </div>

              <div
                style={{
                  display: 'flex',
                  fontSize: 32,
                  lineHeight: 1.35,
                  color: 'rgba(16,32,24,0.76)',
                  maxWidth: '680px',
                }}
              >
                Evidence-first herb & compound reference built around pathways, mechanisms, safety, and semantic discovery.
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap',
              }}
            >
              {['Herbs', 'Compounds', 'Pathways', 'Research'].map(label => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    padding: '12px 20px',
                    borderRadius: '999px',
                    background: '#358f52',
                    color: '#ffffff',
                    fontSize: 22,
                    fontWeight: 600,
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
              width: '240px',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '180px',
                height: '180px',
                borderRadius: '999px',
                background: 'rgba(53,143,82,0.12)',
                border: '2px solid rgba(53,143,82,0.18)',
                position: 'absolute',
              }}
            />

            <div
              style={{
                display: 'flex',
                width: '120px',
                height: '120px',
                borderRadius: '999px',
                background: 'rgba(53,143,82,0.22)',
                border: '2px solid rgba(53,143,82,0.24)',
                position: 'absolute',
              }}
            />

            <div
              style={{
                display: 'flex',
                width: '46px',
                height: '46px',
                borderRadius: '999px',
                background: '#358f52',
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  )
}

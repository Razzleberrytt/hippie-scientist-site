import { getSemanticArtwork, type SemanticArtworkKind } from '@/lib/semantic-artwork-registry'

type SemanticArtworkPanelProps = {
  slug?: string | null
  kind?: SemanticArtworkKind
  title?: string
  subtitle?: string
  height?: number
}

function motifGlyph(motif: string) {
  if (/root|adaptogen/.test(motif)) return '❋'
  if (/energy|spark/.test(motif)) return '✦'
  if (/sleep|calm/.test(motif)) return '◌'
  if (/molecule|mineral/.test(motif)) return '⬡'
  if (/network|pathway/.test(motif)) return '⌘'
  if (/cell/.test(motif)) return '◎'
  return '✺'
}

export default function SemanticArtworkPanel({
  slug,
  kind = 'botanical',
  title,
  subtitle,
  height = 320,
}: SemanticArtworkPanelProps) {
  const artwork = getSemanticArtwork(slug, kind)

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 shadow-card"
      aria-label={artwork.alt}
      style={{
        background: `linear-gradient(135deg, ${artwork.palette.base} 0%, ${artwork.palette.mid} 100%)`,
        minHeight: height,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),transparent_60%)]" />

      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full opacity-[0.22]"
        role="presentation"
      >
        {artwork.motifs.map((motif, index) => {
          const x = 20 + ((index * 19) % 70)
          const y = 22 + ((index * 23) % 58)
          const radius = 7 + (index % 3) * 3

          return (
            <g key={`${motif}-${index}`}>
              <circle
                cx={x}
                cy={y}
                r={radius}
                fill="none"
                stroke={artwork.palette.accent}
                strokeWidth="0.55"
              />

              <text
                x={x}
                y={y + 1.5}
                textAnchor="middle"
                fontSize="4"
                fill={artwork.palette.accent}
              >
                {motifGlyph(motif)}
              </text>
            </g>
          )
        })}

        {artwork.motifs.map((motif, index) => {
          const x1 = 20 + ((index * 19) % 70)
          const y1 = 22 + ((index * 23) % 58)
          const x2 = 20 + (((index + 1) * 19) % 70)
          const y2 = 22 + (((index + 1) * 23) % 58)

          return (
            <line
              key={`edge-${motif}-${index}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={artwork.palette.accent}
              strokeOpacity="0.4"
              strokeWidth="0.35"
            />
          )
        })}
      </svg>

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <div className="rounded-full border border-white/40 bg-white/20 px-4 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] backdrop-blur-md" style={{ color: artwork.palette.ink }}>
            {artwork.kind} ecosystem
          </div>

          <div
            className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/20 text-3xl backdrop-blur-md"
            style={{ color: artwork.palette.accent }}
          >
            {motifGlyph(artwork.motifs[0] || 'network')}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h2
              className="max-w-[14ch] text-3xl font-semibold tracking-tight sm:text-4xl"
              style={{ color: artwork.palette.ink }}
            >
              {title || artwork.title}
            </h2>

            <p
              className="mt-3 max-w-[40rem] text-sm leading-7 sm:text-base"
              style={{ color: artwork.palette.ink, opacity: 0.86 }}
            >
              {subtitle || artwork.alt}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {artwork.motifs.map((motif) => (
              <span
                key={motif}
                className="rounded-full border border-white/40 bg-white/20 px-3 py-1 text-xs backdrop-blur-md"
                style={{ color: artwork.palette.ink }}
              >
                {motif}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

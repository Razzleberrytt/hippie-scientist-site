import { getBotanicalVisual } from '../lib/botanical-visual-system'

type BotanicalHeroVisualProps = {
  slug?: string | null
  title?: string
  subtitle?: string
  size?: 'default' | 'large'
}

export default function BotanicalHeroVisual({
  slug,
  title,
  subtitle,
  size = 'default',
}: BotanicalHeroVisualProps) {
  const visual = getBotanicalVisual(slug)

  return (
    <div
      className={`relative overflow-hidden rounded-[2rem] border border-white/30 shadow-card ${
        size === 'large' ? 'min-h-[340px]' : 'min-h-[260px]'
      }`}
      style={{
        background: visual.gradient,
        color: visual.accent,
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),transparent_60%)]" />
      <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay">
        <div className="absolute left-[8%] top-[12%] text-[10rem] leading-none">
          {visual.glyph}
        </div>
        <div className="absolute bottom-[6%] right-[10%] text-[7rem] leading-none">
          {visual.glyph}
        </div>
      </div>

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-white/40 bg-white/20 px-4 py-1 text-[0.68rem] font-bold uppercase tracking-[0.18em] backdrop-blur-md">
            Botanical ecosystem
          </span>

          <span className="text-5xl opacity-90 sm:text-6xl">
            {visual.glyph}
          </span>
        </div>

        <div className="space-y-3">
          {title ? (
            <h2 className="max-w-[12ch] text-3xl font-semibold tracking-tight sm:text-4xl">
              {title}
            </h2>
          ) : null}

          {subtitle ? (
            <p className="max-w-[34rem] text-sm leading-7 opacity-90 sm:text-base">
              {subtitle}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs backdrop-blur-md">
              {visual.atmosphere}
            </span>
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs backdrop-blur-md">
              semantic identity
            </span>
            <span className="rounded-full border border-white/30 bg-white/20 px-3 py-1 text-xs backdrop-blur-md">
              pathway visualization
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

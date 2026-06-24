import { useMemo, useState, type ReactNode } from 'react'

type ResultsSummaryCardProps = {
  goal: string
  blendName: string
  herbs: string[]
  explanation: string
  timestamp?: string
  ctaButtons?: ReactNode
  variant?: 'compact' | 'expanded'
  className?: string
  sharePath?: string
}

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) return null
  const parsed = new Date(timestamp)
  if (Number.isNaN(parsed.getTime())) return timestamp
  return parsed.toLocaleString()
}

export default function ResultsSummaryCard({
  goal,
  blendName,
  herbs,
  explanation,
  timestamp,
  ctaButtons,
  variant = 'expanded',
  className = '',
  sharePath = '/build',
}: ResultsSummaryCardProps) {
  const isCompact = variant === 'compact'
  const formattedTimestamp = formatTimestamp(timestamp)
  const [shareMessage, setShareMessage] = useState<'idle' | 'copied' | 'shared'>('idle')
  const shareGoal = goal
    .toLowerCase()
    .replace(/[^a-z\s/-]/g, '')
    .split(/[/\s-]+/)
    .find(Boolean)
  const shareUrl = useMemo(() => {
    const goalParam = shareGoal || 'calm'
    const herbParam = herbs
      .map(herb =>
        herb
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
      )
      .filter(Boolean)
      .join(',')
    const pathWithParams = `${sharePath}?goal=${encodeURIComponent(goalParam)}${
      herbParam ? `&herbs=${encodeURIComponent(herbParam)}` : ''
    }`
    if (typeof window === 'undefined') {
      return `https://thehippiescientist.net/#${pathWithParams}`
    }
    return `${window.location.origin}/#${pathWithParams}`
  }, [herbs, shareGoal, sharePath])
  const shareText = useMemo(
    () =>
      `I just built a ${blendName} using:\n${herbs.map(herb => `- ${herb}`).join('\n')}\nTry it here: ${shareUrl}`,
    [blendName, herbs, shareUrl]
  )

  const setSuccessState = (state: 'copied' | 'shared') => {
    setShareMessage(state)
    window.setTimeout(() => {
      setShareMessage('idle')
    }, 1800)
  }

  const handleCopy = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText)
        setSuccessState('copied')
        return
      }
      if (typeof window !== 'undefined') {
        window.prompt('Copy your blend summary', shareText)
      }
    } catch {
      if (typeof window !== 'undefined') {
        window.prompt('Copy your blend summary', shareText)
      }
    }
  }

  const handleNativeShare = async () => {
    if (typeof navigator === 'undefined' || !navigator.share) return
    try {
      await navigator.share({
        title: blendName,
        text: shareText,
        url: shareUrl,
      })
      setSuccessState('shared')
    } catch {
      // User canceled or browser blocked share.
    }
  }

  return (
    <article
      className={`border-white/12 from-black/40/95 via-black/40/85 to-black/40/70 relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_34px_-24px_rgba(148,163,184,0.62)] ${isCompact ? 'space-y-3 p-3.5' : 'space-y-4 p-4 sm:p-5'} ${className}`}
    >
      <div className='via-lime-400/4 pointer-events-none absolute inset-0 bg-gradient-to-r from-lime-400/10 to-transparent' />
      <div className='relative z-10 space-y-2'>
        <p className='text-[11px] uppercase tracking-[0.2em] text-white/60'>Recommended blend</p>
        <h3
          className={`${isCompact ? 'text-base' : 'text-lg sm:text-xl'} font-semibold text-white`}
        >
          {blendName}
        </h3>
        <span className='bg-lime-400/16 inline-flex rounded-full border border-lime-400/35 px-2.5 py-1 text-[11px] font-semibold capitalize tracking-[0.08em] text-lime-300'>
          {goal}
        </span>
      </div>

      <p
        className={`${isCompact ? 'text-xs' : 'text-sm'} relative z-10 leading-relaxed text-white/60`}
      >
        {explanation}
      </p>

      <div className='relative z-10 space-y-2'>
        <p className='text-[11px] uppercase tracking-[0.18em] text-white/60'>Included herbs</p>
        {herbs.length ? (
          <ul
            className={`${isCompact ? 'text-xs' : 'text-sm'} list-inside list-disc space-y-1.5 text-white/60`}
          >
            {herbs.map(herb => (
              <li key={`${blendName}-${herb}`}>{herb}</li>
            ))}
          </ul>
        ) : (
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-white/60`}>
            No herbs saved yet.
          </p>
        )}
      </div>

      {formattedTimestamp && (
        <p className='relative z-10 border-t border-white/10 pt-2 text-[11px] text-white/60'>
          Recommended: {formattedTimestamp}
        </p>
      )}

      <div className='relative z-10 space-y-2.5 border-t border-white/10 pt-2.5'>
        {(ctaButtons || herbs.length > 0) && (
          <div className='flex flex-wrap items-center gap-2'>
            {ctaButtons}
            <button
              type='button'
              onClick={handleCopy}
              className='border-white/18 min-h-9 rounded-lg border bg-black/20 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-lime-400/40 hover:text-white'
            >
              Share
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type='button'
                onClick={handleNativeShare}
                className='border-white/18 min-h-9 rounded-lg border bg-black/20 px-3 py-1.5 text-xs font-medium text-white/60 transition hover:border-lime-400/40 hover:text-white'
              >
                Native share
              </button>
            )}
          </div>
        )}
        {shareMessage === 'copied' && <p className='text-xs text-lime-300'>Copied ✓</p>}
        {shareMessage === 'shared' && <p className='text-xs text-lime-300'>Shared ✓</p>}
      </div>
    </article>
  )
}

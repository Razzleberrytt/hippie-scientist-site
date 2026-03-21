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
    .split(/[\/\s-]+/)
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
      className={`border-border/80 from-panel/95 via-panel/86 to-panel/76 relative overflow-hidden rounded-2xl border bg-gradient-to-br shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_18px_34px_-24px_rgba(148,163,184,0.62)] ${isCompact ? 'space-y-3.5 p-3.5' : 'space-y-4 p-4 sm:p-5'} ${className}`}
    >
      <div className='from-brand-lime/14 via-brand-lime/4 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
      <div className='relative z-10 space-y-2.5'>
        <p className='text-sub text-[11px] uppercase tracking-[0.2em]'>Your Recommended Blend</p>
        <h3 className={`${isCompact ? 'text-base' : 'text-lg sm:text-xl'} text-text font-semibold`}>
          {blendName}
        </h3>
        <span className='text-brand-lime bg-brand-lime/18 border-brand-lime/35 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize tracking-[0.08em]'>
          {goal}
        </span>
      </div>

      <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub relative z-10 leading-relaxed`}>
        {explanation}
      </p>

      <div className='relative z-10 space-y-2.5'>
        <p className='text-sub text-[11px] uppercase tracking-[0.18em]'>Herb list</p>
        {herbs.length ? (
          <ul
            className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub list-inside list-disc space-y-1.5`}
          >
            {herbs.map(herb => (
              <li key={`${blendName}-${herb}`}>{herb}</li>
            ))}
          </ul>
        ) : (
          <p className={`${isCompact ? 'text-xs' : 'text-sm'} text-sub`}>No herbs saved yet.</p>
        )}
      </div>

      {formattedTimestamp && (
        <p className='text-sub relative z-10 border-t border-white/10 pt-2 text-[11px]'>
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
              className='border-border/70 text-sub hover:text-text hover:border-brand-lime/40 min-h-9 rounded-lg border bg-black/20 px-3 py-1.5 text-xs font-medium transition'
            >
              Share
            </button>
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                type='button'
                onClick={handleNativeShare}
                className='border-border/70 text-sub hover:text-text hover:border-brand-lime/40 min-h-9 rounded-lg border bg-black/20 px-3 py-1.5 text-xs font-medium transition'
              >
                Native share
              </button>
            )}
          </div>
        )}
        {shareMessage === 'copied' && <p className='text-brand-lime text-xs'>Copied ✓</p>}
        {shareMessage === 'shared' && <p className='text-brand-lime text-xs'>Shared ✓</p>}
      </div>
    </article>
  )
}

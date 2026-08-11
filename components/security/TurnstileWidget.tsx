'use client'

import { useEffect, useRef } from 'react'

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ) => string
  reset: (widgetId?: string) => void
}

type TurnstileWindow = Window & { turnstile?: TurnstileApi }

type TurnstileWidgetProps = {
  onTokenChange: (token: string) => void
  resetKey?: number
  className?: string
}

export const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || ''
export const turnstileEnabled = Boolean(turnstileSiteKey)

const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

function getTurnstile(): TurnstileApi | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as TurnstileWindow).turnstile
}

function loadScript() {
  if (typeof document === 'undefined') return
  if (document.querySelector(`script[src="${SCRIPT_SRC}"]`)) return

  const script = document.createElement('script')
  script.src = SCRIPT_SRC
  script.async = true
  script.defer = true
  document.head.appendChild(script)
}

export default function TurnstileWidget({
  onTokenChange,
  resetKey = 0,
  className = 'min-h-[65px]',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | undefined>(undefined)
  const lastResetKeyRef = useRef(resetKey)
  const onTokenChangeRef = useRef(onTokenChange)

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange
  }, [onTokenChange])

  useEffect(() => {
    if (!turnstileEnabled || !containerRef.current || widgetIdRef.current) return

    let cancelled = false
    let retryTimer: number | undefined
    loadScript()

    const renderWhenReady = () => {
      if (cancelled || !containerRef.current || widgetIdRef.current) return
      const turnstile = getTurnstile()

      if (turnstile) {
        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => onTokenChangeRef.current(token),
          'expired-callback': () => onTokenChangeRef.current(''),
          'error-callback': () => onTokenChangeRef.current(''),
        })
        return
      }

      retryTimer = window.setTimeout(renderWhenReady, 150)
    }

    renderWhenReady()

    return () => {
      cancelled = true
      if (retryTimer !== undefined) window.clearTimeout(retryTimer)
    }
  }, [])

  useEffect(() => {
    if (!turnstileEnabled || resetKey === lastResetKeyRef.current) return
    lastResetKeyRef.current = resetKey
    onTokenChangeRef.current('')
    getTurnstile()?.reset(widgetIdRef.current)
  }, [resetKey])

  if (!turnstileEnabled) return null
  return <div ref={containerRef} className={className} />
}

type SafetyGaugeMeterProps = {
  /** 0-100 safety score; higher is safer */
  score: number
  label: string
  className?: string
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy - r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle)
  const end = polarToCartesian(cx, cy, r, endAngle)
  const largeArcFlag = Math.abs(startAngle - endAngle) > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`
}

export default function SafetyGaugeMeter({ score, label, className = '' }: SafetyGaugeMeterProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  const needleAngle = 180 - (180 * clamped) / 100
  const needleTip = polarToCartesian(50, 50, 34, needleAngle)

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <svg
        viewBox="0 0 100 58"
        className="w-full max-w-[200px]"
        role="img"
        aria-label={`Safety meter: ${clamped} out of 100 — ${label}`}
      >
        <path d={describeArc(50, 50, 40, 180, 120)} stroke="#dc4c3c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d={describeArc(50, 50, 40, 120, 60)} stroke="#e8a13c" strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d={describeArc(50, 50, 40, 60, 0)} stroke="#2f9e52" strokeWidth="9" fill="none" strokeLinecap="round" />
        <line
          x1="50"
          y1="50"
          x2={needleTip.x}
          y2={needleTip.y}
          className="stroke-ink dark:stroke-white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="3.5" className="fill-ink dark:fill-white" />
      </svg>
      <p className="-mt-2 text-2xl font-bold text-ink">{clamped}%</p>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
    </div>
  )
}

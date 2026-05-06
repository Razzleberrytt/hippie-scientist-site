function cleanLabel(value: string) {
  return value
    .replace(/_/g, ' ')
    .replace(/\bhealthy aging\b/gi, 'Healthy aging')
    .replace(/\bfat loss\b/gi, 'Fat loss')
    .replace(/\bstress mood\b/gi, 'Stress & mood')
    .replace(/\bsleep quality\b/gi, 'Sleep quality')
    .replace(/\bgeneral wellness\b/gi, 'General wellness')
}

export default function DecisionCard({
  bestFor = [],
  avoid = [],
  time = '',
  evidence = ''
}: any) {
  const cleanedBestFor = bestFor
    .filter(Boolean)
    .map((item:any) => cleanLabel(String(item)))
    .slice(0, 3)

  const cleanedAvoid = avoid
    .filter(Boolean)
    .map((item:any) => cleanLabel(String(item)))

  return (
    <div className="surface-depth card-spacing section-spacing">

      <div className="grid gap-6 md:grid-cols-2">

        <div className="space-y-3">
          <p className="eyebrow-label">Best for</p>

          <ul className="space-y-3 text-sm leading-7 text-[#435246]">
            {cleanedBestFor.length > 0 ? cleanedBestFor.map((b:any,i:number)=>(
              <li key={i} className="flex gap-3">
                <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-brand-700" />
                <span>{b}</span>
              </li>
            )) : (
              <li className="text-[#5a685f]">
                General wellness and exploratory support.
              </li>
            )}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="eyebrow-label">Safety context</p>

          {cleanedAvoid.length > 0 ? (
            <ul className="space-y-3 text-sm leading-7 text-[#435246]">
              {cleanedAvoid.map((a:any,i:number)=>(
                <li key={i} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-7 text-[#435246]">
              No major cautions surfaced in the current profile.
            </p>
          )}
        </div>

      </div>

      <div className="flex flex-wrap gap-3 border-t border-brand-900/10 pt-2 text-xs font-medium">
        <span className="chip-readable">⏱ {time || 'Varies by dosage and context'}</span>
        {evidence ? (
          <span className="chip-readable">📊 {cleanLabel(evidence)}</span>
        ) : null}
      </div>

    </div>
  )
}

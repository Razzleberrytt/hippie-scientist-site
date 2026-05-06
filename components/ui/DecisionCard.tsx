export default function DecisionCard({
  bestFor = [],
  avoid = [],
  time = '',
  evidence = ''
}: any) {
  return (
    <div className="surface-depth card-spacing section-spacing">

      <div className="grid gap-6 md:grid-cols-2">

        <div className="space-y-3">
          <p className="eyebrow-label">Best for</p>

          <ul className="space-y-3 text-sm leading-7 text-[#435246]">
            {bestFor.slice(0,3).map((b:any,i:number)=>(
              <li key={i} className="flex gap-3">
                <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-brand-700" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <p className="eyebrow-label">Use caution</p>

          <ul className="space-y-3 text-sm leading-7 text-[#435246]">
            {avoid.length
              ? avoid.map((a:any,i:number)=>(
                <li key={i} className="flex gap-3">
                  <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-amber-600" />
                  <span>{a}</span>
                </li>
              ))
              : <li className="flex gap-3"><span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-emerald-700" /><span>No major flags identified.</span></li>}
          </ul>
        </div>

      </div>

      <div className="flex flex-wrap gap-3 border-t border-brand-900/8 pt-2 text-xs font-medium">
        <span className="chip-readable">⏱ {time || 'Varies'}</span>
        <span className="chip-readable">📊 {evidence}</span>
      </div>

    </div>
  )
}

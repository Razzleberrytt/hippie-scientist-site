export default function DecisionCard({
  bestFor = [],
  avoid = [],
  time = '',
  evidence = ''
}: any) {
  return (
    <div className="rounded-2xl border bg-neutral-50 p-5 space-y-4">

      <div>
        <p className="text-xs font-semibold uppercase text-neutral-500">Best for</p>
        <ul className="text-sm mt-1 space-y-1">
          {bestFor.slice(0,3).map((b:any,i:number)=>(
            <li key={i}>• {b}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase text-neutral-500">Avoid if</p>
        <ul className="text-sm mt-1 space-y-1">
          {avoid.length
            ? avoid.map((a:any,i:number)=><li key={i}>• {a}</li>)
            : <li>• No major flags</li>}
        </ul>
      </div>

      <div className="flex flex-wrap gap-3 text-xs font-medium">
        <span className="bg-neutral-200 px-2 py-1 rounded">⏱ {time || 'Varies'}</span>
        <span className="bg-neutral-200 px-2 py-1 rounded">📊 {evidence}</span>
      </div>

    </div>
  )
}

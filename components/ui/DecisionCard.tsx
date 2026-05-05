export default function DecisionCard({ bestFor = [], avoid = [], time = '', evidence = '' }: any) {
  return (
    <div className="rounded-2xl border p-5 bg-neutral-50 space-y-3">
      <div>
        <p className="text-xs font-semibold uppercase">Best for</p>
        <ul className="text-sm">{bestFor.map((b:any,i:number)=><li key={i}>• {b}</li>)}</ul>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase">Avoid if</p>
        <ul className="text-sm">{avoid.map((b:any,i:number)=><li key={i}>• {b}</li>)}</ul>
      </div>
      <div className="text-sm">⏱ {time}</div>
      <div className="text-sm">📊 {evidence}</div>
    </div>
  )
}

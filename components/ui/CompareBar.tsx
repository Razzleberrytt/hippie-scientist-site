export default function CompareBar({items=[]}:any){
  if(!items.length) return null

  return(
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 bg-white border shadow-lg rounded-xl px-4 py-2 flex gap-3 text-xs">
      {items.slice(0,3).map((i:any)=>(
        <span key={i.slug} className="bg-neutral-100 px-2 py-1 rounded">
          {i.name}
        </span>
      ))}
      <button className="bg-black text-white px-3 py-1 rounded">
        Compare
      </button>
    </div>
  )
}

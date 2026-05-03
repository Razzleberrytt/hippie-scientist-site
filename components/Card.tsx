import Link from 'next/link'

function getBestFor(description?: string){
  if(!description) return ''
  const sentence = description.split('.').find(s=>s.length>20)
  return sentence?.trim() || ''
}

function getScore(text?: string){
  if(!text) return 3
  const t = text.toLowerCase()
  if(/strong|rct|meta/.test(t)) return 5
  if(/moderate|human/.test(t)) return 4
  if(/limited|low/.test(t)) return 2
  return 3
}

export default function Card({title, subtitle, description, href, badge}:{title:string, subtitle?:string, description?:string, href:string, badge?:string}){
  const bestFor = getBestFor(description)
  const score = getScore(description)

  return (
    <Link href={href} className="card-unified group block">
      <div className="flex items-start justify-between gap-2">
        <div>
          {subtitle && <p className="text-xs font-black text-emerald-700/70">{subtitle}</p>}
          <h3 className="text-lg font-black text-slate-950 group-hover:text-emerald-700">{title}</h3>
        </div>
        {badge && <span className="badge">{badge}</span>}
      </div>

      {bestFor && (
        <p className="mt-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg">
          {bestFor}
        </p>
      )}

      {description && <p className="mt-2 text-sm text-slate-600 line-clamp-2">{description}</p>}

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i=> (
            <span key={i} className={`h-1.5 w-4 rounded ${i<=score?'bg-emerald-500':'bg-slate-200'}`} />
          ))}
        </div>
        <span className="text-sm font-black text-emerald-700 group-hover:translate-x-1">Open →</span>
      </div>
    </Link>
  )
}
import Link from 'next/link'

export default function Card({title, subtitle, description, href, badge, footer}:{title:string, subtitle?:string, description?:string, href:string, badge?:string, footer?:string}){
  return (
    <Link href={href} className="card-unified group block">
      <div className="flex items-start justify-between gap-2">
        <div>
          {subtitle && <p className="text-xs font-black text-emerald-700/70">{subtitle}</p>}
          <h3 className="text-lg font-black text-slate-950 group-hover:text-emerald-700">{title}</h3>
        </div>
        {badge && <span className="badge">{badge}</span>}
      </div>

      {description && <p className="mt-2 text-sm text-slate-600 line-clamp-3">{description}</p>}

      <div className="mt-4 flex items-center justify-between">
        {footer && <span className="text-xs text-slate-500">{footer}</span>}
        <span className="text-sm font-black text-emerald-700 group-hover:translate-x-1">Open →</span>
      </div>
    </Link>
  )
}
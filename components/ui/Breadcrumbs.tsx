import Link from 'next/link'

export default function Breadcrumbs({ items = [] }: Record<string, unknown>) {
  return (
    <nav className="text-xs text-neutral-500 flex gap-2 flex-wrap">
      {items.map((item: Record<string, unknown>, i:number)=>(
        <span key={i} className="flex items-center gap-2">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:underline">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

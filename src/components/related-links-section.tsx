import Link from 'next/link'

export default function RelatedLinksSection({ title, items }: any) {
  if (!items?.length) return null
  return (
    <div>
      <h2>{title}</h2>
      {items.map((item: any) => (
        <Link key={item.href} href={item.href}>{item.title}</Link>
      ))}
    </div>
  )
}

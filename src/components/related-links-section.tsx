import Link from 'next/link'
import { cleanEditorialText, shouldRenderCard } from '@/lib/editorial-rendering'

export default function RelatedLinksSection({ title, items }: any) {
  const cleanTitle = cleanEditorialText(title) || 'Related links'
  const renderableItems = (items || [])
    .map((item: any) => ({
      ...item,
      title: cleanEditorialText(item?.title || item?.label),
    }))
    .filter((item: any) => item.href && shouldRenderCard(item.title))

  if (!renderableItems.length) return null

  return (
    <div>
      <h2>{cleanTitle}</h2>
      {renderableItems.map((item: any) => (
        <Link key={item.href} href={item.href}>{item.title}</Link>
      ))}
    </div>
  )
}

import ContinueExploring from '@/components/runtime/continue-exploring'
import {
  getDiscoveryItems,
  type DiscoveryContext,
} from '@/lib/runtime/get-discovery-items'

type Props = {
  context?: DiscoveryContext
  title?: string
  limit?: number
}

export default function RuntimeDiscoverySection({
  context = 'default',
  title = 'Continue Exploring',
  limit = 4,
}: Props) {
  const items = getDiscoveryItems(context, limit)

  if (!items.length) {
    return null
  }

  return <ContinueExploring title={title} items={items} />
}

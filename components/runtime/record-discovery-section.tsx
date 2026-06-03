import RuntimeDiscoverySection from '@/components/runtime/runtime-discovery-section'
import { getContextFromRecord } from '@/lib/runtime/get-context-from-record'

type Props = {
  record: any
  title?: string
  limit?: number
}

export default function RecordDiscoverySection({
  record,
  title,
  limit = 4,
}: Props) {
  const context = getContextFromRecord(record)

  const inferredTitle =
    title ||
    {
      stress: 'Explore stress and resilience systems',
      focus: 'Explore cognition and focus systems',
      sleep: 'Explore recovery and sleep systems',
      psychoactive: 'Explore psychoactive education systems',
      cognition: 'Explore cognition and neuroplasticity systems',
      recovery: 'Explore recovery-oriented neuroscience',
      adaptogen: 'Explore adaptogenic resilience systems',
      default: 'Continue exploring connected systems',
    }[context]

  return (
    <RuntimeDiscoverySection
      context={context}
      title={inferredTitle}
      limit={limit}
    />
  )
}

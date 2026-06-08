import ContinueExploring from '@/components/runtime/continue-exploring'
import { getRuntimeDiscoveryPayload } from '@/lib/runtime/get-runtime-discovery-payload'

type Props = {
  record: Record<string, unknown>
  title?: string
}

export default function RuntimeOrchestratedDiscovery({
  record,
  title,
}: Props) {
  if (!record) {
    return null
  }

  const payload = getRuntimeDiscoveryPayload(record)

  const inferredTitle =
    title ||
    {
      stress: 'Explore stress and resilience systems',
      focus: 'Explore cognition and focus systems',
      recovery: 'Explore recovery-oriented neuroscience',
      adaptogen: 'Explore adaptogenic resilience systems',
      cognition: 'Explore cognition and neuroplasticity systems',
      psychoactive: 'Explore psychoactive education systems',
      sleep: 'Explore sleep and recovery systems',
      default: 'Continue exploring connected systems',
    }[payload.context]

  return (
    <ContinueExploring
      title={inferredTitle}
      items={payload.recommendations}
    />
  )
}

import RecordDiscoverySection from '@/components/runtime/record-discovery-section'

type Props = {
  record: any
  className?: string
}

export default function ProfileDiscoveryWrapper({
  record,
  className = '',
}: Props) {
  if (!record) {
    return null
  }

  return (
    <div className={`space-y-10 ${className}`.trim()}>
      <RecordDiscoverySection
        record={record}
        limit={4}
      />
    </div>
  )
}

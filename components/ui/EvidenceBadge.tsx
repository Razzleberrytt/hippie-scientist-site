export default function EvidenceBadge({ level = 'moderate' }: any) {
  const map:any = {
    strong: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    limited: 'bg-red-100 text-red-800'
  }

  const label:any = {
    strong: 'Strong Evidence',
    moderate: 'Moderate Evidence',
    limited: 'Limited Evidence'
  }

  return (
    <div className={`inline-block text-xs px-3 py-1 rounded-full font-semibold ${map[level]}`}>
      {label[level] || label.moderate}
    </div>
  )
}

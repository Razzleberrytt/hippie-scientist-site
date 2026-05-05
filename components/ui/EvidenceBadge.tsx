export default function EvidenceBadge({ level = 'moderate' }: any) {
  const map:any = {
    strong: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    limited: 'bg-red-100 text-red-800'
  }
  return (
    <span className={`text-xs px-2 py-1 rounded ${map[level] || map.moderate}`}>
      {level}
    </span>
  )
}

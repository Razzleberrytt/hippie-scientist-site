import React from 'react'
import InfoTooltip from './InfoTooltip'

interface Props {
  level?: string | number
  className?: string
}

export default function SafetyIcon({ level, className = '' }: Props) {
  if (level == null || level === '') return null
  const value = String(level).toLowerCase()

  let icon = '❓'
  let aria = 'Unknown safety'
  let color = 'text-gray-300'
  if (/(safe|high)/.test(value)) {
    icon = '✅'
    aria = 'Generally safe'
    color = 'text-green-400'
  } else if (/(caution|medium)/.test(value)) {
    icon = '⚠️'
    aria = 'Use caution'
    color = 'text-yellow-300'
  } else if (/(toxic|low)/.test(value)) {
    icon = '☠️'
    aria = 'Potentially toxic'
    color = 'text-red-400'
  } else if (/avoid/.test(value)) {
    icon = '❌'
    aria = 'Avoid use'
    color = 'text-red-500'
  }

  return (
    <InfoTooltip text={`Safety level: ${value}`}>
      <span role='img' aria-label={aria} className={`${color} ${className}`}>
        {icon}
      </span>
    </InfoTooltip>
  )
}

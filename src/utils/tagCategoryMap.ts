import { TagCategory } from './format'
import { LucideIcon, Zap, Leaf, AlertCircle, FlaskConical, Globe, Tag } from 'lucide-react'

export interface CategoryInfo {
  label: string
  icon?: LucideIcon
}

export const tagCategoryMap: Record<TagCategory, CategoryInfo> = {
  Effect: { label: 'Effects', icon: Zap },
  Preparation: { label: 'Preparation', icon: Leaf },
  Safety: { label: 'Safety', icon: AlertCircle },
  Chemistry: { label: 'Chemistry', icon: FlaskConical },
  Region: { label: 'Region', icon: Globe },
  Other: { label: 'Other', icon: Tag },
}

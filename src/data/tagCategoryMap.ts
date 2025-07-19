export interface TagInfo {
  category: string
  alias?: string
}

export const tagCategoryMap: Record<string, TagInfo> = {
  root: { category: 'Preparation', alias: 'root bark' },
  bark: { category: 'Preparation', alias: 'root bark' },
  tryptamine: { category: 'Compound Type', alias: 'alkaloid' },
  phenethylamine: { category: 'Compound Type', alias: 'alkaloid' },
}

export const allTags = Object.keys(tagCategoryMap)

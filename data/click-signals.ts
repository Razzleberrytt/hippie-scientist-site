export type ClickSignal = {
  compound_slug: string
  page_slug: string
  clicks: number
  product_clicks?: number
  top_pick_clicks?: number
  updated_at?: string
}

// Replace or generate this from real analytics later.
// Kept intentionally small and safe so rankings still mainly come from workbook data.
export const clickSignals: ClickSignal[] = []

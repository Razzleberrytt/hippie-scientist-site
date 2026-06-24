export function cleanSummary(text: any): string {
  if (!text) return "Traditionally used with growing scientific interest."

  const cleaned = String(text)
    .replace(/lean monograph.*|bulk mode.*|internal cross-linking.*|centers on the unspecified.*/gi, "")
    .trim()

  if (cleaned.length < 40) {
    return "Traditionally used with growing scientific interest."
  }

  return cleaned
}

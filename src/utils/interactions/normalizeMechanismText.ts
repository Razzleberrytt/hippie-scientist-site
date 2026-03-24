export function normalizeMechanismText(input: string): string {
  return input.toLowerCase().replace(/[_/]/g, ' ').replace(/\s+/g, ' ').trim()
}

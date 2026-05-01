export function validateHerb(herb: any): boolean {
  return Boolean(herb?.slug && (herb?.name || herb?.displayName || herb?.common || herb?.scientific))
}

export function validateCompound(compound: any): boolean {
  return Boolean(compound?.slug && (compound?.name || compound?.displayName))
}

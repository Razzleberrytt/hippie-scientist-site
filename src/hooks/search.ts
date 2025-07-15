
export interface HasScore {
  score?: number | string;
  [key: string]: unknown;
}

export function filterByScore<T extends HasScore>(items: T[], minScore: number): T[] {
  return items.filter((item) => {
    const score = Number(item.score);
    return !Number.isNaN(score) && score >= minScore;
  });
}

export function sortByValue<T extends Record<string, number | string>>(items: T[], key: keyof T): T[] {
  return [...items].sort((a, b) => {
    const aVal = Number(a[key]);
    const bVal = Number(b[key]);
    return aVal - bVal;
  });
}

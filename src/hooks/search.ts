
export function filterByScore<T extends { score: number }>(items: T[], minScore: number): T[] {
  return items.filter((item) => {
    const score = Number(item.score);
    return !isNaN(score) && score >= minScore;
  });
}

export function sortByValue<T extends Record<string, number>>(items: T[], key: keyof T): T[] {
  return items.sort((a, b) => {
    const aVal = Number(a[key]);
    const bVal = Number(b[key]);
    return aVal - bVal;
  });
}

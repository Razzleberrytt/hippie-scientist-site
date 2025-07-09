
export function filterByScore(items: any[], minScore: number) {
  return items.filter(item => {
    const score = Number(item.score);
    return !isNaN(score) && score >= minScore;
  });
}

export function sortByValue(items: any[], key: string) {
  return items.sort((a, b) => {
    const aVal = Number(a[key]);
    const bVal = Number(b[key]);
    return aVal - bVal;
  });
}

export function filterByScore(items, minScore) {
    return items.filter(item => {
        const score = Number(item.score);
        return !isNaN(score) && score >= minScore;
    });
}
export function sortByValue(items, key) {
    return items.sort((a, b) => {
        const aVal = Number(a[key]);
        const bVal = Number(b[key]);
        return aVal - bVal;
    });
}

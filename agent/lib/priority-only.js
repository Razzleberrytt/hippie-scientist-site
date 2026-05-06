export function filterPriorityOnly(queue = []) {
  return queue.filter(item => {
    const score = item?.priority?.score || 0
    return score >= 70
  })
}

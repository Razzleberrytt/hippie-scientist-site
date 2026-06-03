export function buildTopicHubs(clusters = {}) {
  return Object.entries(clusters).map(([topic, compounds]) => ({
    topic,
    slug: topic.toLowerCase().replace(/\s+/g, '-'),
    compound_count: compounds.length,
    compounds,
  }))
}

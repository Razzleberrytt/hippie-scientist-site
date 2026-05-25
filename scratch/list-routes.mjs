import { getStacks } from './lib/runtime-data.js'
import { mergeStackEcosystems } from './lib/stack-ecosystems.js'
import { getEcosystemHubs } from './src/lib/ecosystem-hubs.ts'
import { semanticSupernodes } from './src/lib/semantic-supernodes.ts'
import { authorityTopicSlugs } from './app/authority-links.ts'

console.log("=== Stacks ===")
try {
  const stacks = mergeStackEcosystems(await getStacks())
  console.log(stacks.map(s => s.slug))
} catch (e) {
  console.error("Error getting stacks:", e)
}

console.log("=== Ecosystem Hubs ===")
console.log(getEcosystemHubs().map(h => h.slug))

console.log("=== Semantic Supernodes ===")
console.log(semanticSupernodes.map(n => n.slug))

console.log("=== Authority Topics ===")
console.log(authorityTopicSlugs)

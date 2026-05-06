export function generateSemanticStacks(compounds = []) {
  return {
    sleep_stack: compounds.filter(c => {
      return JSON.stringify(c.effects || []).toLowerCase().includes('sleep')
    }).slice(0, 5),

    focus_stack: compounds.filter(c => {
      return JSON.stringify(c.effects || []).toLowerCase().includes('focus')
    }).slice(0, 5),

    anxiety_stack: compounds.filter(c => {
      return JSON.stringify(c.effects || []).toLowerCase().includes('anxiety')
    }).slice(0, 5),

    recovery_stack: compounds.filter(c => {
      return JSON.stringify(c.effects || []).toLowerCase().includes('recovery')
    }).slice(0, 5),
  }
}

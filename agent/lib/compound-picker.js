const compounds = [
  'ashwagandha',
  'l-theanine',
  'rhodiola-rosea',
  'creatine',
  'magnesium-glycinate',
]

export function pickCompound() {
  return compounds[Math.floor(Math.random() * compounds.length)]
}

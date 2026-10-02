export function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i += 1) {
    h = (h << 5) - h + seed.charCodeAt(i)
    h |= 0
  }
  return Math.abs(h)
}

export function avatarColors(seed: string): { a: string; b: string } {
  const h = hashSeed(seed || 'sumba')
  const hueA = h % 360
  const hueB = (hueA + 40 + (h % 80)) % 360
  return {
    a: `hsl(${hueA} 55% 45%)`,
    b: `hsl(${hueB} 50% 28%)`,
  }
}

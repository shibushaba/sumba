/** Unbiased Fisher–Yates shuffle using a cryptographically strong RNG when available. */
export function secureShuffle<T>(
  items: T[],
  randomUint32: () => number = defaultRandomUint32,
): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const random = randomUint32()
    const j = random % (i + 1)
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function defaultRandomUint32(): number {
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]!
}

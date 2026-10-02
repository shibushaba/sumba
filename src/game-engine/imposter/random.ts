export function pickRandomWord(words: readonly string[]): string {
  if (words.length === 0) throw new Error('Word pool is empty')
  const index = Math.floor(Math.random() * words.length)
  return words[index]
}

export function pickRandomIndices(total: number, count: number): number[] {
  if (count > total) throw new Error('Too many imposters')
  const indices = Array.from({ length: total }, (_, i) => i)
  for (let i = indices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[indices[i], indices[j]] = [indices[j], indices[i]]
  }
  return indices.slice(0, count)
}

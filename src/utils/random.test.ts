import { describe, expect, it } from 'vitest'
import { secureShuffle } from './random'

describe('secureShuffle', () => {
  it('returns a permutation of the input', () => {
    const items = ['a', 'b', 'c', 'd', 'e']
    let i = 0
    const sequence = [4, 0, 1, 0, 0]
    const shuffled = secureShuffle(items, () => sequence[i++] ?? 0)
    expect(shuffled.sort()).toEqual(items.sort())
  })

  it('does not mutate the original array', () => {
    const items = [1, 2, 3]
    const copy = [...items]
    secureShuffle(items, () => 0)
    expect(items).toEqual(copy)
  })
})

import { describe, expect, it } from 'vitest'

/** Logic mirrored in CountUp — large jumps skip animation */
function shouldSkipCountAnimation(from: number, to: number): boolean {
  return Math.abs(to - from) > 12
}

describe('CountUp policy', () => {
  it('animates small deltas only', () => {
    expect(shouldSkipCountAnimation(3, 4)).toBe(false)
    expect(shouldSkipCountAnimation(0, 48)).toBe(true)
  })
})

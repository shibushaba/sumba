import { describe, expect, it } from 'vitest'
import { formatSentence } from './getBeVerb'

describe('formatSentence', () => {
  it('joins who, where, what in order', () => {
    expect(formatSentence('Shinu', 'Chadi', 'Mookil')).toBe('Shinu Mookil Chadi')
  })

  it('trims parts and skips empties', () => {
    expect(formatSentence(' Shibu ', 'dancing', ' tree ')).toBe('Shibu tree dancing')
  })
})

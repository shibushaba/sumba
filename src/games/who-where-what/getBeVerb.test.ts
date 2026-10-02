import { describe, expect, it } from 'vitest'
import { formatSentence, getBeVerb } from './getBeVerb'

describe('getBeVerb', () => {
  it('uses was for singular names', () => {
    expect(getBeVerb('Shibu')).toBe('was')
    expect(getBeVerb('Babu')).toBe('was')
  })

  it('uses were for plural groups', () => {
    expect(getBeVerb('The boys')).toBe('were')
    expect(getBeVerb('The cousins')).toBe('were')
  })

  it('uses was for everyone', () => {
    expect(getBeVerb('Everyone')).toBe('was')
  })
})

describe('formatSentence', () => {
  it('formats singular sentence', () => {
    expect(
      formatSentence('Shibu', 'dancing', 'on top of a tree'),
    ).toBe('Shibu was dancing on top of a tree.')
  })

  it('formats plural sentence', () => {
    expect(formatSentence('The boys', 'running', 'in the street')).toBe(
      'The boys were running in the street.',
    )
  })
})

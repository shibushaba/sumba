import { describe, expect, it } from 'vitest'
import { normalizePlayerName } from './playerName'

describe('normalizePlayerName', () => {
  it('trims and lowercases', () => {
    expect(normalizePlayerName('  Hima ')).toBe('hima')
    expect(normalizePlayerName('HIMA')).toBe('hima')
  })
})

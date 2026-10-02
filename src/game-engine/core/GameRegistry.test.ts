import { describe, expect, it, beforeEach } from 'vitest'
import {
  getGame,
  getGames,
  hasGame,
  registerGame,
  resetGameRegistryForTests,
} from './GameRegistry'
import type { GameDefinition } from './types'

function stubGame(slug: string): GameDefinition {
  return {
    slug,
    name: slug,
    description: 'test',
    icon: '🎮',
    category: 'Test',
    minPlayers: 2,
    maxPlayers: 8,
    createdBy: 'Test',
    engine: slug,
    engineVersion: '0.0.1',
    Play: () => null,
  }
}

describe('GameRegistry', () => {
  beforeEach(() => {
    resetGameRegistryForTests()
  })

  it('registers and retrieves a game', () => {
    registerGame(stubGame('quiz'))
    expect(hasGame('quiz')).toBe(true)
    expect(getGame('quiz')?.slug).toBe('quiz')
  })

  it('lists registered games', () => {
    registerGame(stubGame('a'))
    registerGame(stubGame('b'))
    expect(getGames()).toHaveLength(2)
  })

  it('returns undefined for unknown game', () => {
    expect(getGame('missing')).toBeUndefined()
  })

  it('prevents duplicate registration', () => {
    registerGame(stubGame('dup'))
    expect(() => registerGame(stubGame('dup'))).toThrow()
  })
})

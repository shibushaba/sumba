import { describe, expect, it } from 'vitest'
import { filterSavedPlayerSuggestions } from './savedPlayerSearch'
import type { SavedPlayerRecord } from '../players/types'

function player(
  id: string,
  displayName: string,
  isActive = true,
): SavedPlayerRecord {
  return {
    id,
    displayName,
    normalizedName: displayName.trim().toLowerCase(),
    avatarSeed: 'seed',
    isActive,
    lastPlayedAt: null,
  }
}

const roster = [
  player('1', 'Hima'),
  player('2', 'Hardy'),
  player('3', 'Dia'),
  player('4', 'Abhima'),
  player('5', 'Inactive', false),
]

describe('filterSavedPlayerSuggestions', () => {
  it('matches case-insensitively with startsWith preference', () => {
    const hi = filterSavedPlayerSuggestions(roster, 'Hi')
    expect(hi.map((p) => p.displayName)).toEqual(['Hima'])

    const h = filterSavedPlayerSuggestions(roster, 'h')
    expect(h.map((p) => p.displayName)).toEqual(['Hardy', 'Hima'])
  })

  it('falls back to contains when no startsWith match', () => {
    const ima = filterSavedPlayerSuggestions(roster, 'ima')
    expect(ima.map((p) => p.displayName)).toEqual(['Abhima', 'Hima'])
  })

  it('ranks startsWith matches for Him', () => {
    const him = filterSavedPlayerSuggestions(roster, 'Him')
    expect(him.map((p) => p.displayName)).toEqual(['Hima'])
  })

  it('excludes inactive by default', () => {
    const all = filterSavedPlayerSuggestions(roster, '')
    expect(all.some((p) => p.displayName === 'Inactive')).toBe(false)
  })

  it('excludes already selected ids', () => {
    const exclude = new Set(['1'])
    const h = filterSavedPlayerSuggestions(roster, 'h', { excludeIds: exclude })
    expect(h.some((p) => p.id === '1')).toBe(false)
  })
})

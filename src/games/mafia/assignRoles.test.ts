import { describe, expect, it } from 'vitest'
import { assignRoles, countRoles } from './assignRoles'

describe('assignRoles', () => {
  it('assigns exactly one of each special role for 5 players', () => {
    const players = Array.from({ length: 5 }, (_, i) => ({
      id: `p${i}`,
      name: `Player ${i}`,
    }))
    const assigned = assignRoles(players)
    const counts = countRoles(assigned)
    expect(assigned).toHaveLength(5)
    expect(counts.mafia).toBe(1)
    expect(counts.doctor).toBe(1)
    expect(counts.detective).toBe(1)
    expect(counts.civilian).toBe(2)
  })

  it('assigns exactly one of each special role for 12 players', () => {
    const players = Array.from({ length: 12 }, (_, i) => ({
      id: `p${i}`,
      name: `Player ${i}`,
    }))
    const assigned = assignRoles(players)
    const counts = countRoles(assigned)
    expect(assigned).toHaveLength(12)
    expect(counts.mafia).toBe(1)
    expect(counts.doctor).toBe(1)
    expect(counts.detective).toBe(1)
    expect(counts.civilian).toBe(9)
  })
})

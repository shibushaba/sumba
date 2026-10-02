import { describe, expect, it } from 'vitest'
import { calculateRoundPoints } from './scoring'
import type { ImposterPlayer, ImposterVote } from './types'

const players: ImposterPlayer[] = [
  { id: '1', name: 'A', savedPlayerId: 's1', isImposter: false },
  { id: '2', name: 'B', savedPlayerId: 's2', isImposter: false },
  { id: '3', name: 'C', savedPlayerId: 's3', isImposter: true },
]

describe('Imposter V2 scoring', () => {
  it('awards +1 for correct imposter vote', () => {
    const votes: ImposterVote[] = [{ voterId: '1', targetId: '3' }]
    const points = calculateRoundPoints(players, ['3'], votes)
    expect(points.find((p) => p.playerId === '1')?.points).toBe(1)
    expect(points.find((p) => p.playerId === '2')?.points).toBe(0)
  })

  it('awards imposter survival when zero votes', () => {
    const votes: ImposterVote[] = [{ voterId: '1', targetId: '2' }]
    const points = calculateRoundPoints(players, ['3'], votes)
    expect(points.find((p) => p.playerId === '3')?.points).toBe(1)
  })

  it('caps voter at +1 with two imposters', () => {
    const six: ImposterPlayer[] = [
      { id: '1', name: 'A', savedPlayerId: 's1', isImposter: false },
      { id: '2', name: 'B', savedPlayerId: 's2', isImposter: false },
      { id: '3', name: 'C', savedPlayerId: 's3', isImposter: false },
      { id: '4', name: 'D', savedPlayerId: 's4', isImposter: true },
      { id: '5', name: 'E', savedPlayerId: 's5', isImposter: true },
      { id: '6', name: 'F', savedPlayerId: 's6', isImposter: false },
    ]
    const votes: ImposterVote[] = [
      { voterId: '1', targetId: '4' },
      { voterId: '2', targetId: '5' },
    ]
    const points = calculateRoundPoints(six, ['4', '5'], votes)
    expect(points.find((p) => p.playerId === '1')?.points).toBe(1)
    expect(points.find((p) => p.playerId === '2')?.points).toBe(1)
  })
})
